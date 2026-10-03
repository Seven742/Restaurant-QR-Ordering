import { pool, query } from '@/lib/db';
import { handle, ok, readJson, ApiError } from '@/lib/api';
import { requireRole } from '@/lib/auth';
import { str, int, oneOf } from '@/lib/validate';
import { attachItems } from '@/lib/orders';
import { ORDER_STATUSES, PAYMENT_METHODS, SERVICE_FEE_PERCENT, round2 } from '@/lib/utils';

export const dynamic = 'force-dynamic';

// GET /api/orders?status=pending&q=12&limit=100   (admin/staff)
// `q` matches an order id or a table number.
export const GET = handle(async (req) => {
  await requireRole(['admin', 'staff']);
  const sp = new URL(req.url).searchParams;
  const where = [];
  const params = [];

  if (sp.get('status') && sp.get('status') !== 'all') {
    where.push('o.status = ?');
    params.push(oneOf(sp.get('status'), 'status', ORDER_STATUSES));
  }
  const q = sp.get('q')?.trim();
  if (q) {
    if (!/^\d{1,9}$/.test(q)) throw new ApiError(422, 'Search must be an order id or table number');
    where.push('(o.id = ? OR t.table_number = ?)');
    params.push(Number(q), Number(q));
  }
  const limit = Math.min(Math.max(Number(sp.get('limit')) || 100, 1), 500);

  const orders = await query(
    `SELECT o.*, t.table_number FROM orders o JOIN \`tables\` t ON t.id = o.table_id
     ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
     ORDER BY o.created_at DESC, o.id DESC LIMIT ?`,
    [...params, limit]
  );
  return ok(await attachItems(orders));
});

// POST /api/orders  (public: customers have no account)
// Body: { tableId, customerName?, customerPhone?, paymentMethod?, note?, items: [{ productId, quantity, note? }] }
// SECURITY: prices are NEVER taken from the browser. We read them from the database.
export const POST = handle(async (req) => {
  const body = await readJson(req);

  const tableId = int(body.tableId, 'tableId', { min: 1 });
  const customerName = str(body.customerName, 'customerName', { max: 100 });
  const customerPhone = str(body.customerPhone, 'customerPhone', { max: 30 });
  if (customerPhone && !/^[0-9+\-\s()]{6,30}$/.test(customerPhone)) throw new ApiError(422, 'Invalid phone number');
  const paymentMethod = oneOf(body.paymentMethod ?? 'pay_at_counter', 'paymentMethod', PAYMENT_METHODS);
  const note = str(body.note, 'note', { max: 500 });

  if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > 50)
    throw new ApiError(422, 'items must contain 1 to 50 foods');
  const items = body.items.map((it, i) => ({
    productId: int(it?.productId, `items[${i}].productId`, { min: 1 }),
    quantity: int(it?.quantity, `items[${i}].quantity`, { min: 1, max: 50 }),
    note: str(it?.note, `items[${i}].note`, { max: 300 }),
  }));

  const conn = await pool.getConnection();
  try {
    // A transaction means: either the whole order is saved, or nothing is.
    await conn.beginTransaction();

    const [tableRows] = await conn.query('SELECT id, status FROM `tables` WHERE id = ?', [tableId]);
    const table = tableRows[0];
    if (!table) throw new ApiError(404, 'Table not found. Please scan the QR code again.');
    if (table.status === 'disabled') throw new ApiError(403, 'This table is not accepting orders');

    const ids = [...new Set(items.map((i) => i.productId))];
    const [products] = await conn.query('SELECT id, name, price, available FROM products WHERE id IN (?)', [ids]);
    const byId = Object.fromEntries(products.map((p) => [p.id, p]));

    const rows = items.map((it) => {
      const p = byId[it.productId];
      if (!p) throw new ApiError(422, `Food #${it.productId} does not exist`);
      if (!p.available) throw new ApiError(422, `"${p.name}" is not available right now`);
      return { ...it, name: p.name, price: p.price, subtotal: round2(p.price * it.quantity) };
    });

    const subtotal = round2(rows.reduce((s, r) => s + r.subtotal, 0));
    const serviceFee = round2((subtotal * SERVICE_FEE_PERCENT) / 100);
    const total = round2(subtotal + serviceFee);

    const [order] = await conn.query(
      'INSERT INTO orders (table_id, customer_name, customer_phone, service_fee, total_amount, payment_method, note) VALUES (?,?,?,?,?,?,?)',
      [tableId, customerName, customerPhone, serviceFee, total, paymentMethod, note]
    );
    await conn.query(
      'INSERT INTO order_items (order_id, product_id, product_name, price, quantity, subtotal, note) VALUES ?',
      [rows.map((r) => [order.insertId, r.productId, r.name, r.price, r.quantity, r.subtotal, r.note])]
    );
    await conn.query("UPDATE `tables` SET status = 'occupied' WHERE id = ? AND status = 'available'", [tableId]);

    await conn.commit();
    return ok({ id: order.insertId, status: 'pending', subtotal, service_fee: serviceFee, total_amount: total }, 201);
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

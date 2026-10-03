import { query } from '@/lib/db';
import { handle, ok, readJson } from '@/lib/api';
import { requireRole } from '@/lib/auth';
import { parseId } from '@/lib/validate';
import { parseProduct } from '@/lib/schemas';

export const dynamic = 'force-dynamic';

const SELECT = 'SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON c.id = p.category_id';
const clean = (r) => ({ ...r, available: !!r.available });

// GET /api/products?category=2        -> available foods only (public menu)
// GET /api/products?all=1             -> includes disabled foods (admin/staff only)
export const GET = handle(async (req) => {
  const sp = new URL(req.url).searchParams;
  const where = [];
  const params = [];

  if (sp.get('all') === '1') await requireRole(['admin', 'staff']);
  else where.push('p.available = 1');

  if (sp.get('category')) {
    where.push('p.category_id = ?');
    params.push(parseId(sp.get('category'), 'category'));
  }
  const rows = await query(`${SELECT} ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY p.category_id, p.name`, params);
  return ok(rows.map(clean));
});

// POST /api/products (admin)
export const POST = handle(async (req) => {
  await requireRole(['admin']);
  const p = parseProduct(await readJson(req));
  const r = await query(
    'INSERT INTO products (category_id, name, description, price, image, available) VALUES (?,?,?,?,?,?)',
    [p.category_id, p.name, p.description, p.price, p.image, p.available]
  );
  const [row] = await query(`${SELECT} WHERE p.id = ?`, [r.insertId]);
  return ok(clean(row), 201);
});

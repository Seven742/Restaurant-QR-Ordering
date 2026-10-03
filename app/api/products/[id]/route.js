import { query, buildSet } from '@/lib/db';
import { handle, ok, readJson, ApiError } from '@/lib/api';
import { requireRole, getSession } from '@/lib/auth';
import { parseId } from '@/lib/validate';
import { parseProduct } from '@/lib/schemas';

export const dynamic = 'force-dynamic';

const SELECT = 'SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE p.id = ?';

async function find(id) {
  const [row] = await query(SELECT, [id]);
  if (!row) throw new ApiError(404, 'Product not found');
  return { ...row, available: !!row.available };
}

// GET /api/products/:id  (public, but hidden products are only visible to staff)
export const GET = handle(async (_req, { params }) => {
  const product = await find(parseId(params.id));
  if (!product.available && !(await getSession())) throw new ApiError(404, 'Product not found');
  return ok(product);
});

// PATCH /api/products/:id  (admin or staff) - partial update, e.g. { available: false }
export const PATCH = handle(async (req, { params }) => {
  await requireRole(['admin', 'staff']);
  const id = parseId(params.id);
  await find(id);
  const fields = parseProduct(await readJson(req), true);
  if (!Object.keys(fields).length) throw new ApiError(400, 'Nothing to update');
  const { sql, params: p } = buildSet(fields);
  await query(`UPDATE products SET ${sql} WHERE id = ?`, [...p, id]);
  return ok(await find(id));
});

// DELETE /api/products/:id  (admin). Old orders keep their copied name/price.
export const DELETE = handle(async (_req, { params }) => {
  await requireRole(['admin']);
  const id = parseId(params.id);
  await find(id);
  await query('DELETE FROM products WHERE id = ?', [id]);
  return ok({ success: true });
});

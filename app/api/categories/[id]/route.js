import { query, buildSet } from '@/lib/db';
import { handle, ok, readJson, ApiError } from '@/lib/api';
import { requireRole } from '@/lib/auth';
import { str, parseId } from '@/lib/validate';

export const dynamic = 'force-dynamic';

async function find(id) {
  const [row] = await query('SELECT * FROM categories WHERE id = ?', [id]);
  if (!row) throw new ApiError(404, 'Category not found');
  return row;
}

export const GET = handle(async (_req, { params }) => ok(await find(parseId(params.id))));

// PATCH /api/categories/:id  (admin)  { name?, description? }
export const PATCH = handle(async (req, { params }) => {
  await requireRole(['admin']);
  const id = parseId(params.id);
  await find(id);
  const body = await readJson(req);
  const fields = {};
  if (body.name !== undefined) fields.name = str(body.name, 'name', { required: true, max: 100 });
  if (body.description !== undefined) fields.description = str(body.description, 'description', { max: 255 });
  if (!Object.keys(fields).length) throw new ApiError(400, 'Nothing to update');
  const { sql, params: p } = buildSet(fields);
  await query(`UPDATE categories SET ${sql} WHERE id = ?`, [...p, id]);
  return ok(await find(id));
});

// DELETE /api/categories/:id  (admin) - blocked with 409 if products still use it
export const DELETE = handle(async (_req, { params }) => {
  await requireRole(['admin']);
  const id = parseId(params.id);
  await find(id);
  await query('DELETE FROM categories WHERE id = ?', [id]);
  return ok({ success: true });
});

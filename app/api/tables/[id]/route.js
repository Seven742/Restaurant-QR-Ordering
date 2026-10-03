import { query, buildSet } from '@/lib/db';
import { handle, ok, readJson, ApiError } from '@/lib/api';
import { requireRole } from '@/lib/auth';
import { int, oneOf, parseId, bool } from '@/lib/validate';
import { TABLE_STATUSES, tableUrl } from '@/lib/utils';

export const dynamic = 'force-dynamic';

async function find(id) {
  const [row] = await query('SELECT * FROM `tables` WHERE id = ?', [id]);
  if (!row) throw new ApiError(404, 'Table not found');
  return row;
}

// GET /api/tables/:id  (public) - the customer page uses this to verify the QR code.
// Only safe fields are returned.
export const GET = handle(async (_req, { params }) => {
  const { id, table_number, status } = await find(parseId(params.id));
  return ok({ id, table_number, status });
});

// PATCH /api/tables/:id  (admin/staff)  { status?, table_number?, regenerate_qr? }
export const PATCH = handle(async (req, { params }) => {
  await requireRole(['admin', 'staff']);
  const id = parseId(params.id);
  await find(id);
  const body = await readJson(req);
  const fields = {};
  if (body.status !== undefined) fields.status = oneOf(body.status, 'status', TABLE_STATUSES);
  if (body.table_number !== undefined) fields.table_number = int(body.table_number, 'table_number', { min: 1, max: 9999 });
  if (body.regenerate_qr !== undefined && bool(body.regenerate_qr, 'regenerate_qr')) fields.qr_code = tableUrl(id);
  if (!Object.keys(fields).length) throw new ApiError(400, 'Nothing to update');
  const { sql, params: p } = buildSet(fields);
  await query(`UPDATE \`tables\` SET ${sql} WHERE id = ?`, [...p, id]);
  return ok(await find(id));
});

// DELETE /api/tables/:id  (admin) - blocked with 409 if the table has orders
export const DELETE = handle(async (_req, { params }) => {
  await requireRole(['admin']);
  const id = parseId(params.id);
  await find(id);
  await query('DELETE FROM `tables` WHERE id = ?', [id]);
  return ok({ success: true });
});

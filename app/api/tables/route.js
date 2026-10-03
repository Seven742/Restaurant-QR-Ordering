import { query } from '@/lib/db';
import { handle, ok, readJson } from '@/lib/api';
import { requireRole } from '@/lib/auth';
import { int } from '@/lib/validate';
import { tableUrl } from '@/lib/utils';

export const dynamic = 'force-dynamic';

// GET /api/tables  (admin/staff)
export const GET = handle(async () => {
  await requireRole(['admin', 'staff']);
  return ok(await query('SELECT * FROM `tables` ORDER BY table_number'));
});

// POST /api/tables  (admin)  { table_number }
export const POST = handle(async (req) => {
  await requireRole(['admin']);
  const body = await readJson(req);
  const number = int(body.table_number, 'table_number', { min: 1, max: 9999 });
  const r = await query('INSERT INTO `tables` (table_number) VALUES (?)', [number]);
  // The QR URL contains the table id, so we set it right after the insert
  await query('UPDATE `tables` SET qr_code = ? WHERE id = ?', [tableUrl(r.insertId), r.insertId]);
  const [row] = await query('SELECT * FROM `tables` WHERE id = ?', [r.insertId]);
  return ok(row, 201);
});

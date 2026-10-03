import { query } from '@/lib/db';
import { handle, ok, readJson } from '@/lib/api';
import { requireRole } from '@/lib/auth';
import { str } from '@/lib/validate';

export const dynamic = 'force-dynamic';

// GET /api/categories  (public: the customer menu needs it)
export const GET = handle(async () => {
  return ok(await query('SELECT * FROM categories ORDER BY id'));
});

// POST /api/categories  (admin)  { name, description? }
export const POST = handle(async (req) => {
  await requireRole(['admin']);
  const body = await readJson(req);
  const name = str(body.name, 'name', { required: true, max: 100 });
  const description = str(body.description, 'description', { max: 255 });
  const r = await query('INSERT INTO categories (name, description) VALUES (?, ?)', [name, description]);
  const [row] = await query('SELECT * FROM categories WHERE id = ?', [r.insertId]);
  return ok(row, 201);
});

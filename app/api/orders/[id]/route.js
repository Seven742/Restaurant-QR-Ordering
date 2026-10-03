import { query } from '@/lib/db';
import { handle, ok, ApiError } from '@/lib/api';
import { requireRole } from '@/lib/auth';
import { parseId } from '@/lib/validate';
import { getOrder } from '@/lib/orders';

export const dynamic = 'force-dynamic';

// GET /api/orders/:id  (admin/staff only)
// Customers do not track orders, so there is no public access to order details.
export const GET = handle(async (_req, { params }) => {
  await requireRole(['admin', 'staff']);
  const order = await getOrder(parseId(params.id));
  if (!order) throw new ApiError(404, 'Order not found');
  return ok(order);
});

// DELETE /api/orders/:id  (admin)
export const DELETE = handle(async (_req, { params }) => {
  await requireRole(['admin']);
  const id = parseId(params.id);
  if (!(await getOrder(id))) throw new ApiError(404, 'Order not found');
  await query('DELETE FROM orders WHERE id = ?', [id]); // order_items are removed by ON DELETE CASCADE
  return ok({ success: true });
});

// PATCH /api/orders/:id
export const PATCH = handle(async (req, { params }) => {
  await requireRole(['admin', 'staff']);
  const id = parseId(params.id);
  const body = await req.json();
  
  if (!body.status) throw new ApiError(422, 'Status is required');
  
  await query('UPDATE orders SET status = ? WHERE id = ?', [body.status, id]);
  return ok({ success: true });
});

import { query } from '@/lib/db';
import { handle, ok, readJson, ApiError } from '@/lib/api';
import { requireRole } from '@/lib/auth';
import { oneOf, parseId } from '@/lib/validate';
import { getOrder } from '@/lib/orders';
import { ACTIVE_STATUSES, ORDER_STATUSES } from '@/lib/utils';

export const dynamic = 'force-dynamic';

// PATCH /api/orders/:id/status  (admin/staff)  { status }
export const PATCH = handle(async (req, { params }) => {
  await requireRole(['admin', 'staff']);
  const id = parseId(params.id);
  const order = await getOrder(id);
  if (!order) throw new ApiError(404, 'Order not found');

  const { status } = await readJson(req);
  oneOf(status, 'status', ORDER_STATUSES);
  await query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);

  // When the order is finished, free the table if no other order is still active on it
  if (!ACTIVE_STATUSES.includes(status)) {
    await query(
      `UPDATE \`tables\` SET status = 'available'
       WHERE id = ? AND status = 'occupied'
         AND NOT EXISTS (SELECT 1 FROM orders WHERE table_id = ? AND status IN (?))`,
      [order.table_id, order.table_id, ACTIVE_STATUSES]
    );
  }
  return ok(await getOrder(id));
});

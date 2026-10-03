import { query } from '@/lib/db';
import { handle, ok } from '@/lib/api';
import { requireRole } from '@/lib/auth';
import { attachItems } from '@/lib/orders';

export const dynamic = 'force-dynamic';

// GET /api/admin/dashboard  (admin/staff)
// "Revenue" counts every order of today that is not cancelled.
export const GET = handle(async () => {
  await requireRole(['admin', 'staff']);

  const [stats] = await query(`SELECT
    COUNT(*) AS total_orders,
    COALESCE(SUM(DATE(created_at) = CURDATE()), 0) AS today_orders,
    COALESCE(SUM(status = 'pending'), 0) AS pending_orders,
    COALESCE(SUM(status = 'completed'), 0) AS completed_orders,
    COALESCE(SUM(CASE WHEN DATE(created_at) = CURDATE() AND status <> 'cancelled' THEN total_amount END), 0) AS today_revenue
  FROM orders`);

  const [statusSummary, popular, recent, daily, [{ today }]] = await Promise.all([
    query('SELECT status, COUNT(*) AS count FROM orders GROUP BY status'),
    query(`SELECT oi.product_name AS name, SUM(oi.quantity) AS sold
           FROM order_items oi JOIN orders o ON o.id = oi.order_id
           WHERE o.status <> 'cancelled' GROUP BY oi.product_name ORDER BY sold DESC LIMIT 5`),
    query('SELECT o.*, t.table_number FROM orders o JOIN `tables` t ON t.id = o.table_id ORDER BY o.created_at DESC, o.id DESC LIMIT 8'),
    query(`SELECT DATE(created_at) AS day, COUNT(*) AS orders, COALESCE(SUM(total_amount), 0) AS revenue
           FROM orders WHERE status <> 'cancelled' AND created_at >= CURDATE() - INTERVAL 6 DAY
           GROUP BY DATE(created_at)`),
    query('SELECT CURDATE() AS today'),
  ]);

  // Always return 7 days, even days with no sales (so the chart has no gaps)
  const map = Object.fromEntries(daily.map((d) => [d.day, d]));
  const base = new Date(`${today}T00:00:00Z`);
  const salesChart = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base);
    d.setUTCDate(d.getUTCDate() - (6 - i));
    const day = d.toISOString().slice(0, 10);
    return { day, orders: map[day]?.orders ?? 0, revenue: map[day]?.revenue ?? 0 };
  });

  return ok({
    stats,
    statusSummary: Object.fromEntries(statusSummary.map((s) => [s.status, s.count])),
    popularFoods: popular,
    recentOrders: await attachItems(recent),
    salesChart,
  });
});

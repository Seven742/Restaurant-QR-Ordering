import { query } from './db';

/** Load orders and attach their items (2 queries total, no N+1). */
export async function attachItems(orders) {
  if (!orders.length) return orders;
  const items = await query('SELECT * FROM order_items WHERE order_id IN (?) ORDER BY id', [orders.map((o) => o.id)]);
  const byOrder = {};
  for (const it of items) (byOrder[it.order_id] ||= []).push(it);
  return orders.map((o) => ({ ...o, items: byOrder[o.id] || [] }));
}

export async function getOrder(id) {
  const rows = await query(
    'SELECT o.*, t.table_number FROM orders o JOIN `tables` t ON t.id = o.table_id WHERE o.id = ?',
    [id]
  );
  if (!rows.length) return null;
  return (await attachItems(rows))[0];
}

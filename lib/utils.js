export const ORDER_STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];
export const ACTIVE_STATUSES = ['pending', 'confirmed', 'preparing', 'ready'];
export const TABLE_STATUSES = ['available', 'occupied', 'disabled'];
export const PAYMENT_METHODS = ['pay_at_counter', 'cash', 'qr_payment'];

// Service fee percentage (0 disables it). Read on the server only.
export const SERVICE_FEE_PERCENT = Number(process.env.SERVICE_FEE_PERCENT ?? 5);

/** Round to 2 decimals (money). */
export const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

export const formatPrice = (n) => `$${Number(n).toFixed(2)}`;
export const tableLabel = (n) => `Table ${String(n).padStart(2, '0')}`;

/** The URL a table's QR code points to. */
export const tableUrl = (id) => `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/order?table=${id}`;

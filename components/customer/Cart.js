'use client';
import { useEffect, useState } from 'react';
import { X, ShoppingBag, ArrowLeft } from 'lucide-react';
import CartItem from './CartItem';
import { useCart } from '@/lib/cart';
import { useLang } from '@/lib/i18n';
import { api } from '@/lib/client';
import { formatPrice, round2, tableLabel, PAYMENT_METHODS } from '@/lib/utils';

// Slide-up sheet with two steps: 1) cart  2) checkout
export default function Cart({ open, onClose, table, serviceFeePercent, onPlaced }) {
  const { t } = useLang();
  const { items, subtotal, setQty, remove, clear } = useCart();
  const [step, setStep] = useState('cart');
  const [form, setForm] = useState({ customerName: '', customerPhone: '', note: '', paymentMethod: 'pay_at_counter' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { if (open) { setStep('cart'); setError(''); } }, [open]);
  if (!open) return null;

  // This is only a preview. The server recalculates everything from the database prices.
  const fee = round2((subtotal * serviceFeePercent) / 100);
  const total = round2(subtotal + fee);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function confirm() {
    setLoading(true);
    setError('');
    try {
      const res = await api('/api/orders', {
        method: 'POST',
        body: {
          tableId: table.id,
          ...form,
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, note: i.note || undefined })),
        },
      });
      // Save to localStorage for history
      const orderToSave = { ...res, table, items: [...items], date: new Date().toISOString() };
      const history = JSON.parse(localStorage.getItem('order_history') || '[]');
      localStorage.setItem('order_history', JSON.stringify([orderToSave, ...history].slice(0, 50)));

      // Keep a copy of the items for the confirmation screen, then empty the cart
      onPlaced(orderToSave);
      clear();
      setLoading(false);
      onClose();
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  }

  const Totals = () => (
    <dl className="space-y-1 border-t border-dashed border-neutral-200 pt-3 text-sm">
      <div className="flex justify-between"><dt className="text-neutral-500">{t('subtotal')}</dt><dd>{formatPrice(subtotal)}</dd></div>
      {serviceFeePercent > 0 && (
        <div className="flex justify-between"><dt className="text-neutral-500">{t('serviceFee')}</dt><dd>{formatPrice(fee)}</dd></div>
      )}
      <div className="flex justify-between pt-1 text-lg font-bold"><dt>{t('total')}</dt><dd className="text-brand-600">{formatPrice(total)}</dd></div>
    </dl>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute bottom-0 left-0 right-0 flex max-h-[92vh] flex-col rounded-t-[2rem] bg-white shadow-2xl sm:inset-y-0 sm:left-auto sm:max-h-none sm:w-[440px] sm:rounded-none animate-in slide-in-from-bottom-full sm:slide-in-from-right-full duration-300"
      >
        <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-neutral-200 sm:hidden" />
        <div className="flex items-center gap-3 border-b border-neutral-100 p-5">
          {step === 'checkout' && (
            <button onClick={() => setStep('cart')} className="rounded-full bg-neutral-100 p-2 text-neutral-600 transition-colors hover:bg-neutral-200 hover:text-neutral-900" aria-label={t('back')}><ArrowLeft size={20} /></button>
          )}
          <h2 className="flex-1 text-xl font-black text-neutral-900 tracking-tight">{step === 'cart' ? t('cart') : t('placeOrder')}</h2>
          <button onClick={onClose} className="rounded-full bg-neutral-100 p-2 text-neutral-600 transition-colors hover:bg-neutral-200 hover:text-neutral-900" aria-label="Close"><X size={20} /></button>
        </div>

        {items.length === 0 ? (
          <div className="grid flex-1 place-items-center p-10 text-center text-neutral-500">
            <div><ShoppingBag className="mx-auto mb-2" size={36} />{t('emptyCart')}</div>
          </div>
        ) : step === 'cart' ? (
          <>
            <ul className="flex-1 divide-y divide-neutral-100 overflow-y-auto px-4">
              {items.map((i) => <CartItem key={i.key} item={i} onQty={setQty} onRemove={remove} />)}
            </ul>
            <div className="space-y-4 border-t border-neutral-100 bg-neutral-50/50 p-5">
              <Totals />
              <button onClick={() => setStep('checkout')} className="w-full rounded-2xl bg-brand-600 py-3.5 text-base font-bold text-white shadow-lg shadow-brand-600/30 transition-all hover:bg-brand-700 hover:shadow-xl active:scale-[0.98]">
                {t('placeOrder')}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              <p className="rounded-xl bg-brand-50 px-4 py-3 font-semibold text-brand-700">{t('table')}: {tableLabel(table.table_number)}</p>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-medium">{t('customerName')} <span className="text-neutral-400">({t('optional')})</span>
                  <input value={form.customerName} onChange={set('customerName')} maxLength={100} className="mt-1 w-full rounded-xl border border-neutral-200 p-3 outline-none focus:border-brand-500" />
                </label>
                <label className="text-sm font-medium">{t('phone')} <span className="text-neutral-400">({t('optional')})</span>
                  <input value={form.customerPhone} onChange={set('customerPhone')} type="tel" maxLength={30} className="mt-1 w-full rounded-xl border border-neutral-200 p-3 outline-none focus:border-brand-500" />
                </label>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium">{t('paymentMethod')}</p>
                <div className="space-y-2">
                  {PAYMENT_METHODS.map((m) => (
                    <label key={m} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm ${form.paymentMethod === m ? 'border-brand-600 bg-brand-50' : 'border-neutral-200'}`}>
                      <input type="radio" name="pay" checked={form.paymentMethod === m} onChange={() => setForm((f) => ({ ...f, paymentMethod: m }))} className="accent-orange-600" />
                      {t(m)}
                    </label>
                  ))}
                </div>
              </div>

              <label className="block text-sm font-medium">{t('note')} <span className="text-neutral-400">({t('optional')})</span>
                <textarea value={form.note} onChange={set('note')} maxLength={500} rows={2} className="mt-1 w-full rounded-xl border border-neutral-200 p-3 outline-none focus:border-brand-500" />
              </label>

              <div>
                <p className="mb-1 text-sm font-medium">{t('orderItems')}</p>
                <ul className="space-y-1 text-sm text-neutral-600">
                  {items.map((i) => (
                    <li key={i.key} className="flex justify-between gap-2">
                      <span>{i.quantity} × {i.name}{i.note ? ` (${i.note})` : ''}</span>
                      <span>{formatPrice(i.price * i.quantity)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-4 border-t border-neutral-100 bg-neutral-50/50 p-5">
              <Totals />
              {error && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p>}
              <button onClick={confirm} disabled={loading} className="w-full flex justify-center items-center gap-2 rounded-2xl bg-brand-600 py-3.5 text-base font-bold text-white shadow-lg shadow-brand-600/30 transition-all hover:bg-brand-700 hover:shadow-xl active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none">
                {loading ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></span> : null}
                {loading ? t('loading') : t('confirmOrder')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

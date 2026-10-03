'use client';
import { CheckCircle2 } from 'lucide-react';
import { useLang } from '@/lib/i18n';
import { formatPrice, tableLabel } from '@/lib/utils';

// Shown right after the order is placed. No tracking: staff will bring the food to the table.
export default function OrderConfirmation({ placed, onMore }) {
  const { t } = useLang();
  return (
    <main className="mx-auto max-w-lg space-y-6 px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="relative overflow-hidden rounded-[2rem] bg-white p-8 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100">
        <div className="absolute inset-x-0 -top-10 mx-auto h-32 w-32 rounded-full bg-green-500/10 blur-3xl"></div>
        <div className="relative">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-50 shadow-sm ring-8 ring-green-50/50">
            <CheckCircle2 className="text-green-500" size={40} strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900">{t('order')} #{placed.id}</h1>
          <p className="mt-2 text-base font-medium text-neutral-500">{t('received')}</p>
          <div className="mt-6 flex items-center justify-center gap-2">
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-sm font-semibold text-neutral-700">{t('table')}</span>
            <span className="text-lg font-black text-brand-600">{tableLabel(placed.table.table_number)}</span>
          </div>
          <p className="mt-6 rounded-2xl bg-brand-50 p-4 text-[15px] font-bold leading-relaxed text-brand-700 shadow-sm">{t('staffWillServe')}</p>
        </div>
      </section>

      <section className="rounded-[2rem] bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100">
        <h2 className="mb-4 text-lg font-black text-neutral-900 tracking-tight">{t('orderItems')}</h2>
        <ul className="divide-y divide-neutral-100/80">
          {placed.items.map((i) => (
            <li key={i.key} className="flex justify-between gap-4 py-3.5">
              <div className="flex-1">
                <p className="font-bold text-neutral-900 leading-snug">{i.quantity} <span className="text-neutral-400 mx-1">×</span> {i.name}</p>
                {i.note && <p className="mt-1 w-fit rounded-md bg-neutral-50 px-2 py-0.5 text-xs font-medium text-neutral-500">{i.note}</p>}
              </div>
              <span className="font-bold text-neutral-900">{formatPrice(i.price * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-2 space-y-2 border-t border-dashed border-neutral-200 pt-5">
          <div className="flex justify-between text-sm"><dt className="font-medium text-neutral-500">{t('subtotal')}</dt><dd className="font-semibold text-neutral-900">{formatPrice(placed.subtotal)}</dd></div>
          {placed.service_fee > 0 && <div className="flex justify-between text-sm"><dt className="font-medium text-neutral-500">{t('serviceFee')}</dt><dd className="font-semibold text-neutral-900">{formatPrice(placed.service_fee)}</dd></div>}
          <div className="flex justify-between pt-2 text-xl font-black"><dt>{t('total')}</dt><dd className="text-brand-600">{formatPrice(placed.total_amount)}</dd></div>
        </dl>
      </section>

      <button onClick={onMore} className="w-full rounded-2xl bg-neutral-900 py-4 text-base font-bold text-white shadow-lg shadow-neutral-900/20 transition-all hover:bg-black hover:shadow-xl active:scale-[0.98]">
        {t('orderMore')}
      </button>
    </main>
  );
}

'use client';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useLang } from '@/lib/i18n';

export default function CartItem({ item, onQty, onRemove }) {
  const { t } = useLang();
  return (
    <li className="group flex gap-4 py-4 transition-all duration-200">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-neutral-100 shadow-sm border border-neutral-100/50">
        <img src={item.image || '/images/placeholder.svg'} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-neutral-900 leading-tight line-clamp-2">{item.name}</h4>
            <button onClick={() => onRemove(item.key)} className="text-neutral-400 hover:text-red-500 transition-colors rounded-full p-1 hover:bg-red-50" aria-label={t('remove')}>
              <Trash2 size={16} />
            </button>
          </div>
          {item.note && <p className="mt-1 truncate text-xs text-brand-700 bg-brand-50 w-fit px-2 py-0.5 rounded-md font-medium">{item.note}</p>}
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-bold text-neutral-900">{formatPrice(item.price * item.quantity)}</span>
            {item.quantity > 1 && <span className="text-[11px] font-medium text-neutral-500">{formatPrice(item.price)} each</span>}
          </div>
          <div className="flex items-center gap-3 rounded-full border border-neutral-200 bg-white px-2 py-1 shadow-sm">
            <button onClick={() => onQty(item.key, item.quantity - 1)} className="text-neutral-500 transition-colors hover:text-brand-600 p-0.5" aria-label="-"><Minus size={14} /></button>
            <span className="w-5 text-center text-sm font-semibold text-neutral-800">{item.quantity}</span>
            <button onClick={() => onQty(item.key, item.quantity + 1)} className="text-neutral-500 transition-colors hover:text-brand-600 p-0.5" aria-label="+"><Plus size={14} /></button>
          </div>
        </div>
      </div>
    </li>
  );
}

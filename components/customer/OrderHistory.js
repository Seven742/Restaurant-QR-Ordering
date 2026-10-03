'use client';
import { useEffect, useState } from 'react';
import { X, History, Clock } from 'lucide-react';
import { useLang } from '@/lib/i18n';
import { formatPrice } from '@/lib/utils';

export default function OrderHistory({ open, onClose }) {
  const { t } = useLang();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (open) {
      setOrders(JSON.parse(localStorage.getItem('order_history') || '[]'));
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute bottom-0 left-0 right-0 flex max-h-[92vh] flex-col rounded-t-[2rem] bg-white shadow-2xl sm:inset-y-0 sm:left-auto sm:max-h-none sm:w-[440px] sm:rounded-none animate-in slide-in-from-bottom-full sm:slide-in-from-right-full duration-300"
      >
        <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-neutral-200 sm:hidden" />
        <div className="flex items-center gap-3 border-b border-neutral-100 p-5">
          <h2 className="flex-1 text-xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
            <History size={20} className="text-brand-600" />
            {t('myOrder')}
          </h2>
          <button onClick={onClose} className="rounded-full bg-neutral-100 p-2 text-neutral-600 transition-colors hover:bg-neutral-200 hover:text-neutral-900">
            <X size={20} />
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-neutral-500">
            <History size={40} className="mb-3 text-neutral-300" />
            <p className="font-medium text-center">No previous orders found on this device.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50/50">
            {orders.map((o, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100">
                <div className="flex justify-between items-start mb-4 border-b border-neutral-100 pb-3">
                  <div>
                    <h3 className="font-black text-neutral-900">Order #{o.id}</h3>
                    <p className="text-xs font-semibold text-neutral-400 mt-0.5 flex items-center gap-1">
                      <Clock size={12} /> {new Date(o.date).toLocaleString()}
                    </p>
                  </div>
                  <span className="font-black text-brand-600 text-lg">{formatPrice(o.total_amount)}</span>
                </div>
                
                <ul className="space-y-2 text-sm">
                  {o.items.map((i, iIdx) => (
                    <li key={iIdx} className="flex justify-between text-neutral-700">
                      <span>{i.quantity} × {i.name}</span>
                      <span className="font-semibold">{formatPrice(i.price * i.quantity)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

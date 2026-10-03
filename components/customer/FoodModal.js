'use client';
import { useState } from 'react';
import { X, Minus, Plus } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useLang } from '@/lib/i18n';

// Optional add-ons are free "options". They are added to the item note so the kitchen sees them.
// (Priced add-ons would need extra database tables - possible future upgrade.)
function optionsFor(category = '') {
  const c = category.toLowerCase();
  if (c.includes('drink')) return ['Less ice', 'No ice', 'Less sugar'];
  if (c.includes('dessert')) return ['Less sweet', 'Extra topping'];
  return ['Less spicy', 'No onion', 'Extra sauce'];
}

export default function FoodModal({ product, onClose, onAdd }) {
  const { t } = useLang();
  const [qty, setQty] = useState(1);
  const [picked, setPicked] = useState([]);
  const [note, setNote] = useState('');

  const toggle = (o) => setPicked((p) => (p.includes(o) ? p.filter((x) => x !== o) : [...p, o]));
  const submit = () => {
    onAdd(product, qty, [...picked, note.trim()].filter(Boolean).join(', ').slice(0, 300));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center animate-in fade-in duration-300" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[95vh] w-full max-w-lg overflow-y-auto rounded-t-[2rem] bg-white shadow-2xl sm:rounded-3xl animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-300"
      >
        <div className="relative h-64 sm:h-96 w-full overflow-hidden bg-neutral-100">
          <img src={product.image || '/images/placeholder.svg'} alt={product.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          <button onClick={onClose} aria-label={t('back')} className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-md transition hover:bg-black/50 active:scale-95">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-neutral-900 tracking-tight">{product.name}</h2>
            <p className="mt-1.5 text-[15px] leading-relaxed text-neutral-500">{product.description}</p>
            <p className="mt-3 text-xl font-black text-brand-600">{formatPrice(product.price)}</p>
          </div>

          <div className="mb-6 space-y-3 border-t border-neutral-100 pt-5">
            <p className="text-[15px] font-bold text-neutral-900">{t('options')}</p>
            <div className="flex flex-wrap gap-2.5">
              {optionsFor(product.category_name).map((o) => (
                <button
                  key={o}
                  onClick={() => toggle(o)}
                  className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-all active:scale-95 ${picked.includes(o) ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-sm' : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50'
                    }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8 space-y-3 border-t border-neutral-100 pt-5">
            <label className="block text-[15px] font-bold text-neutral-900">{t('specialRequest')}</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={150}
              rows={2}
              placeholder={t('specialPlaceholder')}
              className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-[15px] outline-none transition-all focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 placeholder:text-neutral-400"
            />
          </div>

          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-2 shadow-sm">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-50 text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900 active:scale-95" aria-label="-"><Minus size={18} /></button>
              <span className="w-4 text-center text-lg font-bold text-neutral-900">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(50, q + 1))} className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-50 text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900 active:scale-95" aria-label="+"><Plus size={18} /></button>
            </div>
            <button onClick={submit} className="flex-1 rounded-2xl bg-brand-600 py-4 text-base font-bold text-white shadow-lg shadow-brand-600/30 transition-all hover:bg-brand-700 hover:shadow-xl active:scale-[0.98]">
              {t('addToCart')} · {formatPrice(product.price * qty)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

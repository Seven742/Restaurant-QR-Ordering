'use client';
import { Plus } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useLang } from '@/lib/i18n';

// Horizontal card on phones, vertical card on larger screens.
export default function MenuCard({ product, onOpen, onQuickAdd }) {
  const { t } = useLang();
  return (
    <article
      onClick={() => onOpen(product)}
      className="group flex flex-row sm:flex-col cursor-pointer overflow-hidden rounded-3xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-neutral-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
    >
      <div className="relative w-[130px] sm:w-full sm:h-52 shrink-0 bg-neutral-100">
        <img
          src={product.image || '/images/placeholder.svg'}
          alt={product.name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {product.category_name && (
          <span className="mb-2 w-fit rounded-lg bg-brand-50/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-700 backdrop-blur-sm">
            {product.category_name}
          </span>
        )}
        <h3 className="text-base font-bold text-neutral-900 leading-tight line-clamp-2">{product.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-neutral-500">{product.description}</p>
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="text-lg font-black text-brand-600">{formatPrice(product.price)}</span>
          <button
            onClick={(e) => { e.stopPropagation(); onQuickAdd(product); }}
            className="flex items-center justify-center h-8 w-8 rounded-full bg-neutral-100 text-neutral-700 transition-all duration-200 hover:bg-brand-600 hover:text-white active:scale-90 sm:h-9 sm:w-auto sm:px-4 sm:gap-1.5 sm:bg-brand-600 sm:text-white sm:hover:bg-brand-700"
            aria-label={t('add')}
          >
            <Plus size={18} /> <span className="hidden sm:inline text-sm font-semibold">{t('add')}</span>
          </button>
        </div>
      </div>
    </article>
  );
}

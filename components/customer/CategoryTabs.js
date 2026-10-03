'use client';
import { useLang } from '@/lib/i18n';

export default function CategoryTabs({ categories, active, onChange }) {
  const { t } = useLang();
  const tabs = [{ id: 'all', name: t('all') }, ...categories];
  return (
    <nav className="sticky top-16 z-30 bg-neutral-50/80 backdrop-blur-md border-b border-neutral-200/50">
      <div className="mx-auto flex max-w-5xl gap-2.5 overflow-x-auto px-4 py-3.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((c) => (
          <button
            key={c.id}
            onClick={() => onChange(c.id)}
            className={`shrink-0 rounded-full px-5 py-2 text-sm font-bold transition-all duration-300 ${
              active === c.id ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 scale-105' : 'bg-white border border-neutral-200/80 text-neutral-600 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 shadow-sm'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>
    </nav>
  );
}

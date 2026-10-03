'use client';
import { useState, useEffect } from 'react';
import { ShoppingCart, Menu as MenuIcon, UtensilsCrossed } from 'lucide-react';
import { useLang } from '@/lib/i18n';

export default function Header({ name, logoUrl, tableText, cartCount = 0, onCart, onHistory }) {
  const { lang, setLang, t } = useLang();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-40 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-lg shadow-sm border-b border-neutral-200/50' : 'bg-white/50 backdrop-blur-sm border-b border-transparent'}`}>
      <div className="mx-auto flex h-16 max-w-5xl items-center gap-3 px-4">
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm border border-neutral-100">
          <img src={logoUrl || '/logo.svg'} alt="" className="h-full w-full object-cover" onError={(e) => e.target.style.display = 'none'} />
          <UtensilsCrossed className="absolute text-brand-500 opacity-50" size={20} />
        </div>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-[17px] font-bold text-neutral-900 tracking-tight">{name || '...'}</p>
          {tableText && <p className="text-[11px] font-bold tracking-wider text-brand-600 uppercase">{tableText}</p>}
        </div>

        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          aria-label="Language"
          className="rounded-xl border border-neutral-200 bg-white/70 px-2.5 py-1.5 text-xs font-bold text-neutral-700 outline-none transition-all hover:border-neutral-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
        >
          <option value="en">EN</option>
          <option value="km">ខ្មែរ</option>
        </select>

        {onCart && (
          <button onClick={onCart} aria-label={t('cart')} className="relative rounded-2xl bg-white border border-neutral-100 p-2.5 text-neutral-700 shadow-sm transition-all hover:bg-neutral-50 hover:shadow active:scale-95">
            <ShoppingCart size={18} />
            {cartCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-[20px] place-items-center rounded-full bg-brand-600 px-1 text-[10px] font-black text-white shadow-sm ring-2 ring-white">
                {cartCount}
              </span>
            )}
          </button>
        )}

        <div className="relative">
          <button onClick={() => setOpen((v) => !v)} aria-label={t('menu')} className="rounded-2xl bg-white border border-neutral-100 p-2.5 text-neutral-700 shadow-sm transition-all hover:bg-neutral-50 hover:shadow active:scale-95">
            <MenuIcon size={18} />
          </button>
          {open && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
              <div className="absolute right-0 top-14 z-40 w-48 origin-top-right overflow-hidden rounded-2xl bg-white p-1.5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] ring-1 ring-black/5">
                <button
                  onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setOpen(false); }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-brand-600"
                >
                  <UtensilsCrossed size={16} /> {t('menu')}
                </button>
                {onHistory && (
                  <button
                    onClick={() => { onHistory(); setOpen(false); }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-brand-600"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg> {t('myOrder')}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

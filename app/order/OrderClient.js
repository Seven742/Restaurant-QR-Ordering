'use client';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { QrCode, ShoppingBag } from 'lucide-react';
import Header from '@/components/customer/Header';
import CategoryTabs from '@/components/customer/CategoryTabs';
import MenuCard from '@/components/customer/MenuCard';
import FoodModal from '@/components/customer/FoodModal';
import Cart from '@/components/customer/Cart';
import OrderConfirmation from '@/components/customer/OrderConfirmation';
import { CartProvider, useCart } from '@/lib/cart';
import { useLang } from '@/lib/i18n';
import { api } from '@/lib/client';
import { formatPrice, tableLabel } from '@/lib/utils';

import OrderHistory from '@/components/customer/OrderHistory';

function Message({ text }) {
  return (
    <main className="grid min-h-screen place-items-center p-6 text-center">
      <div className="max-w-xs">
        <QrCode className="mx-auto mb-3 text-brand-600" size={48} />
        <p className="text-lg font-semibold">{text}</p>
      </div>
    </main>
  );
}

// The table number comes from the QR URL: /order?table=1
export default function OrderClient() {
  const { t } = useLang();
  const raw = useSearchParams().get('table');
  const tableId = /^\d{1,9}$/.test(raw || '') ? Number(raw) : null;

  if (!tableId) return <Message text={t('scanQr')} />;
  return (
    <CartProvider tableId={tableId}>
      <MenuView tableId={tableId} />
    </CartProvider>
  );
}

function MenuView({ tableId }) {
  const { t } = useLang();
  const { count, subtotal, add } = useCart();
  const [data, setData] = useState(null); // { table, products, categories, settings }
  const [error, setError] = useState('');
  const [active, setActive] = useState('all');
  const [selected, setSelected] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [placed, setPlaced] = useState(null); // set after the order is created

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    Promise.all([api(`/api/tables/${tableId}`), api('/api/products'), api('/api/categories'), api('/api/settings')])
      .then(([table, products, categories, settings]) => setData({ table, products, categories, settings }))
      .catch((e) => setError(e.status === 404 ? t('tableNotFound') : e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableId]);

  const categories = useMemo(
    () => (data ? data.categories.filter((c) => data.products.some((p) => p.category_id === c.id)) : []),
    [data]
  );
  const visible = useMemo(
    () => (data ? data.products.filter((p) => {
      const matchCat = active === 'all' || p.category_id === active;
      const q = searchQuery.toLowerCase();
      const matchSearch = p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q));
      return matchCat && matchSearch;
    }) : []),
    [data, active, searchQuery]
  );

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 1500);
  };
  const addToCart = (product, qty = 1, note = '') => {
    add(product, qty, note);
    showToast(`${t('added')}: ${product.name}`);
  };

  if (error) return <Message text={error} />;
  if (!data) return <Message text={t('loading')} />;
  if (data.table.status === 'disabled') return <Message text={t('tableDisabled')} />;

  if (placed)
    return (
      <div className="min-h-screen">
        <Header name={data.settings.restaurantName} logoUrl={data.settings.logoUrl} tableText={tableLabel(data.table.table_number)} onHistory={() => setHistoryOpen(true)} />
        <OrderConfirmation placed={placed} onMore={() => setPlaced(null)} />
        <OrderHistory open={historyOpen} onClose={() => setHistoryOpen(false)} />
      </div>
    );

  return (
    <div className="min-h-screen pb-28">
      <Header name={data.settings.restaurantName} logoUrl={data.settings.logoUrl} tableText={tableLabel(data.table.table_number)} cartCount={count} onCart={() => setCartOpen(true)} onHistory={() => setHistoryOpen(true)} />
      
      <div className="mx-auto max-w-5xl px-4 mt-2 mb-2">
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input
            type="text"
            placeholder={t('searchFood') || 'Search menu...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl bg-white py-3 pl-11 pr-4 text-[15px] font-medium outline-none border border-neutral-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all placeholder:text-neutral-400"
          />
        </div>
      </div>

      <CategoryTabs categories={categories} active={active} onChange={setActive} />

      <main className="mx-auto max-w-5xl px-4 pt-1">
        {visible.length === 0 ? (
          <p className="py-16 text-center text-neutral-500">{t('noFood')}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {visible.map((p) => (
              <MenuCard key={p.id} product={p} onOpen={setSelected} onQuickAdd={(prod) => addToCart(prod)} />
            ))}
          </div>
        )}
      </main>

      {/* Floating cart bar (like food delivery apps) */}
      {count > 0 && !cartOpen && (
        <div className="fixed inset-x-0 bottom-0 z-30 p-4 pb-6 bg-gradient-to-t from-white via-white/90 to-transparent pt-12 pointer-events-none animate-in slide-in-from-bottom-10 fade-in duration-300">
          <button
            onClick={() => setCartOpen(true)}
            className="pointer-events-auto mx-auto flex w-full max-w-md items-center justify-between rounded-2xl bg-brand-600 px-5 py-4 font-bold text-white shadow-[0_8px_30px_rgba(234,88,12,0.3)] transition-all hover:bg-brand-700 hover:shadow-[0_12px_40px_rgba(234,88,12,0.4)] active:scale-[0.98]"
          >
            <span className="flex items-center gap-3">
              <div className="relative flex items-center justify-center">
                <ShoppingBag size={20} />
                <span className="absolute -right-2 -top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white px-1 text-[11px] font-black text-brand-600 shadow-sm">
                  {count}
                </span>
              </div>
              <span className="tracking-wide">{t('viewCart')}</span>
            </span>
            <span className="text-lg">{formatPrice(subtotal)}</span>
          </button>
        </div>
      )}

      {toast && (
        <div className="fixed left-1/2 top-20 z-[60] -translate-x-1/2 rounded-full bg-neutral-900 px-4 py-2 text-sm text-white shadow-lg">{toast}</div>
      )}

      {selected && <FoodModal product={selected} onClose={() => setSelected(null)} onAdd={addToCart} />}
      <Cart open={cartOpen} onClose={() => setCartOpen(false)} table={data.table} serviceFeePercent={data.settings.serviceFeePercent} onPlaced={setPlaced} />
      <OrderHistory open={historyOpen} onClose={() => setHistoryOpen(false)} />
    </div>
  );
}

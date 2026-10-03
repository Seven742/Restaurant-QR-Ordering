'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { round2 } from './utils';

const CartCtx = createContext(null);

// One cart per table, saved in localStorage so a page refresh does not empty it.
export function CartProvider({ tableId, children }) {
  const storageKey = `cart:${tableId}`;
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
      if (Array.isArray(saved)) setItems(saved);
    } catch {}
    setLoaded(true);
  }, [storageKey]);

  useEffect(() => {
    if (loaded) localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, loaded, storageKey]);

  // Same food + same note = same line (quantities are merged)
  const add = (product, quantity = 1, note = '') => {
    const key = `${product.id}|${note}`;
    setItems((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) return prev.map((i) => (i.key === key ? { ...i, quantity: Math.min(50, i.quantity + quantity) } : i));
      return [...prev, { key, productId: product.id, name: product.name, price: product.price, image: product.image, quantity, note }];
    });
  };
  const setQty = (key, q) =>
    setItems((prev) => (q < 1 ? prev.filter((i) => i.key !== key) : prev.map((i) => (i.key === key ? { ...i, quantity: Math.min(50, q) } : i))));
  const remove = (key) => setItems((prev) => prev.filter((i) => i.key !== key));
  const clear = () => setItems([]);

  const count = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = round2(items.reduce((s, i) => s + i.price * i.quantity, 0));

  return <CartCtx.Provider value={{ items, count, subtotal, add, setQty, remove, clear }}>{children}</CartCtx.Provider>;
}

export const useCart = () => useContext(CartCtx);

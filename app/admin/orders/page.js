'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/client';
import { formatPrice } from '@/lib/utils';

export default function LiveOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Simple polling for live orders (every 10s)
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const [pending, preparing, ready] = await Promise.all([
          api('/api/orders?status=pending'),
          api('/api/orders?status=preparing'),
          api('/api/orders?status=ready')
        ]);
        // Sort by created_at ascending (oldest first) so they get handled first
        const all = [...pending, ...preparing, ...ready].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        setOrders(all);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api(`/api/orders/${id}`, { method: 'PATCH', body: { status } });
      setOrders(orders.map((o) => (o.id === id ? { ...o, status } : o)).filter(o => o.status !== 'completed'));
    } catch (e) {
      alert(e.message);
    }
  };

  if (loading) return <div className="p-8 text-neutral-500 font-semibold">Loading live orders...</div>;

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-green-100 text-green-800';
      default: return 'bg-neutral-100 text-neutral-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-neutral-900 tracking-tight">Live Orders</h2>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-3xl bg-white p-12 text-center shadow-sm border border-neutral-100">
          <p className="text-neutral-500 font-medium">No active orders right now.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {orders.map((order) => (
            <div key={order.id} className="rounded-[2rem] bg-white p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-neutral-100 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-neutral-900">Table {order.table_number}</h3>
                  <p className="text-sm font-medium text-neutral-500">Order #{order.id} • {new Date(order.created_at).toLocaleTimeString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>

              <div className="flex-1 bg-neutral-50 rounded-2xl p-4 mb-4">
                <ul className="space-y-3">
                  {order.items?.map((item, idx) => (
                    <li key={idx} className="text-[15px]">
                      <div className="flex justify-between font-bold text-neutral-900">
                        <span>{item.quantity} x {item.product_name}</span>
                      </div>
                      {item.note && <p className="text-sm font-medium text-red-500 mt-0.5">{item.note}</p>}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex justify-between items-center mt-auto border-t border-neutral-100 pt-4 mb-4">
                <span className="font-semibold text-neutral-500">Total</span>
                <span className="font-black text-brand-600 text-lg">{formatPrice(order.total_amount)}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-auto">
                {order.status === 'pending' && (
                  <button onClick={() => updateStatus(order.id, 'preparing')} className="col-span-2 rounded-xl bg-brand-600 py-3 font-bold text-white hover:bg-brand-700 transition">
                    Accept & Prepare
                  </button>
                )}
                {order.status === 'preparing' && (
                  <button onClick={() => updateStatus(order.id, 'ready')} className="col-span-2 rounded-xl bg-blue-600 py-3 font-bold text-white hover:bg-blue-700 transition">
                    Mark Ready to Serve
                  </button>
                )}
                {order.status === 'ready' && (
                  <button onClick={() => updateStatus(order.id, 'completed')} className="col-span-2 rounded-xl bg-green-600 py-3 font-bold text-white hover:bg-green-700 transition">
                    Complete Order
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

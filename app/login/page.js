'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, Loader2, UtensilsCrossed } from 'lucide-react';
import { api } from '@/lib/client';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api('/api/auth/login', { method: 'POST', body: { email, password } });
      router.push(searchParams.get('next') || '/admin/orders');
      router.refresh();
    } catch (err) {
      setError(err.message || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-50 grid place-items-center p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100 animate-in fade-in zoom-in-95 duration-500">
        <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 shadow-sm ring-8 ring-brand-50/50">
          <UtensilsCrossed size={32} />
        </div>
        <h1 className="text-3xl font-black text-center text-neutral-900 tracking-tight">Staff Login</h1>
        <p className="mt-2 mb-8 text-center text-neutral-500 font-medium">Please sign in to manage orders</p>
        
        {error && <p className="mb-6 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-600 border border-red-100 text-center">{error}</p>}
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block mb-2 text-sm font-bold text-neutral-900">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 py-3.5 pl-12 pr-4 text-[15px] font-medium outline-none transition-all focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 placeholder:text-neutral-400"
                placeholder="staff@restaurant.com"
              />
            </div>
          </div>
          <div>
            <label className="block mb-2 text-sm font-bold text-neutral-900">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 py-3.5 pl-12 pr-4 text-[15px] font-medium outline-none transition-all focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 placeholder:text-neutral-400"
                placeholder="••••••••"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 rounded-2xl bg-brand-600 py-4 mt-2 text-base font-bold text-white shadow-lg shadow-brand-600/30 transition-all hover:bg-brand-700 hover:shadow-xl active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
          </button>
        </form>
      </div>
    </main>
  );
}

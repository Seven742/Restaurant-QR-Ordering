'use client';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { api } from '@/lib/client';

export default function LogoutButton() {
  const router = useRouter();
  
  const handleLogout = async () => {
    try {
      await api('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-neutral-600 transition-colors hover:bg-red-50 hover:text-red-600"
    >
      <LogOut size={18} />
      Sign Out
    </button>
  );
}

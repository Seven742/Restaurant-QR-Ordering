import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { UtensilsCrossed, LayoutDashboard, QrCode, Settings, Coffee } from 'lucide-react';
import LogoutButton from './LogoutButton';

export const metadata = { title: 'Admin - Restaurant QR' };

export default async function AdminLayout({ children }) {
  const session = await getSession();
  if (!session) return null; // Middleware handles redirect

  const links = [
    { name: 'Live Orders', href: '/admin/orders', icon: LayoutDashboard },
    { name: 'Tables & QR', href: '/admin/tables', icon: QrCode },
  ];

  if (session.role === 'admin') {
    links.push({ name: 'Menu Editor', href: '/admin/menu', icon: Coffee });
    links.push({ name: 'Settings', href: '/admin/settings', icon: Settings });
  }

  return (
    <div className="flex h-screen bg-neutral-50">
      <aside className="w-64 flex-shrink-0 border-r border-neutral-200 bg-white shadow-sm flex flex-col">
        <div className="flex items-center gap-3 p-6 border-b border-neutral-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <UtensilsCrossed size={20} />
          </div>
          <div>
            <h1 className="font-bold text-neutral-900 leading-tight">Restaurant QR</h1>
            <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">{session.role}</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-neutral-600 transition-colors hover:bg-brand-50 hover:text-brand-700"
            >
              <link.icon size={18} />
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-neutral-100">
          <div className="mb-4 px-4">
            <p className="text-sm font-semibold text-neutral-900">{session.name}</p>
            <p className="text-xs text-neutral-500">{session.email}</p>
          </div>
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}

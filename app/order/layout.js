import { LangProvider } from '@/lib/i18n';

export default function OrderLayout({ children }) {
  return <LangProvider>{children}</LangProvider>;
}

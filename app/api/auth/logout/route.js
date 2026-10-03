import { handle, ok } from '@/lib/api';
import { clearAuthCookie } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// POST /api/auth/logout
export const POST = handle(async () => {
  clearAuthCookie();
  return ok({ success: true });
});

import { handle, ok, ApiError } from '@/lib/api';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/auth/me  -> current user (used by the admin layout)
export const GET = handle(async () => {
  const s = await getSession();
  if (!s) throw new ApiError(401, 'Not logged in');
  return ok({ user: { id: Number(s.sub), name: s.name, email: s.email, role: s.role } });
});

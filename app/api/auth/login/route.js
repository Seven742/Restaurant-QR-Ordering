import { query } from '@/lib/db';
import { handle, ok, readJson, ApiError } from '@/lib/api';
import { setAuthCookie, verifyPassword } from '@/lib/auth';
import { str } from '@/lib/validate';

export const dynamic = 'force-dynamic';

// POST /api/auth/login  { email, password }
export const POST = handle(async (req) => {
  const body = await readJson(req);
  const email = str(body.email, 'email', { required: true, max: 190 }).toLowerCase();
  // Do not trim passwords: spaces can be part of them
  if (typeof body.password !== 'string' || !body.password || body.password.length > 200)
    throw new ApiError(422, 'password is required');

  const [user] = await query('SELECT id, name, email, password, role FROM users WHERE email = ?', [email]);
  const valid = user ? await verifyPassword(body.password, user.password) : false;
  // Same message for "unknown email" and "wrong password" so attackers learn nothing
  if (!valid) throw new ApiError(401, 'Invalid email or password');

  await setAuthCookie({ sub: String(user.id), name: user.name, email: user.email, role: user.role });
  return ok({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

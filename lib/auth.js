import bcrypt from 'bcrypt';
import { cookies } from 'next/headers';
import { ApiError } from './api';
import { COOKIE_NAME, MAX_AGE, signToken, verifyToken } from './jwt';

export const hashPassword = (plain) => bcrypt.hash(plain, 12);
export const verifyPassword = (plain, hash) => bcrypt.compare(plain, hash);

/** Store the login token in an httpOnly cookie (JavaScript in the browser cannot read it). */
export async function setAuthCookie(payload) {
  cookies().set(COOKIE_NAME, await signToken(payload), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE,
  });
}

export const clearAuthCookie = () => cookies().delete(COOKIE_NAME);

/** Current logged-in user ({ sub, name, email, role }) or null. */
export async function getSession() {
  const token = cookies().get(COOKIE_NAME)?.value;
  return token ? verifyToken(token) : null;
}

/** Use at the top of protected API routes. Throws 401 / 403 automatically. */
export async function requireRole(roles = ['admin', 'staff']) {
  const session = await getSession();
  if (!session) throw new ApiError(401, 'Please log in');
  if (!roles.includes(session.role)) throw new ApiError(403, 'You do not have permission');
  return session;
}

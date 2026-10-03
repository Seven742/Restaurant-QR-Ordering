// JWT helpers using `jose` (works in both Node and the Edge middleware).
import { SignJWT, jwtVerify } from 'jose';

export const COOKIE_NAME = 'qr_session';
export const MAX_AGE = 60 * 60 * 12; // 12 hours

function secret() {
  if (!process.env.AUTH_SECRET) throw new Error('AUTH_SECRET is not set in .env.local');
  return new TextEncoder().encode(process.env.AUTH_SECRET);
}

export const signToken = (payload) =>
  new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime(`${MAX_AGE}s`).sign(secret());

/** Returns the payload, or null if the token is missing/invalid/expired. */
export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload;
  } catch {
    return null;
  }
}

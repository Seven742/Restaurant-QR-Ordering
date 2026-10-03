import { ApiError } from './api';

const fail = (msg) => {
  throw new ApiError(422, msg);
};
const empty = (v) => v === undefined || v === null || v === '';

/** Text: trimmed, length-checked. Returns null when empty and optional. */
export function str(v, field, { required = false, max = 255 } = {}) {
  if (empty(v)) return required ? fail(`${field} is required`) : null;
  if (typeof v !== 'string') return fail(`${field} must be text`);
  const s = v.trim();
  if (!s) return required ? fail(`${field} is required`) : null;
  if (s.length > max) return fail(`${field} must be at most ${max} characters`);
  return s;
}

export function num(v, field, { min = 0, max = 1_000_000 } = {}) {
  const n = typeof v === 'string' && v.trim() !== '' ? Number(v) : v;
  if (typeof n !== 'number' || !Number.isFinite(n)) return fail(`${field} must be a number`);
  if (n < min || n > max) return fail(`${field} must be between ${min} and ${max}`);
  return n;
}

export function int(v, field, opts = {}) {
  const n = num(v, field, opts);
  return Number.isInteger(n) ? n : fail(`${field} must be a whole number`);
}

export function bool(v, field) {
  return typeof v === 'boolean' ? v : fail(`${field} must be true or false`);
}

export function oneOf(v, field, list) {
  return list.includes(v) ? v : fail(`${field} must be one of: ${list.join(', ')}`);
}

/** Validate an id taken from the URL (e.g. /api/products/12). */
export function parseId(v, field = 'id') {
  const n = Number(v);
  if (!Number.isInteger(n) || n < 1) throw new ApiError(400, `Invalid ${field}`);
  return n;
}

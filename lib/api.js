import { NextResponse } from 'next/server';

/** Throw this from any route to send a clean error response. */
export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const ok = (data, status = 200) => NextResponse.json(data, { status });

export async function readJson(req) {
  try {
    return await req.json();
  } catch {
    throw new ApiError(400, 'Invalid JSON body');
  }
}

// Friendly messages for common MySQL errors
const MYSQL_ERRORS = {
  ER_DUP_ENTRY: [409, 'This value already exists'],
  ER_ROW_IS_REFERENCED_2: [409, 'Cannot delete: it is still used by other records'],
  ER_NO_REFERENCED_ROW_2: [422, 'Related record does not exist'],
};

/** Wrap a route handler so every error becomes a proper JSON response. */
export const handle = (fn) => async (req, ctx) => {
  try {
    return await fn(req, ctx);
  } catch (e) {
    if (e instanceof ApiError) return NextResponse.json({ error: e.message, details: e.details }, { status: e.status });
    if (MYSQL_ERRORS[e?.code]) {
      const [status, error] = MYSQL_ERRORS[e.code];
      return NextResponse.json({ error }, { status });
    }
    console.error(e); // full error stays in the server log only
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
};

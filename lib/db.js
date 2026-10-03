import mysql from 'mysql2/promise';

// Reuse one connection pool. In dev, Next.js reloads modules often,
// so we keep the pool on `globalThis` to avoid opening too many connections.
// This file only runs on the server, so credentials never reach the browser.
const globalForDb = globalThis;

export const pool =
  globalForDb.__dbPool ??
  mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    decimalNumbers: true, // DECIMAL columns come back as numbers, not strings
    dateStrings: true, // dates stay as 'YYYY-MM-DD HH:MM:SS' (no timezone surprises)
  });

if (process.env.NODE_ENV !== 'production') globalForDb.__dbPool = pool;

/** Run a query and return the rows. Always pass values via `params` (prevents SQL injection). */
export async function query(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

/** Build "a = ?, b = ?" for UPDATE statements. Keys come from our own validators, never from raw user input. */
export function buildSet(fields) {
  const keys = Object.keys(fields);
  return { sql: keys.map((k) => `\`${k}\` = ?`).join(', '), params: keys.map((k) => fields[k]) };
}

import fs from 'fs';
import mysql from 'mysql2/promise';

async function run() {
  const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
    const [key, ...val] = line.split('=');
    if (key && key.trim()) acc[key.trim()] = val.join('=').trim();
    return acc;
  }, {});

  const pool = mysql.createPool({
    host: env.DB_HOST || 'localhost',
    port: Number(env.DB_PORT || 3306),
    user: env.DB_USER || 'root',
    password: env.DB_PASSWORD || '',
    database: env.DB_NAME || 'restaurant_qr',
  });
  
  await pool.query(`
    CREATE TABLE IF NOT EXISTS settings (
      id INT PRIMARY KEY,
      restaurant_name VARCHAR(100) NOT NULL,
      logo_url VARCHAR(255) NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  
  const [rows] = await pool.query('SELECT * FROM settings WHERE id = 1');
  if (rows.length === 0) {
    await pool.query('INSERT INTO settings (id, restaurant_name, logo_url) VALUES (1, ?, ?)', [
      env.RESTAURANT_NAME || 'Restaurant Name', 
      '/logo.svg'
    ]);
  }
  console.log('Settings table created and seeded.');
  process.exit(0);
}
run();

// Usage: npm run db:reset
// WARNING: drops and recreates all tables, then inserts demo data.
import fs from 'node:fs';
import path from 'node:path';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

const { DB_HOST = 'localhost', DB_PORT = 3306, DB_USER = 'root', DB_PASSWORD = '', DB_NAME = 'restaurant_qr' } = process.env;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// 1) Connect without a database first so we can create it
const root = await mysql.createConnection({ host: DB_HOST, port: DB_PORT, user: DB_USER, password: DB_PASSWORD, multipleStatements: true });
await root.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4`);
await root.end();

const db = await mysql.createConnection({ host: DB_HOST, port: DB_PORT, user: DB_USER, password: DB_PASSWORD, database: DB_NAME, multipleStatements: true });

// 2) Reset + create schema
await db.query('SET FOREIGN_KEY_CHECKS=0');
for (const t of ['order_items', 'orders', 'products', 'categories', '`tables`', 'users']) await db.query(`DROP TABLE IF EXISTS ${t}`);
await db.query('SET FOREIGN_KEY_CHECKS=1');
await db.query(fs.readFileSync(path.join(process.cwd(), 'database', 'schema.sql'), 'utf8'));

// 3) Users (change these passwords before going live!)
await db.query('INSERT INTO users (name,email,password,role) VALUES ?', [[
  ['Admin', 'admin@restaurant.com', await bcrypt.hash('Admin@123', 12), 'admin'],
  ['Staff', 'staff@restaurant.com', await bcrypt.hash('Staff@123', 12), 'staff'],
]]);

// 4) Tables 1..10 + QR URL
for (let n = 1; n <= 10; n++) await db.query('INSERT INTO `tables` (table_number) VALUES (?)', [n]);
await db.query('UPDATE `tables` SET qr_code = CONCAT(?, "/order?table=", id)', [APP_URL]);

// 5) Categories
const categories = [
  ['Appetizers', 'Small bites to start'], ['Main Course', 'Hearty main dishes'], ['Rice', 'Rice dishes'],
  ['Noodles', 'Noodles and pasta'], ['Drinks', 'Cold and hot drinks'], ['Desserts', 'Sweet endings'],
];
const catId = {};
for (const [name, desc] of categories) {
  const [r] = await db.query('INSERT INTO categories (name, description) VALUES (?,?)', [name, desc]);
  catId[name] = r.insertId;
}

// 6) Products (image is NULL -> UI shows /images/placeholder.svg; upload real photos in admin)
const products = [
  ['Appetizers', 'Spring Rolls', 'Crispy rolls filled with vegetables and pork, served with sweet chili sauce.', 3.5],
  ['Appetizers', 'Chicken Wings', 'Six golden wings tossed in honey garlic glaze.', 5.5],
  ['Appetizers', 'Crispy Calamari', 'Lightly battered squid rings with lime mayo.', 6.0],
  ['Appetizers', 'Garlic Bread', 'Toasted baguette with garlic butter and herbs.', 3.0],
  ['Main Course', 'Grilled Chicken Steak', 'Juicy chicken breast with black pepper sauce, fries and salad.', 8.5],
  ['Main Course', 'Beef Lok Lak', 'Cambodian stir-fried beef with lime pepper dip, egg and fresh vegetables.', 7.5],
  ['Main Course', 'Fish Amok', 'Steamed fish curry in banana leaf with coconut cream.', 7.0],
  ['Main Course', 'BBQ Pork Ribs', 'Slow-cooked ribs glazed with smoky BBQ sauce.', 9.0],
  ['Rice', 'Chicken Fried Rice', 'Fried rice with chicken, vegetables and egg.', 4.5],
  ['Rice', 'Seafood Fried Rice', 'Fried rice with shrimp, squid and egg.', 5.5],
  ['Rice', 'Steamed Rice with Pork', 'Grilled marinated pork over steamed rice with pickles.', 4.0],
  ['Noodles', 'Stir-fried Noodles with Beef', 'Wok-fried noodles with beef, greens and soy sauce.', 5.0],
  ['Noodles', 'Chicken Noodle Soup', 'Warm broth with chicken, noodles and herbs.', 4.5],
  ['Noodles', 'Spaghetti Carbonara', 'Creamy spaghetti with bacon and parmesan.', 6.5],
  ['Drinks', 'Coca Cola', 'Chilled 330ml can.', 1.5],
  ['Drinks', 'Iced Lemon Tea', 'Fresh black tea with lemon and ice.', 2.0],
  ['Drinks', 'Fresh Orange Juice', 'Squeezed to order.', 2.5],
  ['Drinks', 'Iced Coffee', 'Strong coffee with condensed milk over ice.', 2.5],
  ['Desserts', 'Mango Sticky Rice', 'Sweet coconut sticky rice with ripe mango.', 3.5],
  ['Desserts', 'Chocolate Lava Cake', 'Warm cake with a molten chocolate center.', 4.0],
];
const prod = {};
for (const [cat, name, desc, price] of products) {
  const [r] = await db.query('INSERT INTO products (category_id,name,description,price) VALUES (?,?,?,?)', [catId[cat], name, desc, price]);
  prod[name] = { id: r.insertId, price };
}

// 7) Demo orders: [tableId, customer, status, payment, minutesAgo, [[product, qty], ...]]
const FEE = 0.05;
const orders = [
  [1, 'Sokha', 'pending', 'pay_at_counter', 3, [['Chicken Fried Rice', 2], ['Coca Cola', 1]]],
  [3, null, 'preparing', 'cash', 12, [['Beef Lok Lak', 1], ['Iced Lemon Tea', 2]]],
  [5, 'Dara', 'ready', 'qr_payment', 25, [['Fish Amok', 2], ['Mango Sticky Rice', 2]]],
  [2, null, 'completed', 'cash', 90, [['BBQ Pork Ribs', 1], ['Fresh Orange Juice', 1]]],
  [7, 'Vanna', 'completed', 'pay_at_counter', 1500, [['Spaghetti Carbonara', 2], ['Iced Coffee', 2]]],
  [4, null, 'completed', 'qr_payment', 2900, [['Seafood Fried Rice', 3], ['Spring Rolls', 2], ['Coca Cola', 3]]],
  [6, 'Rith', 'cancelled', 'cash', 200, [['Chicken Wings', 2]]],
];
for (const [tableId, name, status, payment, mins, items] of orders) {
  const lines = items.map(([n, q]) => ({ ...prod[n], name: n, qty: q, sub: +(prod[n].price * q).toFixed(2) }));
  const subtotal = lines.reduce((s, l) => s + l.sub, 0);
  const fee = +(subtotal * FEE).toFixed(2);
  const [r] = await db.query(
    'INSERT INTO orders (table_id,customer_name,service_fee,total_amount,status,payment_method,created_at) VALUES (?,?,?,?,?,?,DATE_SUB(NOW(), INTERVAL ? MINUTE))',
    [tableId, name, fee, +(subtotal + fee).toFixed(2), status, payment, mins]
  );
  await db.query('INSERT INTO order_items (order_id,product_id,product_name,price,quantity,subtotal) VALUES ?',
    [lines.map((l) => [r.insertId, l.id, l.name, l.price, l.qty, l.sub])]);
}
// Tables with an active order are occupied
await db.query("UPDATE `tables` SET status='occupied' WHERE id IN (SELECT DISTINCT table_id FROM orders WHERE status IN ('pending','confirmed','preparing','ready'))");

console.log('Database ready.\n  admin: admin@restaurant.com / Admin@123\n  staff: staff@restaurant.com / Staff@123');
await db.end();

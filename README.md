# Restaurant QR Ordering System

A modern, full-stack web application built with Next.js 14 for restaurants to provide contactless QR code ordering for their customers. The system includes a comprehensive admin dashboard for managing menus, tables, orders, and restaurant settings.

## 🌟 Features

### For Customers
* **QR Code Menu**: Scan a QR code on the table to access the digital menu instantly.
* **Seamless Ordering**: Browse categories, add items to the cart (with quantity), and place orders directly from their smartphone.
* **Order Tracking**: Real-time view of order status (pending, completed, etc.).
* **No App Required**: Works directly in the mobile browser.

### For Admins & Staff
* **Secure Dashboard**: Protected routes requiring admin/staff authentication.
* **Order Management**: View recent orders, update statuses, and manage the workflow.
* **Menu Management**: Add, edit, or delete categories and food items. Upload images directly.
* **Table Management**: Manage restaurant tables and generate unique QR codes for each table.
* **Analytics**: Dashboard with sales charts, revenue metrics, popular foods, and order summaries.
* **Settings**: Configure restaurant details.

## 🚀 Tech Stack

* **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/)
* **Database**: MySQL (using `mysql2`)
* **Authentication**: Custom JWT authentication (`jose`, `bcrypt`)
* **Image Hosting**: [Cloudinary](https://cloudinary.com/)
* **Icons**: [Lucide React](https://lucide.dev/)
* **QR Code Generation**: `qrcode`

## ⚙️ Getting Started

### Prerequisites
* Node.js (v18 or higher recommended)
* MySQL Database
* Cloudinary Account (for image uploads)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Seven742/Restaurant-QR-Ordering.git
   cd Restaurant-QR-Ordering
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file in the root directory and copy the contents from `.env.example`. Fill in your specific database and Cloudinary details:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=your_db_name

   # JWT Secret for Authentication
   JWT_SECRET=your_super_secret_jwt_key_here

   # Cloudinary for Image Uploads
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **Initialize the Database:**
   Run the database schema file `database/schema.sql` in your MySQL database to create the necessary tables.
   You can also seed the initial data (including an admin user) by running:
   ```bash
   npm run db:reset
   ```

5. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   The application will be available at [http://localhost:3000](http://localhost:3000).

## 🗄️ Project Structure

* `/app` - Next.js App Router (Pages, Layouts, API routes)
  * `/admin` - Admin dashboard pages
  * `/api` - Backend API endpoints
  * `/order` - Customer ordering interface
* `/components` - Reusable React components (Admin, Customer)
* `/database` - SQL schemas
* `/lib` - Utility functions (DB connection, Auth, JWT, Orders)
* `/scripts` - Seeding and migration scripts

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

import './globals.css';

export const metadata = {
  title: 'Restaurant QR Ordering',
  description: 'Scan, order and track your food from your table.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

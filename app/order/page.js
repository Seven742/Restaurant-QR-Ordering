import { Suspense } from 'react';
import OrderClient from './OrderClient';

// useSearchParams() needs a Suspense boundary in the App Router
export default function OrderPage() {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center text-neutral-400">...</div>}>
      <OrderClient />
    </Suspense>
  );
}

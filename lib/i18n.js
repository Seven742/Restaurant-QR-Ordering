'use client';
import { createContext, useContext, useEffect, useState } from 'react';

// Minimal translations for the customer UI (food names come from the database).
const dict = {
  en: {
    menu: 'Menu', all: 'All', add: 'Add', addToCart: 'Add to Cart', cart: 'Cart', quantity: 'Quantity',
    specialRequest: 'Special request', specialPlaceholder: 'e.g. Less spicy', options: 'Options',
    subtotal: 'Subtotal', serviceFee: 'Service Fee', total: 'Total', placeOrder: 'Place Order',
    confirmOrder: 'Confirm Order', customerName: 'Customer Name', phone: 'Phone', optional: 'optional',
    paymentMethod: 'Payment Method', pay_at_counter: 'Pay at Counter', cash: 'Cash', qr_payment: 'QR Payment',
    note: 'Special Note', orderItems: 'Order Items', emptyCart: 'Your cart is empty', remove: 'Remove',
    table: 'Table', loading: 'Loading...', back: 'Back', viewCart: 'View cart', items: 'items',
    scanQr: 'Please scan the QR code on your restaurant table.', tableNotFound: 'Table not found. Please scan the QR code again.',
    tableDisabled: 'This table is not accepting orders.', received: 'Your order has been received.',
    trackOrder: 'Track Order', backToMenu: 'Back to Menu', order: 'Order', myOrder: 'My last order',
    staffWillServe: 'Our staff will bring your food to your table.', orderMore: 'Order More',
    added: 'Added to cart', payment: 'Payment', retry: 'Try again', orderNotFound: 'Order not found',
    autoRefresh: 'This page refreshes automatically.', noFood: 'No food available in this category.',
    pending: 'Order Received', confirmed: 'Confirmed', preparing: 'Preparing', ready: 'Ready',
    completed: 'Completed', cancelled: 'Cancelled', cancelledMsg: 'This order was cancelled. Please ask our staff.',
  },
  km: {
    menu: 'ម៉ឺនុយ', all: 'ទាំងអស់', add: 'បន្ថែម', addToCart: 'បន្ថែមទៅកន្ត្រក', cart: 'កន្ត្រក', quantity: 'ចំនួន',
    specialRequest: 'សំណើពិសេស', specialPlaceholder: 'ឧ. ហឹរតិច', options: 'ជម្រើស',
    subtotal: 'សរុបរង', serviceFee: 'ថ្លៃសេវា', total: 'សរុប', placeOrder: 'កុម្ម៉ង់',
    confirmOrder: 'បញ្ជាក់ការកុម្ម៉ង់', customerName: 'ឈ្មោះអតិថិជន', phone: 'លេខទូរស័ព្ទ', optional: 'ស្រេចចិត្ត',
    paymentMethod: 'វិធីបង់ប្រាក់', pay_at_counter: 'បង់ប្រាក់នៅបញ្ជរ', cash: 'សាច់ប្រាក់', qr_payment: 'បង់តាម QR',
    note: 'កំណត់ចំណាំ', orderItems: 'មុខម្ហូបដែលបានកុម្ម៉ង់', emptyCart: 'កន្ត្រករបស់អ្នកទទេ', remove: 'លុប',
    table: 'តុ', loading: 'កំពុងផ្ទុក...', back: 'ត្រឡប់', viewCart: 'មើលកន្ត្រក', items: 'មុខ',
    scanQr: 'សូមស្កេន QR code នៅលើតុរបស់អ្នក។', tableNotFound: 'រកមិនឃើញតុ។ សូមស្កេន QR code ម្តងទៀត។',
    tableDisabled: 'តុនេះមិនទទួលការកុម្ម៉ង់ទេ។', received: 'យើងបានទទួលការកុម្ម៉ង់របស់អ្នកហើយ។',
    trackOrder: 'តាមដានការកុម្ម៉ង់', backToMenu: 'ត្រឡប់ទៅម៉ឺនុយ', order: 'ការកុម្ម៉ង់', myOrder: 'ការកុម្ម៉ង់ចុងក្រោយ',
    staffWillServe: 'បុគ្គលិករបស់យើងនឹងយកម្ហូបមកជូនអ្នកនៅតុ។', orderMore: 'កុម្ម៉ង់បន្ថែម',
    added: 'បានបន្ថែមទៅកន្ត្រក', payment: 'ការបង់ប្រាក់', retry: 'ព្យាយាមម្តងទៀត', orderNotFound: 'រកមិនឃើញការកុម្ម៉ង់',
    autoRefresh: 'ទំព័រនេះធ្វើបច្ចុប្បន្នភាពដោយស្វ័យប្រវត្តិ។', noFood: 'មិនមានមុខម្ហូបក្នុងប្រភេទនេះទេ។',
    pending: 'បានទទួលការកុម្ម៉ង់', confirmed: 'បានបញ្ជាក់', preparing: 'កំពុងរៀបចំ', ready: 'រួចរាល់',
    completed: 'បានបញ្ចប់', cancelled: 'បានបោះបង់', cancelledMsg: 'ការកុម្ម៉ង់នេះត្រូវបានបោះបង់។ សូមសួរបុគ្គលិក។',
    searchFood: 'ស្វែងរកមុខម្ហូប...',
  },
};

const Ctx = createContext({ lang: 'en', setLang: () => { }, t: (k) => k });

export function LangProvider({ children }) {
  const [lang, setLangState] = useState('en');

  // Read the saved language after the first render (avoids a server/client mismatch)
  useEffect(() => {
    const saved = localStorage.getItem('lang');
    if (saved && dict[saved]) setLangState(saved);
  }, []);

  const setLang = (l) => {
    setLangState(l);
    localStorage.setItem('lang', l);
  };
  const t = (key) => dict[lang][key] ?? dict.en[key] ?? key;

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);

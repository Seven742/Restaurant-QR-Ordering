'use client';
import { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { api } from '@/lib/client';
import { Printer, Plus } from 'lucide-react';

function QRCodeCard({ table }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current && table.qr_code) {
      QRCode.toCanvas(canvasRef.current, table.qr_code, {
        width: 150,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' }
      }, (error) => {
        if (error) console.error(error);
      });
    }
  }, [table.qr_code]);

  return (
    <div className="rounded-[2rem] bg-white p-6 text-center shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-neutral-100 flex flex-col items-center">
      <h3 className="text-xl font-bold text-neutral-900 mb-4">Table {table.table_number}</h3>
      <div className="bg-neutral-50 p-4 rounded-2xl mb-4 border border-neutral-100">
        <canvas ref={canvasRef} className="mx-auto"></canvas>
      </div>
      <p className="text-xs text-neutral-400 break-all mb-4 px-2">{table.qr_code}</p>
      
      <button 
        onClick={() => window.print()}
        className="mt-auto flex items-center justify-center gap-2 w-full rounded-xl bg-neutral-100 py-2.5 font-semibold text-neutral-700 transition hover:bg-neutral-200 active:scale-95"
      >
        <Printer size={16} /> Print
      </button>
    </div>
  );
}

export default function TablesPage() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/api/tables')
      .then(setTables)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const addTable = async () => {
    const num = prompt('Enter new table number:');
    if (!num) return;
    try {
      const newTable = await api('/api/tables', { method: 'POST', body: { table_number: Number(num) } });
      setTables([...tables, newTable].sort((a, b) => a.table_number - b.table_number));
    } catch (e) {
      alert(e.message);
    }
  };

  if (loading) return <div className="p-8 text-neutral-500 font-semibold">Loading tables...</div>;

  return (
    <div className="space-y-6">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          #printable-area, #printable-area * { visibility: visible; }
          #printable-area { position: absolute; left: 0; top: 0; width: 100%; }
          button { display: none !important; }
        }
      `}} />
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-neutral-900 tracking-tight">Tables & QR Codes</h2>
          <p className="text-neutral-500 font-medium mt-1">Print these codes and place them on your tables.</p>
        </div>
        <button 
          onClick={addTable}
          className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 font-bold text-white shadow-lg shadow-brand-600/30 transition-all hover:bg-brand-700 hover:shadow-xl active:scale-[0.98]"
        >
          <Plus size={18} /> Add Table
        </button>
      </div>

      <div id="printable-area" className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 pt-4">
        {tables.map(t => <QRCodeCard key={t.id} table={t} />)}
      </div>
    </div>
  );
}

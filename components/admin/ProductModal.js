'use client';
import { useState, useRef } from 'react';
import { X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { api } from '@/lib/client';

export default function ProductModal({ product, categoryId, onClose, onSaved }) {
  const [name, setName] = useState(product ? product.name : '');
  const [description, setDescription] = useState(product ? product.description || '' : '');
  const [price, setPrice] = useState(product ? product.price : '');
  const [image, setImage] = useState(product ? product.image || '' : '');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setImage(data.url);
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (product) {
        await api(`/api/products/${product.id}`, {
          method: 'PATCH',
          body: { name, description, price: Number(price), image },
        });
      } else {
        await api('/api/products', {
          method: 'POST',
          body: { category_id: categoryId, name, description, price: Number(price), image, available: true },
        });
      }
      onSaved();
    } catch (err) {
      alert(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center p-6 border-b border-neutral-100">
          <h3 className="text-xl font-bold text-neutral-900">{product ? 'Edit Food' : 'Add Food'}</h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 bg-neutral-100 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          <div className="flex justify-center">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative flex flex-col items-center justify-center w-32 h-32 bg-neutral-50 border-2 border-dashed border-neutral-200 rounded-2xl cursor-pointer hover:bg-neutral-100 transition-colors overflow-hidden group"
            >
              {image ? (
                <>
                  <img src={image} alt="Upload preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ImageIcon className="text-white mb-1" size={24} />
                    <span className="text-xs font-bold text-white">Change</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center text-neutral-400 group-hover:text-brand-600 transition-colors">
                  {uploading ? <Loader2 className="animate-spin mb-1" size={24} /> : <ImageIcon className="mb-1" size={24} />}
                  <span className="text-xs font-bold">{uploading ? 'Uploading...' : 'Add Image'}</span>
                </div>
              )}
              <input type="file" ref={fileInputRef} onChange={handleUpload} accept="image/*" className="hidden" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-neutral-900 mb-1.5">Name</label>
            <input 
              required type="text" value={name} onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all" 
              placeholder="e.g. Chicken Wings"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-neutral-900 mb-1.5">Description (Optional)</label>
            <textarea 
              value={description} onChange={e => setDescription(e.target.value)} rows={2}
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all resize-none" 
              placeholder="Crispy wings tossed in sauce..."
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-neutral-900 mb-1.5">Price ($)</label>
            <input 
              required type="number" step="0.01" min="0" value={price} onChange={e => setPrice(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all" 
              placeholder="5.50"
            />
          </div>

          <button 
            type="submit" disabled={loading || uploading}
            className="w-full flex items-center justify-center py-3.5 rounded-xl bg-brand-600 text-white font-bold shadow-lg shadow-brand-600/30 hover:bg-brand-700 active:scale-[0.98] transition-all disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Save Food'}
          </button>
        </form>
      </div>
    </div>
  );
}

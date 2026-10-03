'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/client';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import ProductModal from '@/components/admin/ProductModal';

export default function MenuEditor() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State for modal
  const [editingProduct, setEditingProduct] = useState(null);
  const [addingToCategory, setAddingToCategory] = useState(null);

  const fetchData = async () => {
    try {
      const [cats, prods] = await Promise.all([
        api('/api/categories'),
        api('/api/products?all=1')
      ]);
      setCategories(cats);
      setProducts(prods);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addCategory = async () => {
    const name = prompt('Category Name:');
    if (!name) return;
    try {
      await api('/api/categories', { method: 'POST', body: { name } });
      fetchData();
    } catch(e) { alert(e.message); }
  };

  const toggleProduct = async (p) => {
    try {
      await api(`/api/products/${p.id}`, { method: 'PATCH', body: { available: !p.available } });
      fetchData();
    } catch(e) { alert(e.message); }
  };

  const deleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api(`/api/products/${id}`, { method: 'DELETE' });
      fetchData();
    } catch(e) { alert(e.message); }
  };
  
  const deleteCategory = async (id) => {
    if (!confirm('Delete this category? (Must be empty)')) return;
    try {
      await api(`/api/categories/${id}`, { method: 'DELETE' });
      fetchData();
    } catch(e) { alert(e.message); }
  };

  const handleModalClose = () => {
    setEditingProduct(null);
    setAddingToCategory(null);
  };

  const handleModalSaved = () => {
    handleModalClose();
    fetchData();
  };

  if (loading) return <div className="p-8 font-semibold text-neutral-500">Loading menu...</div>;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-neutral-900 tracking-tight">Menu Editor</h2>
        <button onClick={addCategory} className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 font-bold text-white hover:bg-brand-700 shadow-lg shadow-brand-600/30 transition-all active:scale-95">
          <Plus size={18} /> Add Category
        </button>
      </div>

      <div className="space-y-6">
        {categories.map(c => (
          <div key={c.id} className="rounded-[2rem] bg-white p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-neutral-100">
            <div className="flex justify-between items-center mb-4 border-b border-neutral-100 pb-4">
              <h3 className="text-xl font-bold text-neutral-900">{c.name}</h3>
              <div className="flex gap-2">
                <button onClick={() => setAddingToCategory(c.id)} className="text-brand-600 hover:text-brand-700 font-semibold text-sm flex items-center gap-1 bg-brand-50 px-3 py-1.5 rounded-lg transition-colors">
                  <Plus size={16} /> Add Food
                </button>
                <button onClick={() => deleteCategory(c.id)} className="text-red-500 hover:text-red-600 bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              {products.filter(p => p.category_id === c.id).map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 pl-4 rounded-2xl bg-neutral-50 border border-neutral-100 transition-all hover:border-neutral-200">
                  <div className="flex items-center gap-4">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="w-12 h-12 rounded-xl object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-neutral-200 flex items-center justify-center text-neutral-400 text-xs font-bold">No Img</div>
                    )}
                    <div>
                      <p className="font-bold text-neutral-900">{p.name}</p>
                      <p className="text-sm font-medium text-brand-600">${Number(p.price).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pr-2">
                    <button 
                      onClick={() => toggleProduct(p)} 
                      className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider transition-colors ${p.available ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300'}`}
                    >
                      {p.available ? 'Available' : 'Hidden'}
                    </button>
                    <button onClick={() => setEditingProduct(p)} className="text-neutral-400 hover:text-brand-600 p-2 transition-colors">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => deleteProduct(p.id)} className="text-red-400 hover:text-red-600 p-2 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
              {products.filter(p => p.category_id === c.id).length === 0 && (
                <p className="text-sm text-neutral-400 text-center py-4 font-medium">No food in this category.</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {(editingProduct || addingToCategory) && (
        <ProductModal 
          product={editingProduct} 
          categoryId={addingToCategory || editingProduct?.category_id}
          onClose={handleModalClose}
          onSaved={handleModalSaved}
        />
      )}
    </div>
  );
}

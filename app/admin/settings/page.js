'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/client';
import { Store, Image as ImageIcon, Upload, Loader2, Save } from 'lucide-react';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [form, setForm] = useState({
    restaurantName: '',
    logoUrl: '/logo.svg',
    serviceFeePercent: 0
  });

  useEffect(() => {
    api('/api/settings')
      .then(data => {
        setForm({
          restaurantName: data.restaurantName || '',
          logoUrl: data.logoUrl || '/logo.svg',
          serviceFeePercent: data.serviceFeePercent || 0
        });
        setLoading(false);
      })
      .catch(e => {
        setError('Failed to load settings');
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      setError('');
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to upload image');
      const data = await res.json();
      
      setForm(prev => ({ ...prev, logoUrl: data.url }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await api('/api/settings', {
        method: 'PATCH',
        body: {
          restaurantName: form.restaurantName,
          logoUrl: form.logoUrl
        }
      });
      setSuccess('Settings updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-brand-600" size={32} /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-neutral-900 tracking-tight">Restaurant Settings</h2>
        <button
          onClick={handleSubmit}
          disabled={saving || uploading}
          className="flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-600/20 transition-all hover:bg-brand-700 active:scale-95 disabled:opacity-50"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          Save Changes
        </button>
      </div>
      
      {error && <div className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-600 border border-red-100">{error}</div>}
      {success && <div className="rounded-xl bg-green-50 p-4 text-sm font-semibold text-green-600 border border-green-100">{success}</div>}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-[2rem] bg-white p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-neutral-100 space-y-6">
          <div className="flex items-center gap-3 border-b border-neutral-100 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Store size={20} />
            </div>
            <h3 className="text-lg font-bold text-neutral-900">General Info</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-bold text-neutral-700">Restaurant Name</label>
              <input
                type="text"
                name="restaurantName"
                value={form.restaurantName}
                onChange={handleChange}
                className="w-full rounded-xl border border-neutral-200 p-3 text-sm font-medium outline-none transition-all focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
                placeholder="Enter restaurant name"
              />
            </div>
            
            <div>
              <label className="mb-1.5 block text-sm font-bold text-neutral-700">Service Fee (%)</label>
              <input
                type="text"
                disabled
                value={form.serviceFeePercent}
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-sm font-medium text-neutral-500 outline-none cursor-not-allowed"
              />
              <p className="mt-1.5 text-xs text-neutral-500 font-medium">To change the service fee, please edit your <code className="bg-neutral-100 px-1 py-0.5 rounded text-neutral-700">.env.local</code> file.</p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-neutral-100 space-y-6">
          <div className="flex items-center gap-3 border-b border-neutral-100 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <ImageIcon size={20} />
            </div>
            <h3 className="text-lg font-bold text-neutral-900">Branding</h3>
          </div>

          <div>
            <label className="mb-3 block text-sm font-bold text-neutral-700">Restaurant Logo</label>
            <div className="flex items-start gap-6">
              <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50">
                {form.logoUrl ? (
                  <img src={form.logoUrl} alt="Logo" className="h-full w-full object-cover" />
                ) : (
                  <Store size={32} className="text-neutral-300" />
                )}
              </div>
              <div className="flex-1 space-y-3">
                <label className="relative flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50 py-4 transition-all hover:border-brand-500 hover:bg-brand-50">
                  <input type="file" className="sr-only" accept="image/*" onChange={handleFileChange} disabled={uploading} />
                  {uploading ? (
                    <>
                      <Loader2 size={16} className="animate-spin text-brand-600" />
                      <span className="text-sm font-bold text-brand-600">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={16} className="text-neutral-500" />
                      <span className="text-sm font-bold text-neutral-600">Click to upload new logo</span>
                    </>
                  )}
                </label>
                <p className="text-xs text-neutral-500 font-medium leading-relaxed">
                  Recommended size: 120x120px. Max 2MB. Supported formats: JPG, PNG, WEBP, SVG.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

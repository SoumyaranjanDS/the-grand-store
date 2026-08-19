import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Building2, Package, UploadCloud, CheckCircle2, AlertCircle, PlusCircle, User } from 'lucide-react';
import { storeCategories } from '../../data';

export default function EditProduct({ onNotify }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
    price: '',
    stock: '',
    tags: '',
    tastingNotes: '',
    options: 'Pack of 1',
    tradePrice: '',
    minOrderQuantity: '',
    exportReady: false
  });
  
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [pdfFile, setPdfFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'vendor_active') {
      return;
    }
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/products/${id}`);
        const product = res.data;
        if (product) {
          setFormData({
            name: product.name || '',
            type: product.type || '',
            description: product.description || '',
            price: product.price || '',
            options: product.options ? product.options.join(', ') : '',
            tags: product.tags ? product.tags.join(', ') : '',
            tastingNotes: product.tastingNotes ? product.tastingNotes.join(', ') : '',
            stock: product.stock !== undefined ? product.stock.toString() : '0',
            tradePrice: product.tradePrice || '',
            minOrderQuantity: product.minOrderQuantity || '',
            exportReady: product.exportReady || false
          });
          if (product.image) {
            const initialPreviews = [`${import.meta.env.VITE_API_URL}${product.image}`];
            if (product.gallery && product.gallery.length > 0) {
              product.gallery.forEach(img => initialPreviews.push(`${import.meta.env.VITE_API_URL}${img}`));
            }
            setImagePreviews(initialPreviews);
          }
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch product details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [user, id]);

  if (!user || user.role !== 'vendor_active') {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
        <div className="p-8 border border-red-500/20 bg-red-950/10 text-[var(--color-ivory)] max-w-md w-full flex items-center gap-4">
          <AlertCircle size={32} className="text-red-400 shrink-0" />
          <p className="font-light leading-relaxed">Only approved vendors can edit regular products in the store.</p>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files).slice(0, 5); // Max 5
      setImageFiles(files);
      
      const previews = [];
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          previews.push(reader.result);
          if (previews.length === files.length) {
            setImagePreviews([...previews]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handlePdfChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const token = userInfo?.token || user?.token;

      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('type', formData.type || 'Whisky');
      payload.append('description', formData.description);
      payload.append('price', formData.price);
      payload.append('stock', formData.stock);
      
      const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
      payload.append('tags', JSON.stringify(tagsArray));
      
      const notesArray = formData.tastingNotes.split(',').map(t => t.trim()).filter(Boolean);
      payload.append('tastingNotes', JSON.stringify(notesArray));
      
      payload.append('options', JSON.stringify([formData.options]));

      if (formData.tradePrice) payload.append('tradePrice', formData.tradePrice);
      if (formData.minOrderQuantity) payload.append('minOrderQuantity', formData.minOrderQuantity);
      payload.append('exportReady', formData.exportReady);

      if (imageFiles && imageFiles.length > 0) {
        imageFiles.forEach(file => {
          payload.append('images', file);
        });
      }
      if (pdfFile) {
        payload.append('factSheetPdf', pdfFile);
      }

      await axios.put(`${import.meta.env.VITE_API_URL}/api/products/${id}`, payload, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess(true);
      if (onNotify) onNotify('Product updated successfully!');
      setTimeout(() => navigate('/vendor/products'), 2000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Failed to update product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto">
      <div className="max-w-4xl w-full">
        <section className="mb-4">
              <h1 className="text-[var(--color-ivory)] font-serif text-5xl mb-4">
                Edit <span className="font-script text-5xl md:text-7xl text-gold-gradient font-normal ml-2 tracking-wide drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]">Retail Product</span>
              </h1>
              <p className="text-[var(--color-ivory-muted)] text-lg max-w-2xl font-light leading-relaxed">
                Update the details of your retail product. The image and fact sheet will remain unchanged unless you upload new ones.
              </p>
            </section>

            {success && (
              <div className="bg-green-900/20 backdrop-blur-md border border-green-500/20 text-green-400 p-6 rounded-2xl shadow-lg flex items-center gap-4 mb-8">
                <CheckCircle2 size={24} className="text-green-500" />
                <div className="text-lg font-medium">Product updated successfully!</div>
              </div>
            )}

            {error && !success && (
              <div className="bg-red-950/20 backdrop-blur-md border border-red-500/20 text-red-400 p-4 rounded-xl shadow-lg mb-8">
                {error}
              </div>
            )}

            {!loading && (
            <form onSubmit={handleSubmit} className="w-full mt-12 space-y-16">
              
              <div className="space-y-10">
                <h2 className="text-[var(--color-ivory)] font-serif text-3xl flex items-center gap-4 border-b border-white/[0.05] pb-4">
                  <Package size={24} className="text-gold-gradient" />
                  General Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                  <div className="relative z-0 w-full group">
                    <input 
                      type="text" 
                      name="name" 
                      id="name"
                      value={formData.name} 
                      onChange={handleChange} 
                      className="block py-3 px-0 w-full text-base text-[var(--color-ivory)] bg-transparent border-0 border-b border-white/20 appearance-none focus:outline-none focus:ring-0 focus:border-[var(--color-gold)] peer" 
                      placeholder=" " 
                      required 
                    />
                    <label className="peer-focus:font-medium absolute text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-gold-gradient peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Product Name *</label>
                  </div>
                  
                  <div className="w-full group">
                    <label className="block text-sm uppercase tracking-widest text-[var(--color-ivory-muted)] font-medium mb-3">Category / Type *</label>
                    <select 
                      name="type" 
                      id="type"
                      value={formData.type} 
                      onChange={handleChange}
                      required
                      className="block w-full px-4 py-3 text-base text-[var(--color-ivory)] bg-black/20 border border-[var(--color-gold)]/50 rounded-lg appearance-none focus:outline-none focus:border-[var(--color-gold)] focus:bg-black/40 transition-colors"
                    >
                      {storeCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="w-full group mt-8">
                  <label className="block text-sm uppercase tracking-widest text-[var(--color-ivory-muted)] font-medium mb-3">Detailed Description *</label>
                  <textarea 
                    name="description" 
                    id="description"
                    value={formData.description} 
                    onChange={handleChange} 
                    rows="4"
                    className="block w-full px-4 py-3 text-base text-[var(--color-ivory)] bg-black/20 border border-[var(--color-gold)]/50 rounded-lg focus:outline-none focus:border-[var(--color-gold)] focus:bg-black/40 transition-colors resize-none" 
                    required 
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                  <div className="relative z-0 w-full group">
                    <input 
                      type="number" 
                      name="price" 
                      id="price"
                      value={formData.price} 
                      onChange={handleChange} 
                      min="0"
                      className="block py-3 px-0 w-full text-base text-[var(--color-ivory)] bg-transparent border-0 border-b border-white/20 appearance-none focus:outline-none focus:ring-0 focus:border-[var(--color-gold)] peer" 
                      placeholder=" " 
                      required 
                    />
                    <label className="peer-focus:font-medium absolute text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-gold-gradient peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Price (ZAR) *</label>
                  </div>
                  
                  <div className="relative z-0 w-full group">
                    <input 
                      type="number" 
                      name="stock" 
                      id="stock"
                      value={formData.stock} 
                      onChange={handleChange} 
                      min="0"
                      className="block py-3 px-0 w-full text-base text-[var(--color-ivory)] bg-transparent border-0 border-b border-white/20 appearance-none focus:outline-none focus:ring-0 focus:border-[var(--color-gold)] peer" 
                      placeholder=" " 
                      required 
                    />
                    <label className="peer-focus:font-medium absolute text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-gold-gradient peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Stock Quantity *</label>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                  <div className="relative z-0 w-full group">
                    <input 
                      type="text" 
                      name="tags" 
                      id="tags"
                      value={formData.tags} 
                      onChange={handleChange} 
                      className="block py-3 px-0 w-full text-base text-[var(--color-ivory)] bg-transparent border-0 border-b border-white/20 appearance-none focus:outline-none focus:ring-0 focus:border-[var(--color-gold)] peer" 
                      placeholder=" " 
                    />
                    <label className="peer-focus:font-medium absolute text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-gold-gradient peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Tags (Comma separated)</label>
                  </div>
                  
                  <div className="relative z-0 w-full group">
                    <input 
                      type="text" 
                      name="tastingNotes" 
                      id="tastingNotes"
                      value={formData.tastingNotes} 
                      onChange={handleChange} 
                      className="block py-3 px-0 w-full text-base text-[var(--color-ivory)] bg-transparent border-0 border-b border-white/20 appearance-none focus:outline-none focus:ring-0 focus:border-[var(--color-gold)] peer" 
                      placeholder=" " 
                    />
                    <label className="peer-focus:font-medium absolute text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-gold-gradient peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Tasting Notes (Comma separated)</label>
                  </div>
                </div>
              </div>

              {/* Advanced Channels */}
              <div className="space-y-10 pt-6">
                <h2 className="text-[var(--color-ivory)] font-serif text-3xl flex items-center gap-4 border-b border-white/[0.05] pb-4">
                  <Building2 size={24} className="text-gold-gradient" />
                  Advanced Channels
                </h2>
                
                <div className="border-b border-white/10 pb-6">
                  <h3 className="text-lg font-serif text-[var(--color-ivory)] mb-6">Wholesale & Trade Pricing</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                    <div className="relative z-0 w-full group">
                      <input 
                        type="number" 
                        name="tradePrice" 
                        id="tradePrice"
                        value={formData.tradePrice} 
                        onChange={handleChange} 
                        min="0"
                        className="block py-3 px-0 w-full text-base text-[var(--color-ivory)] bg-transparent border-0 border-b border-white/20 appearance-none focus:outline-none focus:ring-0 focus:border-[var(--color-gold)] peer" 
                        placeholder=" " 
                      />
                      <label className="peer-focus:font-medium absolute text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-gold-gradient peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Trade Price (ZAR)</label>
                    </div>
                    <div className="relative z-0 w-full group">
                      <input 
                        type="number" 
                        name="minOrderQuantity" 
                        id="minOrderQuantity"
                        value={formData.minOrderQuantity} 
                        onChange={handleChange} 
                        min="0"
                        className="block py-3 px-0 w-full text-base text-[var(--color-ivory)] bg-transparent border-0 border-b border-white/20 appearance-none focus:outline-none focus:ring-0 focus:border-[var(--color-gold)] peer" 
                        placeholder=" " 
                      />
                      <label className="peer-focus:font-medium absolute text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-gold-gradient peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Min. Order Quantity</label>
                    </div>
                  </div>
                </div>

                <div className="py-6 border-b border-white/10 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-serif text-[var(--color-ivory)] mb-1">International Export</h3>
                    <p className="text-sm text-[var(--color-ivory-muted)] font-light">Make this product available for international purchase enquiries.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="exportReady" checked={formData.exportReady} onChange={handleChange} className="sr-only peer" />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-gradient"></div>
                  </label>
                </div>
              </div>
              
              <div className="space-y-10 pt-6">
                <h2 className="text-[var(--color-ivory)] font-serif text-3xl flex items-center gap-4 border-b border-white/[0.05] pb-4">
                  <UploadCloud size={24} className="text-gold-gradient" />
                  Media & Documents
                </h2>
                
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gold-gradient mb-2 font-bold">Product Images (Up to 5) (Optional to Update)</label>
                  <p className="text-sm text-[var(--color-ivory-muted)] mb-6 font-light">Upload new high-quality images if you want to replace the current ones. The first will be the main image.</p>
                  <div className="flex flex-col md:flex-row items-start gap-6">
                    <div className="flex flex-wrap gap-4">
                      {imagePreviews.map((preview, idx) => (
                        <div key={idx} className="w-24 h-24 rounded-2xl overflow-hidden border border-[var(--color-gold)]/30 shrink-0 bg-black/40">
                          <img src={preview} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageChange}
                      multiple
                      className="w-full text-sm text-[var(--color-ivory-muted)] file:mr-6 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-[10px] file:uppercase file:tracking-widest file:font-bold file:bg-[var(--color-gold)]/10 file:text-gold-gradient hover:file:bg-[var(--color-gold)]/20 transition-all cursor-pointer mt-4"
                    />
                  </div>
                </div>

                {formData.type.toLowerCase() === 'wine' && (
                  <div className="border border-[var(--color-gold)]/20 p-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--color-gold)]/10 via-[var(--color-gold)]/50 to-[var(--color-gold)]/10"></div>
                    <label className="block text-[10px] uppercase tracking-widest text-gold-gradient mb-2 font-bold">Fact Sheet PDF (Required for Wine) *</label>
                    <p className="text-sm text-[var(--color-ivory-muted)] mb-6 font-light">Please upload a new official vineyard fact sheet or authentication document.</p>
                    <input 
                      type="file" 
                      accept="application/pdf"
                      onChange={handlePdfChange}
                      className="w-full text-sm text-[var(--color-ivory-muted)] file:mr-6 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-[10px] file:uppercase file:tracking-widest file:font-bold file:bg-white/10 file:text-[var(--color-ivory)] hover:file:bg-white/20 transition-all cursor-pointer"
                    />
                  </div>
                )}
              </div>

              <div className="pt-8">
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="bg-gold-gradient text-black font-bold uppercase tracking-widest text-sm px-10 py-4 rounded-full hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all disabled:opacity-50 inline-flex items-center justify-center gap-3"
                >
                  {submitting ? 'Updating Product...' : <><CheckCircle2 size={20} /> Update Product</>}
                </button>
              </div>
            </form>
            )}
          </div>
    </div>
  );
}

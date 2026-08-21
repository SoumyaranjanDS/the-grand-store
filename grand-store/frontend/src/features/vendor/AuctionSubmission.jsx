import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Building2, Package, CheckCircle2, AlertCircle, PlusCircle, User, Gavel } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { storeCategories } from '../../data';

export default function AuctionSubmission({ onNotify }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    category: '', // Empty for floating label
    description: '',
    startingBid: '',
    reservePrice: '',
    condition: '',
    provenance: '',
    startDate: '',
    endDate: ''
  });
  
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!user || (user.role !== 'vendor_active' && user.role !== 'admin' && user.role !== 'auction_host')) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
        <div className="p-8 border border-red-500/20 bg-red-950/10 text-[var(--color-ivory)] max-w-md w-full flex items-center gap-4">
          <AlertCircle size={32} className="text-red-400 shrink-0" />
          <p className="font-light leading-relaxed">Only approved vendors can submit lots for auction.</p>
        </div>
      </div>
    );
  }

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
    } else {
      setImageFiles([]);
      setImagePreviews([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess(false);
    
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const token = userInfo?.token || user?.token;

      if (!imageFiles || imageFiles.length === 0) {
        throw new Error('At least one image is required.');
      }

      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('description', formData.description);
      payload.append('startingBid', Number(formData.startingBid));
      payload.append('reservePrice', Number(formData.reservePrice));
      payload.append('startDate', formData.startDate ? new Date(formData.startDate).toISOString() : new Date().toISOString());
      payload.append('endDate', formData.endDate ? new Date(formData.endDate).toISOString() : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString());
      payload.append('category', formData.category || 'Whisky');
      payload.append('condition', formData.condition);
      payload.append('provenance', formData.provenance);

      imageFiles.forEach(file => {
        payload.append('images', file);
      });

      await axios.post(`${import.meta.env.VITE_API_URL}/api/auction`, payload, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess(true);
      if (onNotify) onNotify('Auction lot submitted successfully for review!');
      
      setTimeout(() => {
        navigate(user.role === 'auction_host' ? '/auction-manager/dashboard' : '/vendor/dashboard');
      }, 2000);
      
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Failed to submit auction lot');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto">
      <div className="max-w-4xl w-full">
        {/* Welcome Section */}
        <section className="mb-4">
          <h1 className="text-[var(--color-ivory)] font-serif text-5xl mb-4">
            Submit <span className="text-6xl text-[#e1bd70] font-normal ml-2 tracking-wide ">Auction Lot</span>
          </h1>
          <p className="text-[var(--color-ivory-muted)] text-lg max-w-2xl font-light">
            Submit your rare and collectible items for review by our expert curators.
          </p>
        </section>

        {error && (
          <div className="bg-red-950/20 backdrop-blur-md border border-red-500/20 text-red-400 p-4 rounded-xl shadow-lg mb-8">
            {error}
          </div>
        )}

        {success ? (
          <div className="bg-green-950/10 border border-green-500/20 text-green-400 p-8 mt-8 flex flex-col items-center justify-center text-center">
            <CheckCircle2 size={48} className="mb-4" />
            <h3 className="text-2xl font-serif mb-2 text-[var(--color-ivory)]">Submission Successful</h3>
            <p className="font-light">Your lot has been submitted for curation. Redirecting to dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full mt-12 space-y-16">
            
            {/* General Information */}
            <div className="space-y-10">
              <h2 className="text-[var(--color-ivory)] font-serif text-3xl flex items-center gap-4 border-b border-white/[0.05] pb-4">
                <Gavel size={24} className="text-[#e1bd70]" />
                Lot Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                <div className="relative z-0 w-full group">
                  <input 
                    type="text" 
                    name="title" 
                    id="title"
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})} 
                    className="block py-3 px-0 w-full text-base text-[var(--color-ivory)] bg-transparent border-0 border-b border-white/20 appearance-none focus:outline-none focus:ring-0 focus:border-[var(--color-gold)] peer" 
                    placeholder=" " 
                    required 
                  />
                  <label 
                    htmlFor="title" 
                    className="peer-focus:font-medium absolute text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-[#e1bd70] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    Lot Title *
                  </label>
                </div>
                
                <div className="w-full group">
                  <label 
                    htmlFor="category" 
                    className="block text-sm uppercase tracking-widest text-[var(--color-ivory-muted)] font-medium mb-3"
                  >
                    Category *
                  </label>
                  <select 
                    name="category" 
                    id="category"
                    value={formData.category} 
                    onChange={e => setFormData({...formData, category: e.target.value})} 
                    required
                    className="block w-full px-4 py-3 text-base text-[var(--color-ivory)] bg-black/20 border border-[var(--color-gold)]/50 rounded-lg appearance-none focus:outline-none focus:border-[var(--color-gold)] focus:bg-black/40 transition-colors"
                  >
                    <option value="" disabled hidden>Select Category</option>
                    {storeCategories.map(cat => (
                      <option key={cat} className="bg-[#1a1a1a]" value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-10 pt-6 border-b border-white/[0.05] pb-10">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] mb-4 font-semibold">Lot Images (Up to 5) *</label>
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
                      required
                      multiple
                      className="w-full text-sm text-[var(--color-ivory-muted)] file:mr-6 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-[10px] file:uppercase file:tracking-widest file:font-bold file:bg-[var(--color-gold)]/10 file:text-[#e1bd70] hover:file:bg-[var(--color-gold)]/20 transition-all cursor-pointer mt-4"
                    />
                  </div>
                </div>
              </div>

              <div className="w-full group mt-8">
                <label 
                  htmlFor="description" 
                  className="block text-sm uppercase tracking-widest text-[var(--color-ivory-muted)] font-medium mb-3"
                >
                  Detailed Description & Notes *
                </label>
                <textarea 
                  name="description" 
                  id="description"
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  rows="4"
                  className="block w-full px-4 py-3 text-base text-[var(--color-ivory)] bg-black/20 border border-[var(--color-gold)]/50 rounded-lg focus:outline-none focus:border-[var(--color-gold)] focus:bg-black/40 transition-colors resize-none" 
                  placeholder="Enter detailed description..." 
                  required 
                />
              </div>
            </div>

            {/* Authentication */}
            <div className="space-y-10 pt-6">
              <h2 className="text-[var(--color-ivory)] font-serif text-3xl flex items-center gap-4 border-b border-white/[0.05] pb-4">
                <CheckCircle2 size={24} className="text-[#e1bd70]" />
                Authentication Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                <div className="relative z-0 w-full group">
                  <input 
                    type="text" 
                    name="condition" 
                    id="condition"
                    value={formData.condition} 
                    onChange={e => setFormData({...formData, condition: e.target.value})} 
                    className="block py-3 px-0 w-full text-base text-[var(--color-ivory)] bg-transparent border-0 border-b border-white/20 appearance-none focus:outline-none focus:ring-0 focus:border-[var(--color-gold)] peer" 
                    placeholder=" " 
                    required 
                  />
                  <label 
                    htmlFor="condition" 
                    className="peer-focus:font-medium absolute text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-[#e1bd70] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    Condition Report *
                  </label>
                </div>

                <div className="relative z-0 w-full group">
                  <input 
                    type="text" 
                    name="provenance" 
                    id="provenance"
                    value={formData.provenance} 
                    onChange={e => setFormData({...formData, provenance: e.target.value})} 
                    className="block py-3 px-0 w-full text-base text-[var(--color-ivory)] bg-transparent border-0 border-b border-white/20 appearance-none focus:outline-none focus:ring-0 focus:border-[var(--color-gold)] peer" 
                    placeholder=" " 
                    required 
                  />
                  <label 
                    htmlFor="provenance" 
                    className="peer-focus:font-medium absolute text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-[#e1bd70] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    Provenance *
                  </label>
                </div>
              </div>
            </div>

            {/* Financials */}
            <div className="space-y-10 pt-6">
              <h2 className="text-[var(--color-ivory)] font-serif text-3xl flex items-center gap-4 border-b border-white/[0.05] pb-4">
                <Package size={24} className="text-[#e1bd70]" />
                Financials
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                <div className="relative z-0 w-full group">
                  <input 
                    type="number" 
                    name="startingBid" 
                    id="startingBid"
                    value={formData.startingBid} 
                    onChange={e => setFormData({...formData, startingBid: e.target.value})} 
                    min="0"
                    className="block py-3 px-0 w-full text-base text-[var(--color-ivory)] bg-transparent border-0 border-b border-white/20 appearance-none focus:outline-none focus:ring-0 focus:border-[var(--color-gold)] peer" 
                    placeholder=" " 
                    required 
                  />
                  <label 
                    htmlFor="startingBid" 
                    className="peer-focus:font-medium absolute text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-[#e1bd70] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    Starting Bid (ZAR) *
                  </label>
                </div>

                <div className="relative z-0 w-full group">
                  <input 
                    type="number" 
                    name="reservePrice" 
                    id="reservePrice"
                    value={formData.reservePrice} 
                    onChange={e => setFormData({...formData, reservePrice: e.target.value})} 
                    min="0"
                    className="block py-3 px-0 w-full text-base text-[var(--color-ivory)] bg-transparent border-0 border-b border-white/20 appearance-none focus:outline-none focus:ring-0 focus:border-[var(--color-gold)] peer" 
                    placeholder=" " 
                    required 
                  />
                  <label 
                    htmlFor="reservePrice" 
                    className="peer-focus:font-medium absolute text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-[#e1bd70] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    Reserve Price (ZAR) *
                  </label>
                  <p className="text-[10px] tracking-widest uppercase text-[#e1bd70] mt-3 font-light absolute -bottom-6">Lot will not be sold below this price.</p>
                </div>
              </div>
            </div>

            {/* Auction Schedule */}
            <div className="space-y-10 pt-6">
              <h2 className="text-[var(--color-ivory)] font-serif text-3xl flex items-center gap-4 border-b border-white/[0.05] pb-4">
                <CheckCircle2 size={24} className="text-[#e1bd70]" />
                Schedule
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                <div className="w-full group">
                  <label 
                    htmlFor="startDate" 
                    className="block text-sm uppercase tracking-widest text-[var(--color-ivory-muted)] font-medium mb-3"
                  >
                    Start Date/Time *
                  </label>
                  <input 
                    type="datetime-local" 
                    name="startDate" 
                    id="startDate"
                    value={formData.startDate} 
                    onChange={e => setFormData({...formData, startDate: e.target.value})} 
                    className="block w-full px-4 py-3 text-base text-[var(--color-ivory)] bg-black/20 border border-[var(--color-gold)]/50 rounded-lg focus:outline-none focus:border-[var(--color-gold)] focus:bg-black/40 transition-colors [color-scheme:dark]" 
                    required 
                  />
                </div>

                <div className="w-full group">
                  <label 
                    htmlFor="endDate" 
                    className="block text-sm uppercase tracking-widest text-[var(--color-ivory-muted)] font-medium mb-3"
                  >
                    End Date/Time *
                  </label>
                  <input 
                    type="datetime-local" 
                    name="endDate" 
                    id="endDate"
                    value={formData.endDate} 
                    onChange={e => setFormData({...formData, endDate: e.target.value})} 
                    className="block w-full px-4 py-3 text-base text-[var(--color-ivory)] bg-black/20 border border-[var(--color-gold)]/50 rounded-lg focus:outline-none focus:border-[var(--color-gold)] focus:bg-black/40 transition-colors [color-scheme:dark]" 
                    required 
                  />
                </div>
              </div>
            </div>

            <div className="pt-8">
              <button 
                type="submit" 
                disabled={submitting} 
                className="bg-[#c9a35b] text-black font-bold uppercase tracking-widest text-sm px-10 py-4 rounded-full  transition-all disabled:opacity-50 inline-flex items-center justify-center gap-3"
              >
                {submitting ? 'Submitting...' : <><CheckCircle2 size={20} /> Submit to Admin for Review</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

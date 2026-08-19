import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Store, MapPin, Award, CheckCircle, Search } from 'lucide-react';
import ProductCard from '../../components/ProductCard';

export default function StoreFront() {
  const { storeId } = useParams();
  const [storeData, setStoreData] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real scenario, this would fetch from a specific endpoint that returns vendor details and their products
    // For now, we mock the fetch
    const fetchStore = async () => {
      try {
        setLoading(true);
        // We'll mock the data for demonstration purposes, as the actual backend endpoint might not exist yet
        // In real implementation: const res = await axios.get(`/api/shop/stores/${storeId}`);
        
        await new Promise(r => setTimeout(r, 1000));
        
        setStoreData({
          _id: storeId,
          businessName: 'Stellenbosch Vineyards',
          country: 'South Africa',
          type: 'local',
          bannerUrl: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=2000&auto=format&fit=crop',
          logoUrl: 'https://images.unsplash.com/photo-1559564109-ce879bd2925b?q=80&w=200&auto=format&fit=crop',
          story: 'Nestled in the heart of the Cape Winelands, Stellenbosch Vineyards has been producing exceptional wines for over a century. Our master winemaker brings traditional techniques together with modern innovation to create award-winning vintages.',
          isVerified: true,
        });

        // Mock products
        setProducts([
          { _id: '1', title: 'Cabernet Sauvignon 2018', category: 'Wine', price: 450, images: ['https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=500&auto=format&fit=crop'] },
          { _id: '2', title: 'Chenin Blanc Reserve', category: 'Wine', price: 320, images: ['https://images.unsplash.com/photo-1563261775-6e8648b2eb59?q=80&w=500&auto=format&fit=crop'] },
          { _id: '3', title: 'Pinotage Estate 2020', category: 'Wine', price: 550, images: ['https://images.unsplash.com/photo-1571216581177-33a4c49f8263?q=80&w=500&auto=format&fit=crop'] },
        ]);
        
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStore();
  }, [storeId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-[var(--color-ivory-muted)] animate-pulse">Loading Storefront...</div>
      </div>
    );
  }

  if (!storeData) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-red-500">Store not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[var(--color-ivory)]">
      {/* Banner */}
      <div className="relative h-64 md:h-96 w-full">
        <img src={storeData.bannerUrl} alt="Store Banner" className="w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-black/50" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 md:-mt-32 relative z-10 pb-20">
        
        {/* Header Profile */}
        <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-2xl flex flex-col md:flex-row gap-8 items-start mb-12 shadow-2xl">
          <div className="w-32 h-32 md:w-48 md:h-48 rounded-xl overflow-hidden border-2 border-[var(--color-gold)] shrink-0 bg-black">
            <img src={storeData.logoUrl} alt="Store Logo" className="w-full h-full object-cover" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl md:text-4xl font-serif text-[var(--color-ivory)]">{storeData.businessName}</h1>
              {storeData.isVerified && (
                <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-[var(--color-gold)] bg-[var(--color-gold)]/10 px-2 py-1 rounded-full border border-[var(--color-gold)]/20">
                  <CheckCircle size={12} /> Verified
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-xs text-[var(--color-ivory-muted)] uppercase tracking-widest mb-6">
              <span className="flex items-center gap-1"><MapPin size={14} /> {storeData.country}</span>
              <span className="flex items-center gap-1"><Store size={14} /> {storeData.type === 'local' ? 'Local Vendor' : 'International Vendor'}</span>
              <span className="flex items-center gap-1"><Award size={14} /> Top Rated</span>
            </div>
            
            <p className="text-white/60 font-light leading-relaxed max-w-3xl">
              {storeData.story}
            </p>
          </div>
        </div>

        {/* Store Products */}
        <div>
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
            <h2 className="text-2xl font-serif text-[var(--color-ivory)]">Store Collection</h2>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 w-64">
              <Search size={14} className="text-white/40" />
              <input type="text" placeholder="Search this store..." className="bg-transparent border-none outline-none text-sm text-white placeholder-white/30 w-full" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
          
          {products.length === 0 && (
            <div className="text-center py-20 text-[var(--color-ivory-muted)] border border-white/5 border-dashed rounded-xl">
              This store doesn't have any products available yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

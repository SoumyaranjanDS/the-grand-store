import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import ProductCard from '../../components/ProductCard';
import { RotateCcw } from 'lucide-react';
import DynamicIcon from '../../components/DynamicIcon';

const DEFAULT_KEYWORDS = {
  smoky: ['Peat', 'Smoky', 'Islay', 'Lagavulin', 'Laphroaig', 'Smoke'],
  rich: ['Sherry', 'Rich', 'Dark Chocolate', 'Macallan', 'Fruitcake', 'Spice'],
  light: ['Light', 'Floral', 'Lowland', 'Delicate', 'Vanilla', 'Citrus'],
  fruity: ['Fruity', 'Spicy', 'Speyside', 'Highland', 'Apple', 'Honey']
};

export default function WhiskyFinder() {
  const navigate = useNavigate();
  const { products } = useProducts();
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [flavorProfiles, setFlavorProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlavors = async () => {
      try {
        const res = await fetch('/api/attributes');
        const data = await res.json();
        if (Array.isArray(data)) {
          const flavors = data.filter(a => a.type === 'flavor').map(p => ({
            id: p.value,
            label: p.name,
            iconName: p.icon,
            keywords: DEFAULT_KEYWORDS[p.value] || [p.name, 'Whisky']
          }));
          setFlavorProfiles(flavors);
        }
      } catch (error) {
        console.error('Failed to fetch flavors:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFlavors();
  }, []);
  
  const recommendedWhiskies = useMemo(() => {
    if (!selectedProfile || !products) return [];
    
    const profileInfo = flavorProfiles.find(p => p.id === selectedProfile);
    if (!profileInfo) return [];

    return products.filter(product => {
      // Check explicit flavor profile first. If set, this overrides the type check.
      if (product.flavorProfile && product.flavorProfile.length > 0) {
        return product.flavorProfile.includes(selectedProfile);
      }

      // Fallback: Must be a whisky/whiskey for dynamic keyword matching
      const isWhisky = product.category?.toLowerCase().includes('whisky') || 
                       product.category?.toLowerCase().includes('whiskey') ||
                       product.subcategory?.toLowerCase().includes('whisky') ||
                       product.type?.toLowerCase().includes('whisky');
                       
      if (!isWhisky) return false;

      // Dynamic string matching
      const searchableText = `${product.name} ${product.description} ${product.subcategory} ${product.type} ${product.brand || ''}`.toLowerCase();
      
      // Return true if any of the keywords match
      return profileInfo.keywords.some(keyword => searchableText.includes(keyword.toLowerCase()));
    }).slice(0, 8);
  }, [selectedProfile, products]);

  return (
    <div className="min-h-screen bg-[#0a0907] text-white pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        
        {/* Header */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
          <h1 className="text-3xl md:text-5xl font-serif text-[#d8b76d] mb-4">Whisky Finder</h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Discover your perfect dram. Select your preferred flavor profile and our dynamic engine will match you with the finest whiskies in our collection.
          </p>
        </div>

        {/* Step 1: Select Flavor Profile */}
        {!selectedProfile ? (
          <div className="animate-in fade-in zoom-in-95 duration-500 delay-150 fill-mode-both">
            <h2 className="text-2xl font-serif text-center mb-8">What flavor profile do you prefer?</h2>
            
            {loading ? (
              <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-[#d8b76d] border-t-transparent rounded-full animate-spin"></div></div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {flavorProfiles.map((profile) => {
                  return (
                    <button
                      key={profile.id}
                      onClick={() => setSelectedProfile(profile.id)}
                      className="relative flex flex-col items-center justify-center p-8 bg-gradient-to-b from-[#1a1714] to-[#0f0e0c] border border-white/5 rounded-2xl overflow-hidden hover:border-[#d8b76d]/50 transition-all duration-500 group shadow-lg hover:shadow-[#d8b76d]/20 hover:-translate-y-2"
                    >
                      {/* Hover Glow Effect */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#d8b76d]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-[#1a1714] to-[#2a261f] border border-white/5 group-hover:border-[#d8b76d]/30 flex items-center justify-center mb-6 transition-all duration-500 shadow-inner group-hover:scale-110">
                        <DynamicIcon name={profile.iconName} className="w-10 h-10 text-white group-hover:text-[#d8b76d] filter drop-shadow-lg group-hover:drop-shadow-[0_0_15px_rgba(216,183,109,0.5)] transition-all duration-500" />
                      </div>
                      
                      <span className="relative font-serif text-xl text-[#eee8dd] text-center mb-3 group-hover:text-[#d8b76d] transition-colors duration-300">{profile.label}</span>
                      
                      <span className="relative text-[10px] uppercase tracking-widest text-gray-500 text-center group-hover:text-gray-300 transition-colors duration-300">
                        {profile.keywords.slice(0, 3).join(' • ')}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        ) : (
          /* Step 2: Recommendations */
          <div className="animate-in fade-in slide-in-from-left-8 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 pb-6 border-b border-[#2a261f]">
              <div>
                <h2 className="text-2xl font-serif mb-2">Our {flavorProfiles.find(p => p.id === selectedProfile)?.label} Selections</h2>
                <p className="text-gray-400 text-sm">Dynamically matched to your taste preferences.</p>
              </div>
              <button 
                onClick={() => setSelectedProfile(null)}
                className="mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 text-sm text-[#d8b76d] border border-[#d8b76d] rounded hover:bg-[#d8b76d] hover:text-black transition-colors"
              >
                <RotateCcw size={16} /> Start Over
              </button>
            </div>

            {recommendedWhiskies.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {recommendedWhiskies.map((product) => (
                  <ProductCard key={product.id || product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-[#151310] rounded-lg border border-[#2a261f]">
                <GlassWater size={48} className="mx-auto text-gray-600 mb-4" />
                <h3 className="text-xl font-serif text-gray-300 mb-2">No exact matches found</h3>
                <p className="text-gray-500 mb-6">We couldn't find a perfect match in our current inventory.</p>
                <button 
                  onClick={() => navigate('/shop')}
                  className="inline-flex items-center gap-2 text-[#d8b76d] hover:text-white transition-colors"
                >
                  Browse all whiskies <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import ProductCard from '../../components/ProductCard';
import { Wine, ArrowRight, RotateCcw, Beef, Fish, Drumstick, Leaf, ChefHat } from 'lucide-react';

const MEAL_TYPES = [
  { id: 'beef', label: 'Beef & Steak', icon: Beef, keywords: ['Red Wine', 'Cabernet Sauvignon', 'Shiraz', 'Pinotage', 'Merlot', 'Bordeaux'] },
  { id: 'seafood', label: 'Seafood', icon: Fish, keywords: ['White Wine', 'Sauvignon Blanc', 'Chardonnay', 'Chenin Blanc'] },
  { id: 'poultry', label: 'Poultry & Pork', icon: Drumstick, keywords: ['Chardonnay', 'Pinot Noir', 'White Wine', 'Rose'] },
  { id: 'vegetarian', label: 'Vegetarian', icon: Leaf, keywords: ['Pinot Noir', 'Sauvignon Blanc', 'White Wine', 'Rose'] },
  { id: 'cheese', label: 'Cheese & Dessert', icon: ChefHat, keywords: ['Dessert Wine', 'Port', 'Shiraz', 'Red Wine'] }
];

export default function WinePairingTool() {
  const navigate = useNavigate();
  const { products } = useProducts();
  const [selectedMeal, setSelectedMeal] = useState(null);
  
  const recommendedWines = useMemo(() => {
    if (!selectedMeal || !products) return [];
    
    // Find keywords for the selected meal
    const mealInfo = MEAL_TYPES.find(m => m.id === selectedMeal);
    if (!mealInfo) return [];

    return products.filter(product => {
      // Check explicit pairing first. If set, this overrides the type check.
      if (product.foodPairing && product.foodPairing.length > 0) {
        return product.foodPairing.includes(selectedMeal);
      }

      // Fallback: Must be a wine for dynamic keyword matching
      const isWine = product.category?.toLowerCase().includes('wine') || 
                     product.type?.toLowerCase().includes('wine') ||
                     product.subcategory?.toLowerCase().includes('wine');
                     
      if (!isWine) return false;

      // Dynamic string matching
      const searchableText = `${product.name} ${product.category} ${product.subcategory} ${product.type} ${product.description} ${product.grape || ''} ${product.varietal || ''}`.toLowerCase();
      
      // Return true if any of the keywords match
      return mealInfo.keywords.some(keyword => searchableText.includes(keyword.toLowerCase()));
    }).slice(0, 8); // Limit to top 8 recommendations
  }, [selectedMeal, products]);

  return (
    <div className="min-h-screen bg-[#0a0907] text-white pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        
        {/* Header */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
          <h1 className="text-3xl md:text-5xl font-serif text-[#d8b76d] mb-4">Wine Pairing Assistant</h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Find the perfect wine for your next meal. Our dynamic assistant matches flavor profiles to our curated collection.
          </p>
        </div>

        {/* Step 1: Select Meal */}
        {!selectedMeal ? (
          <div className="animate-in fade-in zoom-in-95 duration-500 delay-150 fill-mode-both">
            <h2 className="text-2xl font-serif text-center mb-8">What are you eating?</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
              {MEAL_TYPES.map((meal) => {
                return (
                  <button
                    key={meal.id}
                    onClick={() => setSelectedMeal(meal.id)}
                    className="relative flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#1a1714] to-[#0f0e0c] border border-white/5 rounded-2xl overflow-hidden hover:border-[#d8b76d]/50 transition-all duration-500 group shadow-lg hover:shadow-[#d8b76d]/20 hover:-translate-y-2"
                  >
                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#d8b76d]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-[#1a1714] to-[#2a261f] border border-white/5 group-hover:border-[#d8b76d]/30 flex items-center justify-center mb-4 transition-all duration-500 shadow-inner group-hover:scale-110">
                      <meal.icon className="w-8 h-8 text-white group-hover:text-[#d8b76d] filter drop-shadow-lg group-hover:drop-shadow-[0_0_15px_rgba(216,183,109,0.5)] transition-all duration-500" strokeWidth={1.5} />
                    </div>
                    
                    <span className="relative font-serif text-lg text-[#eee8dd] text-center group-hover:text-[#d8b76d] transition-colors duration-300">{meal.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          /* Step 2: Recommendations */
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 pb-6 border-b border-[#2a261f]">
              <div>
                <h2 className="text-2xl font-serif mb-2">Perfect Pairings for {MEAL_TYPES.find(m => m.id === selectedMeal)?.label}</h2>
                <p className="text-gray-400 text-sm">We dynamically selected these from our active cellar collection.</p>
              </div>
              <button 
                onClick={() => setSelectedMeal(null)}
                className="mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 text-sm text-[#d8b76d] border border-[#d8b76d] rounded hover:bg-[#d8b76d] hover:text-black transition-colors"
              >
                <RotateCcw size={16} /> Start Over
              </button>
            </div>

            {recommendedWines.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {recommendedWines.map((product) => (
                  <ProductCard key={product.id || product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-[#151310] rounded-lg border border-[#2a261f]">
                <Wine size={48} className="mx-auto text-gray-600 mb-4" />
                <h3 className="text-xl font-serif text-gray-300 mb-2">No exact matches found</h3>
                <p className="text-gray-500 mb-6">We couldn't find a perfect match in our current inventory.</p>
                <button 
                  onClick={() => navigate('/shop')}
                  className="inline-flex items-center gap-2 text-[#d8b76d] hover:text-white transition-colors"
                >
                  Browse all wines <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

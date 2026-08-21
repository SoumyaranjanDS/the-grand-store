import { useProducts } from '../../context/ProductContext'
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Grid3X3, X } from 'lucide-react';
import ProductCard from '../../components/ProductCard';
import FilterGroup from './FilterGroup';
import Price from '../../components/ui/Price';

export default function ShopPage({ onAdd, onWish, onCompare, compareItems }) {
  const { products } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams()
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [sortBy, setSortBy] = useState('featured')
  const [priceLimit, setPriceLimit] = useState(3000)

  useEffect(() => {
    document.title = 'Shop the Collection — The Grand Store'
    window.scrollTo({ top: 0, behavior: 'auto' })
    return () => { document.title = 'The Grand Store — Luxury Wines & Spirits' }
  }, [])

  const selectedCategories = searchParams.getAll('category')
  const selectedBrands = searchParams.getAll('brand')
  const selectedSizes = searchParams.getAll('size')
  const shopProducts = products.filter(product => product.type !== 'accessory');
  const categoryOptions = [...new Set(shopProducts.map((product) => product.category))]
  const brandOptions = [...new Set(shopProducts.map((product) => product.brand))]
  const sizeOptions = [...new Set(shopProducts.map((product) => product.size))]

  const toggleFilter = (key, value) => {
    const nextParams = new URLSearchParams(searchParams)
    const values = nextParams.getAll(key)
    nextParams.delete(key)
    const nextValues = values.includes(value) ? values.filter((item) => item !== value) : [...values, value]
    nextValues.forEach((item) => nextParams.append(key, item))
    setSearchParams(nextParams)
  }

  const resetFilters = () => {
    setSearchParams({})
    setPriceLimit(3000)
    setMobileFiltersOpen(false)
  }

  const priceValue = (product) => Number(product.price.toString().replace(/[^0-9.]/g, ''))
  
  let filteredProducts = shopProducts.filter((product) => {

    return (!selectedCategories.length || selectedCategories.includes(product.category))
    && (!selectedBrands.length || selectedBrands.includes(product.brand))
    && (!selectedSizes.length || selectedSizes.includes(product.size))
    && priceValue(product) <= priceLimit;
  })

  filteredProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return priceValue(a) - priceValue(b)
    if (sortBy === 'price-high') return priceValue(b) - priceValue(a)
    if (sortBy === 'name') return a.name.localeCompare(b.name)
    return a.id - b.id
  })

  const activeFilterCount = selectedCategories.length + selectedBrands.length + selectedSizes.length + (priceLimit < 3000 ? 1 : 0)

  return (
    <main className="min-h-screen bg-[#050505] text-[#e0e0e0] font-sans pb-24">
      {/* Main Catalog Section */}
      <section className="max-w-7xl mx-auto px-2 lg:px-4 pt-12">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Mobile Filter Overlay & Sidebar */}
          <div className={`fixed inset-0 z-50 bg-black/80 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${mobileFiltersOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setMobileFiltersOpen(false)} />
          
          <aside className={`fixed top-0 left-0 h-full w-[85%] max-w-sm bg-[#0a0a0a] border-r border-white/10 z-50 p-6 lg:p-0 overflow-y-auto lg:overflow-visible transition-transform duration-300 lg:static lg:w-1/5 lg:bg-transparent lg:border-none lg:z-auto lg:translate-x-0 ${mobileFiltersOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex items-center justify-between lg:hidden mb-8">
              <h2 className="text-[#e6c97a] font-serif text-xl tracking-wide">Filters</h2>
              <button onClick={() => setMobileFiltersOpen(false)} className="text-white hover:text-[#e6c97a]"><X size={24} /></button>
            </div>
            
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
              <div className="flex items-center gap-2 text-white font-medium tracking-wider text-sm uppercase">
                <SlidersHorizontal size={16} className="text-[#b58b38]" /> Filters 
                {activeFilterCount > 0 && <span className="bg-[#b58b38] text-black w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold">{activeFilterCount}</span>}
              </div>
              {activeFilterCount > 0 && (
                <button type="button" onClick={resetFilters} className="text-[#888] text-[10px] uppercase tracking-widest hover:text-white transition-colors">Clear all</button>
              )}
            </div>

            <div className="space-y-8">
              <FilterGroup title="Category" options={categoryOptions} selectedValues={selectedCategories} onToggle={(value) => toggleFilter('category', value)} />
              <FilterGroup title="Brand" options={brandOptions} selectedValues={selectedBrands} onToggle={(value) => toggleFilter('brand', value)} />
              <FilterGroup title="Bottle size" options={sizeOptions} selectedValues={selectedSizes} onToggle={(value) => toggleFilter('size', value)} />
              
              <div className="pt-2">
                <h3 className="text-white text-xs font-bold tracking-[0.15em] uppercase mb-4">Price range</h3>
                <input 
                  type="range" 
                  min="500" 
                  max="3000" 
                  step="50" 
                  value={priceLimit} 
                  onChange={(event) => setPriceLimit(Number(event.target.value))} 
                  className="w-full accent-[#b58b38] h-1 bg-white/20 rounded-full appearance-none cursor-pointer"
                />
                <div className="flex justify-between items-center mt-3 text-[10px] tracking-widest text-[#888] uppercase">
                  <span><Price amount={500} /></span>
                  <strong className="text-[#e6c97a]">Up to <Price amount={priceLimit.toLocaleString()} /></strong>
                </div>
              </div>
            </div>
          </aside>

          {/* Results Area */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-4 border-b border-white/5">
              <div className="flex items-center gap-3 text-[#888]">
                <Grid3X3 size={16} className="text-[#b58b38]" />
                <strong className="text-white font-medium text-sm tracking-wide">{filteredProducts.length} bottles</strong>
                <span className="hidden md:inline text-xs">Curated and ready to discover</span>
              </div>
              <div className="flex items-center gap-4">
                <button className="lg:hidden flex items-center gap-2 border border-white/20 px-4 py-2 text-xs font-medium uppercase tracking-widest hover:bg-white/5 transition-colors" type="button" onClick={() => setMobileFiltersOpen(true)}>
                  <SlidersHorizontal size={14} /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                </button>
                <div className="flex items-center gap-2">
                  <label className="text-[#888] text-[10px] uppercase tracking-widest">Sort by</label>
                  <select 
                    value={sortBy} 
                    onChange={(event) => setSortBy(event.target.value)}
                    className="bg-transparent border-none text-white text-xs font-medium uppercase tracking-widest outline-none cursor-pointer hover:text-[#e6c97a] transition-colors"
                  >
                    <option value="featured" className="bg-[#111]">Featured</option>
                    <option value="price-low" className="bg-[#111]">Price: low to high</option>
                    <option value="price-high" className="bg-[#111]">Price: high to low</option>
                    <option value="name" className="bg-[#111]">Name</option>
                  </select>
                </div>
              </div>
            </div>

            {filteredProducts.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    product={product}
                    onAdd={onAdd}
                    onWish={onWish}
                    onCompare={onCompare}
                    isCompared={compareItems.some((item) => item.id === product.id)}
                    key={product.id}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 text-center border border-white/5 bg-white/[0.02]">
                <h2 className="font-serif text-3xl text-white mb-4 tracking-wide">No bottles match these filters.</h2>
                <p className="text-[#888] mb-8 max-w-md">Clear a filter to return to the wider collection and discover more exceptional spirits.</p>
                <button 
                  className="px-8 py-3 bg-white text-black text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-[#e6c97a] transition-colors" 
                  type="button" 
                  onClick={resetFilters}
                >
                  Reset filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
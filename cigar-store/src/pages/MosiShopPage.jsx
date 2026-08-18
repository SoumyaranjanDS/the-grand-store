import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import ShopFilters from '../components/ShopFilters';
import ShopProductCard from '../components/ShopProductCard';
import SiteFooter from '../sections/SiteFooter';
import { mosiProductDetails, shopBrands } from '../data/mosiProducts';
import './MosiShopPage.css';

const strengthOrder = { Strong: 0, Mixed: 1, Mild: 2, Lite: 3 };

function MosiShopPage() {
  const [activeBrands, setActiveBrands] = useState(['Mosi Oa Tunya']);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('featured');
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Mosi Oa Tunya Cigars · Cigar Connoisseur Club';
  }, []);

  useEffect(() => {
    document.body.classList.toggle('shop-filter-open', filtersOpen);
    return () => document.body.classList.remove('shop-filter-open');
  }, [filtersOpen]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    const matches = mosiProductDetails.filter((product) => {
      const matchesBrand = !activeBrands.length || activeBrands.includes(product.brand);
      const matchesSearch = !query || [product.name, product.wrapper, product.flavor, product.origin, product.sku]
        .some((value) => value.toLowerCase().includes(query));
      return matchesBrand && matchesSearch;
    });

    if (sort === 'name-asc') return [...matches].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'name-desc') return [...matches].sort((a, b) => b.name.localeCompare(a.name));
    if (sort === 'strength') return [...matches].sort((a, b) => strengthOrder[a.flavor] - strengthOrder[b.flavor]);
    return matches;
  }, [activeBrands, search, sort]);

  const toggleBrand = (brand) => {
    setActiveBrands((current) => current.includes(brand) ? current.filter((item) => item !== brand) : [...current, brand]);
  };

  const clearFilters = () => {
    setActiveBrands([]);
    setSearch('');
  };

  return (
    <div className="mosi-shop" id="top">
      <main className="mosi-shop__main">
        <section className="mosi-shop-hero">
          <div className="mosi-shop-hero__copy">
            <p>Shop / African collection</p>
            <h1>Mosi Oa Tunya<br /><em>Cigars</em></h1>
            <span>Meticulously hand-rolled with high-quality African tobacco by an all-female team of expert cigar rollers.</span>
          </div>
          <div className="mosi-shop-hero__image"><img src="/images/mosi-oa-tunya.jpeg" alt="Mosi Oa Tunya cigar" /></div>
        </section>

        <section className="mosi-catalog" aria-labelledby="mosi-catalog-title">
          <div className={`shop-filter-drawer ${filtersOpen ? 'is-open' : ''}`}>
            <ShopFilters
              brands={shopBrands}
              activeBrands={activeBrands}
              search={search}
              onSearchChange={setSearch}
              onToggleBrand={toggleBrand}
              onClear={clearFilters}
              onClose={() => setFiltersOpen(false)}
            />
          </div>
          {filtersOpen && <button className="shop-filter-backdrop" type="button" aria-label="Close filters" onClick={() => setFiltersOpen(false)} />}

          <div className="mosi-catalog__desktop-filters">
            <ShopFilters
              brands={shopBrands}
              activeBrands={activeBrands}
              search={search}
              onSearchChange={setSearch}
              onToggleBrand={toggleBrand}
              onClear={clearFilters}
            />
          </div>

          <div className="mosi-catalog__content">
            <header className="mosi-catalog__header">
              <div>
                <p>African tobacco · Hand rolled</p>
                <h2 id="mosi-catalog-title">Shop <span>({filteredProducts.length})</span></h2>
              </div>
              <div className="mosi-catalog__controls">
                <button type="button" className="mobile-filter-button" onClick={() => setFiltersOpen(true)}><SlidersHorizontal size={17} /> Filters</button>
                <label className="shop-sort">
                  <span>Sort by</span>
                  <select value={sort} onChange={(event) => setSort(event.target.value)}>
                    <option value="featured">Featured</option>
                    <option value="name-asc">Name A–Z</option>
                    <option value="name-desc">Name Z–A</option>
                    <option value="strength">Strength</option>
                  </select>
                  <ChevronDown size={14} aria-hidden="true" />
                </label>
              </div>
            </header>

            <div className="active-filters">
              <p>Active filters</p>
              <div>
                {activeBrands.map((brand) => <button type="button" key={brand} onClick={() => toggleBrand(brand)}>{brand}<X size={13} /></button>)}
                {search && <button type="button" onClick={() => setSearch('')}>“{search}”<X size={13} /></button>}
                {!activeBrands.length && !search && <span>Showing the complete collection</span>}
              </div>
            </div>

            {filteredProducts.length ? (
              <div className="mosi-product-grid">
                {filteredProducts.map((product, index) => <ShopProductCard key={product.slug} product={product} index={index} />)}
              </div>
            ) : (
              <div className="mosi-catalog__empty">
                <p>No cigars match those filters.</p>
                <button type="button" onClick={clearFilters}>Reset the collection</button>
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

export default MosiShopPage;

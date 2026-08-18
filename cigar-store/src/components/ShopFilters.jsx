import { Search, X } from 'lucide-react';

function ShopFilters({ brands, activeBrands, search, onSearchChange, onToggleBrand, onClear, onClose }) {
  return (
    <aside className="shop-filters" aria-label="Product filters">
      <div className="shop-filters__header">
        <div><p>Refine selection</p><h2>Filter by brand</h2></div>
        {onClose && <button type="button" onClick={onClose} aria-label="Close filters"><X size={21} /></button>}
      </div>

      <label className="shop-filters__search">
        <span>Search this collection</span>
        <div><Search size={17} strokeWidth={1.4} /><input type="search" value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search cigars…" /></div>
      </label>

      <fieldset>
        <legend className="sr-only">Brands</legend>
        {brands.map((brand) => (
          <label className="shop-filter-option" key={brand}>
            <input type="checkbox" checked={activeBrands.includes(brand)} onChange={() => onToggleBrand(brand)} />
            <span className="shop-filter-option__box" aria-hidden="true" />
            <span>{brand}</span>
            {brand === 'Mosi Oa Tunya' && <small>10</small>}
          </label>
        ))}
      </fieldset>

      <button className="shop-filters__clear" type="button" onClick={onClear} disabled={!activeBrands.length && !search}>Clear all filters</button>
    </aside>
  );
}

export default ShopFilters;

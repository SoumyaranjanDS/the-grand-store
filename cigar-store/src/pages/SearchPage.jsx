import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import SectionHeading from '../components/SectionHeading';
import { newArrivals, mosiProducts, featuredMosiProducts } from '../data/homeContent';
import SiteFooter from '../sections/SiteFooter';
import './SearchPage.css';

// Combine all products to search through
const allProducts = [...newArrivals, ...mosiProducts, ...featuredMosiProducts];

function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);

  useEffect(() => {
    // Scroll to top on load
    window.scrollTo(0, 0);
    
    if (query) {
      const lowerQuery = query.toLowerCase();
      const filtered = allProducts.filter(
        product => 
          product.name.toLowerCase().includes(lowerQuery) || 
          product.brand.toLowerCase().includes(lowerQuery) ||
          product.description?.toLowerCase().includes(lowerQuery)
      );
      
      // Deduplicate by name
      const uniqueResults = Array.from(new Map(filtered.map(item => [item.name, item])).values());
      setResults(uniqueResults);
    } else {
      setResults([]);
    }
  }, [query]);

  return (
    <div className="search-page site-shell">
      <main className="search-page__main">
        <div className="search-page__header">
          <SectionHeading 
            eyebrow="Search Results" 
            title={query ? `Results for "${query}"` : "Search"} 
            intro={results.length > 0 ? `Found ${results.length} products matching your query.` : (query ? "We couldn't find any products matching your search. Please try another term." : "Enter a search term above to find products.")}
            align="center"
            light={false}
          />
        </div>

        {results.length > 0 && (
          <div className="search-page__grid">
            {results.map((product, index) => (
              <ProductCard key={product.name} product={product} index={index} />
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

export default SearchPage;

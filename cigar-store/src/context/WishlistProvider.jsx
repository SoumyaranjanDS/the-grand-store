import { useEffect, useMemo, useState } from 'react';
import { WishlistContext } from './wishlistContext';

const STORAGE_KEY = 'cigar-connoisseur-saved-products';

function getProductId(product) {
  if (product.slug) return product.slug;
  const routeSlug = product.href?.match(/\/product-details\/([^/?#]+)/)?.[1];
  return routeSlug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function prepareProduct(product) {
  const id = getProductId(product);
  return {
    id,
    slug: product.slug || id,
    name: product.name,
    brand: product.brand,
    image: product.image,
    href: product.href || `/product-details/${product.slug || id}`,
    wrapper: product.wrapper,
    flavor: product.flavor,
  };
}

function readSavedProducts() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

function WishlistProvider({ children }) {
  const [savedProducts, setSavedProducts] = useState(readSavedProducts);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedProducts));
  }, [savedProducts]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key !== STORAGE_KEY) return;
      try {
        const updated = JSON.parse(event.newValue);
        setSavedProducts(Array.isArray(updated) ? updated : []);
      } catch {
        setSavedProducts([]);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const value = useMemo(() => ({
    savedProducts,
    savedCount: savedProducts.length,
    isSaved: (product) => savedProducts.some((item) => item.id === getProductId(product)),
    toggleProduct: (product) => {
      const prepared = prepareProduct(product);
      setSavedProducts((current) => current.some((item) => item.id === prepared.id)
        ? current.filter((item) => item.id !== prepared.id)
        : [prepared, ...current]);
    },
    clearSaved: () => setSavedProducts([]),
  }), [savedProducts]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export default WishlistProvider;

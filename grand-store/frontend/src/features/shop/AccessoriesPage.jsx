import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProductCard from '../../components/ProductCard';

export default function AccessoriesPage({ onAdd, onWish, onCompare, compareItems = [] }) {
  const [accessories, setAccessories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchAccessories = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/products?type=accessory`);
        setAccessories(res.data);
      } catch (err) {
        console.error('Error fetching accessories:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAccessories();
  }, []);

  const goldText = "text-[#c9a35b] font-serif";

  return (
    <div className="bg-[#050505] min-h-screen text-[var(--color-ivory)] pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto mb-16 text-center">
        <h1 className="text-5xl md:text-7xl font-serif mb-6 tracking-tight">
          Fine <span className={goldText}>Glassware</span> & Accessories
        </h1>
        <p className="text-lg md:text-xl text-[var(--color-ivory-muted)] max-w-2xl mx-auto font-light leading-relaxed">
          Elevate your tasting experience with our curated selection of premium glassware, from elegant flutes to sophisticated tumblers.
        </p>
      </div>

      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex justify-center items-center py-20 text-[var(--color-ivory-muted)] animate-pulse">
            Curating accessories...
          </div>
        ) : accessories.length === 0 ? (
          <div className="text-center py-20 text-[var(--color-ivory-muted)]">
            No accessories found at this time.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {accessories.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAdd={onAdd}
                onWish={onWish}
                onCompare={onCompare}
                compareItems={compareItems}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

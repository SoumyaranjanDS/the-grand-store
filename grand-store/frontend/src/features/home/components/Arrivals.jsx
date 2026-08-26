import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ArrowRight } from "lucide-react";
import { useProducts } from "../../../context/ProductContext";
import ProductCard from "../../../components/ProductCard";

export default function Arrivals({ onAdd, onWish, onCompare, compareItems }) {
  const { products } = useProducts();
  const sectionRef = useRef(null);

  const [arrivalProducts, setArrivalProducts] = useState([]);

  useEffect(() => {
    if (products.length > 0 && arrivalProducts.length === 0) {
      const filtered = [...products]
        .filter(
          (product) =>
            !product.vendorId || product.approvalStatus === "approved",
        )
        .filter((product) => String(product.category || product.type || '').toLowerCase() !== 'accessories')
        .sort((first, second) => {
          const firstCreatedAt = Date.parse(first.createdAt || '') || 0
          const secondCreatedAt = Date.parse(second.createdAt || '') || 0
          return secondCreatedAt - firstCreatedAt
        })
        .slice(0, 15)
        .sort(() => 0.5 - Math.random())
        .slice(0, 5);

      setArrivalProducts(filtered);
    }
  }, [products]);

  useEffect(() => {
    if (arrivalProducts.length === 0 || !sectionRef.current) return;
    const context = gsap.context(() => {
      gsap.from(".product-card", {
        y: 60,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 76%" },
      });
    }, sectionRef);

    return () => context.revert();
  }, [arrivalProducts.length]);

  return (
    <section
      className="section arrivals home-product-editorial"
      id="arrivals"
      ref={sectionRef}
    >
      <div className="shell">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Fresh from the cellar</p>
            <h2>New arrivals</h2>
            <p className="section-intro">
              Newly discovered, quietly exceptional. Meet the bottles our
              curators cannot stop talking about.
            </p>
          </div>
          <Link className="text-link arrow-link" to="/shop">
            View all bottles <ArrowRight size={16} />
          </Link>
        </div>

        <div className="product-grid">
          {arrivalProducts.map((product, index) => (
            <ProductCard
              key={product.id || product._id}
              product={product}
              index={index}
              onAdd={onAdd}
              onWish={onWish}
              onCompare={onCompare}
              isCompared={compareItems.some(
                (item) => (item.id || item._id) === (product.id || product._id),
              )}
            />
          ))}
        </div>

        <p className="swipe-hint">
          <ArrowRight size={15} /> Swipe to explore
        </p>
      </div>
    </section>
  );
}

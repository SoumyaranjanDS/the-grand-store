import { useProducts } from "../../context/ProductContext";
import React, { useState, useEffect } from "react";
import SEO from "../../components/SEO";
import { Link, Navigate, useParams } from "react-router-dom";
import {
  ChevronRight,
  ChevronLeft,
  Minus,
  Plus,
  Heart,
  Link2,
  ArrowRight,
  X,
} from "lucide-react";
import { useWishlist } from "../../wishlistContext";
import { useGeoLocation } from "../../context/LocationContext";
import ProductCard from "../../components/ProductCard";
import TrustBadges from "../../components/social/TrustBadges";
import ReviewSection from "../../components/social/ReviewSection";
import ProductQnA from "../../components/social/ProductQnA";
import ExpertReviewCard from "../../components/social/ExpertReviewCard";
import Price from "../../components/ui/Price";

const preparedVendorImages = {
  '/uploads/images-1787292711461.png': '/assets/products/vendor/whisky-tona-full.png',
};

const resolveImageUrl = (src) => {
  if (!src) return '';
  const normalizedSrc = String(src).replace(/\\/g, '/');
  
  const prepared = Object.entries(preparedVendorImages)
    .find(([uploadPath]) => normalizedSrc.includes(uploadPath))?.[1];
  if (prepared) return prepared;
  
  if (normalizedSrc.startsWith('http://') || normalizedSrc.startsWith('https://')) {
    return normalizedSrc;
  }
  
  if (normalizedSrc.includes('uploads/')) {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5015';
    const cleanPath = normalizedSrc.substring(normalizedSrc.indexOf('uploads/'));
    return `${apiUrl.replace(/\/$/, '')}/${cleanPath}`;
  }
  
  return normalizedSrc;
};

export default function ProductPage({ onAdd, onWish, compareItems, onNotify }) {
  const { products } = useProducts();
  const { slug } = useParams();
  const { currency, country_name } = useGeoLocation();

  const product = products.find(
    (item) =>
      item.slug === slug ||
      item.id === slug ||
      item.id === Number(slug) ||
      item._id === slug,
  );
  const { isWishlisted } = useWishlist();
  const wishlisted = product ? isWishlisted(product) : false;
  const [selectedImage, setSelectedImage] = useState(resolveImageUrl(product?.image ?? ""));
  const [quantity, setQuantity] = useState(1);
  const [selectedOption, setSelectedOption] = useState(
    product?.options?.[0] ?? "Pack of 1",
  );

  // For zooming/gallery
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState("50% 50%");
  const [showCertificate, setShowCertificate] = useState(false);

  // Shipping Estimation
  const [deliveryCountry, setDeliveryCountry] = useState("South Africa");
  const [shippingEstimate, setShippingEstimate] = useState(null);

  // Mock social proof data (to be replaced by API calls in the future)
  const [reviews, setReviews] = useState([]);
  const [qna, setQna] = useState([]);
  const [expertReview, setExpertReview] = useState(null);

  useEffect(() => {
    if (!product) return;
    setSelectedImage(resolveImageUrl(product.image));
    setQuantity(1);
    setSelectedOption(product.options?.[0] ?? "Pack of 1");
    setIsZoomed(false);
    setZoomOrigin("50% 50%");

    // Mock data for demo purposes
    setExpertReview({
      expertName: "James Sinclair",
      expertTitle: "Whisky Specialist",
      ratings: {
        overall: 9.2,
        criteria: [
          { label: "Aroma", score: 9 },
          { label: "Palate", score: 9.5 },
          { label: "Finish", score: 9 },
        ],
      },
      verdict:
        "Excellent for collectors and experienced whisky drinkers. A truly remarkable expression that showcases the distillery character.",
    });

    document.title = `${product.fullName || product.name} — The Grand Store`;
    window.scrollTo({ top: 0, behavior: "auto" });
    return () => {
      document.title = "The Grand Store — Luxury Wines & Spirits";
    };
  }, [product]);

  // Mock shipping estimate effect
  useEffect(() => {
    if (!product) return;
    const isDomestic = deliveryCountry === "South Africa";
    setShippingEstimate({
      cost: isDomestic ? <Price amount={150} /> : <Price amount={450} />,
      time: isDomestic ? "2-4 days" : "5-8 days",
    });
  }, [deliveryCountry, product, currency]);

  if (!product) return <Navigate to="/" replace />;

  const gallery = [product.image, ...(product.gallery || [])].filter(Boolean).map(resolveImageUrl);
  const relatedProducts = products
    .filter((item) => item.id !== product.id)
    .slice(0, 4);
  const detailEntries = product.details ? Object.entries(product.details) : [];

  const productUrl = typeof window === "undefined" ? "" : window.location.href;
  const encodedUrl = encodeURIComponent(productUrl);
  const encodedTitle = encodeURIComponent(product.fullName || product.name);

  const handleZoomMove = (event) => {
    // Keep function to avoid undefined reference if used in JSX, but we will remove it from JSX
  };

  const shareProduct = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      if (onNotify) onNotify("Product link copied");
    } catch {
      if (onNotify) onNotify("Share link ready in your address bar");
    }
  };

  // Format price
  const formattedPrice = Number(product.price).toFixed(2);

  // Generate grid items
  const gridItems = [
    { label: "Category", value: product.category || product.type || "N/A" },
    { label: "Brand", value: product.brand || "The Grand Store" },
    { label: "Origin", value: product.origin || "N/A" },
    ...detailEntries.map(([k, v]) => ({ label: k, value: v })),
  ];

  // Define Product Schema for SEO
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.fullName || product.name,
    image: resolveImageUrl(product.image),
    description:
      product.description || `Buy ${product.name} at The Grand Store.`,
    sku: product.sku || product._id,
    brand: {
      "@type": "Brand",
      name: product.brand || "The Grand Store",
    },
    offers: {
      "@type": "Offer",
      url: typeof window !== "undefined" ? window.location.href : "",
      priceCurrency: "ZAR",
      price: product.price,
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return (
    <main className="min-h-screen bg-[#0a0907] pt-16 pb-12 px-4 md:px-8 lg:px-12 text-[#eee8dd] font-sans">
      <SEO
        title={product.fullName || product.name}
        description={
          product.description?.substring(0, 160) ||
          `Buy ${product.name} at The Grand Store.`
        }
        image={resolveImageUrl(product.image)}
        url={`/product/${product.slug || product._id}`}
        type="product"
        schema={productSchema}
      />
      {/* Top Breadcrumbs */}
      <section className="max-w-7xl mx-auto mb-2 flex items-center text-[10px] text-[#918a7f] uppercase tracking-[0.2em] font-semibold gap-3">
        <Link to="/" className="hover:text-gold-gradient transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link
          to={`/shop?category=${encodeURIComponent(product.category || product.type || "")}`}
          className="hover:text-gold-gradient transition-colors"
        >
          {product.category || product.type || "Shop"}
        </Link>
        {product.brand && (
          <>
            <span>/</span>
            <span className="hover:text-gold-gradient cursor-pointer transition-colors">
              {product.brand}
            </span>
          </>
        )}
        <span>/</span>
        <span className="text-[#eee8dd] font-bold">{product.name}</span>
      </section>

      {/* Main Detail Section (Split Layout) */}
      <section className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
        {/* Left: Floating Image */}
        <div className="flex flex-col items-center">
          <div className="relative w-full max-w-lg aspect-[4/5] flex items-center justify-center group overflow-hidden">
            {/* Image Drop Shadow for floating effect */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-black/80 blur-2xl rounded-[100%] pointer-events-none"></div>

            <img
              src={selectedImage}
              alt={product.fullName || product.name}
              className="relative z-10 max-w-full max-h-full object-contain"
            />
          </div>

          {/* Thumbnails underneath */}
          {gallery.length > 1 && (
            <div className="flex gap-4 mt-8 justify-center flex-wrap">
              {gallery.map((img) => (
                <button
                  key={img}
                  className={`w-16 h-16 md:w-20 md:h-20 flex items-center justify-center p-1 rounded-lg border transition-all ${selectedImage === img ? "border-[#c9a35b] bg-white/5" : "border-transparent hover:border-white/10"}`}
                  onClick={() => setSelectedImage(img)}
                >
                  <img
                    src={img}
                    alt="Thumbnail"
                    className="max-w-full max-h-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info */}
        <div className="flex flex-col justify-center">
          <TrustBadges
            badges={product.badges || ["GRAND_STORE_CHOICE"]}
            className="mb-4"
          />

          <h1 className="text-4xl md:text-5xl lg:text-[54px] font-serif leading-[1.1] mb-4 text-[#eee8dd]">
            {product.fullName || product.name}
          </h1>

          <div className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase mb-4">
            <span className="text-[#918a7f]">
              SKU: {String(product.id).substring(0, 10).toUpperCase()}
            </span>
            <span className="text-white/20">—</span>
            <span
              className={
                product.stock > 0 || product.stock === undefined
                  ? "text-green-500"
                  : "text-red-500"
              }
            >
              {product.stock > 0 || product.stock === undefined
                ? "In Stock"
                : "Out of Stock"}
            </span>
          </div>

          <div className="flex items-end justify-between mb-8 gap-4">
            <div className="text-[42px] font-serif text-[#d8b76d]">
              <Price amount={product.price} />
            </div>

            <button
              onClick={() => setShowCertificate(true)}
              className="relative group hover:scale-105 transition-transform duration-300 shrink-0"
              title="Click to view our 100% Satisfaction Guarantee"
            >
              <img
                src="/grandstore-badge.png"
                alt="Grandstore Guarantee"
                className="relative w-8 sm:w-10 h-auto"
              />
            </button>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4 mb-8">
            {gridItems.slice(0, 6).map((item, idx) => (
              <div key={idx}>
                <div className="text-[10px] text-[#918a7f] uppercase tracking-widest font-semibold mb-1.5">
                  {item.label}
                </div>
                <div className="text-sm font-medium">{item.value}</div>
              </div>
            ))}
          </div>

          {/* Select Options */}
          {product.options && product.options.length > 1 && (
            <div className="mb-6">
              <label className="block text-[10px] text-[#918a7f] uppercase tracking-widest font-semibold mb-2">
                Options
              </label>
              <select
                className="w-full bg-transparent border border-white/20 text-[#eee8dd] p-3 focus:border-[#c9a35b] outline-none transition-colors"
                value={selectedOption}
                onChange={(e) => setSelectedOption(e.target.value)}
              >
                {product.options.map((option) => (
                  <option className="bg-[#0a0907]" value={option} key={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-wrap items-stretch gap-4 mb-6">
            {/* Quantity Selector */}
            <div className="flex items-center border border-white/20 h-[52px]">
              <button
                type="button"
                className="w-12 h-full flex items-center justify-center text-[#918a7f] hover:text-gold-gradient transition-colors"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              >
                <Minus size={14} />
              </button>
              <span className="w-8 text-center text-sm font-semibold">
                {quantity}
              </span>
              <button
                type="button"
                className="w-12 h-full flex items-center justify-center text-[#918a7f] hover:text-gold-gradient transition-colors"
                onClick={() => setQuantity((value) => value + 1)}
              >
                <Plus size={14} />
              </button>
            </div>

            <button
              className="flex-1 min-w-[140px] border border-[#eee8dd] bg-transparent text-[#eee8dd] cursor-pointer font-bold uppercase tracking-widest text-[11px] h-[52px]"
              type="button"
              onClick={() => onAdd && onAdd(product, quantity, selectedOption)}
            >
              Add To Cart
            </button>

            <button
              className="flex-1 min-w-[140px] bg-[#222] hover:bg-[#333] border border-[#222] text-[#eee8dd] transition-colors font-bold uppercase tracking-widest text-[11px] h-13 cursor-pointer"
              type="button"
              onClick={() => {
                if (onAdd) onAdd(product, quantity, selectedOption);
                // In future, redirect to checkout here
              }}
            >
              Buy Now
            </button>

            <button
              className={`w-[52px] h-[52px] border transition-colors flex items-center justify-center ${wishlisted ? "border-[#c9a35b] text-gold-gradient" : "border-white/20 text-[#918a7f] hover:border-white/50 hover:text-white"}`}
              type="button"
              onClick={() => onWish && onWish(product)}
            >
              <Heart size={18} fill={wishlisted ? "currentColor" : "none"} />
            </button>
          </div>

          {/* South Africa Legal Drinking Warning Banner */}
          <div className="w-full bg-[#0a0a0a] border border-white/10 p-3 sm:p-4 flex flex-col xl:flex-row items-center justify-center gap-4 xl:gap-6 mb-8 rounded">
            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              {/* #NO 18 Logo */}
              <div className="flex items-center text-[#e84c22] font-black tracking-tighter">
                <span className="text-3xl leading-none">#N</span>
                <div className="relative w-9 h-9 ml-0.5 flex items-center justify-center border-[4px] border-[#e84c22] rounded-full overflow-hidden">
                  <span className="text-sm font-black tracking-tighter">
                    18
                  </span>
                  <div className="absolute w-full h-[4px] bg-[#e84c22] rotate-[-45deg]"></div>
                </div>
              </div>

              {/* aware.org Logo */}
              <div className="flex flex-col text-white font-bold leading-none">
                <span className="text-[16px] tracking-tight flex items-center">
                  aware
                  <span className="text-[#e84c22] text-xl -mt-1 mx-[1px]">
                    !
                  </span>
                  org
                </span>
                <span className="text-[9px] tracking-widest opacity-90 font-normal mt-0.5">
                  www.aware.org.za
                </span>
              </div>
            </div>

            <div className="hidden xl:block w-px h-8 bg-white/20 shrink-0"></div>

            {/* Warning Text */}
            <div className="text-[11px] sm:text-xs font-bold text-white tracking-[0.15em] text-center xl:text-left leading-snug uppercase">
              Drink responsibly. Not for persons under the age of 18.
            </div>
          </div>

          {/* Fulfilled By Widget */}
          <div className="border border-white/10 p-5 mb-8 bg-white/5">
            <h4 className="text-[10px] text-gold-gradient uppercase tracking-widest font-bold flex items-center gap-2 mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
              </svg>
              Delivery & Fulfillment
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <span className="block text-[#918a7f] text-[10px] uppercase tracking-wider mb-1">
                  Fulfilled By
                </span>
                <span className="font-medium">
                  {product.vendorName || "ABC Winery"}
                </span>
              </div>
              <div>
                <span className="block text-[#918a7f] text-[10px] uppercase tracking-wider mb-1">
                  Ships From
                </span>
                <span className="font-medium">
                  {product.origin || "South Africa"}
                </span>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4 mt-2">
              <label className="block text-[#918a7f] text-[10px] uppercase tracking-wider mb-2">
                Estimate Delivery To
              </label>
              <div className="flex gap-2">
                <select
                  className="bg-[#0a0907] border border-white/20 text-[#eee8dd] text-sm p-2 flex-1 focus:border-[#c9a35b] outline-none"
                  value={deliveryCountry}
                  onChange={(e) => setDeliveryCountry(e.target.value)}
                >
                  <option value="South Africa">South Africa</option>
                  <option value="United Arab Emirates">Dubai, UAE</option>
                  <option value="France">France</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="United States">United States</option>
                </select>
              </div>
              {shippingEstimate && (
                <div className="mt-3 flex justify-between items-center text-sm bg-[#0a0907] p-3 border border-white/10">
                  <div>
                    <span className="text-[#918a7f] mr-2">Est. Time:</span>
                    <span className="font-medium">{shippingEstimate.time}</span>
                  </div>
                  <div>
                    <span className="text-[#918a7f] mr-2">Cost:</span>
                    <span className="font-medium text-gold-gradient">
                      {shippingEstimate.cost}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Share Links */}
          <div className="flex items-center gap-6 text-[10px] uppercase tracking-widest font-semibold text-[#918a7f]">
            <span>Share</span>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#eee8dd] transition-colors p-1"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
              </svg>
            </a>
            <a
              href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#eee8dd] transition-colors p-1"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
              </svg>
            </a>
            <a
              href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#eee8dd] transition-colors p-1"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.891-4.444 9.891-9.891 0-2.64-1.028-5.12-2.894-6.988-1.866-1.867-4.348-2.895-6.988-2.895-5.448 0-9.891 4.444-9.891 9.891 0 2.115.6 3.715 1.595 5.391l-1.082 3.953 4.077-1.059zm3.626-6.495c.27-.135 1.597-.789 1.845-.879.248-.09.429-.135.609.135.18.27.697.879.855 1.059.157.18.315.225.585.09.27-.135 1.14-.42 2.171-1.341.801-.715 1.343-1.598 1.5-1.868.157-.27.016-.416-.119-.551-.121-.121-.27-.315-.405-.473-.135-.157-.18-.27-.27-.45-.09-.18-.045-.337.023-.472.067-.135.609-1.467.855-2.008.239-.525.48-.452.609-.461.121-.009.27-.009.405-.009.135 0 .36.051.549.231.189.18.729.713.729 1.737 0 1.024.747 2.015.855 2.159.108.144 1.47 2.245 3.565 3.151.498.215.887.344 1.19.44.5.158.956.135 1.315.082.404-.06 1.242-.508 1.417-1.002.175-.494.175-.918.123-1.002-.051-.084-.196-.135-.466-.27l-2.05-1.005z" />
              </svg>
            </a>
            <button
              onClick={shareProduct}
              className="hover:text-[#eee8dd] transition-colors p-1"
              title="Copy Link"
            >
              <Link2 size={24} />
            </button>
          </div>
        </div>
      </section>

      <hr className="border-white/10 max-w-7xl mx-auto mb-10" />

      {/* Stacked Info Sections */}
      <section className="max-w-7xl mx-auto">
        {/* Fact Sheet PDF (Moved up) */}
        {product.factSheetPdf && (
          <div className="flex justify-center mb-10">
            <a
              href={product.factSheetPdf}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 border border-[#c9a35b] text-gold-gradient hover:bg-gold-gradient hover:text-black font-bold uppercase tracking-widest text-xs transition-colors rounded-full"
            >
              Download Official Fact Sheet PDF <ArrowRight size={16} />
            </a>
          </div>
        )}

        {/* Description Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 py-8 border-t border-b border-white/10">
          <div className="md:col-span-3">
            <h3 className="text-xl font-serif text-[#eee8dd]">Description</h3>
          </div>
          <div className="md:col-span-9">
            <div className="max-w-3xl space-y-6 text-[#918a7f] text-sm leading-relaxed">
              <p>{product.description}</p>
              {product.tastingNotes && product.tastingNotes.length > 0 && (
                <div className="mt-6">
                  <strong className="block text-[#eee8dd] mb-2 font-serif text-lg">
                    Tasting Notes
                  </strong>
                  <ul className="list-disc pl-5 space-y-1">
                    {product.tastingNotes.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 py-8 border-b border-white/10">
          <div className="md:col-span-3">
            <h3 className="text-xl font-serif text-[#eee8dd]">
              Additional Info
            </h3>
          </div>
          <div className="md:col-span-9">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-1">
                <div className="text-[10px] text-[#918a7f] uppercase tracking-widest font-semibold">
                  Category
                </div>
                <div className="text-sm font-medium">
                  {product.category || product.type || "N/A"}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] text-[#918a7f] uppercase tracking-widest font-semibold">
                  Brand
                </div>
                <div className="text-sm font-medium">
                  {product.brand || product.name}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] text-[#918a7f] uppercase tracking-widest font-semibold">
                  Origin
                </div>
                <div className="text-sm font-medium">
                  {product.origin || "N/A"}
                </div>
              </div>
              {detailEntries.map(([label, value]) => (
                <div className="space-y-1" key={label}>
                  <div className="text-[10px] text-[#918a7f] uppercase tracking-widest font-semibold">
                    {label}
                  </div>
                  <div className="text-sm font-medium">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Engine Components */}
      <section className="max-w-7xl mx-auto my-16 px-4 md:px-0">
        <div className="border-t border-white/10 pt-16">
          <ExpertReviewCard expertReview={expertReview} />
        </div>

        <div className="mt-16">
          <ProductQnA questions={qna} productId={product.id || product._id} />
        </div>

        <div className="mt-16">
          <ReviewSection
            reviews={reviews}
            averageRating={product.averageRating || 4.8}
            reviewCount={product.reviewCount || 124}
          />
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="max-w-7xl mx-auto mt-16">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-2xl font-serif text-[#eee8dd]">
              Related Products
            </h2>
            <a
              className="text-[10px] text-gold-gradient uppercase tracking-[0.2em] font-bold hover:text-[#e1bd70] transition-colors"
              href="/#arrivals"
            >
              View More In This Category
            </a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((item) => (
              <ProductCard
                product={item}
                onAdd={onAdd}
                onWish={onWish}
                isCompared={
                  compareItems &&
                  compareItems.some((productItem) => productItem.id === item.id)
                }
                key={item.id}
              />
            ))}
          </div>
        </section>
      )}

      {/* Certificate Modal */}
      {showCertificate && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur-md overflow-y-auto"
          onClick={() => setShowCertificate(false)}
        >
          <div
            className="relative w-full max-w-2xl mx-auto flex flex-col items-center animate-in fade-in zoom-in-95 duration-300 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowCertificate(false)}
              className="absolute -top-12 right-0 text-white/50 hover:text-white transition-colors z-10"
              title="Close Certificate"
            >
              <X size={28} />
            </button>

            {/* Exact Image Certificate Layout */}
            <div className="w-full bg-[#1a1a1a] p-2 md:p-3 shadow-2xl">
              <div className="w-full bg-white relative p-3 md:p-5 lg:p-6 flex justify-center">
                {/* Inner Gold Border */}
                <div className="w-full border-[3px] border-[#d4af37] relative p-6 md:p-8 lg:p-10 flex flex-col items-center justify-center min-h-[300px]">
                  {/* Corners */}
                  <CornerFlourish className="absolute top-0 left-0 w-16 md:w-20 h-16 md:h-20 text-[#e0e0e0] transform" />
                  <CornerFlourish className="absolute top-0 right-0 w-16 md:w-20 h-16 md:h-20 text-[#e0e0e0] transform scale-x-[-1]" />
                  <CornerFlourish className="absolute bottom-0 left-0 w-16 md:w-20 h-16 md:h-20 text-[#e0e0e0] transform scale-y-[-1]" />
                  <CornerFlourish className="absolute bottom-0 right-0 w-16 md:w-20 h-16 md:h-20 text-[#e0e0e0] transform scale-x-[-1] scale-y-[-1]" />

                  {/* Content */}
                  <div className="relative z-10 flex flex-col items-center text-center px-4">
                    <h2 className="text-xl md:text-2xl lg:text-3xl font-bold font-serif text-[#333] mb-6 md:mb-8 tracking-wide">
                      Your Satisfaction is 100% Guaranteed!!
                    </h2>

                    <div className="text-[13px] md:text-[15px] lg:text-[17px] font-serif leading-[1.6] text-[#444] mb-6 md:mb-8 max-w-xl">
                      <p className="mb-4 md:mb-5">
                        Our reputation and success of our company rests on
                        <br className="hidden md:block" /> making you a Happy
                        Customer today and forever!
                        <br className="hidden md:block" /> All we want is for
                        you have a great shopping
                        <br className="hidden md:block" /> experience every time
                        you Shop with us.
                      </p>
                      <p>
                        You simply can't go wrong shopping at Grandstore!
                        <br className="hidden md:block" /> We will always put
                        you right. And we mean ALWAYS!
                      </p>
                    </div>

                    <h3 className="text-sm md:text-base lg:text-lg font-semibold font-serif text-[#333] mb-2 uppercase tracking-widest">
                      BUY WITH CONFIDENCE!
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

const CornerFlourish = ({ className }) => (
  <svg
    className={className}
    width="120"
    height="120"
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M0 0 C 40 0 75 15 95 40 C 115 65 115 100 115 120 C 115 85 95 55 65 35 C 35 15 10 5 0 5 Z"
      fill="#e5e7eb"
    />
    <path
      d="M0 20 C 25 20 50 35 65 55 C 80 75 80 100 80 120 C 80 95 65 75 50 60 C 35 45 15 35 0 35 Z"
      fill="#e5e7eb"
    />
    <circle cx="105" cy="105" r="6" fill="#e5e7eb" />
    <circle cx="90" cy="112" r="3.5" fill="#e5e7eb" />
    <circle cx="112" cy="90" r="3.5" fill="#e5e7eb" />
  </svg>
);

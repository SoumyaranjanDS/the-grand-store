import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  Search,
  GitCompareArrows,
  Heart,
  ShoppingBag,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  PackageCheck,
  X,
  CircleUserRound,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import IconButton from "./IconButton";
import { storeCategories } from "../data";
import { useAuth } from "../context/AuthContext";
import { useProducts } from "../context/ProductContext";
import { useGeoLocation } from "../context/LocationContext";

export default function Header({
  cartCount,
  compareCount,
  wishlistCount,
  onBagClick,
  onCompareClick,
  onWishlistClick,
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { products } = useProducts();
  const { country_name, currency } = useGeoLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const [megaTrigger, setMegaTrigger] = useState("shop");
  const headerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setMegaOpen(false);
      }
    };
    if (megaOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [megaOpen]);

  const closeMenus = () => {
    setMobileOpen(false);
    setMegaOpen(false);
  };

  const toggleMegaMenu = (trigger, categoryName) => {
    const categoryIndex = categoryName
      ? storeCategories.findIndex((category) => category === categoryName)
      : activeCategory;
    if (categoryIndex >= 0) setActiveCategory(categoryIndex);
    setMegaOpen(!(megaOpen && megaTrigger === trigger));
    setMegaTrigger(trigger);
  };

  return (
    <div className="sticky top-0 left-0 right-0 z-[100] bg-[#0a0a0a]">
      <div className="announcement-bar py-3 bg-gradient-to-r from-[#b58b38] via-[#e6c97a] to-[#b58b38] text-black">
        <div className="shell announcement-inner">
          <p className="font-bold tracking-widest uppercase text-[10px]">
            <PackageCheck size={14} className="mr-2" /> Complimentary delivery
            over R1,500
          </p>
          <p className="announcement-message font-bold tracking-widest uppercase text-[10px]">
            Private cellar sourcing available worldwide
          </p>
          <div className="announcement-actions font-bold tracking-widest uppercase text-[10px]">
            <span className="flex items-center gap-1">
              {country_name || 'South Africa'}
            </span>
            <span className="top-rule bg-black/20 mx-2" />
            <span className="flex items-center gap-1">
              {currency}
            </span>
          </div>
        </div>
      </div>

      <header
        className="site-header"
        ref={headerRef}
        onMouseLeave={() => setMegaOpen(false)}
      >
        <div className="shell header-main">
          <button
            className="mobile-menu-button"
            type="button"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={23} />
          </button>

          <Link
            className="brand-mark mx-auto"
            to="/"
            aria-label="The Grand Store home"
          >
            <img
              src="/logo.png"
              alt="The Grand Store"
              className="h-14 w-auto object-contain"
            />
          </Link>

          <form
            className="search-field"
            onSubmit={(event) => event.preventDefault()}
          >
            <Search size={18} aria-hidden="true" />
            <input
              aria-label="Search the collection"
              placeholder="Search rare bottles, estates, vintages…"
            />
            <button type="submit">Search</button>
          </form>

          <div className="header-actions">
            {user ? (
              <IconButton
                label="Profile"
                onClick={() =>
                  navigate(
                    user.role === "admin"
                      ? "/admin/auctions"
                      : user.role === "vendor_active"
                        ? "/vendor/dashboard"
                        : "/customer/profile",
                  )
                }
              >
                <CircleUserRound size={22} className="text-gold-gradient" />
              </IconButton>
            ) : (
              <button
                type="button"
                onClick={() => navigate("/login")}
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "#eee8dd",
                  marginRight: "8px",
                }}
                onMouseEnter={(e) => (e.target.style.color = "#c9a35b")}
                onMouseLeave={(e) => (e.target.style.color = "#eee8dd")}
              >
                Login
              </button>
            )}

            <IconButton
              className={wishlistCount ? "wishlist-header-active" : ""}
              label={`Wishlist, ${wishlistCount} saved ${wishlistCount === 1 ? "bottle" : "bottles"}`}
              count={wishlistCount}
              onClick={onWishlistClick}
            >
              <Heart size={22} fill={wishlistCount ? "currentColor" : "none"} />
            </IconButton>
            <IconButton
              label="Shopping bag"
              count={cartCount}
              onClick={onBagClick}
            >
              <ShoppingBag size={22} />
            </IconButton>
          </div>
        </div>

        <nav className="desktop-nav" aria-label="Main navigation">
          <div className="shell nav-inner">
            <Link className="active" to="/">
              Home
            </Link>
            <div
              className="relative nav-shop-control"
              onMouseEnter={() => {
                setActiveCategory(0);
                setMegaTrigger("shop");
                setMegaOpen(true);
              }}
              onMouseLeave={() => setMegaOpen(false)}
            >
              <Link className="nav-shop-link" to="/shop">
                Shop
              </Link>

              <AnimatePresence>
                {megaOpen && megaTrigger === "shop" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 pt-4 z-50 flex"
                  >
                    <div className="w-48 bg-[#0a0a0a] border border-[#b58b38]/20 shadow-[0_4px_20px_rgba(0,0,0,0.8)] rounded-sm h-96 overflow-y-auto custom-scrollbar relative">
                      {storeCategories.map((category, index) => (
                        <div
                          key={category}
                          className="relative group/category"
                          onMouseEnter={() => setActiveCategory(index)}
                        >
                          <div
                            className={`px-4 py-3 flex items-center justify-between text-sm cursor-pointer transition-colors ${activeCategory === index ? "text-[#e6c97a] bg-white/5" : "text-white hover:text-[#e6c97a]"}`}
                          >
                            {category}
                            <ChevronRight size={14} />
                          </div>
                        </div>
                      ))}
                    </div>

                    <AnimatePresence mode="wait">
                      {activeCategory >= 0 &&
                        storeCategories[activeCategory] && (
                          <motion.div
                            key={activeCategory}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -5 }}
                            transition={{ duration: 0.2 }}
                            className="pl-4 w-72"
                          >
                            <div className="flex flex-col gap-2 max-h-[80vh] overflow-y-auto overflow-x-hidden custom-scrollbar pr-2 py-1">
                              {products
                                .filter((p) =>
                                  (p.category || p.type || "")
                                    .toLowerCase()
                                    .includes(
                                      storeCategories[
                                        activeCategory
                                      ].toLowerCase(),
                                    ),
                                )
                                .map((product, i) => (
                                  <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{
                                      duration: 0.2,
                                      delay: i * 0.03,
                                    }}
                                  >
                                    <Link
                                      to={`/product/${product.slug || product.id}`}
                                      onClick={closeMenus}
                                      className="block px-5 py-2 text-sm text-white bg-[#0a0a0a] border border-[#b58b38]/30 shadow-[0_4px_15px_rgba(0,0,0,0.5)] rounded-lg hover:text-[#e6c97a] hover:border-[#e6c97a]/60 hover:bg-[#b58b38]/10 transition-all truncate text-center"
                                    >
                                      {product.name}
                                    </Link>
                                  </motion.div>
                                ))}
                              {products.filter((p) =>
                                (p.category || p.type || "")
                                  .toLowerCase()
                                  .includes(
                                    storeCategories[
                                      activeCategory
                                    ].toLowerCase(),
                                  ),
                              ).length === 0 && (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="px-5 py-2 text-[#888] text-xs bg-[#0a0a0a] border border-white/10 rounded-lg shadow-[0_4px_15px_rgba(0,0,0,0.5)] text-center whitespace-normal break-words"
                                >
                                  New allocations arriving soon.
                                </motion.div>
                              )}
                            </div>
                          </motion.div>
                        )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button
              className="nav-dropdown-button"
              type="button"
              aria-expanded={megaOpen && megaTrigger === "wine"}
              onClick={() => toggleMegaMenu("wine", "Wine")}
            >
              Wine <ChevronDown size={14} />
            </button>
            <button
              className="nav-dropdown-button"
              type="button"
              aria-expanded={megaOpen && megaTrigger === "accessories"}
              onClick={() => toggleMegaMenu("accessories", "Accessories")}
            >
              Accessories <ChevronDown size={14} />
            </button>
            <a href="/#private-collection">Offers</a>
            <Link to="/auction">Auction</Link>
            <Link to="/events" className="font-bold text-gold-gradient hover:text-[#e1bd70]">Events</Link>
            <Link to="/vendor-portal">Sell on The Grand Store</Link>
            <Link to="/bookatasting">Book a tasting</Link>
            <Link to="/global-wines" className="font-bold text-gold-gradient hover:text-[#e1bd70]">🌍 GLOBAL WINES</Link>
          </div>
        </nav>
      </header>

      <div
        className={`mobile-drawer ${mobileOpen ? "open" : ""}`}
        aria-hidden={!mobileOpen}
      >
        <button
          className="drawer-scrim"
          type="button"
          aria-label="Close menu"
          onClick={closeMenus}
        />
        <div className="drawer-panel">
          <div className="drawer-head">
            <img src="/assets/logo.webp" alt="The Grand Store" />
            <IconButton label="Close menu" onClick={closeMenus}>
              <X size={23} />
            </IconButton>
          </div>
          <form
            className="mobile-search"
            onSubmit={(event) => event.preventDefault()}
          >
            <Search size={18} />
            <input aria-label="Search" placeholder="Search the cellar" />
          </form>
          <div className="drawer-links">
            <Link to="/" onClick={closeMenus}>
              Home
            </Link>
            <details>
              <summary>
                Shop
                <ChevronDown size={15} />
              </summary>
              <div className="mobile-nest">
                <strong>Shop the cellar</strong>
                {storeCategories.map((category) => (
                  <Link
                    to={`/shop?category=${encodeURIComponent(category)}`}
                    onClick={closeMenus}
                    key={category}
                  >
                    {category}
                  </Link>
                ))}
              </div>
            </details>
            <a href="/#private-collection" onClick={closeMenus}>
              Offers
            </a>
            <Link to="/auction" onClick={closeMenus}>
              Auction
            </Link>
            <Link to="/events" onClick={closeMenus} className="font-bold text-gold-gradient">
              Events
            </Link>
            <Link to="/vendor-portal" onClick={closeMenus}>
              Sell on The Grand Store
            </Link>
            <Link to="/bookatasting" onClick={closeMenus}>
              Book a tasting
            </Link>
            <Link to="/global-wines" onClick={closeMenus} className="text-gold-gradient font-bold">
              🌍 Global Wines
            </Link>
            <Link
              className="mobile-wishlist-link"
              to="/customer/wishlist"
              onClick={closeMenus}
            >
              <Heart size={17} fill={wishlistCount ? "currentColor" : "none"} />{" "}
              Wishlist <span>{wishlistCount}</span>
            </Link>
          </div>
          <div
            className="drawer-foot"
            onClick={() => {
              closeMenus();
              navigate(
                user
                  ? user.role === "admin"
                    ? "/admin/auctions"
                    : user.role === "vendor_active"
                      ? "/vendor/dashboard"
                      : "/customer/profile"
                  : "/login",
              );
            }}
          >
            <CircleUserRound
              size={18}
              className={user ? "text-gold-gradient" : ""}
            />
            {user
              ? `Welcome back, ${user.name}`
              : "Sign in to your private account"}
          </div>
        </div>
      </div>
    </div>
  );
}

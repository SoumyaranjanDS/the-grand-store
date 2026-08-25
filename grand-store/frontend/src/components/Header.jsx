import Price from "./ui/Price";
import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
import { storeCategories, accessoryCategories } from "../data";
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
  const location = useLocation();
  const { products } = useProducts();
  const { country_name, currency } = useGeoLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [megaTrigger, setMegaTrigger] = useState("shop");
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeBrand, setActiveBrand] = useState(null);
  const headerRef = useRef(null);

  const closeTimerRef = useRef(null);

  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef(null);

  const [mobileSearchQuery, setMobileSearchQuery] = useState("");
  const mobileSearchRef = useRef(null);

  const searchResults = searchQuery.trim()
    ? products
        .filter(
          (p) =>
            p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.brand?.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        .slice(0, 5)
    : [];

  const mobileSearchResults = mobileSearchQuery.trim()
    ? products
        .filter(
          (p) =>
            p.name?.toLowerCase().includes(mobileSearchQuery.toLowerCase()) ||
            p.brand?.toLowerCase().includes(mobileSearchQuery.toLowerCase()),
        )
        .slice(0, 5)
    : [];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY && window.scrollY > 100) {
        setIsVisible(false);
        setMegaOpen(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setMegaOpen(false);
      }
    };
    if (megaOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [megaOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };
    if (isSearchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSearchOpen]);

  const closeMenus = () => {
    setMobileOpen(false);
    setMegaOpen(false);
  };

  const scheduleClose = useCallback(() => {
    closeTimerRef.current = setTimeout(() => setMegaOpen(false), 300);
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  }, []);

  // Build category→brands map from live products (must be before openMega)
  const getProductCategory = (p) => p.category || p.type || "";
  const categoryBrandsMap = {};
  for (const p of products) {
    const cat = getProductCategory(p);
    if (!cat) continue;
    if (!categoryBrandsMap[cat]) categoryBrandsMap[cat] = new Set();
    if (p.brand) categoryBrandsMap[cat].add(p.brand);
  }
  const liveCategories = Object.keys(categoryBrandsMap).sort();

  // Keep a ref so openMega can read latest map without being in its dep array
  const categoryBrandsMapRef = useRef(categoryBrandsMap);
  categoryBrandsMapRef.current = categoryBrandsMap;

  const openMega = useCallback(
    (trigger) => {
      cancelClose();
      setMegaTrigger(trigger);
      setMegaOpen(true);
      // Auto-select first category + first brand so panels aren't empty on open
      if (trigger === "shop") {
        const map = categoryBrandsMapRef.current;
        const firstCat = Object.keys(map).sort()[0] ?? null;
        setActiveCategory(firstCat);
        const firstBrand = firstCat ? ([...map[firstCat]][0] ?? null) : null;
        setActiveBrand(firstBrand);
      } else {
        setActiveCategory(null);
      }
    },
    [cancelClose],
  );

  return (
    <div
      className={`sticky top-0 left-0 right-0 bg-[#0a0a0a] ${mobileOpen ? "z-[10000] transform-none" : `z-[100] transition-transform duration-300 ease-in-out ${isVisible ? "translate-y-0" : "-translate-y-full"}`}`}
    >
      <div className="announcement-bar py-1.5 bg-[#c9a35b] text-black">
        <div className="shell announcement-inner">
          <p className="font-bold tracking-widest uppercase text-[10px]">
            <PackageCheck size={14} className="mr-2" /> Complimentary delivery
            over <Price amount={1500} />
          </p>
          <p className="announcement-message font-bold tracking-widest uppercase text-[10px]">
            Private cellar sourcing available worldwide
          </p>
          <div className="announcement-actions font-bold tracking-widest uppercase text-[10px]">
            <span className="flex items-center gap-1">
              {country_name || "South Africa"}
            </span>
            <span className="top-rule bg-black/20 mx-2" />
            <span className="flex items-center gap-1">{currency}</span>
          </div>
        </div>
      </div>

      <header className="site-header relative" ref={headerRef}>
        <div className="shell header-main flex items-center justify-between min-h-[50px] sm:min-h-[64px] md:min-h-[80px] px-2 sm:px-6 md:px-10">
          {/* Left: Mobile Menu + Logo */}
          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            <button
              className="mobile-menu-button shrink-0"
              type="button"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={22} />
            </button>

            <Link
              className="brand-mark shrink-0 inline-flex items-center"
              to="/"
              aria-label="The Grand Store home"
            >
              <img
                src="/logo.png"
                alt="The Grand Store"
                className="h-9 w-auto max-w-[135px] object-contain object-left sm:h-12 sm:max-w-[190px] md:h-[62px] md:max-w-[270px]"
              />
            </Link>
          </div>

          {/* Center: Search */}
          <div
            className="hidden md:block flex-1 max-w-[560px] mx-6 relative"
            ref={searchRef}
          >
            <form
              className="search-field w-full"
              onSubmit={(event) => {
                event.preventDefault();
                if (searchQuery.trim()) {
                  navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
                  setIsSearchOpen(false);
                }
              }}
            >
              <Search size={18} aria-hidden="true" />
              <input
                aria-label="Search the collection"
                placeholder="Search rare bottles, estates, vintages…"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
              />
              <button type="submit">Search</button>
            </form>

            <AnimatePresence>
              {isSearchOpen &&
                searchQuery.trim() &&
                searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 w-full bg-[#1e1e1e] border border-white/20 shadow-2xl z-50 overflow-hidden"
                  >
                    {searchResults.map((product) => (
                      <Link
                        key={product.id || product._id}
                        to={`/product/${product.slug || product.id || product._id}`}
                        className="flex items-center justify-between p-3 border-b border-white/10 hover:bg-white/5 transition-colors last:border-b-0"
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSearchQuery("");
                        }}
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-8 h-10 flex items-center justify-center rounded border border-white/10 overflow-hidden shrink-0 bg-white/5">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="max-w-full max-h-full object-contain"
                              />
                            ) : (
                              <div className="w-full h-full bg-[#222]"></div>
                            )}
                          </div>
                          <span
                            className="text-[15px] text-[#eee] truncate"
                            title={product.name}
                          >
                            {product.name}
                          </span>
                        </div>
                        <span className="text-[15px] text-[#eee] ml-4 shrink-0">
                          <Price amount={product.price} />
                        </span>
                      </Link>
                    ))}
                  </motion.div>
                )}
            </AnimatePresence>
          </div>

          {/* Right: Header Actions */}
          <div className="header-actions flex items-center justify-end gap-1 sm:gap-2.5 shrink-0">
            {user ? (
              <IconButton
                label="Profile"
                onClick={() =>
                  navigate(
                    user.role === "admin"
                      ? "/admin/auctions"
                      : user.role === "vendor_active"
                        ? "/vendor/dashboard"
                        : user.role === "auction_host"
                          ? "/auction-manager/dashboard"
                          : user.role === "event_host"
                            ? "/event-manager/dashboard"
                            : "/customer/profile",
                  )
                }
              >
                <CircleUserRound size={21} className="text-gold-gradient" />
              </IconButton>
            ) : (
              <>
                <IconButton
                  className="sm:hidden"
                  label="Account"
                  onClick={() => navigate("/login")}
                >
                  <CircleUserRound size={21} />
                </IconButton>
                <button
                  type="button"
                  className="hidden sm:inline-block"
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
              </>
            )}

            <div className="hidden">
              <IconButton
                label="Compare products"
                count={compareCount}
                onClick={onCompareClick}
              >
                <GitCompareArrows size={21} />
              </IconButton>
            </div>

            <IconButton
              className={wishlistCount ? "wishlist-header-active" : ""}
              label={`Wishlist, ${wishlistCount} saved ${wishlistCount === 1 ? "bottle" : "bottles"}`}
              count={wishlistCount}
              onClick={onWishlistClick}
            >
              <Heart size={21} fill={wishlistCount ? "currentColor" : "none"} />
            </IconButton>

            <IconButton
              label="Shopping bag"
              count={cartCount}
              onClick={onBagClick}
            >
              <ShoppingBag size={21} />
            </IconButton>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav
          className="desktop-nav"
          aria-label="Main navigation"
          onMouseLeave={scheduleClose}
          onMouseEnter={cancelClose}
        >
          <div className="shell nav-inner">
            <Link
              className={location.pathname === "/" ? "active" : ""}
              to="/"
              onMouseEnter={() => {
                cancelClose();
                setMegaOpen(false);
              }}
            >
              Home
            </Link>

            {/* Shop trigger */}
            <div
              className="nav-shop-control"
              onMouseEnter={() => openMega("shop")}
            >
              <Link
                className={`nav-shop-link font-bold hover:text-white transition-colors ${location.pathname.startsWith("/shop") ? "text-[#f0cf76] active" : ""}`}
                to="/shop"
                onClick={() => setMegaOpen(false)}
              >
                SHOP
              </Link>
            </div>

            <Link
              className={
                location.pathname.startsWith("/offers") ? "active" : ""
              }
              to="/offers"
              onMouseEnter={() => {
                cancelClose();
                setMegaOpen(false);
              }}
            >
              Offers
            </Link>
            <Link
              className={
                location.pathname.startsWith("/auction") ? "active" : ""
              }
              to="/auction"
              onMouseEnter={() => {
                cancelClose();
                setMegaOpen(false);
              }}
            >
              Auction
            </Link>

            {/* Accessories trigger */}
            <div
              className="nav-accessories-control"
              onMouseEnter={() => openMega("accessories")}
            >
              <Link
                to="/accessories"
                className={`nav-dropdown-button hover:text-[#f0cf76] transition-colors ${location.pathname.startsWith("/accessories") ? "active text-[#f0cf76]" : ""}`}
                onClick={() => setMegaOpen(false)}
              >
                Accessories
              </Link>
            </div>

            <Link
              to="/events"
              className={`font-bold hover:text-white transition-colors ${location.pathname.startsWith("/events") ? "text-[#f0cf76] active" : ""}`}
              onMouseEnter={() => {
                cancelClose();
                setMegaOpen(false);
              }}
            >
              Events
            </Link>
            <Link
              className={
                location.pathname.startsWith("/vendor-portal") ? "active" : ""
              }
              to="/vendor-portal"
              onMouseEnter={() => {
                cancelClose();
                setMegaOpen(false);
              }}
            >
              Sell on The Grand Store
            </Link>
            <Link
              className={
                location.pathname === "/events/tasting" ? "active" : ""
              }
              to="/events"
              onMouseEnter={() => {
                cancelClose();
                setMegaOpen(false);
              }}
            >
              Book a tasting
            </Link>
            <Link
              to="/global-wines"
              className={`font-bold hover:text-white transition-colors ${location.pathname.startsWith("/global-wines") ? "text-[#f0cf76] active" : ""}`}
              onMouseEnter={() => {
                cancelClose();
                setMegaOpen(false);
              }}
            >
              🌍 GLOBAL WINES
            </Link>
          </div>
        </nav>

        {/* ── SHOP MEGA MENU ── */}
        <AnimatePresence>
          {megaOpen && megaTrigger === "shop" && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute top-[100%] left-0 w-full z-50 border-t border-white/10"
              onMouseEnter={cancelClose}
              onMouseLeave={scheduleClose}
            >
              <div className="w-full bg-[#111] shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
                <div className="w-full max-w-[1400px] mx-auto px-10 py-8">
                  {/* Multi-column grid — each category is a column cell */}
                  <div className="columns-4 gap-x-8 space-y-6">
                    {liveCategories.map((cat) => {
                      const catProducts = products
                        .filter((p) => (p.category || p.type || "") === cat)
                        .slice(0, 5);
                      return (
                        <div key={cat} className="break-inside-avoid mb-6">
                          {/* Category header */}
                          <Link
                            to={`/shop?category=${encodeURIComponent(cat)}`}
                            onClick={closeMenus}
                            className="block mb-2 text-[11px] font-bold tracking-[0.18em] text-white hover:text-[#d4af37] transition-colors uppercase"
                          >
                            {cat}
                          </Link>
                          {/* Product list */}
                          <div className="space-y-[3px]">
                            {catProducts.map((p) => (
                              <Link
                                key={p._id || p.id}
                                to={`/product/${p.slug || p._id || p.id}`}
                                onClick={closeMenus}
                                title={p.name}
                                className="flex items-center gap-1.5 group"
                              >
                                <span className="text-[#c9a35b] text-[11px] shrink-0">
                                  ›
                                </span>
                                <span className="text-[13px] text-[#888] group-hover:text-[#c9a35b] transition-colors truncate">
                                  {p.name}
                                </span>
                              </Link>
                            ))}
                            {products.filter(
                              (p) => (p.category || p.type || "") === cat,
                            ).length > 5 && (
                              <Link
                                to={`/shop?category=${encodeURIComponent(cat)}`}
                                onClick={closeMenus}
                                className="flex items-center gap-1.5 mt-1 group"
                              >
                                <span className="text-[#c9a35b] text-[11px] shrink-0">
                                  ›
                                </span>
                                <span className="text-[12px] text-[#c9a35b]/70 group-hover:text-[#c9a35b] transition-colors">
                                  All {cat}
                                </span>
                              </Link>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── ACCESSORIES MEGA MENU ── */}
        <AnimatePresence>
          {megaOpen && megaTrigger === "accessories" && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute top-[100%] left-0 w-full z-50 border-t border-white/10"
              onMouseEnter={cancelClose}
              onMouseLeave={scheduleClose}
            >
              <div className="w-full bg-[#111] shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
                <div className="w-full max-w-[1400px] mx-auto px-10 py-8">
                  {/* Multi-column grid — each category is a column cell */}
                  <div className="columns-4 gap-x-8 space-y-6">
                    {Object.entries(accessoryCategories).map(
                      ([cat, subcats]) => (
                        <div key={cat} className="break-inside-avoid mb-6">
                          {/* Category header */}
                          <Link
                            to={`/accessories?category=${encodeURIComponent(cat)}`}
                            onClick={closeMenus}
                            className="block mb-2 text-[11px] font-bold tracking-[0.18em] text-white hover:text-[#d4af37] transition-colors uppercase"
                          >
                            {cat}
                          </Link>
                          {/* Subcategory list */}
                          <div className="space-y-[3px]">
                            {subcats.map((subcat) => (
                              <Link
                                key={subcat}
                                to={`/accessories?category=${encodeURIComponent(cat)}&subcategory=${encodeURIComponent(subcat)}`}
                                onClick={closeMenus}
                                className="flex items-center gap-1.5 group"
                              >
                                <span className="text-[#c9a35b] text-[11px] shrink-0">
                                  ›
                                </span>
                                <span className="text-[13px] text-[#888] group-hover:text-[#c9a35b] transition-colors truncate">
                                  {subcat}
                                </span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Drawer */}
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
          <div className="drawer-head flex items-center justify-between">
            <Link
              to="/"
              onClick={closeMenus}
              className="inline-flex items-center"
            >
              <img
                src="/logo.png"
                alt="The Grand Store"
                className="h-8 w-auto object-contain sm:h-10 md:h-[46px]"
              />
            </Link>
            <IconButton label="Close menu" onClick={closeMenus}>
              <X size={23} />
            </IconButton>
          </div>
          <div
            className="mobile-search-container relative"
            ref={mobileSearchRef}
          >
            <form
              className="mobile-search"
              onSubmit={(event) => {
                event.preventDefault();
                if (mobileSearchQuery.trim()) {
                  navigate(
                    `/shop?search=${encodeURIComponent(mobileSearchQuery)}`,
                  );
                  closeMenus();
                }
              }}
            >
              <Search size={18} />
              <input
                aria-label="Search"
                placeholder="Search the cellar"
                value={mobileSearchQuery}
                onChange={(e) => setMobileSearchQuery(e.target.value)}
              />
            </form>
            <AnimatePresence>
              {mobileSearchQuery.trim() && mobileSearchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute top-full left-0 w-full mt-2 bg-[#1a1a1a] border border-[#333] shadow-xl z-[100] rounded-sm overflow-hidden"
                >
                  {mobileSearchResults.map((product) => (
                    <Link
                      key={product.id || product._id}
                      to={`/product/${product.slug || product.id || product._id}`}
                      className="flex items-center justify-between p-3 border-b border-[#333] hover:bg-[#2a2a2a] transition-colors last:border-b-0"
                      onClick={() => {
                        setMobileSearchQuery("");
                        closeMenus();
                      }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-10 bg-black flex items-center justify-center rounded border border-[#333] overflow-hidden shrink-0">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="max-w-full max-h-full object-contain"
                            />
                          ) : (
                            <div className="w-full h-full bg-[#222]"></div>
                          )}
                        </div>
                        <span
                          className="text-sm text-[#eee] truncate"
                          title={product.name}
                        >
                          {product.name}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-white ml-4 shrink-0">
                        <Price amount={product.price} />
                      </span>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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
            <Link to="/offers" onClick={closeMenus}>
              Offers
            </Link>
            <Link to="/auction" onClick={closeMenus}>
              Auction
            </Link>
            <details>
              <summary className="text-[#f0cf76]">
                Accessories
                <ChevronDown size={15} />
              </summary>
              <div className="mobile-nest">
                <strong>Shop accessories</strong>
                {Object.keys(accessoryCategories).map((category) => (
                  <Link
                    to={`/accessories?category=${encodeURIComponent(category)}`}
                    onClick={closeMenus}
                    key={category}
                  >
                    {category}
                  </Link>
                ))}
              </div>
            </details>
            <Link
              to="/events"
              onClick={closeMenus}
              className="font-bold text-[#f0cf76]"
            >
              Events
            </Link>
            <Link to="/vendor-portal" onClick={closeMenus}>
              Sell on The Grand Store
            </Link>
            <Link to="/events" onClick={closeMenus}>
              Book a tasting
            </Link>
            <Link
              to="/global-wines"
              onClick={closeMenus}
              className="text-[#f0cf76] font-bold"
            >
              🌍 Global Wines
            </Link>
            <Link to="/customer/wishlist" onClick={closeMenus}>
              Wishlist
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

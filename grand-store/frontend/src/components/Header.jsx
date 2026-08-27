import Price from "./ui/Price";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  Search,
  GitCompareArrows,
  Heart,
  ShoppingBag,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  PackageCheck,
  X,
  CircleUserRound,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import IconButton from "./IconButton";
import { storeCategories, accessoryCategories, menuCategories } from "../data";
import { useAuth } from "../context/AuthContext";
import { useProducts } from "../context/ProductContext";
import { useGeoLocation } from "../context/LocationContext";
import { useCurrency } from "../context/CurrencyContext";
import LocaleSelector from "./LocaleSelector";

const currencyFlagCountries = {
  AED: 'AE', AUD: 'AU', BWP: 'BW', BRL: 'BR', CAD: 'CA', CHF: 'CH', CNY: 'CN',
  EUR: 'EU', GBP: 'GB', GHS: 'GH', HKD: 'HK', INR: 'IN', JPY: 'JP', KES: 'KE',
  KRW: 'KR', MUR: 'MU', MXN: 'MX', NAD: 'NA', NGN: 'NG', NZD: 'NZ', RUB: 'RU',
  SAR: 'SA', SGD: 'SG', TRY: 'TR', USD: 'US', ZAR: 'ZA'
};

const currencyNames = typeof Intl !== 'undefined' && Intl.DisplayNames
  ? new Intl.DisplayNames(['en'], { type: 'currency' })
  : null;

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
  const { country_code, countries, changeCountry } = useGeoLocation();
  const { currency, availableCurrencies, changeCurrency, loading: currencyLoading } = useCurrency();

  const countryOptions = useMemo(() => countries.map((country) => ({
    value: country.code,
    label: country.name,
    flagCode: country.code
  })), [countries]);

  const currencyOptions = useMemo(() => availableCurrencies.map((currencyCode) => ({
    value: currencyCode,
    label: currencyNames?.of(currencyCode) || currencyCode,
    flagCode: currencyFlagCountries[currencyCode],
    icon: '¤'
  })), [availableCurrencies]);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileNavStack, setMobileNavStack] = useState([{ view: "root" }]);
  const [megaTrigger, setMegaTrigger] = useState("shop");
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeBrand, setActiveBrand] = useState(null);
  const [megaActiveCategory, setMegaActiveCategory] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);

  const currentNav = mobileNavStack[mobileNavStack.length - 1];
  const pushNav = (view, data = null) => setMobileNavStack(prev => [...prev, { view, data }]);
  const popNav = () => setMobileNavStack(prev => prev.length > 1 ? prev.slice(0, -1) : prev);

  const previewProduct = useMemo(() => {
    if (!hoveredItem || !products.length) return null;
    return products.find(p => p.brand === hoveredItem || p.subcategory === hoveredItem);
  }, [hoveredItem, products]);
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
    setTimeout(() => setMobileNavStack([{ view: "root" }]), 300);
  };

  const scheduleClose = useCallback(() => {
    closeTimerRef.current = setTimeout(() => setMegaOpen(false), 300);
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  }, []);

  // Build category→brands and subcategories map from live products
  const getProductCategory = (p) => p.category || p.type || "";
  const categoryBrandsMap = {};
  const categorySubcategoriesMap = {};
  for (const p of products) {
    const cat = getProductCategory(p);
    if (!cat) continue;
    if (!categoryBrandsMap[cat]) categoryBrandsMap[cat] = new Set();
    if (p.brand) categoryBrandsMap[cat].add(p.brand);
    
    if (!categorySubcategoriesMap[cat]) categorySubcategoriesMap[cat] = new Set();
    if (p.subcategory) categorySubcategoriesMap[cat].add(p.subcategory);
  }
  const liveCategories = Object.keys(categoryBrandsMap).sort();

  const dynamicMenuCategories = liveCategories.map(cat => {
    const subcats = Array.from(categorySubcategoriesMap[cat] || []).sort();
    const brands = Array.from(categoryBrandsMap[cat] || []).sort();
    
    return {
      name: cat,
      description: `Explore our collection of ${cat}`,
      groups: [
        ...(subcats.length > 0 ? [{ title: 'Subcategories', items: subcats }] : []),
        ...(brands.length > 0 ? [{ title: 'Brands', items: brands }] : [])
      ]
    };
  });

  const dynamicAccessoryCategories = useMemo(() => {
    const accProducts = products.filter(p => p.type === 'accessory' || Object.keys(accessoryCategories).includes(p.category || p.type));
    
    const catBrands = {};
    const catSubcats = {};
    
    Object.keys(accessoryCategories).forEach(cat => {
      catBrands[cat] = new Set();
      catSubcats[cat] = new Set(accessoryCategories[cat]);
    });

    for (const p of accProducts) {
      const cat = p.category || p.type;
      if (!cat) continue;
      if (!catBrands[cat]) catBrands[cat] = new Set();
      if (p.brand) catBrands[cat].add(p.brand);
      
      if (!catSubcats[cat]) catSubcats[cat] = new Set();
      if (p.subcategory) catSubcats[cat].add(p.subcategory);
    }
    
    const categories = Object.keys(catBrands).sort();
    return categories.map(cat => {
      const subcats = Array.from(catSubcats[cat] || []).sort();
      const brands = Array.from(catBrands[cat] || []).sort();
      
      return {
        name: cat,
        description: `Explore our premium collection of ${cat}`,
        isAccessory: true,
        groups: [
          ...(subcats.length > 0 ? [{ title: 'Subcategories', items: subcats }] : []),
          ...(brands.length > 0 ? [{ title: 'Brands', items: brands }] : [])
        ]
      };
    }).filter(c => c.groups.length > 0);
  }, [products]);

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
        setMegaActiveCategory(dynamicMenuCategories[0]);
      } else if (trigger === "accessories") {
        setMegaActiveCategory(dynamicAccessoryCategories[0]);
      } else {
        setActiveCategory(null);
        setMegaActiveCategory(null);
        setHoveredItem(null);
      }
    },
    [cancelClose, dynamicMenuCategories, dynamicAccessoryCategories],
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
            <LocaleSelector
              ariaLabel="Shopping country"
              value={country_code || "ZA"}
              options={countryOptions}
              onChange={changeCountry}
              searchPlaceholder="Search countries..."
            />
            <span className="top-rule bg-black/20 mx-2" />
            <LocaleSelector
              ariaLabel="Display currency"
              value={currency || "ZAR"}
              options={currencyOptions}
              onChange={changeCurrency}
              searchPlaceholder="Search currencies..."
              disabled={currencyLoading}
              compact
            />
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
              className="absolute top-[100%] left-0 w-full z-50"
              onMouseEnter={cancelClose}
              onMouseLeave={scheduleClose}
            >
              <div className="w-full bg-[#111] shadow-[0_20px_60px_rgba(0,0,0,0.8)] border-t border-white/10">
                <div className="w-full max-w-[1400px] mx-auto flex min-h-[420px]">
                  {/* Left Sidebar */}
                  <div className="w-[380px] shrink-0 border-r border-white/10 py-8 pl-10 pr-6 flex flex-col bg-[#0a0a0a]">
                    <h3 className="text-[11px] font-bold tracking-[0.2em] text-[#888] uppercase mb-4 pl-4">Shop By Category</h3>
                    <div className="columns-2 gap-2">
                      {dynamicMenuCategories.map((cat) => (
                        <button
                          key={cat.name}
                          onMouseEnter={() => setMegaActiveCategory(cat)}
                          onClick={() => {
                            closeMenus();
                            navigate(`/shop?category=${encodeURIComponent(cat.name)}`);
                          }}
                          className={`w-full break-inside-avoid mb-1.5 text-left text-[14px] px-4 py-2.5 rounded-sm transition-all duration-300 font-serif ${megaActiveCategory?.name === cat.name ? 'bg-[#c9a35b]/10 text-[#c9a35b]' : 'text-[#ccc] hover:text-white hover:bg-white/5'}`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right Content */}
                  <div className="flex-1 flex bg-[#111] relative overflow-hidden">
                    {megaActiveCategory && (
                      <>
                        <div className="flex-1 py-10 px-12 h-full flex flex-col">
                          <div className="mb-10">
                            <h2 className="text-3xl font-serif text-white mb-2">{megaActiveCategory.name}</h2>
                            <p className="text-[#888] text-[15px] max-w-lg">{megaActiveCategory.description}</p>
                          </div>
                        
                        <div className="flex gap-12 flex-wrap">
                          {megaActiveCategory?.groups?.map((group) => (
                            <div key={group.title} className="flex-1 min-w-[240px] max-w-[340px]">
                              <h4 className="text-white text-[13px] font-bold tracking-[0.05em] mb-5 pb-4 border-b border-white/10">
                                {group.title}
                              </h4>
                              <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                <ul className="columns-2 gap-6">
                                  {group.items.map((item) => (
                                    <li key={item} className="break-inside-avoid mb-3.5">
                                      <Link
                                        to={`/shop?category=${encodeURIComponent(megaActiveCategory.name)}&search=${encodeURIComponent(item)}`}
                                        onClick={closeMenus}
                                        onMouseEnter={() => setHoveredItem(item)}
                                        className="text-[13px] text-[#999] hover:text-[#c9a35b] transition-colors block"
                                      >
                                        {item}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          ))}
                          
                          {/* Products List (Identical UI to groups) */}
                          {(() => {
                            if (!hoveredItem) return null;
                            const matchedProducts = products.filter(p => p.brand === hoveredItem || p.subcategory === hoveredItem);
                            if (matchedProducts.length === 0) return null;
                            
                            const visibleProducts = matchedProducts.slice(0, 8);
                            const hasMore = matchedProducts.length > 8;
                            
                            return (
                              <div className="flex-1 min-w-[240px] max-w-[340px] animate-in fade-in slide-in-from-left-4 duration-200 flex flex-col">
                                <h4 className="text-[#c9a35b] text-[13px] font-bold tracking-[0.05em] mb-5 pb-4 border-b border-white/10 uppercase">
                                  Products
                                </h4>
                                <div>
                                  <ul className="columns-2 gap-6">
                                    {visibleProducts.map(p => (
                                      <li key={p.id || p._id} className="break-inside-avoid mb-5">
                                        <Link
                                          to={`/product/${p.slug || p.id || p._id}`}
                                          onClick={closeMenus}
                                          className="text-[13px] text-[#999] hover:text-[#c9a35b] transition-colors block line-clamp-1"
                                          title={p.name}
                                        >
                                          {p.name}
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                {hasMore && (
                                  <div className="mt-2 pt-4 border-t border-white/5">
                                    <Link
                                      to={`/shop?category=${encodeURIComponent(megaActiveCategory.name)}&search=${encodeURIComponent(hoveredItem)}`}
                                      onClick={closeMenus}
                                      className="inline-flex items-center gap-1.5 text-[#c9a35b] text-[11px] font-bold tracking-[0.1em] uppercase hover:text-white transition-colors"
                                    >
                                      View more <ArrowRight size={12} />
                                    </Link>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                        
                        {/* View All Button */}
                        <div className="mt-auto pt-8">
                          <Link 
                            to={`/shop?category=${encodeURIComponent(megaActiveCategory.name)}`}
                            onClick={closeMenus}
                            className="inline-flex items-center gap-2 text-[#c9a35b] text-[12px] font-bold tracking-[0.15em] uppercase hover:text-white transition-colors"
                          >
                            Shop All {megaActiveCategory.name} <ArrowRight size={14} />
                          </Link>
                        </div>
                      </div>
                      </>
                    )}
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
              <div className="w-full bg-[#0a0a0a] shadow-[0_20px_60px_rgba(0,0,0,0.8)] border-b border-white/10">
                <div className="w-full max-w-[1400px] mx-auto flex min-h-[420px]">
                  {/* Left Sidebar */}
                  <div className="w-[380px] shrink-0 border-r border-white/10 py-8 pl-10 pr-6 flex flex-col bg-[#0a0a0a]">
                    <div className="mb-6 flex items-center justify-between">
                      <h3 className="text-[#c9a35b] text-[11px] font-bold tracking-[0.2em] uppercase">Accessories</h3>
                    </div>
                    
                    <ul className="space-y-1">
                      {dynamicAccessoryCategories.map((cat) => (
                        <li key={cat.name}>
                          <button
                            type="button"
                            onMouseEnter={() => {
                              setMegaActiveCategory(cat);
                              setHoveredItem(null);
                            }}
                            className={`w-full text-left px-4 py-3 rounded text-[15px] transition-all duration-200 flex items-center justify-between group
                              ${megaActiveCategory?.name === cat.name 
                                ? 'bg-white/10 text-white font-medium pl-6' 
                                : 'text-[#888] hover:text-white hover:bg-white/5'}`}
                          >
                            <span>{cat.name}</span>
                            <ChevronRight size={16} className={`transition-transform duration-200 ${megaActiveCategory?.name === cat.name ? 'text-[#c9a35b] translate-x-1' : 'opacity-0 -translate-x-2 group-hover:opacity-50 group-hover:translate-x-0'}`} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Right Content */}
                  <div className="flex-1 flex bg-[#111] relative overflow-hidden">
                    {megaActiveCategory && (
                      <>
                        <div className="flex-1 py-10 px-12 h-full flex flex-col">
                          <div className="mb-10">
                            <h2 className="text-3xl font-serif text-white mb-2">{megaActiveCategory.name}</h2>
                            <p className="text-[#888] text-[15px] max-w-lg">{megaActiveCategory.description}</p>
                          </div>
                        
                        <div className="flex gap-12 flex-wrap">
                          {megaActiveCategory?.groups?.map((group) => (
                            <div key={group.title} className="flex-1 min-w-[240px] max-w-[340px]">
                              <h4 className="text-white text-[13px] font-bold tracking-[0.05em] mb-5 pb-4 border-b border-white/10">
                                {group.title}
                              </h4>
                              <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                <ul className="columns-2 gap-6">
                                  {group.items.map((item) => (
                                    <li key={item} className="break-inside-avoid mb-3.5">
                                      <Link
                                        to={`/accessories?category=${encodeURIComponent(megaActiveCategory.name)}&subcategory=${encodeURIComponent(item)}`}
                                        onClick={closeMenus}
                                        onMouseEnter={() => setHoveredItem(item)}
                                        className="text-[13px] text-[#999] hover:text-[#c9a35b] transition-colors block"
                                      >
                                        {item}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          ))}
                          
                          {/* Products List (Identical UI to groups) */}
                          {(() => {
                            if (!hoveredItem) return null;
                            const matchedProducts = products.filter(p => p.brand === hoveredItem || p.subcategory === hoveredItem);
                            if (matchedProducts.length === 0) return null;
                            
                            const visibleProducts = matchedProducts.slice(0, 8);
                            const hasMore = matchedProducts.length > 8;
                            
                            return (
                              <div className="flex-1 min-w-[240px] max-w-[340px] animate-in fade-in slide-in-from-left-4 duration-200 flex flex-col">
                                <h4 className="text-[#c9a35b] text-[13px] font-bold tracking-[0.05em] mb-5 pb-4 border-b border-white/10 uppercase">
                                  Products
                                </h4>
                                <div>
                                  <ul className="columns-2 gap-6">
                                    {visibleProducts.map(p => (
                                      <li key={p.id || p._id} className="break-inside-avoid mb-5">
                                        <Link
                                          to={`/product/${p.slug || p.id || p._id}`}
                                          onClick={closeMenus}
                                          className="text-[13px] text-[#999] hover:text-[#c9a35b] transition-colors block line-clamp-1"
                                          title={p.name}
                                        >
                                          {p.name}
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                {hasMore && (
                                  <div className="mt-2 pt-4 border-t border-white/5">
                                    <Link
                                      to={`/accessories?category=${encodeURIComponent(megaActiveCategory.name)}&subcategory=${encodeURIComponent(hoveredItem)}`}
                                      onClick={closeMenus}
                                      className="inline-flex items-center gap-1.5 text-[#c9a35b] text-[11px] font-bold tracking-[0.1em] uppercase hover:text-white transition-colors"
                                    >
                                      View more <ArrowRight size={12} />
                                    </Link>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                        
                        {/* View All Button */}
                        <div className="mt-auto pt-8">
                          <Link 
                            to={`/accessories?category=${encodeURIComponent(megaActiveCategory.name)}`}
                            onClick={closeMenus}
                            className="inline-flex items-center gap-2 text-[#c9a35b] text-[12px] font-bold tracking-[0.15em] uppercase hover:text-white transition-colors"
                          >
                            Shop All {megaActiveCategory.name} <ArrowRight size={14} />
                          </Link>
                        </div>
                      </div>
                      </>
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
        <div className="drawer-panel flex flex-col h-full bg-[#111]">
          <div className="drawer-head flex items-center justify-between shrink-0 bg-[#0a0a0a] z-10 relative shadow-md">
            {currentNav.view !== 'root' ? (
              <button onClick={popNav} className="flex items-center text-white py-2 pr-4 font-medium hover:text-[#c9a35b] transition-colors -ml-1">
                <ChevronLeft size={22} className="mr-1" />
                Back
              </button>
            ) : (
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
            )}
            <IconButton label="Close menu" onClick={closeMenus}>
              <X size={23} />
            </IconButton>
          </div>
          
          <div className="flex-1 relative overflow-hidden flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentNav.view + (currentNav.data?.name || '') + (currentNav.data?.item || '')}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute inset-0 overflow-y-auto flex flex-col custom-scrollbar pb-10"
              >
                {currentNav.view === 'root' && (
                  <>
                    <div
                      className="mobile-search-container relative mt-4"
                      ref={mobileSearchRef}
                    >
                      <form
                        className="mobile-search mx-5"
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
                            className="absolute top-full left-5 right-5 mt-2 bg-[#1a1a1a] border border-[#333] shadow-xl z-[100] rounded-sm overflow-hidden"
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
                    <div className="drawer-links mt-2">
                      <Link to="/" onClick={closeMenus}>
                        Home
                      </Link>
                      <a role="button" className="flex items-center justify-between w-full text-left cursor-pointer" onClick={() => pushNav('shop')}>
                        <span>Shop</span><ChevronRight size={16} className="text-[#666]"/>
                      </a>
                      <Link to="/offers" onClick={closeMenus}>
                        Offers
                      </Link>
                      <Link to="/auction" onClick={closeMenus}>
                        Auction
                      </Link>
                      <a role="button" className="flex items-center justify-between w-full text-left text-[#f0cf76] cursor-pointer" onClick={() => pushNav('accessories')}>
                        <span>Accessories</span><ChevronRight size={16} className="text-[#666]"/>
                      </a>
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
                  </>
                )}

                {currentNav.view === 'shop' && (
                  <div className="drawer-links pt-2">
                    <div className="px-5 mb-4 border-b border-white/10 pb-4">
                      <h2 className="text-2xl font-serif text-white">Shop the cellar</h2>
                    </div>
                    <Link to="/shop" onClick={closeMenus} className="text-[#c9a35b] font-bold text-sm tracking-widest uppercase pb-2 block">
                      View All Shop Items <ArrowRight size={14} className="inline ml-1" />
                    </Link>
                    {dynamicMenuCategories.map(cat => (
                      <a role="button" key={cat.name} className="flex items-center justify-between w-full text-left cursor-pointer" onClick={() => pushNav('category', cat)}>
                        <span>{cat.name}</span><ChevronRight size={16} className="text-[#666]"/>
                      </a>
                    ))}
                  </div>
                )}

                {currentNav.view === 'accessories' && (
                  <div className="drawer-links pt-2">
                    <div className="px-5 mb-4 border-b border-white/10 pb-4">
                      <h2 className="text-2xl font-serif text-[#f0cf76]">Accessories</h2>
                    </div>
                    <Link to="/accessories" onClick={closeMenus} className="text-[#c9a35b] font-bold text-sm tracking-widest uppercase pb-2 block">
                      View All Accessories <ArrowRight size={14} className="inline ml-1" />
                    </Link>
                    {dynamicAccessoryCategories.map(cat => (
                      <a role="button" key={cat.name} className="flex items-center justify-between w-full text-left cursor-pointer" onClick={() => pushNav('category', cat)}>
                        <span>{cat.name}</span><ChevronRight size={16} className="text-[#666]"/>
                      </a>
                    ))}
                  </div>
                )}

                {currentNav.view === 'category' && (
                  <div className="drawer-links pt-2">
                    <div className="px-5 mb-4 border-b border-white/10 pb-4">
                      <h2 className="text-2xl font-serif text-white">{currentNav.data.name}</h2>
                    </div>
                    <Link to={`/${currentNav.data.isAccessory ? 'accessories' : 'shop'}?category=${encodeURIComponent(currentNav.data.name)}`} onClick={closeMenus} className="text-[#c9a35b] font-bold text-sm tracking-widest uppercase pb-2 block">
                      Shop All {currentNav.data.name} <ArrowRight size={14} className="inline ml-1" />
                    </Link>
                    {currentNav.data.groups.map(group => (
                      <div key={group.title} className="mb-4">
                        <h3 className="px-5 text-[#888] text-xs font-bold tracking-widest uppercase mb-1 mt-4">{group.title}</h3>
                        {group.items.map(item => (
                          <a role="button" key={item} className="flex items-center justify-between w-full text-left !py-3.5 !text-[15px] border-b border-white/5 cursor-pointer" onClick={() => pushNav('products', { category: currentNav.data, item })}>
                            <span className="text-[#ddd]">{item}</span><ChevronRight size={14} className="text-[#555]"/>
                          </a>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                {currentNav.view === 'products' && (() => {
                  const { category, item } = currentNav.data;
                  const matchedProducts = products.filter(p => p.brand === item || p.subcategory === item).slice(0, 8);
                  const isAccessory = category.isAccessory;
                  return (
                    <div className="drawer-links pt-2 pb-6">
                      <div className="px-5 mb-4 border-b border-white/10 pb-4">
                        <p className="text-[#888] text-[10px] font-bold uppercase tracking-[0.2em] mb-1.5">{category.name}</p>
                        <h2 className="text-xl font-serif text-white">{item}</h2>
                      </div>
                      <Link to={`/${isAccessory ? 'accessories' : 'shop'}?category=${encodeURIComponent(category.name)}&${isAccessory ? 'subcategory' : 'search'}=${encodeURIComponent(item)}`} onClick={closeMenus} className="text-[#c9a35b] font-bold text-sm tracking-widest uppercase pb-2 block mb-4">
                        Shop all {item} <ArrowRight size={14} className="inline ml-1" />
                      </Link>
                      
                      <div className="px-5 flex flex-col gap-5 mt-2">
                        {matchedProducts.map(p => (
                          <Link key={p.id || p._id} to={`/product/${p.slug || p.id || p._id}`} onClick={closeMenus} className="flex items-center gap-4 !p-0 !border-0 group !bg-transparent hover:!bg-transparent">
                             <div className="w-[60px] h-[75px] bg-[#1a1a1a] rounded overflow-hidden shrink-0 border border-white/10 group-hover:border-white/30 transition-colors flex items-center justify-center">
                               {p.image ? <img src={p.image} alt={p.name} className="max-w-full max-h-full object-contain p-1" /> : <div className="w-full h-full bg-[#222]"></div>}
                             </div>
                             <div className="flex-1 min-w-0">
                               <p className="text-[#888] text-[10px] uppercase tracking-wider mb-1 truncate">{p.brand}</p>
                               <h4 className="text-[#eee] text-[13px] line-clamp-2 leading-snug group-hover:text-[#c9a35b] transition-colors font-medium">{p.name}</h4>
                               <p className="text-white font-bold text-[13px] mt-1.5"><Price amount={p.price}/></p>
                             </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )
                })()}
              </motion.div>
            </AnimatePresence>
          </div>

          <div
            className="drawer-foot bg-[#0a0a0a] border-t border-white/10 shrink-0 z-10"
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

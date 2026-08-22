import Price from "./ui/Price";
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
  const { products } = useProducts();
  const { country_name, currency } = useGeoLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const [megaTrigger, setMegaTrigger] = useState("shop");
  const headerRef = useRef(null);

  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

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

      <header
        className="site-header relative"
        ref={headerRef}
        onMouseLeave={() => setMegaOpen(false)}
      >
        <div className="shell header-main flex items-center justify-between min-h-[50px] sm:min-h-[64px] md:min-h-[80px] px-2 sm:px-6 md:px-10">
          {/* Left: Mobile Menu + Leftified Brand Logo */}
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

          {/* Center: Search Field (Desktop only) */}
          <form
            className="search-field hidden md:grid flex-1 max-w-[560px] mx-6"
            onSubmit={(event) => event.preventDefault()}
          >
            <Search size={18} aria-hidden="true" />
            <input
              aria-label="Search the collection"
              placeholder="Search rare bottles, estates, vintages…"
            />
            <button type="submit">Search</button>
          </form>

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

            {/* Compare Button - Hidden as per user request */}
            <div className="hidden">
              <IconButton
                label="Compare products"
                count={compareCount}
                onClick={onCompareClick}
              >
                <GitCompareArrows size={21} />
              </IconButton>
            </div>

            {/* Wishlist / Likes - Visible on Mobile & Desktop */}
            <IconButton
              className={wishlistCount ? "wishlist-header-active" : ""}
              label={`Wishlist, ${wishlistCount} saved ${wishlistCount === 1 ? "bottle" : "bottles"}`}
              count={wishlistCount}
              onClick={onWishlistClick}
            >
              <Heart size={21} fill={wishlistCount ? "currentColor" : "none"} />
            </IconButton>

            {/* Cart - Visible on Mobile & Desktop */}
            <IconButton
              label="Shopping bag"
              count={cartCount}
              onClick={onBagClick}
            >
              <ShoppingBag size={21} />
            </IconButton>
          </div>
        </div>

        <nav className="desktop-nav" aria-label="Main navigation">
          <div className="shell nav-inner">
            <Link
              className="active"
              to="/"
              onMouseEnter={() => setMegaOpen(false)}
            >
              Home
            </Link>
            <div
              className="nav-shop-control"
              onMouseEnter={() => {
                setActiveCategory(0);
                setMegaTrigger("shop");
                setMegaOpen(true);
              }}
            >
              <Link
                className="nav-shop-link font-bold text-[#f0cf76] hover:text-white transition-colors"
                to="/shop"
              >
                SHOP
              </Link>
            </div>

            <a
              href="/#private-collection"
              onMouseEnter={() => setMegaOpen(false)}
            >
              Offers
            </a>
            <Link to="/auction" onMouseEnter={() => setMegaOpen(false)}>
              Auction
            </Link>
            <div
              className="nav-accessories-control"
              onMouseEnter={() => {
                setActiveCategory(0);
                setMegaTrigger("accessories");
                setMegaOpen(true);
              }}
            >
              <Link
                to="/accessories"
                className="nav-dropdown-button hover:text-[#f0cf76] transition-colors"
              >
                Accessories
              </Link>
            </div>
            <Link
              to="/events"
              className="font-bold text-[#f0cf76] hover:text-white transition-colors"
              onMouseEnter={() => setMegaOpen(false)}
            >
              Events
            </Link>
            <Link to="/vendor-portal" onMouseEnter={() => setMegaOpen(false)}>
              Sell on The Grand Store
            </Link>
            <Link to="/events" onMouseEnter={() => setMegaOpen(false)}>
              Book a tasting
            </Link>
            <Link
              to="/global-wines"
              className="font-bold text-[#f0cf76] hover:text-white transition-colors"
              onMouseEnter={() => setMegaOpen(false)}
            >
              🌍 GLOBAL WINES
            </Link>
          </div>
        </nav>

        <AnimatePresence>
          {megaOpen && megaTrigger === "shop" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-[100%] left-0 w-full pt-0 z-50 border-t border-white/5"
            >
              <div className="w-full bg-[#0a0a0a] shadow-[0_20px_40px_rgba(0,0,0,0.9)] relative flex justify-center">
                <div className="w-full max-w-[1500px] mx-auto flex h-[450px]">
                  {/* Categories Column */}
                  <div className="w-1/4 bg-[#111] border-r border-white/5 py-6 flex flex-col">
                    <div className="px-8 pb-4 text-xs font-bold tracking-widest text-[#888] uppercase">
                      Explore
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                      {storeCategories.map((category, index) => (
                        <div
                          key={category}
                          className="relative group/category"
                          onMouseEnter={() => setActiveCategory(index)}
                        >
                          <div
                            className={`px-8 py-3 flex items-center justify-between text-sm cursor-pointer transition-colors ${activeCategory === index ? "text-[#e6c97a] bg-white/5" : "text-[#ccc] hover:text-white hover:bg-white/5"}`}
                          >
                            {category}
                            <ChevronRight
                              size={14}
                              className={
                                activeCategory === index
                                  ? "opacity-100"
                                  : "opacity-0 group-hover/category:opacity-50 transition-opacity"
                              }
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Products Grid */}
                  <div className="flex-1 bg-[#0a0a0a] py-6 px-8 flex flex-col">
                    <div className="pb-4 text-xs font-bold tracking-widest text-[#888] uppercase">
                      {activeCategory >= 0 && storeCategories[activeCategory]
                        ? storeCategories[activeCategory]
                        : "Featured"}
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3 pr-4">
                        {products
                          .filter((p) =>
                            activeCategory >= 0
                              ? (p.category || p.type || "")
                                  .toLowerCase()
                                  .includes(
                                    storeCategories[
                                      activeCategory
                                    ].toLowerCase(),
                                  )
                              : true,
                          )
                          .slice(0, 30)
                          .map((product) => (
                            <Link
                              key={product.id}
                              to={`/product/${product.slug || product.id}`}
                              onClick={closeMenus}
                              className="text-sm text-[#ccc] hover:text-[#e6c97a] transition-colors truncate block py-1"
                            >
                              {product.name}
                              {product.vintage && (
                                <span className="ml-2 text-xs text-[#888]">
                                  {product.vintage}
                                </span>
                              )}
                            </Link>
                          ))}
                      </div>
                      {activeCategory >= 0 &&
                        products.filter((p) =>
                          (p.category || p.type || "")
                            .toLowerCase()
                            .includes(
                              storeCategories[activeCategory].toLowerCase(),
                            ),
                        ).length === 0 && (
                          <div className="h-full flex items-center justify-center text-[#888] text-sm italic">
                            New allocations arriving soon.
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {megaOpen && megaTrigger === "accessories" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-[100%] left-0 w-full pt-0 z-50 border-t border-white/5"
            >
              <div className="w-full bg-[#0a0a0a] shadow-[0_20px_40px_rgba(0,0,0,0.9)] relative flex justify-center">
                <div className="w-full max-w-[1500px] mx-auto flex h-[450px]">
                  {/* Categories Column */}
                  <div className="w-1/4 bg-[#111] border-r border-white/5 py-6 flex flex-col">
                    <div className="px-8 pb-4 text-xs font-bold tracking-widest text-[#888] uppercase">
                      Categories
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                      {Object.keys(accessoryCategories).map(
                        (category, index) => (
                          <div
                            key={category}
                            className="relative group/category"
                            onMouseEnter={() => setActiveCategory(index)}
                          >
                            <div
                              className={`px-8 py-3 flex items-center justify-between text-sm cursor-pointer transition-colors ${activeCategory === index ? "text-[#e6c97a] bg-white/5" : "text-[#ccc] hover:text-white hover:bg-white/5"}`}
                            >
                              {category}
                              <ChevronRight
                                size={14}
                                className={
                                  activeCategory === index
                                    ? "opacity-100"
                                    : "opacity-0 group-hover/category:opacity-50 transition-opacity"
                                }
                              />
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  {/* Products Grid */}
                  <div className="flex-1 bg-[#0a0a0a] py-6 px-8 flex flex-col">
                    <div className="pb-4 text-xs font-bold tracking-widest text-[#888] uppercase">
                      {activeCategory >= 0 &&
                      Object.keys(accessoryCategories)[activeCategory]
                        ? Object.keys(accessoryCategories)[activeCategory]
                        : "Featured"}
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                      <div className="grid grid-cols-3 xl:grid-cols-4 gap-6 pr-4">
                        {activeCategory >= 0 &&
                          accessoryCategories[
                            Object.keys(accessoryCategories)[activeCategory]
                          ]?.map((subcat) => (
                            <div
                              key={subcat}
                              className="flex flex-col gap-2 p-4 rounded-md bg-[#111] border border-white/5 hover:border-[#c9a35b]/30 transition-colors"
                            >
                              <div className="text-sm font-medium text-[#e6c97a] mb-2">
                                {subcat}
                              </div>
                              {/* Dummy product representation for subcategory */}
                              <Link
                                to={`/accessories?category=${encodeURIComponent(Object.keys(accessoryCategories)[activeCategory])}&subcategory=${encodeURIComponent(subcat)}`}
                                onClick={closeMenus}
                                className="text-xs text-[#888] hover:text-white transition-colors"
                              >
                                View collection &rarr;
                              </Link>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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

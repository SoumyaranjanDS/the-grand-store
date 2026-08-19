import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Agentation } from 'agentation'
import VendorPortalPage from './vendor-portal/VendorPortalPage'
import TradePage from './TradePage'
import TradeLayout from './trade/TradeLayout'
import TradeAbout from './trade/TradeAbout'
import TradeExport from './trade/TradeExport'
import TradeProcedures from './trade/TradeProcedures'
import TradeContact from './trade/TradeContact'
import TradePartnerEnquiry from './trade/TradePartnerEnquiry'
import WineFarmPage from './features/wine-farm/WineFarmPage'
import Hero from './features/home/components/Hero'
import Arrivals from './features/home/components/Arrivals'
import BrandSection from './features/home/components/BrandSection'
import TastingCampaign from './features/home/components/TastingCampaign'
import TequilaShowcase from './features/home/components/TequilaShowcase'
import BrandyShowcase from './features/home/components/BrandyShowcase'
import PrivateCollection from './features/home/components/PrivateCollection'
import PartnerDestinations from './features/home/components/PartnerDestinations'
import WhyChooseUs from './features/home/components/WhyChooseUs'
import Testimonials from './features/home/components/Testimonials'
import LatestBlogs from './features/home/components/LatestBlogs'
import Footer from './components/Footer'
import SocialRail from './components/SocialRail'
import SiteMotion from './components/SiteMotion'
import ProductCard from './components/ProductCard'
import ProductQuickView from './components/ProductQuickView'
import IconButton from './components/IconButton'
import Header from './components/Header'
import ComparePage from './features/compare/ComparePage'
import CartPage from './features/cart/CartPage'
import ProductPage from './features/product/ProductPage'
import ShopPage from './features/shop/ShopPage'
import AuctionPage from './features/auction/AuctionPage'
import AuctionLotDetail from './features/auction/AuctionLotDetail'
import AdminAuctionPanel from './features/auction/AdminAuctionPanel'
import TastingPage from './features/tasting/TastingPage'
import PremiumLiquorsBlogPage from './features/blog/PremiumLiquorsBlogPage'
import BrandyBlogPage from './features/blog/BrandyBlogPage'
import LoginPage from './features/auth/LoginPage'
import RegisterPage from './features/auth/RegisterPage'
import ProfilePage from './features/customer/ProfilePage'
import CustomerOrdersPage from './features/customer/CustomerOrdersPage'
import UserAuctionDashboard from './features/customer/UserAuctionDashboard'
import OnboardingWizard from './features/vendor/OnboardingWizard'
import AuctionSubmission from './features/vendor/AuctionSubmission'
import VendorDashboard from './features/vendor/VendorDashboard'
import VendorProfile from './features/vendor/VendorProfile'
import AddProduct from './features/vendor/AddProduct'
import EventAdd from './features/vendor/EventAdd'
import VendorEvents from './features/vendor/VendorEvents'
import EventsHub from './features/events/EventsHub'
import EventDetails from './features/events/EventDetails'
import VendorProducts from './features/vendor/VendorProducts'
import EditProduct from './features/vendor/EditProduct'
import VendorLayout from './features/vendor/VendorLayout'
import VendorInventory from './features/vendor/VendorInventory'
import VendorWallet from './features/vendor/VendorWallet'
import VendorOrders from './features/vendor/VendorOrders'
import VendorMarketing from './features/vendor/VendorMarketing'
import VendorAcademy from './features/vendor/VendorAcademy'
import CheckoutPage from './features/checkout/CheckoutPage'
import OrderSuccessPage from './features/checkout/OrderSuccessPage'
import GlobalWinesPage from './features/global/GlobalWinesPage'
import CountryPavilionPage from './features/global/CountryPavilionPage'
import GlobalOnboardingLanding from './features/vendor/GlobalOnboardingLanding'

import { Link, Navigate, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  CircleUserRound,
  Camera,
  Gift,
  GitCompareArrows,
  Grid3X3,
  Heart,
  Mail,
  Menu,
  MessageCircle,
  Minus,
  PackageCheck,
  Plus,
  RotateCcw,
  Search,
  Share2,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  CalendarDays,
  MapPin,
  Wine,
  Truck,
  Trash2,
  UsersRound,
  X,
  ZoomIn,
} from 'lucide-react'
import { brandyBrands, brands, menuCategories, tequilaBrands } from './data'
import { useProducts } from './context/ProductContext'
import WishlistPage from './WishlistPage'
import { useWishlist } from './wishlistContext'

gsap.registerPlugin(ScrollTrigger)










function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const { wishlistCount, toggleWishlist } = useWishlist()
  const { products, loading } = useProducts()
  
  const [cartItems, setCartItems] = useState([])
  const [compareItems, setCompareItems] = useState([])
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (products.length > 0 && !isInitialized) {
      try {
        const storedItems = JSON.parse(window.localStorage.getItem('grand-store-cart') || '[]')
        setCartItems(storedItems.map((storedItem) => {
          const product = products.find((item) => item.id === storedItem.id || item._id === storedItem.id)
          if (!product) return null
          return {
            ...product,
            quantity: Math.max(1, Number(storedItem.quantity) || 1),
            option: storedItem.option || product.options?.[0] || 'Pack of 1',
          }
        }).filter(Boolean))
        
        const storedIds = JSON.parse(window.localStorage.getItem('grand-store-compare') || '[]')
        setCompareItems(storedIds.map((id) => products.find((product) => product.id === id || product._id === id)).filter(Boolean).slice(0, 4))
      } catch (e) {
        console.error("Error loading cart/compare from storage", e)
      }
      setIsInitialized(true)
    }
  }, [products, isInitialized])
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0)

  useEffect(() => () => window.clearTimeout(toastTimer.current), [])
  useEffect(() => {
    if (!isInitialized) return;
    window.localStorage.setItem('grand-store-cart', JSON.stringify(cartItems.map((item) => ({
      id: item.id || item._id,
      quantity: item.quantity,
      option: item.option,
    }))))
  }, [cartItems, isInitialized])
  useEffect(() => {
    if (!isInitialized) return;
    window.localStorage.setItem('grand-store-compare', JSON.stringify(compareItems.map((product) => product.id || product._id)))
  }, [compareItems, isInitialized])

  const showToast = (message) => {
    setToast(message)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 2600)
  }

  const addToCart = (product, quantity = 1, option = product.options?.[0] || 'Pack of 1') => {
    setCartItems((items) => {
      const existingItem = items.find((item) => item.id === product.id && item.option === option)
      if (existingItem) {
        return items.map((item) => (
          item.id === product.id && item.option === option
            ? { ...item, quantity: item.quantity + quantity }
            : item
        ))
      }
      return [...items, { ...product, quantity, option }]
    })
    showToast(`${quantity > 1 ? `${quantity} × ` : ''}${product.name} added to your bag`)
    navigate('/customer/cart')
  }

  const updateCartQuantity = (productId, option, quantity) => {
    if (quantity < 1) {
      setCartItems((items) => items.filter((item) => !(item.id === productId && item.option === option)))
      return
    }
    setCartItems((items) => items.map((item) => (
      item.id === productId && item.option === option ? { ...item, quantity } : item
    )))
  }

  const removeFromCart = (product) => {
    setCartItems((items) => items.filter((item) => !(item.id === product.id && item.option === product.option)))
    showToast(`${product.name} removed from your bag`)
  }

  const clearCart = () => {
    setCartItems([])
    showToast('Your cart has been cleared')
  }

  const handleWishlist = (product) => {
    const added = toggleWishlist(product)
    showToast(`${product.name} ${added ? 'saved to' : 'removed from'} your wishlist`)
  }

  const addToCompare = (product) => {
    if (compareItems.some((item) => item.id === product.id)) {
      showToast(`${product.name} is already in your comparison`)
      navigate('/customer/compare')
      return
    }
    if (compareItems.length >= 4) {
      showToast('Your comparison is full. Remove a bottle before adding another.')
      navigate('/customer/compare')
      return
    }
    setCompareItems((items) => [...items, product])
    showToast(`${product.name} added to your comparison`)
    navigate('/customer/compare')
  }

  const removeFromCompare = (product) => {
    setCompareItems((items) => items.filter((item) => item.id !== product.id))
    showToast(`${product.name} removed from your comparison`)
  }

  const isTradeRoute = location.pathname.startsWith('/trade')
  const isDashboardRoute = location.pathname.startsWith('/customer') || location.pathname.startsWith('/vendor') || location.pathname.startsWith('/admin')
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register'

  if (loading) {
    return <div className="min-h-screen bg-[#0a0907] flex items-center justify-center text-[#e1bd70]">Loading...</div>
  }

  return (
    <div className="app">
      <SiteMotion />
      {!isTradeRoute && !isDashboardRoute && !isAuthRoute && (
        <Header
          cartCount={cartCount}
          compareCount={compareItems.length}
          wishlistCount={wishlistCount}
          onBagClick={() => navigate('/customer/cart')}
          onCompareClick={() => navigate('/customer/compare')}
          onWishlistClick={() => navigate('/customer/wishlist')}
        />
      )}
      <Routes>
        <Route path="/winefarm/*" element={<WineFarmPage />} />
        <Route path="/vendor-portal" element={<VendorPortalPage />} />
        
        <Route path="/trade" element={<TradeLayout />}>
          <Route index element={<TradePage />} />
          <Route path="about-us" element={<TradeAbout />} />
          <Route path="trade-export" element={<TradeExport />} />
          <Route path="trade-procedures" element={<TradeProcedures />} />
          <Route path="contact-us" element={<TradeContact />} />
          <Route path="partner-enquiry" element={<TradePartnerEnquiry />} />
        </Route>

        <Route path="/" element={(
          <main className="home-page">
            <Hero />
            <Arrivals onAdd={addToCart} onWish={handleWishlist} onCompare={addToCompare} compareItems={compareItems} />
            <BrandSection />
            <TastingCampaign />
            <TequilaShowcase onAdd={addToCart} onWish={handleWishlist} onCompare={addToCompare} compareItems={compareItems} />
            <BrandyShowcase onAdd={addToCart} onWish={handleWishlist} onCompare={addToCompare} compareItems={compareItems} />
            <PrivateCollection />
            <PartnerDestinations />
            <WhyChooseUs />
            <Testimonials />
            <LatestBlogs />
          </main>
        )} />
        <Route path="/shop" element={<ShopPage onAdd={addToCart} onWish={handleWishlist} onCompare={addToCompare} compareItems={compareItems} />} />
        <Route path="/customer/cart" element={(
          <CartPage
            cartItems={cartItems}
            onUpdateQuantity={updateCartQuantity}
            onRemove={removeFromCart}
            onClear={clearCart}
            onNotify={showToast}
          />
        )} />
        <Route path="/cart" element={<Navigate to="/customer/cart" replace />} />
        <Route path="/customer/checkout" element={<CheckoutPage cartItems={cartItems} onClearCart={clearCart} onNotify={showToast} />} />
        <Route path="/customer/order/:id" element={<OrderSuccessPage />} />
        <Route path="/customer/compare" element={<ComparePage compareItems={compareItems} onCompare={addToCompare} onRemove={removeFromCompare} onClear={() => { setCompareItems([]); showToast('Comparison cleared') }} onAdd={addToCart} />} />
        <Route path="/compare" element={<Navigate to="/customer/compare" replace />} />
        <Route path="/customer/wishlist" element={<WishlistPage onAdd={addToCart} onCompare={addToCompare} compareItems={compareItems} />} />
        <Route path="/wishlist" element={<Navigate to="/customer/wishlist" replace />} />
        
        {/* Customer Profile & Related */}
        <Route path="/customer/profile" element={<ProfilePage />} />
        <Route path="/customer/orders" element={<CustomerOrdersPage />} />
        <Route path="/customer/auctions" element={<UserAuctionDashboard />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Global Wines */}
        <Route path="/global-wines" element={<GlobalWinesPage />} />
        <Route path="/global-wines/:country" element={<CountryPavilionPage onAdd={addToCart} onWish={handleWishlist} onCompare={addToCompare} compareItems={compareItems} />} />

        {/* Vendor Management */}
        <Route path="/vendor/global-onboarding" element={<GlobalOnboardingLanding />} />
        <Route path="/vendor/onboarding" element={<OnboardingWizard />} />
        
        <Route path="/vendor" element={<VendorLayout />}>
          <Route path="dashboard" element={<VendorDashboard />} />
          <Route path="orders" element={<VendorOrders />} />
          <Route path="inventory" element={<VendorInventory />} />
          <Route path="wallet" element={<VendorWallet />} />
          <Route path="marketing" element={<VendorMarketing />} />
          <Route path="academy" element={<VendorAcademy />} />
          <Route path="products" element={<VendorProducts />} />
          <Route path="profile" element={<VendorProfile />} />
          <Route path="product-add" element={<AddProduct onNotify={showToast} />} />
          <Route path="product-edit/:id" element={<EditProduct onNotify={showToast} />} />
          <Route path="event-add" element={<EventAdd onNotify={showToast} />} />
          <Route path="events" element={<VendorEvents />} />
          <Route path="auction-submit" element={<AuctionSubmission onNotify={showToast} />} />
        </Route>
        
        <Route path="/auction" element={<AuctionPage onNotify={showToast} />} />
        <Route path="/auction/:id" element={<AuctionLotDetail onNotify={showToast} />} />
        <Route path="/admin/auctions" element={<AdminAuctionPanel onNotify={showToast} />} />
        <Route path="/bookatasting" element={<TastingPage onNotify={showToast} />} />
        <Route path="/events" element={<EventsHub />} />
        <Route path="/events/:id" element={<EventDetails onNotify={showToast} />} />
        <Route path="/product/:slug" element={(
          <ProductPage
            onAdd={addToCart}
            onWish={handleWishlist}
            onCompare={addToCompare}
            compareItems={compareItems}
            onNotify={showToast}
          />
        )} />
        <Route path="/blog/top-south-african-brandy-brands-you-can-order-online" element={<BrandyBlogPage />} />
        <Route path="/blog/top-10-must-try-premium-liquors-available-at-the-grand-store" element={<PremiumLiquorsBlogPage />} />
        <Route path="/blog/:slug" element={<Navigate to="/#journal" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <div className={`toast ${toast ? 'show' : ''}`} role="status"><ShoppingBag size={18} />{toast}</div>
      {!isTradeRoute && !isDashboardRoute && (
        <>
          <Footer />
          {location.pathname === '/' && <SocialRail />}
          <a className="whatsapp-float" href="https://wa.me/" aria-label="Chat with The Grand Store"><MessageCircle size={22} /></a>
        </>
      )}
      {import.meta.env.DEV && <Agentation />}
    </div>
  )
}

export default App

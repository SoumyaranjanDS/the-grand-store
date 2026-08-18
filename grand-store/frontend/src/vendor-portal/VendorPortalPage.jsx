import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingBag,
  TrendingUp,
  Smartphone,
  CreditCard,
  Truck,
  Megaphone,
  Star,
  Hammer,
  Globe,
  BarChart3,
  Banknote,
  CheckCircle2,
  ChevronRight,
  Image as ImageIcon,
  Plus,
  Minus,
} from "lucide-react";

export default function VendorPortalPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // State for "Preview My Store"
  const [mockBusinessName, setMockBusinessName] = useState("ABC Wine Estate");
  const [mockProductName, setMockProductName] = useState("Cabernet Sauvignon");
  const [mockPrice, setMockPrice] = useState("295");
  const [mockImagePreview, setMockImagePreview] = useState("");

  // State for Accordion FAQs
  const [openFaq, setOpenFaq] = useState(null);

  const handleMockImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setMockImagePreview(url);
    }
  };

  const portalFeatures = [
    {
      title: "Dashboard",
      desc: "Brings together all the data you need to plan and fulfill your upcoming orders",
      icon: BarChart3,
    },
    { title: "Account", desc: "Manage your payments.", icon: Banknote },
    { title: "Stock", desc: "Different product Categories", icon: ShoppingBag },
    {
      title: "Data",
      desc: "Make sure you stay informed about your customer ordering patterns etc.",
      icon: TrendingUp,
    },
    { title: "Sales", desc: "Manage your sales.", icon: CreditCard },
    {
      title: "Orders",
      desc: "Manage all your Orders from start to finish.",
      icon: CheckCircle2,
    },
    {
      title: "Inventory Management",
      desc: "A robust inventory management system to track stock levels accurately.",
      icon: Hammer,
    },
    {
      title: "Shipping Management",
      desc: "Integrate with shipping carriers to offer a range of shipping options.",
      icon: Truck,
    },
  ];

  const faqs = [
    "How do I sign up as a vendor on your online liquor website?",
    "What are the requirements for becoming a vendor on your platform?",
    "Is there a registration fee or any other charges for joining your platform as a vendor?",
    "How do I list my products on your website?",
    "How does the payment process work for vendors on your platform?",
    "What shipping options are available for vendors on your platform?",
    "How do I track and manage my orders?",
    "What support and resources are available to vendors on your platform?",
    "How are taxes handled for vendors on your platform?",
    "Can I sell my products internationally on your platform?",
    "What are the commission rates for vendors on your platform?",
    "How long does it take for my vendor account to be approved?",
  ];

  const scriptFont = { fontFamily: "'Pinyon Script', cursive" };

  // Reusable Gold Text with Glow
  const goldTextClass =
    "bg-gradient-to-r from-[#b58b38] via-[#e6c97a] to-[#b58b38] bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(230,201,122,0.6)] px-4";

  // Reusable Gold Button Class
  const goldButtonClass =
    "bg-gradient-to-r from-[#b58b38] via-[#e6c97a] to-[#b58b38] shadow-[0_0_20px_rgba(230,201,122,0.5)] text-black font-bold uppercase tracking-widest text-xs px-10 py-5 hover:shadow-[0_0_30px_rgba(230,201,122,0.8)] transition-all";

  return (
    <main className="min-h-screen bg-white text-gray-900 font-sans pb-20">
      {/* 1. DYNAMIC HERO SECTION (Full Bleed Image) */}
      <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
        <img
          src="/assets/vendor/premium-bar.png"
          alt="Premium Bar"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60"></div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 lg:px-12 flex flex-col items-center text-center">
          <div className="max-w-4xl flex flex-col items-center">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-serif text-white mb-4 leading-tight">
              Elevate Your <br />
              <span className={goldTextClass} style={scriptFont}>
                Brand
              </span>
            </h1>
            <p className="text-gray-300 mb-10 text-lg leading-relaxed max-w-2xl">
              Welcome to the world of spirits! Our online liquor store is the
              ultimate destination for spirits enthusiasts looking for a variety
              of high-quality products from around the world.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
              <Link to="/vendor/onboarding" className={goldButtonClass}>
                Become a Vendor
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ALTERNATING BLOCK 1: SUPPLIER COLLABORATION */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-16 border-b border-gray-100">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="order-2 lg:order-1">
            <img
              src="/assets/vendor/supplier-action.png"
              alt="Supplier Collaboration"
              className="w-full h-auto max-h-[600px] object-cover shadow-lg"
            />
          </div>
          <div className="order-1 lg:order-2">
            <h3 className="text-5xl md:text-6xl font-serif text-black mb-6 leading-tight">
              A Global <br />
              <span
                style={scriptFont}
                className={`text-6xl md:text-7xl ${goldTextClass}`}
              >
                Platform
              </span>
            </h3>
            <p className="text-gray-600 leading-relaxed mb-6 text-lg">
              We are thrilled to invite suppliers like you to join our online
              store and reach out to a vast market of customers. Partnering with
              us is an opportunity to showcase your products on a global
              platform and reach a wider audience than ever before.
            </p>
            <p className="text-gray-600 leading-relaxed text-lg">
              Our online store is a hub for customers from all corners of the
              world, and our easy-to-use platform makes it seamless for you to
              manage your products, inventory, and orders with ease.
            </p>
          </div>
        </div>
      </section>

      {/* 3. ALTERNATING BLOCK 2: REACH YOUR CUSTOMERS */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <h3 className="text-5xl md:text-6xl font-serif text-black mb-6 leading-tight">
              Reach Your <br />
              <span
                style={scriptFont}
                className={`text-6xl md:text-7xl ${goldTextClass}`}
              >
                Customers
              </span>
            </h3>
            <p className="text-gray-600 leading-relaxed mb-6 text-lg">
              The Grand Store brings together an array of liquor brands for
              customers to choose from. Give your brand exposure to a host of
              potential customers by listing and selling your products on
              grandstore.co.za.
            </p>
            <p className="text-gray-600 leading-relaxed text-lg">
              We facilitate the marketing and sale of the products, take care of
              all the logistics and shipping (should you require) and retain a
              percentage of the sale price. We are confident that with our
              partnership, we can achieve great success in the world of spirits.
            </p>
          </div>
          <div>
            <img
              src="/assets/vendor/warehouse-scale.png"
              alt="Warehouse Scale"
              className="w-full h-auto max-h-[600px] object-cover shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* 4. OVERSIZED ICON GRID: THE GRAND STORE PORTAL */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-serif mb-4 text-black">
              The Vendor Portal
            </h2>
            <p className="text-gray-500 text-lg">
              Manage your Products, Stock, Pricing and Orders using the
              Grandstore Seller Portal online platform.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {portalFeatures.map((f, i) => (
              <div key={i} className="text-center">
                <div className="w-20 h-20 mx-auto bg-white rounded-full shadow-sm flex items-center justify-center mb-6">
                  <f.icon
                    className="text-[#c9a35b]"
                    strokeWidth={1}
                    size={36}
                  />
                </div>
                <h4 className="text-lg font-bold uppercase tracking-wider text-black mb-3">
                  {f.title}
                </h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. PREVIEW MY STORE */}
      <section className="bg-white py-16 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
          <div className="text-center mb-12">
            <h2 className="text-5xl md:text-6xl font-serif mb-4 text-black leading-tight">
              Preview Your <br />
              <span
                style={scriptFont}
                className={`text-6xl md:text-7xl ${goldTextClass}`}
              >
                Store
              </span>
            </h2>
            <p className="text-gray-500 text-lg">
              Enter your details below to see exactly what your customers will
              see.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Input Form - Light Theme */}
            <div className="space-y-6 max-w-md mx-auto w-full">
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-widest font-semibold mb-2">
                  Business / Estate Name
                </label>
                <input
                  type="text"
                  value={mockBusinessName}
                  onChange={(e) => setMockBusinessName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-black p-4 focus:border-[#c9a35b] outline-none"
                  placeholder="e.g. ABC Wine Estate"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-widest font-semibold mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  value={mockProductName}
                  onChange={(e) => setMockProductName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-black p-4 focus:border-[#c9a35b] outline-none"
                  placeholder="e.g. Cabernet Sauvignon"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-widest font-semibold mb-2">
                  Price (ZAR)
                </label>
                <input
                  type="number"
                  value={mockPrice}
                  onChange={(e) => setMockPrice(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-black p-4 focus:border-[#c9a35b] outline-none"
                  placeholder="e.g. 295"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-widest font-semibold mb-2">
                  Product Image (Optional)
                </label>
                <label className="flex items-center justify-center gap-3 w-full border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-gray-500 hover:text-[#c9a35b] hover:border-[#c9a35b] cursor-pointer text-sm">
                  <ImageIcon size={18} />
                  <span>Upload a mock image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleMockImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Live Preview Card */}
            <div className="flex justify-center">
              <div className="w-full max-w-sm bg-[#0a0907] border border-[#c9a35b]/50 p-6 shadow-2xl relative">
                <div className="absolute top-4 right-4 flex items-center gap-1 text-[9px] text-[#c9a35b] uppercase tracking-widest font-bold bg-[#c9a35b]/10 px-2 py-1 border border-[#c9a35b]/20">
                  <Star size={10} fill="currentColor" /> Verified
                </div>

                <p className="text-[10px] text-[#918a7f] uppercase tracking-widest font-semibold mb-4 mt-2 truncate pr-20">
                  {mockBusinessName || "Your Business Name"}
                </p>

                <div className="aspect-[4/5] bg-white/5 mb-6 flex items-center justify-center overflow-hidden">
                  {mockImagePreview ? (
                    <img
                      src={mockImagePreview}
                      alt="Mock product"
                      className="max-w-full max-h-full object-contain p-4"
                    />
                  ) : (
                    <div className="text-[#918a7f]/50 flex flex-col items-center gap-2">
                      <ImageIcon size={32} strokeWidth={1} />
                    </div>
                  )}
                </div>

                <h3 className="text-2xl font-serif text-[#eee8dd] mb-2 truncate">
                  {mockProductName || "Your Product Name"}
                </h3>

                <p className="text-[#c9a35b] text-xl font-serif mb-6">
                  R{Number(mockPrice || 0).toFixed(2)}
                </p>

                <button className="w-full border border-[#eee8dd] text-black bg-[#eee8dd] py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-[#c9a35b] hover:border-[#c9a35b] hover:text-black">
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. INFO CARDS & PRICING */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-gray-50 p-10 border-t-4 border-black">
            <h3 className="text-2xl font-serif text-black mb-4">
              Eligible Categories
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              The Grand Store features all liquor beverages including wine,
              spirits and beer. We are also able to feature certain liquor
              related products such as promotional items.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              We are dedicated to working closely with our third-party vendors
              and we will endeavour to respond to all queries within 48 hours.
            </p>
          </div>

          <div className="bg-gray-50 p-10 border-t-4 border-[#c9a35b]">
            <h3 className="text-2xl font-serif text-black mb-4">
              Pricing & Payment
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Pricing decisions are made in collaboration with third-party
              vendors and we will advise when adjustments are recommended based
              on promotional deal opportunities.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              Vendors will be paid the settlement fee within 30 days. The
              settlement fee is the price paid by the customer less any shipping
              costs and transaction fees.
            </p>
          </div>

          <div className="bg-gray-50 p-10 border-t-4 border-black">
            <h3 className="text-2xl font-serif text-black mb-4">
              Premium Deliveries
            </h3>
            <div className="mb-4">
              <img
                src="/assets/vendor/premium-delivery.png"
                alt="Premium Delivery"
                className="w-full h-32 object-cover"
              />
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Since The Grand Store is committed to service excellence, we are
              able to handle the delivery process from start to finish.
            </p>
          </div>
        </div>

        {/* Commercial Model Split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border border-gray-200">
          <div className="p-10 md:p-14 bg-white">
            <h3 className="text-3xl font-serif text-black mb-2">
              Membership Charges
            </h3>
            <p className="text-gray-500 mb-8">
              No hidden fees. You remain the seller of your products.
            </p>

            <div className="space-y-6 mb-8 text-lg">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <span className="text-sm uppercase tracking-widest font-semibold text-gray-700">
                  Once-off Registration
                </span>
                <span className="font-serif font-bold text-black">R2,500</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <span className="text-sm uppercase tracking-widest font-semibold text-gray-700">
                  Monthly Platform Fee
                </span>
                <span className="font-serif font-bold text-black">R500</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <span className="text-sm uppercase tracking-widest font-semibold text-gray-700">
                  Commission per sale
                </span>
                <span className="font-serif font-bold text-[#c9a35b]">15%</span>
              </div>
            </div>
            <p className="text-[11px] text-gray-400 uppercase tracking-widest leading-relaxed flex gap-2">
              <CheckCircle2 size={16} className="text-[#c9a35b] shrink-0" />
              Secure payment processing system.
            </p>
          </div>

          <div className="p-10 md:p-14 bg-black text-white">
            <h3 className="text-3xl font-serif text-white mb-2">
              Vendor Launch Pack
            </h3>
            <p className="text-[#918a7f] mb-8">
              Included free when you join to ensure a powerful start.
            </p>

            <ul className="space-y-4">
              {[
                "Account Verification & Setup Assistance",
                "Product listing & SEO guidance",
                "Store banner & photography guide",
                "Social media 'New Vendor' announcement",
                "Official Grand Store Vendor Badge",
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-4 text-gray-300">
                  <CheckCircle2
                    size={24}
                    className="text-[#c9a35b] shrink-0"
                    strokeWidth={1.5}
                  />
                  <span className="text-base">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 7. ACCORDION FAQ */}
      <section className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12 py-16 border-t border-gray-100">
        <div className="text-center mb-12">
          <h2 className="text-5xl md:text-6xl font-serif mb-4 text-black leading-tight">
            Frequently Asked <br />
            <span
              style={scriptFont}
              className={`text-6xl md:text-7xl ${goldTextClass}`}
            >
              Questions
            </span>
          </h2>
          <p className="text-gray-500 text-lg">
            Everything you need to know about partnering with us.
          </p>
        </div>

        <div className="space-y-2">
          {faqs.map((q, idx) => (
            <div key={idx} className="border border-gray-200">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-5 bg-white hover:bg-gray-50 text-left"
              >
                <span className="font-semibold text-black">{q}</span>
                {openFaq === idx ? (
                  <Minus className="text-[#c9a35b]" size={20} />
                ) : (
                  <Plus className="text-gray-400" size={20} />
                )}
              </button>
              {openFaq === idx && (
                <div className="p-5 pt-0 bg-white text-gray-600 border-t border-gray-100">
                  Our team will gladly assist you with this query during the
                  onboarding process. Please contact support for specific
                  details.
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 8. CTA & FOOTER NOTE */}
      <section className="bg-gray-50 py-16 text-center px-4">
        <h2 className="text-5xl md:text-6xl font-serif mb-6 text-black leading-tight">
          Ready to <br />
          <span
            style={scriptFont}
            className={`text-7xl md:text-8xl ${goldTextClass}`}
          >
            Launch?
          </span>
        </h2>
        <p className="text-gray-500 mb-8 text-xl max-w-2xl mx-auto">
          Begin the vendor registration process today and showcase your
          high-quality products to a global audience.
        </p>
        <div className="flex justify-center mb-12">
          <Link
            to="/vendor/onboarding"
            className={`inline-flex items-center justify-center gap-3 ${goldButtonClass}`}
          >
            Vendor Sign-Up <ChevronRight size={20} />
          </Link>
        </div>
        <p className="text-[10px] text-gray-400 uppercase tracking-widest">
          Copyright © The Grand Store. All Rights Reserved
        </p>
      </section>
    </main>
  );
}

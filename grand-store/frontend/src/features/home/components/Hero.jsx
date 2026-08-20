import { useState, useEffect } from "react";
import { ArrowRight, Sparkles } from "lucide-react";

const BOTTLE_CATEGORIES = [
  {
    id: "whisky",
    name: "Speyside Scotch 18 Years",
    category: "Whisky",
    vintage: "18 Year Speyside Reserve",
    image: "/assets/hero/whisky-bottle.png",
    link: "/shop?category=Whisky",
  },
  {
    id: "wine",
    name: "Château Margaux Grand Vin",
    category: "Wine",
    vintage: "Estate Grand Cru Reserve",
    image: "/assets/hero/wine-bottle.png",
    link: "/shop?category=Wine",
  },
  {
    id: "champagne",
    name: "Veuve De Saint-Hilaire Grand Cuvée",
    category: "Champagne",
    vintage: "Prestige Gold Brut",
    image: "/assets/hero/champagne-bottle.png",
    link: "/shop?category=Champagne",
  },
  {
    id: "cognac",
    name: "Cognac Réserve Héritage X.O.",
    category: "Cognac",
    vintage: "25 Year X.O. Héritage",
    image: "/assets/hero/cognac-bottle.png",
    link: "/shop?category=Cognac",
  },
  {
    id: "brandy",
    name: "KWV Potstill Reserve Brandy",
    category: "Brandy",
    vintage: "Grand Reserve Potstill",
    image: "/assets/hero/brandy.png",
    link: "/shop?category=Brandy",
  },
  {
    id: "gin",
    name: "Artisanal Botanical Gin",
    category: "Gin",
    vintage: "Small-Batch Infused Botanicals",
    image: "/assets/hero/gin.png",
    link: "/shop?category=Gin",
  },
  {
    id: "liqueur",
    name: "Velvety Cream & Fruit Liqueur",
    category: "Liqueur",
    vintage: "Artisanal Dessert Reserve",
    image: "/assets/hero/liqueur.png",
    link: "/shop?category=Liqueur",
  },
  {
    id: "rum",
    name: "Aged Caribbean Dark Rum",
    category: "Rum",
    vintage: "Oak Cask Matured",
    image: "/assets/hero/rum.png",
    link: "/shop?category=Rum",
  },
  {
    id: "tequila",
    name: "100% Blue Agave Tequila",
    category: "Tequila",
    vintage: "Highland Reposado & Añejo",
    image: "/assets/hero/tequilla.png",
    link: "/shop?category=Tequila",
  },
  {
    id: "vodka",
    name: "Ultra-Premium Crystal Vodka",
    category: "Vodka",
    vintage: "Quadruple Distilled Pure Spirit",
    image: "/assets/hero/vodka.png",
    link: "/shop?category=Vodka",
  },
  {
    id: "ciders",
    name: "Crisp Heritage Orchard Cider",
    category: "Ciders",
    vintage: "Cold-Pressed Artisanal Craft",
    image: "/assets/hero/ciders.png",
    link: "/shop?category=Ciders",
  },
  {
    id: "spirits",
    name: "Specialty Distilled Spirits",
    category: "Spirits",
    vintage: "Master Distiller Cellar Pick",
    image: "/assets/hero/spirits.png",
    link: "/shop?category=Spirits",
  },
  {
    id: "scotch",
    name: "Highland Peated Single Malt",
    category: "Scotch",
    vintage: "Islay & Highland Cask Strength",
    image: "/assets/hero/scotch.png",
    link: "/shop?category=Scotch",
  },
];

export default function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Rotate product bottle every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % BOTTLE_CATEGORIES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const currentProduct = BOTTLE_CATEGORIES[currentIndex];

  return (
    <section
      className="relative w-full h-[calc(100svh-80px)] min-h-[520px] max-h-[760px] bg-black flex flex-col items-center justify-center overflow-hidden select-none"
      id="top"
    >
      {/* User Selected Luxury Ambient Background Anchored to the Right (Soft Balanced Opacity) */}
      <div
        className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(to left, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.80) 35%, rgba(0,0,0,0.50) 55%, rgba(0,0,0,0.16) 72%, rgba(0,0,0,0.02) 82%, rgba(0,0,0,1) 92%)",
          WebkitMaskImage:
            "linear-gradient(to left, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.80) 35%, rgba(0,0,0,0.50) 55%, rgba(0,0,0,0.16) 72%, rgba(0,0,0,0.02) 82%, rgba(0,0,0,1) 92%)",
        }}
      >
        <img
          src="/assets/hero-ambient-bg.jpg"
          alt="Ambient Luxury Studio Lighting"
          className="w-full h-full object-cover object-[80%_center] sm:object-[86%_center] md:object-[92%_center] scale-[1.08]"
          loading="eager"
        />
      </div>

      {/* Subtle, Very Soft Liquid Ambient Golden Gradient on Far Left */}
      <div
        className="absolute inset-y-0 left-0 w-full sm:w-1/2 pointer-events-none z-[1]"
        style={{
          background:
            "radial-gradient(ellipse 65% 55% at 0% 28%, rgba(229, 169, 60, 0.12) 0%, rgba(192, 132, 26, 0.03) 45%, transparent 75%)",
        }}
      />

      {/* Soft Balanced Golden Liquid Gradient on Right Side */}
      <div
        className="absolute inset-y-0 right-0 w-full sm:w-1/2 md:w-5/12 pointer-events-none z-[1] max-sm:opacity-40 sm:opacity-100"
        style={{
          background:
            "radial-gradient(ellipse 95% 85% at 100% 45%, rgba(245, 185, 55, 0.18) 0%, rgba(229, 169, 60, 0.10) 35%, rgba(192, 132, 26, 0.03) 65%, transparent 90%)",
        }}
      />
      <div
        className="absolute inset-y-0 right-0 w-1/3 sm:w-1/4 pointer-events-none z-[1] max-sm:opacity-40 sm:opacity-100"
        style={{
          background:
            "linear-gradient(to left, rgba(245, 185, 55, 0.10) 0%, rgba(229, 169, 60, 0.04) 50%, transparent 100%)",
        }}
      />

      {/* Right-Side 5-Column Dynamic Cyclic Light Chaser */}
      <div className="absolute inset-y-0 right-0 w-full sm:w-9/12 md:w-8/12 pointer-events-none z-[2] overflow-hidden select-none max-sm:opacity-30 sm:opacity-68">
        {/* Box 1: Cyclic Step 1 */}
        <div className="absolute inset-y-0 right-[3%] sm:right-[4%] w-16 sm:w-20 bg-gradient-to-b from-transparent via-[#ffd700]/22 to-transparent blur-md animate-cycle-box-1" />

        {/* Box 2: Cyclic Step 2 */}
        <div className="absolute inset-y-0 right-[11%] sm:right-[13%] w-14 sm:w-18 bg-gradient-to-b from-transparent via-[#ffd700]/18 to-transparent blur-md animate-cycle-box-2" />

        {/* Box 3: Cyclic Step 3 */}
        <div className="absolute inset-y-0 right-[19%] sm:right-[22%] w-14 sm:w-16 bg-gradient-to-b from-transparent via-[#e5a93c]/16 to-transparent blur-md animate-cycle-box-3" />

        {/* Box 4: Cyclic Step 4 */}
        <div className="absolute inset-y-0 right-[27%] sm:right-[31%] w-12 sm:w-14 bg-gradient-to-b from-transparent via-[#e5a93c]/12 to-transparent blur-md animate-cycle-box-4" />

        {/* Box 5: Cyclic Step 5 */}
        <div className="absolute inset-y-0 right-[35%] sm:right-[40%] w-10 sm:w-12 bg-gradient-to-b from-transparent via-[#c0841a]/10 to-transparent blur-md animate-cycle-box-5" />

        {/* Subtle Golden Shimmer Sweep */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ffd700]/5 to-transparent -skew-x-12 animate-gold-shimmer pointer-events-none" />

        {/* Rising Golden Ember Light Motes */}
        <div className="absolute bottom-[20%] right-[16%] w-1.5 h-1.5 rounded-full bg-[#ffeaa7] shadow-[0_0_6px_#ffd700] animate-ember-1 opacity-80" />
        <div className="absolute bottom-[10%] right-[24%] w-2 h-2 rounded-full bg-[#ffd700] shadow-[0_0_8px_#ffd700] animate-ember-2 opacity-80" />
        <div className="absolute bottom-[35%] right-[32%] w-1 h-1 rounded-full bg-[#ffda79] shadow-[0_0_5px_#ffd700] animate-ember-3 opacity-80" />
        <div className="absolute bottom-[15%] right-[8%] w-1.5 h-1.5 rounded-full bg-[#fff3b0] shadow-[0_0_6px_#fff3b0] animate-ember-4 opacity-80" />

        {/* Twinkling Glitter Sparkle Stars */}
        <div className="absolute top-[18%] right-[18%] text-[#ffeaa7] text-lg sm:text-xl animate-luxury-glitter opacity-80">
          ✦
        </div>
        <div className="absolute top-[42%] right-[10%] text-[#ffd700] text-sm sm:text-base animate-luxury-glitter-delay-1 opacity-80">
          ✧
        </div>
        <div className="absolute top-[68%] right-[26%] text-[#ffda79] text-base sm:text-lg animate-luxury-glitter-delay-2 opacity-80">
          ✦
        </div>
        <div className="absolute top-[28%] right-[6%] text-[#fff3b0] text-xs sm:text-sm animate-luxury-glitter-delay-3 opacity-80">
          ✧
        </div>
        <div className="absolute top-[82%] right-[14%] text-[#ffd700] text-sm sm:text-base animate-luxury-glitter opacity-80">
          ✦
        </div>
      </div>

      {/* Main Composition Container */}
      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 md:px-8 flex-1 flex flex-col justify-between py-2 md:py-3">
        {/* Top spacer */}
        <div className="w-full h-1" />

        {/* Diagonal Composition Grid */}
        <div className="relative w-full flex-1 flex items-center justify-center my-auto py-1">
          {/* Diagonal Layer 1: Left-Flush Elevated Luxury Brand Lockup (PC: Exactly as before, Mobile: Top-Left) */}
          <div className="absolute max-sm:top-2 max-sm:left-2 sm:inset-y-0 sm:left-0 flex max-sm:items-start sm:items-center justify-start pl-0 sm:-translate-y-18 md:-translate-y-24 lg:-translate-y-28 pointer-events-none select-none z-10">
            <div className="flex flex-col items-start select-none text-left not-italic">
              {/* Master Brand Headline: Line 1: 'THE', Line 2: 'GRAND STORE' */}
              <h1
                className="font-serif not-italic text-[26px] sm:text-[clamp(28px,4.4vw,64px)] font-bold uppercase text-left leading-[0.96] whitespace-nowrap select-none m-0 p-0 flex flex-col"
                style={{
                  fontFamily: "'Cinzel', 'Playfair Display', serif",
                  fontStyle: "normal",
                }}
              >
                {/* Line 1: 'The' (Fully Golden) */}
                <span
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, #fff8e7 0%, #ffe299 18%, #e5a93c 45%, #ffd269 72%, #a86c0c 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    filter:
                      "drop-shadow(0 2px 14px rgba(229, 169, 60, 0.40)) drop-shadow(0 6px 24px rgba(0,0,0,0.95))",
                    letterSpacing: "0.18em",
                  }}
                >
                  The
                </span>

                {/* Line 2: 'Grand Store' (Fully Golden) */}
                <span
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, #fff8e7 0%, #ffe299 18%, #e5a93c 45%, #ffd269 72%, #a86c0c 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    filter:
                      "drop-shadow(0 2px 14px rgba(229, 169, 60, 0.40)) drop-shadow(0 6px 24px rgba(0,0,0,0.95))",
                    letterSpacing: "0.10em",
                  }}
                >
                  Grand Store
                </span>
              </h1>

              {/* Sub-label Luxury Curated Accent */}
              <span
                className="mt-1 sm:mt-2.5 text-[9px] sm:text-[clamp(11px,1.1vw,15px)] font-semibold tracking-[0.20em] sm:tracking-[0.24em] uppercase text-[#e5a93c]/90 drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]"
                style={{
                  fontFamily: "'Montserrat', 'Inter', sans-serif",
                  letterSpacing: "0.24em",
                }}
              >
                Curated Rare Spirits & Wine
              </span>
            </div>
          </div>

          {/* Diagonal Layer 2: Center Floating Bottle (PC: Exactly as before, Mobile: Enlarged to fill gap) */}
          <div className="relative z-20 shrink-0 flex items-center justify-center pointer-events-auto cursor-pointer group animate-beer-float max-sm:translate-y-1 sm:-translate-y-1 md:-translate-y-4 max-sm:min-h-[355px] sm:min-h-[380px] md:min-h-[450px] lg:min-h-[520px] max-sm:w-[270px] sm:w-[280px] md:w-[400px]">
            {/* Lush Liquid Amber-Gold Contour Glow Around Bottle Corners */}
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-sm:w-[240px] sm:w-[270px] md:w-[320px] max-sm:h-[350px] sm:h-[400px] md:h-[470px] rounded-[40px] pointer-events-none -z-10 blur-xl opacity-90"
              style={{
                background:
                  "radial-gradient(ellipse 65% 75% at 50% 50%, rgba(255, 230, 130, 0.55) 0%, rgba(245, 185, 55, 0.32) 42%, rgba(229, 169, 60, 0.10) 65%, transparent 82%)",
              }}
            />

            {/* Twinkling Star Sparkles in Background of Bottle */}
            <div className="absolute -inset-10 pointer-events-none -z-10 overflow-visible select-none">
              {/* Top Left Sparkle Star */}
              <div className="absolute top-[8%] left-[12%] text-[#ffeaa7] text-lg sm:text-xl drop-shadow-[0_0_8px_#ffd700] animate-luxury-glitter">
                ✦
              </div>

              {/* Top Right Sparkle Star */}
              <div className="absolute top-[14%] right-[10%] text-[#ffd700] text-sm sm:text-base drop-shadow-[0_0_8px_#ffd700] animate-luxury-glitter-delay-1">
                ✧
              </div>

              {/* Mid Left Sparkle Star */}
              <div className="absolute top-[48%] left-[4%] text-[#ffda79] text-base sm:text-lg drop-shadow-[0_0_6px_#ffd700] animate-luxury-glitter-delay-2">
                ✦
              </div>

              {/* Mid Right Sparkle Star */}
              <div className="absolute top-[42%] right-[6%] text-[#fff3b0] text-xs sm:text-sm drop-shadow-[0_0_6px_#fff3b0] animate-luxury-glitter-delay-3">
                ✧
              </div>

              {/* Bottom Left Sparkle Star */}
              <div className="absolute bottom-[16%] left-[10%] text-[#ffd700] text-sm sm:text-base drop-shadow-[0_0_8px_#ffd700] animate-luxury-glitter">
                ✦
              </div>

              {/* Bottom Right Sparkle Star */}
              <div className="absolute bottom-[22%] right-[12%] text-[#ffeaa7] text-base sm:text-lg drop-shadow-[0_0_8px_#ffd700] animate-luxury-glitter-delay-1">
                ✧
              </div>

              {/* Rising Micro Amber Embers */}
              <div className="absolute bottom-[28%] left-[18%] w-1.5 h-1.5 rounded-full bg-[#ffeaa7] shadow-[0_0_6px_#ffd700] animate-ember-1 opacity-90" />
              <div className="absolute bottom-[18%] right-[20%] w-2 h-2 rounded-full bg-[#ffd700] shadow-[0_0_8px_#ffd700] animate-ember-2 opacity-90" />
            </div>

            {/* Crossfading 13 Bottles for Smooth 5-Second Transition */}
            {BOTTLE_CATEGORIES.map((product, index) => {
              const isActive = index === currentIndex;
              return (
                <div
                  key={product.id}
                  className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ease-out will-change-transform ${
                    isActive
                      ? "opacity-100 scale-100 group-hover:scale-105 group-hover:rotate-1.5 group-hover:-translate-y-2"
                      : "opacity-0 scale-95 pointer-events-none"
                  }`}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="max-sm:h-[345px] sm:h-[370px] md:h-[440px] lg:h-[510px] w-auto max-w-[250px] sm:max-w-[300px] md:max-w-[360px] object-contain drop-shadow-[0_0_6px_rgba(255,245,180,0.95)] drop-shadow-[0_0_16px_rgba(255,215,0,0.75)] drop-shadow-[0_0_30px_rgba(245,185,55,0.48)] drop-shadow-[0_20px_42px_rgba(0,0,0,0.95)] filter contrast-[1.08] brightness-[1.04] transition-all duration-500"
                    loading="eager"
                  />
                </div>
              );
            })}
          </div>

          {/* Diagonal Layer 3: Right Diagonal Dynamic Bold Category Title (PC: Exactly as before, Mobile: Bottom-Right) */}
          <div className="absolute max-sm:right-3 max-sm:bottom-3 sm:right-16 md:right-24 lg:right-32 sm:bottom-20 md:bottom-28 lg:bottom-36 z-30 pointer-events-auto">
            <a
              href={currentProduct.link}
              className="relative block text-right cursor-pointer group/title"
            >
              {/* Subtle Dark Ambient Contrast Shield (Prevents Background Blending) */}
              <div
                className="absolute -inset-x-8 -inset-y-4 rounded-3xl pointer-events-none -z-10 blur-xl opacity-90"
                style={{
                  background:
                    "radial-gradient(ellipse 80% 80% at 75% 50%, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.60) 50%, transparent 85%)",
                }}
              />

              <h2
                key={`cat-${currentProduct.id}`}
                className="text-[26px] sm:text-[clamp(30px,4.2vw,62px)] font-serif font-black uppercase tracking-wider leading-none animate-category-switch select-none"
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  backgroundImage:
                    "linear-gradient(135deg, #ffffff 0%, #ffffff 38%, #fff4c7 65%, #ffd700 90%, #e5a93c 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter:
                    "drop-shadow(0 2px 8px rgba(0,0,0,1)) drop-shadow(0 6px 28px rgba(0,0,0,0.98)) drop-shadow(0 0 24px rgba(255,215,0,0.40))",
                }}
              >
                {currentProduct.category}
              </h2>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

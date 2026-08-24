const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../grand-store/frontend/src/components/Header.jsx');
let content = fs.readFileSync(file, 'utf8');

// Replace nav-shop-control
content = content.replace(
  /className="relative nav-shop-control"/g,
  'className="nav-shop-control"' // removed relative
);

// We need to remove relative from .nav-inner or .desktop-nav if they have it, but they usually don't by default unless specified.
// Let's modify the mega menu for Shop
const shopMega = `              <AnimatePresence>
                {megaOpen && megaTrigger === "shop" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-[100%] left-0 w-[100vw] pt-0 z-50 border-t border-white/5"
                  >
                    <div className="w-full bg-[#0a0a0a] shadow-[0_20px_40px_rgba(0,0,0,0.9)] relative flex justify-center">
                      <div className="w-full max-w-[1500px] mx-auto flex h-[450px]">
                        
                        {/* Categories Column */}
                        <div className="w-1/4 bg-[#111] border-r border-white/5 py-6 flex flex-col">
                          <div className="px-8 pb-4 text-xs font-bold tracking-widest text-[#888] uppercase">Explore</div>
                          <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {storeCategories.map((category, index) => (
                              <div
                                key={category}
                                className="relative group/category"
                                onMouseEnter={() => setActiveCategory(index)}
                              >
                                <div
                                  className={\`px-8 py-3 flex items-center justify-between text-sm cursor-pointer transition-colors \${activeCategory === index ? "text-[#e6c97a] bg-white/5" : "text-[#ccc] hover:text-white hover:bg-white/5"}\`}
                                >
                                  {category}
                                  <ChevronRight size={14} className={activeCategory === index ? "opacity-100" : "opacity-0 group-hover/category:opacity-50 transition-opacity"} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Products Grid */}
                        <div className="flex-1 bg-[#0a0a0a] py-6 px-8 flex flex-col">
                           <div className="pb-4 text-xs font-bold tracking-widest text-[#888] uppercase">
                             {activeCategory >= 0 && storeCategories[activeCategory] ? storeCategories[activeCategory] : "Featured"}
                           </div>
                           <div className="flex-1 overflow-y-auto custom-scrollbar">
                             <div className="grid grid-cols-3 xl:grid-cols-4 gap-6 pr-4">
                              {products
                                .filter((p) =>
                                  activeCategory >= 0 ? (p.category || p.type || "").toLowerCase().includes(storeCategories[activeCategory].toLowerCase()) : true
                                )
                                .slice(0, 8)
                                .map((product) => (
                                  <Link
                                    key={product.id}
                                    to={\`/product/\${product.slug || product.id}\`}
                                    onClick={closeMenus}
                                    className="group flex flex-col gap-2 p-3 rounded-md hover:bg-white/5 transition-colors border border-transparent hover:border-white/5"
                                  >
                                    <div className="aspect-square bg-[#1a1a1a] rounded flex items-center justify-center p-4">
                                      <img src={product.image || product.images?.[0] || "/assets/placeholder.png"} alt={product.name} className="h-full object-contain mix-blend-lighten group-hover:scale-105 transition-transform duration-500" />
                                    </div>
                                    <div className="text-sm font-medium text-white group-hover:text-[#e6c97a] transition-colors truncate">
                                      {product.name}
                                    </div>
                                    {product.vintage && <div className="text-xs text-[#888]">{product.vintage}</div>}
                                  </Link>
                                ))}
                             </div>
                             {activeCategory >= 0 && products.filter((p) => (p.category || p.type || "").toLowerCase().includes(storeCategories[activeCategory].toLowerCase())).length === 0 && (
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
              </AnimatePresence>`;

// Regex to replace Shop Mega Menu
content = content.replace(
  /<AnimatePresence>\s*\{megaOpen && megaTrigger === "shop"[\s\S]*?<\/AnimatePresence>/,
  shopMega
);

const accMega = `              <AnimatePresence>
                {megaOpen && megaTrigger === "accessories" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-[100%] left-0 w-[100vw] pt-0 z-50 border-t border-white/5"
                  >
                    <div className="w-full bg-[#0a0a0a] shadow-[0_20px_40px_rgba(0,0,0,0.9)] relative flex justify-center">
                      <div className="w-full max-w-[1500px] mx-auto flex h-[450px]">
                        
                        {/* Categories Column */}
                        <div className="w-1/4 bg-[#111] border-r border-white/5 py-6 flex flex-col">
                          <div className="px-8 pb-4 text-xs font-bold tracking-widest text-[#888] uppercase">Categories</div>
                          <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {Object.keys(accessoryCategories).map((category, index) => (
                              <div
                                key={category}
                                className="relative group/category"
                                onMouseEnter={() => setActiveCategory(index)}
                              >
                                <div
                                  className={\`px-8 py-3 flex items-center justify-between text-sm cursor-pointer transition-colors \${activeCategory === index ? "text-[#e6c97a] bg-white/5" : "text-[#ccc] hover:text-white hover:bg-white/5"}\`}
                                >
                                  {category}
                                  <ChevronRight size={14} className={activeCategory === index ? "opacity-100" : "opacity-0 group-hover/category:opacity-50 transition-opacity"} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Products Grid */}
                        <div className="flex-1 bg-[#0a0a0a] py-6 px-8 flex flex-col">
                           <div className="pb-4 text-xs font-bold tracking-widest text-[#888] uppercase">
                             {activeCategory >= 0 && Object.keys(accessoryCategories)[activeCategory] ? Object.keys(accessoryCategories)[activeCategory] : "Featured"}
                           </div>
                           <div className="flex-1 overflow-y-auto custom-scrollbar">
                             <div className="grid grid-cols-3 xl:grid-cols-4 gap-6 pr-4">
                              {activeCategory >= 0 && accessoryCategories[Object.keys(accessoryCategories)[activeCategory]]?.map((subcat) => (
                                <div key={subcat} className="flex flex-col gap-2 p-4 rounded-md bg-[#111] border border-white/5 hover:border-[#c9a35b]/30 transition-colors">
                                  <div className="text-sm font-medium text-[#e6c97a] mb-2">{subcat}</div>
                                  {/* Dummy product representation for subcategory */}
                                  <Link to={\`/accessories?category=\${encodeURIComponent(Object.keys(accessoryCategories)[activeCategory])}&subcategory=\${encodeURIComponent(subcat)}\`} onClick={closeMenus} className="text-xs text-[#888] hover:text-white transition-colors">View collection &rarr;</Link>
                                </div>
                              ))}
                             </div>
                           </div>
                        </div>

                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>`;

// Replace Accessories Menu
content = content.replace(
  /className="relative nav-accessories-control"/g,
  'className="nav-accessories-control"'
);

content = content.replace(
  /<AnimatePresence>\s*\{megaOpen && megaTrigger === "accessories"[\s\S]*?<\/AnimatePresence>/,
  accMega
);

// Add 'relative' to header so the w-[100vw] absolute acts relative to body mostly or window? 
// Actually w-[100vw] will be full viewport width anyway.
// But left-0 will start from the header's left edge.
// Wait, if the header is fixed and left-0, then it's fine.
content = content.replace(
  /className="site-header"/g,
  'className="site-header relative"'
);

fs.writeFileSync(file, content, 'utf8');
console.log("Replaced!");

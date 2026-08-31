const Product = require('../models/Product');

const CATEGORY_ICONS = {
  Whisky: 'glass-tulip',
  Wine: 'glass-wine',
  Champagne: 'glass-flute',
  Cognac: 'glass-tulip',
  Brandy: 'glass-cocktail',
  Gin: 'bottle-wine-outline',
  Liqueur: 'bottle-tonic-outline',
  Rum: 'bottle-tonic',
  Tequila: 'glass-cocktail',
  Vodka: 'bottle-wine',
  Beer: 'beer-outline',
  Ciders: 'bottle-soda',
  Spirits: 'glass-cocktail'
};

const getCategories = async (_req, res) => {
  try {
    const products = await Product.find({
      type: { $ne: 'accessory' },
      isCatalogDuplicate: { $ne: true }
    })
      .select('category type country subcategory brand')
      .lean();

    const taxonomy = new Map();
    for (const product of products) {
      const categoryName = String(product.category || product.type || '').trim();
      if (!categoryName) continue;
      if (!taxonomy.has(categoryName)) {
        taxonomy.set(categoryName, {
          countries: new Map(),
          brands: new Set(),
          subcategories: new Set()
        });
      }

      const category = taxonomy.get(categoryName);
      const country = String(product.country || '').trim();
      const subcategory = String(product.subcategory || '').trim();
      const brand = String(product.brand || '').trim();
      if (brand) category.brands.add(brand);
      if (subcategory) category.subcategories.add(subcategory);
      if (country) {
        if (!category.countries.has(country)) category.countries.set(country, new Set());
        if (subcategory) category.countries.get(country).add(subcategory);
      }
    }

    const data = [...taxonomy.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([name, category], index) => ({
        id: index + 1,
        name,
        icon: CATEGORY_ICONS[name] || 'view-grid-outline',
        brands: [...category.brands].sort(),
        subcategories: [...category.subcategories].sort(),
        countries: [...category.countries.entries()]
          .sort(([left], [right]) => left.localeCompare(right))
          .map(([country, subcategories]) => ({
            name: country,
            subcategories: [...subcategories].sort()
          }))
      }));

    res.status(200).json({ status: 1, data });
  } catch (error) {
    console.error('Error fetching category taxonomy:', error);
    res.status(500).json({ status: 0, message: 'Unable to load category taxonomy.' });
  }
};

module.exports = { getCategories };

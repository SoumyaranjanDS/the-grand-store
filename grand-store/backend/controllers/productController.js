const Product = require('../models/Product');
const Vendor = require('../models/Vendor');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({}).lean();
    
    const vendorIds = [...new Set(products.filter(p => p.vendorId).map(p => p.vendorId.toString()))];
    const vendors = await Vendor.find({ userId: { $in: vendorIds } }).lean();
    
    const productsWithStore = products.map(product => {
      if (!product.vendorId) return product;
      
      const vendor = vendors.find(v => v.userId.toString() === product.vendorId.toString());
      if (vendor) {
        return {
          ...product,
          storeId: vendor.userId,
          storeName: vendor.businessInfo?.tradingName || vendor.businessInfo?.legalName || 'Unknown Store'
        };
      }
      return product;
    });

    res.json(productsWithStore);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error fetching products' });
  }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching product' });
  }
};
// @desc    Create a new product (Vendor only)
// @route   POST /api/products
// @access  Private (Vendor)
const createProduct = async (req, res) => {
  try {
    if (req.user.role !== 'vendor_active') {
      return res.status(403).json({ message: 'Only approved vendors can add products' });
    }

    const { name, type, description, price, options, tags, tastingNotes, stock } = req.body;

    // Check if type is whisky and ensure fact sheet is provided
    let factSheetPdf = null;
    let image = null;
    let gallery = [];

    if (req.files) {
      if (req.files.images && req.files.images.length > 0) {
        image = `/uploads/${req.files.images[0].filename}`;
        if (req.files.images.length > 1) {
          gallery = req.files.images.slice(1).map(f => `/uploads/${f.filename}`);
        }
      }
      if (req.files.factSheetPdf && req.files.factSheetPdf[0]) {
        factSheetPdf = `/uploads/${req.files.factSheetPdf[0].filename}`;
      }
    }

    if (type && type.toLowerCase() === 'wine' && !factSheetPdf) {
      return res.status(400).json({ message: 'Fact Sheet PDF is required for Wine products' });
    }

    const newProduct = new Product({
      id: `prod_${Date.now()}`,
      name,
      type,
      description,
      price,
      image,
      gallery,
      factSheetPdf,
      options: options ? JSON.parse(options) : [],
      tags: tags ? JSON.parse(tags) : [],
      tastingNotes: tastingNotes ? JSON.parse(tastingNotes) : [],
      stock: Number(stock) || 0,
      vendorId: req.user._id,
      approvalStatus: 'approved'
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Server error creating product' });
  }
};
// @desc    Fetch products for a specific vendor
// @route   GET /api/products/vendor/me
// @access  Private (Vendor)
const getVendorProducts = async (req, res) => {
  try {
    const products = await Product.find({ vendorId: req.user._id });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching vendor products' });
  }
};

// @desc    Update a product (Vendor only)
// @route   PUT /api/products/:id
// @access  Private (Vendor)
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.vendorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this product' });
    }

    const { name, type, description, price, options, tags, tastingNotes, stock } = req.body;

    product.name = name || product.name;
    product.type = type || product.type;
    product.description = description || product.description;
    product.price = price || product.price;
    product.options = options ? JSON.parse(options) : product.options;
    product.tags = tags ? JSON.parse(tags) : product.tags;
    product.tastingNotes = tastingNotes ? JSON.parse(tastingNotes) : product.tastingNotes;
    product.stock = stock !== undefined ? Number(stock) : product.stock;

    if (req.files) {
      if (req.files.images && req.files.images.length > 0) {
        product.image = `/uploads/${req.files.images[0].filename}`;
        if (req.files.images.length > 1) {
          product.gallery = req.files.images.slice(1).map(f => `/uploads/${f.filename}`);
        } else {
          product.gallery = [];
        }
      }
      if (req.files.factSheetPdf && req.files.factSheetPdf[0]) {
        product.factSheetPdf = `/uploads/${req.files.factSheetPdf[0].filename}`;
      }
    }

    if (product.type && product.type.toLowerCase() === 'wine' && !product.factSheetPdf) {
      return res.status(400).json({ message: 'Fact Sheet PDF is required for Wine products' });
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error updating product' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  getVendorProducts,
  updateProduct
};

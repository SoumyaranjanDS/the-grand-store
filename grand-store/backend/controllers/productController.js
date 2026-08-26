const Product = require('../models/Product');
const Vendor = require('../models/Vendor');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const query = {};
    if (req.query.type) {
      query.type = req.query.type;
    }
    const products = await Product.find(query).sort({ createdAt: -1 }).lean();
    
    const vendorIds = [...new Set(products.filter(p => p.vendorId).map(p => p.vendorId.toString()))];
    const vendors = await Vendor.find({ userId: { $in: vendorIds } }).lean();
    
    const productsWithStore = products.map(product => {
      if (!product.vendorId) {
        // Internal product (like Accessories) managed by Admin
        return {
          ...product,
          storeId: 'admin',
          storeName: 'The Grand Store'
        };
      }
      
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
    const product = await Product.findOne({ id: req.params.id }).lean();
    if (product) {
      if (!product.vendorId) {
        product.storeId = 'admin';
        product.storeName = 'The Grand Store';
      } else {
        const vendor = await Vendor.findOne({ userId: product.vendorId }).lean();
        if (vendor) {
          product.storeId = vendor.userId;
          product.storeName = vendor.businessInfo?.tradingName || vendor.businessInfo?.legalName || 'Unknown Store';
        }
      }
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching product' });
  }
};
// @desc    Create a new product (Vendor or Admin)
// @route   POST /api/products
// @access  Private (Vendor/Admin)
const createProduct = async (req, res) => {
  try {
    if (!['vendor_active', 'admin', 'super_admin', 'product_manager'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Only approved vendors or admins can add products' });
    }

    const { name, type, description, price, options, tags, tastingNotes, stock, flavorProfile, foodPairing } = req.body;
    let { image, gallery } = req.body; // Allows passing image links from frontend for admins

    // Check if type is whisky and ensure fact sheet is provided
    let factSheetPdf = null;
    
    // If files are uploaded (multipart/form-data)
    if (req.files) {
      if (req.files.images && req.files.images.length > 0) {
        image = req.files.images[0].path;
        if (req.files.images.length > 1) {
          gallery = req.files.images.slice(1).map(f => f.path);
        }
      }
      if (req.files.factSheetPdf && req.files.factSheetPdf[0]) {
        factSheetPdf = req.files.factSheetPdf[0].path;
      }
    }

    // Admins might pass gallery as a string or array of links
    if (typeof gallery === 'string') {
      gallery = [gallery];
    } else if (!gallery) {
      gallery = [];
    }

    if (type && type.toLowerCase() === 'wine' && !factSheetPdf && req.user.role !== 'admin') {
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
      options: options && typeof options === 'string' ? JSON.parse(options) : options || [],
      tags: tags && typeof tags === 'string' ? JSON.parse(tags) : tags || [],
      tastingNotes: tastingNotes && typeof tastingNotes === 'string' ? JSON.parse(tastingNotes) : tastingNotes || [],
      flavorProfile: flavorProfile && typeof flavorProfile === 'string' ? JSON.parse(flavorProfile) : flavorProfile || [],
      foodPairing: foodPairing && typeof foodPairing === 'string' ? JSON.parse(foodPairing) : foodPairing || [],
      stock: Number(stock) || 0,
      vendorId: ['admin', 'super_admin', 'product_manager'].includes(req.user.role) ? null : req.user._id,
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
// @access  Private (Vendor/Admin)
const getVendorProducts = async (req, res) => {
  try {
    let filter = { vendorId: req.user._id };
    if (['admin', 'super_admin', 'product_manager'].includes(req.user.role)) {
      filter = {};
    }
    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching vendor products' });
  }
};

// @desc    Update a product (Vendor or Admin)
// @route   PUT /api/products/:id
// @access  Private (Vendor/Admin)
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!['admin', 'super_admin', 'product_manager'].includes(req.user.role) && product.vendorId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this product' });
    }

    const { name, type, description, price, options, tags, tastingNotes, stock, image: imageLink, gallery: galleryLinks, flavorProfile, foodPairing } = req.body;

    product.name = name || product.name;
    product.type = type || product.type;
    product.description = description !== undefined ? description : product.description;
    product.price = price || product.price;
    product.options = options && typeof options === 'string' ? JSON.parse(options) : options || product.options;
    product.tags = tags && typeof tags === 'string' ? JSON.parse(tags) : tags || product.tags;
    product.tastingNotes = tastingNotes && typeof tastingNotes === 'string' ? JSON.parse(tastingNotes) : tastingNotes || product.tastingNotes;
    product.flavorProfile = flavorProfile && typeof flavorProfile === 'string' ? JSON.parse(flavorProfile) : flavorProfile || product.flavorProfile;
    product.foodPairing = foodPairing && typeof foodPairing === 'string' ? JSON.parse(foodPairing) : foodPairing || product.foodPairing;
    product.stock = stock !== undefined ? Number(stock) : product.stock;

    if (imageLink) product.image = imageLink;
    if (galleryLinks) {
      product.gallery = typeof galleryLinks === 'string' ? [galleryLinks] : galleryLinks;
    }

    if (req.files) {
      if (req.files.images && req.files.images.length > 0) {
        product.image = req.files.images[0].path;
        if (req.files.images.length > 1) {
          product.gallery = req.files.images.slice(1).map(f => f.path);
        } else {
          product.gallery = [];
        }
      }
      if (req.files.factSheetPdf && req.files.factSheetPdf[0]) {
        product.factSheetPdf = req.files.factSheetPdf[0].path;
      }
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error updating product' });
  }
};

// @desc    Delete a product (Vendor or Admin)
// @route   DELETE /api/products/:id
// @access  Private (Vendor/Admin)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!['admin', 'super_admin', 'product_manager'].includes(req.user.role) && product.vendorId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    await Product.deleteOne({ id: req.params.id });
    res.json({ message: 'Product removed' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error deleting product' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  getVendorProducts,
  updateProduct,
  deleteProduct
};

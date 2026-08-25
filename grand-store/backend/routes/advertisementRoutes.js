const express = require('express');
const router = require('express').Router();
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const upload = multer({ storage });
const AdvertisementRequest = require('../models/AdvertisementRequest');
const AdvertisedProduct = require('../models/AdvertisedProduct');
const { protect, admin } = require('../middleware/authMiddleware');

// @route   POST /api/advertisements/request
// @desc    Submit an advertisement request (Public)
router.post('/request', async (req, res) => {
  try {
    const { companyName, contactName, email, phone, productName, description } = req.body;
    const request = new AdvertisementRequest({
      companyName, contactName, email, phone, productName, description
    });
    const savedRequest = await request.save();
    res.status(201).json(savedRequest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   GET /api/advertisements/requests
// @desc    Get all advertisement requests (Admin)
router.get('/requests', protect, admin, async (req, res) => {
  try {
    const requests = await AdvertisementRequest.find({}).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/advertisements/requests/:id
// @desc    Get a single advertisement request by ID (Admin)
router.get('/requests/:id', protect, admin, async (req, res) => {
  try {
    const request = await AdvertisementRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/advertisements/requests/:id
// @desc    Update advertisement request status (Admin)
router.put('/requests/:id', protect, admin, async (req, res) => {
  try {
    const request = await AdvertisementRequest.findById(req.params.id);
    if (request) {
      request.status = req.body.status || request.status;
      const updatedRequest = await request.save();
      res.json(updatedRequest);
    } else {
      res.status(404).json({ message: 'Request not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/advertisements/products
// @desc    Get all active advertised products (Public)
router.get('/products', async (req, res) => {
  try {
    const products = await AdvertisedProduct.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/advertisements/products/all
// @desc    Get all advertised products (Admin)
router.get('/products/all', protect, admin, async (req, res) => {
  try {
    const products = await AdvertisedProduct.find({}).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/advertisements/products
// @desc    Create an advertised product (Admin)
router.post('/products', protect, admin, upload.array('images', 5), async (req, res) => {
  try {
    const { title, brand, description, linkUrl, isActive, price, category, tagline } = req.body;
    
    let features = [];
    if (req.body.features) {
      try { features = JSON.parse(req.body.features); } catch(e) { features = req.body.features.split(','); }
    }

    let images = [];
    if (req.files) {
      images = req.files.map(file => file.path);
    }

    const product = new AdvertisedProduct({
      title, brand, images, description, linkUrl, isActive, price, category, tagline, features
    });
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/advertisements/products/:id
// @desc    Update an advertised product (Admin)
router.put('/products/:id', protect, admin, upload.array('images', 5), async (req, res) => {
  try {
    const product = await AdvertisedProduct.findById(req.params.id);
    if (product) {
      product.title = req.body.title || product.title;
      product.brand = req.body.brand || product.brand;
      product.description = req.body.description || product.description;
      product.linkUrl = req.body.linkUrl !== undefined ? req.body.linkUrl : product.linkUrl;
      product.price = req.body.price !== undefined ? req.body.price : product.price;
      product.category = req.body.category !== undefined ? req.body.category : product.category;
      product.tagline = req.body.tagline !== undefined ? req.body.tagline : product.tagline;
      product.isActive = req.body.isActive !== undefined ? req.body.isActive : product.isActive;
      
      if (req.body.features !== undefined) {
        try { product.features = JSON.parse(req.body.features); } catch(e) { product.features = req.body.features.split(','); }
      }
      
      // Handle retained existing images and new file uploads
      let retainedImages = [];
      if (req.body.retainedImages) {
        try {
          retainedImages = JSON.parse(req.body.retainedImages);
        } catch (e) {
          retainedImages = [];
        }
      }

      let newImages = [];
      if (req.files && req.files.length > 0) {
        newImages = req.files.map(file => file.path);
      }
      
      // Update product images with combined array
      if (retainedImages.length > 0 || newImages.length > 0) {
        product.images = [...retainedImages, ...newImages];
      } else if (req.body.retainedImages !== undefined) {
        // if retainedImages was explicitly passed as empty array and no new files
        product.images = [];
      }
      
      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/advertisements/products/:id
// @desc    Get a single advertised product by ID (Public)
router.get('/products/:id', async (req, res) => {
  try {
    // Avoid conflicting with /products/all by checking if ID is valid object ID (optional, handled by routing order but let's be safe)
    if (req.params.id === 'all') return; // Handled by another route
    const product = await AdvertisedProduct.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/advertisements/products/:id
// @desc    Delete an advertised product (Admin)
router.delete('/products/:id', protect, admin, async (req, res) => {
  try {
    const product = await AdvertisedProduct.findById(req.params.id);
    if (product) {
      await AdvertisedProduct.deleteOne({ _id: product._id });
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

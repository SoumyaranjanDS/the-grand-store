const Testimonial = require('../models/Testimonial');

// @desc    Get all visible testimonials
// @route   GET /api/testimonials
// @access  Public
const getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ $or: [{ isVisible: true }, { isActive: true }] }).sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all testimonials (including hidden)
// @route   GET /api/testimonials/admin and /api/admin/testimonials
// @access  Private/Admin
const getAdminTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({}).sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Create a new testimonial
// @route   POST /api/testimonials and /api/admin/testimonials
// @access  Private/Admin
const createTestimonial = async (req, res) => {
  try {
    const testimonial = new Testimonial(req.body);
    const createdTestimonial = await testimonial.save();
    res.status(201).json(createdTestimonial);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a testimonial
// @route   PUT /api/testimonials/:id and /api/admin/testimonials/:id
// @access  Private/Admin
const updateTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (testimonial) {
      testimonial.name = req.body.name || testimonial.name;
      testimonial.location = req.body.location || testimonial.location;
      testimonial.image = req.body.image !== undefined ? req.body.image : testimonial.image;
      testimonial.rating = req.body.rating || testimonial.rating;
      testimonial.bottle = req.body.bottle !== undefined ? req.body.bottle : testimonial.bottle;
      testimonial.text = req.body.text || req.body.quote || testimonial.text;
      testimonial.quote = req.body.quote || req.body.text || testimonial.quote;
      testimonial.role = req.body.role || testimonial.role;
      testimonial.date = req.body.date || testimonial.date;
      if (req.body.isVisible !== undefined) testimonial.isVisible = req.body.isVisible;
      if (req.body.isActive !== undefined) testimonial.isActive = req.body.isActive;

      const updatedTestimonial = await testimonial.save();
      res.json(updatedTestimonial);
    } else {
      res.status(404).json({ message: 'Testimonial not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a testimonial
// @route   DELETE /api/testimonials/:id and /api/admin/testimonials/:id
// @access  Private/Admin
const deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (testimonial) {
      await testimonial.deleteOne();
      res.json({ message: 'Testimonial removed' });
    } else {
      res.status(404).json({ message: 'Testimonial not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get active testimonials (Public)
// @route   GET /api/settings/testimonials
// @access  Public
const getPublicTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ $or: [{ isActive: true }, { isVisible: true }] }).sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
  getTestimonials,
  getAdminTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getPublicTestimonials
};

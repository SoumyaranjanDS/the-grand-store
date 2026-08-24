const Testimonial = require('../models/Testimonial');

// @desc    Get all testimonials (Admin)
// @route   GET /api/admin/testimonials
// @access  Private/Admin
const getAdminTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({}).sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Create a testimonial
// @route   POST /api/admin/testimonials
// @access  Private/Admin
const createTestimonial = async (req, res) => {
  try {
    const { name, quote, image, role, isActive } = req.body;
    const testimonial = await Testimonial.create({
      name, quote, image, role, isActive
    });
    res.status(201).json(testimonial);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Update a testimonial
// @route   PUT /api/admin/testimonials/:id
// @access  Private/Admin
const updateTestimonial = async (req, res) => {
  try {
    const { name, quote, image, role, isActive } = req.body;
    const testimonial = await Testimonial.findById(req.params.id);

    if (testimonial) {
      testimonial.name = name || testimonial.name;
      testimonial.quote = quote || testimonial.quote;
      testimonial.image = image || testimonial.image;
      testimonial.role = role || testimonial.role;
      if (isActive !== undefined) testimonial.isActive = isActive;

      const updatedTestimonial = await testimonial.save();
      res.json(updatedTestimonial);
    } else {
      res.status(404).json({ message: "Testimonial not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Delete a testimonial
// @route   DELETE /api/admin/testimonials/:id
// @access  Private/Admin
const deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (testimonial) {
      await testimonial.deleteOne();
      res.json({ message: "Testimonial removed" });
    } else {
      res.status(404).json({ message: "Testimonial not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get active testimonials (Public)
// @route   GET /api/settings/testimonials
// @access  Public
const getPublicTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
  getAdminTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getPublicTestimonials,
};

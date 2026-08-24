const Attribute = require('../models/Attribute');

// @desc    Get all attributes
// @route   GET /api/attributes
// @access  Public
const getAttributes = async (req, res) => {
  try {
    const attributes = await Attribute.find({});
    res.json(attributes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new attribute
// @route   POST /api/attributes
// @access  Private/Admin
const createAttribute = async (req, res) => {
  try {
    const attribute = new Attribute(req.body);
    const createdAttribute = await attribute.save();
    res.status(201).json(createdAttribute);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update an attribute
// @route   PUT /api/attributes/:id
// @access  Private/Admin
const updateAttribute = async (req, res) => {
  try {
    const attribute = await Attribute.findById(req.params.id);

    if (attribute) {
      attribute.name = req.body.name || attribute.name;
      attribute.value = req.body.value || attribute.value;
      attribute.type = req.body.type || attribute.type;
      attribute.icon = req.body.icon || attribute.icon;

      const updatedAttribute = await attribute.save();
      res.json(updatedAttribute);
    } else {
      res.status(404).json({ message: 'Attribute not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete an attribute
// @route   DELETE /api/attributes/:id
// @access  Private/Admin
const deleteAttribute = async (req, res) => {
  try {
    const attribute = await Attribute.findById(req.params.id);

    if (attribute) {
      await attribute.deleteOne();
      res.json({ message: 'Attribute removed' });
    } else {
      res.status(404).json({ message: 'Attribute not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAttributes,
  createAttribute,
  updateAttribute,
  deleteAttribute
};

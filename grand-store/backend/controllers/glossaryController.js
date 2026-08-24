const Glossary = require('../models/Glossary');

// @desc    Get all glossary terms
// @route   GET /api/glossary
// @access  Public
const getTerms = async (req, res) => {
  try {
    const terms = await Glossary.find({}).sort({ term: 1 });
    res.json(terms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error fetching glossary terms' });
  }
};

// @desc    Create a glossary term
// @route   POST /api/glossary
// @access  Private/Admin
const createTerm = async (req, res) => {
  try {
    const { term, definition } = req.body;
    
    const existingTerm = await Glossary.findOne({ term: { $regex: new RegExp(`^${term}$`, 'i') } });
    if (existingTerm) {
      return res.status(400).json({ message: 'Term already exists' });
    }

    const letter = term.charAt(0).toUpperCase();
    const glossaryTerm = new Glossary({ term, definition, letter });
    const createdTerm = await glossaryTerm.save();
    res.status(201).json(createdTerm);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error creating glossary term' });
  }
};

// @desc    Update a glossary term
// @route   PUT /api/glossary/:id
// @access  Private/Admin
const updateTerm = async (req, res) => {
  try {
    const { term, definition } = req.body;
    const glossaryTerm = await Glossary.findById(req.params.id);

    if (glossaryTerm) {
      glossaryTerm.term = term || glossaryTerm.term;
      glossaryTerm.definition = definition || glossaryTerm.definition;
      glossaryTerm.letter = glossaryTerm.term.charAt(0).toUpperCase(); // Update letter if term changed

      const updatedTerm = await glossaryTerm.save();
      res.json(updatedTerm);
    } else {
      res.status(404).json({ message: 'Term not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error updating glossary term' });
  }
};

// @desc    Delete a glossary term
// @route   DELETE /api/glossary/:id
// @access  Private/Admin
const deleteTerm = async (req, res) => {
  try {
    const glossaryTerm = await Glossary.findById(req.params.id);

    if (glossaryTerm) {
      await glossaryTerm.deleteOne();
      res.json({ message: 'Term removed' });
    } else {
      res.status(404).json({ message: 'Term not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error deleting glossary term' });
  }
};

module.exports = {
  getTerms,
  createTerm,
  updateTerm,
  deleteTerm,
};

const express = require('express');
const router = express.Router();
const { getTerms, createTerm, updateTerm, deleteTerm } = require('../controllers/glossaryController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getTerms)
  .post(protect, admin, createTerm);

router.route('/:id')
  .put(protect, admin, updateTerm)
  .delete(protect, admin, deleteTerm);

module.exports = router;

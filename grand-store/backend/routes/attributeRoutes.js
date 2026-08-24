const express = require('express');
const router = express.Router();
const {
  getAttributes,
  createAttribute,
  updateAttribute,
  deleteAttribute
} = require('../controllers/attributeController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getAttributes)
  .post(protect, admin, createAttribute);

router.route('/:id')
  .put(protect, admin, updateAttribute)
  .delete(protect, admin, deleteAttribute);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  submitReview,
  getReviews,
  toggleReviewHelpful,
  submitQuestion,
  getProductQA,
  submitAnswer,
  getExpertReviews,
  saveExpertReview,
  getWallOfLove
} = require('../controllers/socialProofController');

// Assuming you have an auth middleware to verify tokens
const authMiddleware = require('../middleware/authMiddleware');
const protect = authMiddleware.protect || ((req, res, next) => next());
const admin = authMiddleware.admin || ((req, res, next) => next());

router.post('/reviews', protect, submitReview);
router.post('/reviews/:id/helpful', protect, toggleReviewHelpful);
router.get('/reviews/:type/:referenceId', getReviews);

router.post('/questions', protect, submitQuestion);
router.post('/questions/:id/answers', protect, submitAnswer);
router.get('/questions/:productId', getProductQA);

router.post('/expert-reviews', protect, admin, saveExpertReview);
router.get('/expert-reviews/:productId', getExpertReviews);

router.get('/wall-of-love', getWallOfLove);

module.exports = router;

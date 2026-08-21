const Review = require('../models/Review');
const QuestionAnswer = require('../models/QuestionAnswer');
const ExpertReview = require('../models/ExpertReview');
const Product = require('../models/Product');
const Vendor = require('../models/Vendor');
const Order = require('../models/Order');

// --- REVIEWS ---

// @desc    Submit a review
// @route   POST /api/social-proof/reviews
// @access  Private
exports.submitReview = async (req, res) => {
  try {
    const { type, referenceId, ratings, comment, media, consentForMarketing } = req.body;
    const authorId = req.user._id;

    // Determine if verified purchase
    let isVerifiedPurchase = false;
    if (type === 'product') {
      // Check if user has a completed order with this product
      const pastOrder = await Order.findOne({
        user: authorId,
        status: 'Delivered', // or whatever the completed status is
        'items.product': referenceId
      });
      if (pastOrder) isVerifiedPurchase = true;
    } else if (type === 'vendor') {
      // Check if user has bought from this vendor
      const pastOrder = await Order.findOne({
        user: authorId,
        status: 'Delivered',
        'items.vendor': referenceId
      });
      if (pastOrder) isVerifiedPurchase = true;
    }

    const review = await Review.create({
      author: authorId,
      type,
      referenceId,
      isVerifiedPurchase,
      ratings,
      comment,
      media,
      consentForMarketing,
      status: 'approved' // Automatically post as approved based on user feedback
    });

    // Update aggregated stats asynchronously
    if (type === 'product') {
      updateProductReviewStats(referenceId);
    }

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Get reviews for an entity
// @route   GET /api/social-proof/reviews/:type/:referenceId
// @access  Public
exports.getReviews = async (req, res) => {
  try {
    const { type, referenceId } = req.params;
    
    const reviews = await Review.find({ type, referenceId, status: 'approved' })
      .populate('author', 'name avatar') // Assuming user has name and avatar
      .sort('-createdAt');
      
    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Helper function to update Product aggregate stats
async function updateProductReviewStats(productId) {
  try {
    const reviews = await Review.find({ type: 'product', referenceId: productId, status: 'approved' });
    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, rev) => acc + rev.ratings.overall, 0);
      const avg = sum / reviews.length;
      await Product.findByIdAndUpdate(productId, {
        averageRating: avg.toFixed(1),
        reviewCount: reviews.length
      });
    }
  } catch (err) {
    console.error('Error updating product review stats:', err);
  }
}

// --- PRODUCT Q&A ---

// @desc    Submit a question
// @route   POST /api/social-proof/questions
// @access  Private
exports.submitQuestion = async (req, res) => {
  try {
    const { productId, question } = req.body;
    
    const qa = await QuestionAnswer.create({
      productId,
      asker: req.user._id,
      question
    });
    
    res.status(201).json({ success: true, data: qa });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Get Q&A for a product
// @route   GET /api/social-proof/questions/:productId
// @access  Public
exports.getProductQA = async (req, res) => {
  try {
    const qaList = await QuestionAnswer.find({ productId: req.params.productId, status: 'approved' })
      .populate('asker', 'name')
      .populate('answers.responder', 'name')
      .sort('-createdAt');
      
    res.status(200).json({ success: true, count: qaList.length, data: qaList });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Submit an answer to a question
// @route   POST /api/social-proof/questions/:id/answers
// @access  Private
exports.submitAnswer = async (req, res) => {
  try {
    const questionId = req.params.id;
    const { text } = req.body;
    
    // Determine responder type
    let responderType = 'customer';
    if (req.user.role === 'admin') responderType = 'expert';
    else if (req.user.role === 'vendor') responderType = 'vendor';
    
    const qa = await QuestionAnswer.findById(questionId);
    if (!qa) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    
    qa.answers.push({
      responder: req.user._id,
      responderType,
      text
    });
    
    await qa.save();
    
    // Repopulate for the response
    const populatedQa = await QuestionAnswer.findById(questionId)
      .populate('asker', 'name')
      .populate('answers.responder', 'name');
      
    res.status(201).json({ success: true, data: populatedQa });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// --- EXPERT REVIEWS ---

// @desc    Get expert reviews for a product
// @route   GET /api/social-proof/expert-reviews/:productId
// @access  Public
exports.getExpertReviews = async (req, res) => {
  try {
    const expertReviews = await ExpertReview.find({ 
      productId: req.params.productId, 
      status: 'published' 
    }).sort('-createdAt');
      
    res.status(200).json({ success: true, count: expertReviews.length, data: expertReviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Save an expert review for a product (Create or Update)
// @route   POST /api/social-proof/expert-reviews
// @access  Private/Admin
exports.saveExpertReview = async (req, res) => {
  try {
    const { productId, expertName, expertTitle, expertImage, verdict, detailedReview, ratings } = req.body;
    
    let expertReview = await ExpertReview.findOne({ productId });
    
    if (expertReview) {
      expertReview.expertName = expertName;
      expertReview.expertTitle = expertTitle;
      expertReview.expertImage = expertImage;
      expertReview.verdict = verdict;
      expertReview.detailedReview = detailedReview;
      expertReview.ratings = ratings;
      await expertReview.save();
    } else {
      expertReview = await ExpertReview.create({
        productId,
        expertName,
        expertTitle,
        expertImage,
        verdict,
        detailedReview,
        ratings,
        status: 'published'
      });
    }
    
    res.status(201).json({ success: true, data: expertReview });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// --- WALL OF LOVE ---

// @desc    Get curated Wall of Love content
// @route   GET /api/social-proof/wall-of-love
// @access  Public
exports.getWallOfLove = async (req, res) => {
  try {
    // Fetch 5-star verified reviews, preferably with media
    const reviews = await Review.find({ 
      status: 'approved',
      isVerifiedPurchase: true,
      'ratings.overall': 5
    })
    .populate('author', 'name')
    .sort('-createdAt')
    .limit(20);
    
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

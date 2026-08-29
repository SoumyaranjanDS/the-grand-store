const Review = require('../models/Review');
const QuestionAnswer = require('../models/QuestionAnswer');
const ExpertReview = require('../models/ExpertReview');
const Product = require('../models/Product');
const Vendor = require('../models/Vendor');
const Order = require('../models/Order');

const REVIEW_TYPES = ['product', 'vendor', 'event', 'estate'];

const resolveProduct = async (referenceId) => {
  const value = String(referenceId || '').trim();
  if (!value) return null;

  const candidates = [{ id: value }];
  if (Product.db.base.Types.ObjectId.isValid(value)) {
    candidates.push({ _id: value });
  }

  return Product.findOne({ $or: candidates }).select('_id id').lean();
};

const serializeReview = (review, viewerId = null) => {
  const value = typeof review.toObject === 'function' ? review.toObject() : { ...review };
  const helpfulBy = Array.isArray(value.helpfulBy) ? value.helpfulBy : [];
  const viewerKey = viewerId ? String(viewerId) : '';

  value.helpfulCount = helpfulBy.length;
  value.viewerFoundHelpful = Boolean(viewerKey && helpfulBy.some((id) => String(id) === viewerKey));
  delete value.helpfulBy;
  return value;
};

// --- REVIEWS ---

// @desc    Submit a review
// @route   POST /api/social-proof/reviews
// @access  Private
exports.submitReview = async (req, res) => {
  try {
    const { type, referenceId, ratings, comment, media, consentForMarketing } = req.body;
    const authorId = req.user._id;
    const overallRating = Number(ratings?.overall);
    const trimmedComment = String(comment || '').trim();

    if (!REVIEW_TYPES.includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid review type' });
    }
    if (!referenceId) {
      return res.status(400).json({ success: false, message: 'A product or listing reference is required' });
    }
    if (!Number.isFinite(overallRating) || overallRating < 1 || overallRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }
    if (trimmedComment.length < 3) {
      return res.status(400).json({ success: false, message: 'Please enter a review of at least 3 characters' });
    }

    let storedReferenceId = referenceId;
    let product = null;
    if (type === 'product') {
      product = await resolveProduct(referenceId);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      storedReferenceId = product._id;
    } else if (!Product.db.base.Types.ObjectId.isValid(String(referenceId))) {
      return res.status(400).json({ success: false, message: 'Invalid listing reference' });
    }

    // Determine if verified purchase
    let isVerifiedPurchase = false;
    if (type === 'product') {
      // Check if user has a completed order with this product
      const pastOrder = await Order.findOne({
        user: authorId,
        isDelivered: true,
        'orderItems.product': { $in: [String(referenceId), String(product._id)] }
      });
      if (pastOrder) isVerifiedPurchase = true;
    } else if (type === 'vendor') {
      // Check if user has bought from this vendor
      const pastOrder = await Order.findOne({
        user: authorId,
        isDelivered: true,
        'orderItems.vendorId': referenceId
      });
      if (pastOrder) isVerifiedPurchase = true;
    }

    const review = await Review.create({
      author: authorId,
      type,
      referenceId: storedReferenceId,
      isVerifiedPurchase,
      ratings: { ...ratings, overall: overallRating },
      comment: trimmedComment,
      media: Array.isArray(media) ? media : [],
      consentForMarketing,
      status: 'approved' // Automatically post as approved based on user feedback
    });

    // Keep product aggregate stats in sync before returning the new review.
    if (type === 'product') {
      await updateProductReviewStats(product._id);
    }

    await review.populate('author', 'name avatar');
    res.status(201).json({ success: true, data: serializeReview(review, authorId) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Unable to submit review' });
  }
};

// @desc    Get reviews for an entity
// @route   GET /api/social-proof/reviews/:type/:referenceId
// @access  Public
exports.getReviews = async (req, res) => {
  try {
    const { type, referenceId } = req.params;
    let storedReferenceId = referenceId;

    if (!REVIEW_TYPES.includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid review type' });
    }
    if (type === 'product') {
      const product = await resolveProduct(referenceId);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      storedReferenceId = product._id;
    } else if (!Product.db.base.Types.ObjectId.isValid(String(referenceId))) {
      return res.status(400).json({ success: false, message: 'Invalid listing reference' });
    }
    
    const reviews = await Review.find({ type, referenceId: storedReferenceId, status: 'approved' })
      .populate('author', 'name avatar') // Assuming user has name and avatar
      .sort('-createdAt');

    const data = reviews.map((review) => serializeReview(review));
    const averageRating = data.length
      ? data.reduce((sum, review) => sum + Number(review.ratings?.overall || 0), 0) / data.length
      : 0;
    res.status(200).json({ success: true, count: data.length, averageRating, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Unable to load reviews' });
  }
};

// Helper function to update Product aggregate stats
async function updateProductReviewStats(productObjectId) {
  try {
    const reviews = await Review.find({ type: 'product', referenceId: productObjectId, status: 'approved' });
    const sum = reviews.reduce((acc, review) => acc + Number(review.ratings?.overall || 0), 0);
    const averageRating = reviews.length ? Number((sum / reviews.length).toFixed(1)) : 0;
    await Product.findByIdAndUpdate(productObjectId, {
      averageRating,
      reviewCount: reviews.length
    });
  } catch (err) {
    console.error('Error updating product review stats:', err);
  }
}

// @desc    Toggle whether the signed-in customer found a review helpful
// @route   POST /api/social-proof/reviews/:id/helpful
// @access  Private
exports.toggleReviewHelpful = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review || review.status !== 'approved') {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const userId = String(req.user._id);
    const existingIndex = review.helpfulBy.findIndex((id) => String(id) === userId);
    const helpful = existingIndex === -1;
    if (helpful) review.helpfulBy.push(req.user._id);
    else review.helpfulBy.splice(existingIndex, 1);
    await review.save();

    res.json({ success: true, data: { helpful, helpfulCount: review.helpfulBy.length } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Unable to update helpful vote' });
  }
};

// --- PRODUCT Q&A ---

// @desc    Submit a question
// @route   POST /api/social-proof/questions
// @access  Private
exports.submitQuestion = async (req, res) => {
  try {
    const { productId, question } = req.body;
    const trimmedQuestion = String(question || '').trim();

    if (!productId) {
      return res.status(400).json({ success: false, message: 'A product reference is required' });
    }
    if (trimmedQuestion.length < 3) {
      return res.status(400).json({ success: false, message: 'Please enter a question of at least 3 characters' });
    }
    if (!await resolveProduct(productId)) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    const qa = await QuestionAnswer.create({
      productId: String(productId),
      asker: req.user._id,
      question: trimmedQuestion
    });

    await qa.populate('asker', 'name');
    res.status(201).json({ success: true, data: qa });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Unable to post question' });
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
    res.status(500).json({ success: false, message: 'Unable to load questions' });
  }
};

// @desc    Submit an answer to a question
// @route   POST /api/social-proof/questions/:id/answers
// @access  Private
exports.submitAnswer = async (req, res) => {
  try {
    const questionId = req.params.id;
    const text = String(req.body.text || '').trim();

    if (text.length < 2) {
      return res.status(400).json({ success: false, message: 'Please enter an answer' });
    }
    
    // Determine responder type
    let responderType = 'customer';
    if (['admin', 'super_admin', 'product_manager'].includes(req.user.role)) responderType = 'expert';
    else if (String(req.user.role).startsWith('vendor_')) responderType = 'vendor';
    
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
    res.status(500).json({ success: false, message: 'Unable to post answer' });
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

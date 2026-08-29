import React, { useEffect, useMemo, useState } from 'react';
import { Star, CheckCircle, Image as ImageIcon, Video, ThumbsUp, X } from 'lucide-react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const ReviewSection = ({ 
  productId,
  reviews = [], 
  averageRating = 0, 
  reviewCount = 0 
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [localReviews, setLocalReviews] = useState(reviews);
  const [helpfulLoading, setHelpfulLoading] = useState({});

  useEffect(() => {
    setLocalReviews(Array.isArray(reviews) ? reviews : []);
  }, [reviews]);

  const displayReviews = useMemo(() => {
    const filteredReviews = localReviews.filter((review) => {
      if (filter === 'with_media') return Array.isArray(review.media) && review.media.length > 0;
      if (filter === 'verified') return Boolean(review.isVerifiedPurchase);
      return true;
    });

    return [...filteredReviews].sort((left, right) => {
      if (sort === 'highest') return Number(right.ratings?.overall || 0) - Number(left.ratings?.overall || 0);
      if (sort === 'lowest') return Number(left.ratings?.overall || 0) - Number(right.ratings?.overall || 0);
      return new Date(right.createdAt || 0) - new Date(left.createdAt || 0);
    });
  }, [filter, localReviews, sort]);

  const summary = useMemo(() => {
    if (localReviews.length === 0) {
      return { average: Number(averageRating) || 0, count: Number(reviewCount) || 0 };
    }
    const total = localReviews.reduce((sum, review) => sum + Number(review.ratings?.overall || 0), 0);
    return { average: total / localReviews.length, count: localReviews.length };
  }, [averageRating, localReviews, reviewCount]);

  const handleWriteReviewClick = () => {
    if (!user) {
      navigate('/login?redirect=' + window.location.pathname);
      return;
    }
    setIsModalOpen(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!rating || !comment.trim()) {
      setSubmitError('Please provide both a rating and a comment.');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError('');
    setSuccessMessage('');
    
    try {
      const response = await api.post('/social-proof/reviews', {
        type: 'product',
        referenceId: productId,
        ratings: { overall: rating },
        comment: comment.trim()
      });

      if (!response.data?.success || !response.data?.data) {
        throw new Error('The review could not be saved');
      }

      setLocalReviews((current) => [response.data.data, ...current]);
      
      setIsModalOpen(false);
      setComment('');
      setRating(5);
      setSuccessMessage('Thank you. Your review is now published.');
    } catch (error) {
      console.error(error);
      setSubmitError(error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHelpful = async (reviewId) => {
    if (!user) {
      navigate('/login?redirect=' + window.location.pathname);
      return;
    }
    if (!reviewId || helpfulLoading[reviewId]) return;

    setHelpfulLoading((current) => ({ ...current, [reviewId]: true }));
    try {
      const response = await api.post(`/social-proof/reviews/${reviewId}/helpful`);
      const update = response.data?.data;
      if (response.data?.success && update) {
        setLocalReviews((current) => current.map((review) => review._id === reviewId
          ? { ...review, helpfulCount: update.helpfulCount, viewerFoundHelpful: update.helpful }
          : review));
      }
    } catch (error) {
      setSuccessMessage('');
      setSubmitError(error.response?.data?.message || 'Unable to update this review');
    } finally {
      setHelpfulLoading((current) => ({ ...current, [reviewId]: false }));
    }
  };

  return (
    <div className="review-section mt-12 sm:mt-16 relative">
      <div className="mb-10 flex flex-col gap-9 border-b border-white/10 pb-10 sm:mb-12 sm:pb-12 md:flex-row md:gap-12">
        {/* Aggregate Stats */}
        <div className="md:w-1/3 text-center md:text-left">
          <h2 className="mb-2 font-serif text-2xl sm:text-3xl">Customer Reviews</h2>
          <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
            <span className="text-5xl font-light text-gold-400">{Number(summary.average).toFixed(1)}</span>
            <div className="flex flex-col items-start">
              <div className="flex text-gold-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} fill={i < Math.round(summary.average) ? "currentColor" : "none"} />
                ))}
              </div>
              <span className="text-sm text-[var(--color-ivory-muted)] mt-1">Based on {summary.count} reviews</span>
            </div>
          </div>
          <button 
            className="button button-gold w-full mt-4" 
            onClick={handleWriteReviewClick}
          >
            Write a Review
          </button>
        </div>

        {/* Filters */}
        <div className="md:w-2/3 flex flex-col justify-end">
          <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-4">
            <span className="mr-2 w-full text-sm uppercase tracking-widest text-[var(--color-ivory-muted)] sm:mr-0 sm:w-auto">Filter:</span>
            <button 
              className={`rounded-full border px-3 py-2 text-xs sm:px-4 sm:text-sm ${filter === 'all' ? 'border-gold-500 bg-gold-500/10 text-gold-400' : 'border-white/20 hover:border-white/50'}`}
              onClick={() => setFilter('all')}
            >
              All Reviews
            </button>
            <button 
              className={`flex items-center gap-2 rounded-full border px-3 py-2 text-xs sm:px-4 sm:text-sm ${filter === 'with_media' ? 'border-gold-500 bg-gold-500/10 text-gold-400' : 'border-white/20 hover:border-white/50'}`}
              onClick={() => setFilter('with_media')}
            >
              <ImageIcon size={14} /> With Photos/Video
            </button>
            <button 
              className={`flex items-center gap-2 rounded-full border px-3 py-2 text-xs sm:px-4 sm:text-sm ${filter === 'verified' ? 'border-gold-500 bg-gold-500/10 text-gold-400' : 'border-white/20 hover:border-white/50'}`}
              onClick={() => setFilter('verified')}
            >
              <CheckCircle size={14} /> Verified Purchases
            </button>
            <label className="ml-0 flex w-full items-center gap-2 text-sm text-[var(--color-ivory-muted)] sm:ml-auto sm:w-auto">
              Sort:
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="border border-white/20 bg-[#0a0907] px-3 py-2 text-sm text-white outline-none focus:border-gold-500"
              >
                <option value="newest">Newest</option>
                <option value="highest">Highest rated</option>
                <option value="lowest">Lowest rated</option>
              </select>
            </label>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="mb-6 border border-emerald-400/25 bg-emerald-400/[0.07] px-4 py-3 text-sm text-emerald-300" role="status">
          {successMessage}
        </div>
      )}

      {/* Review List */}
      <div className="space-y-8">
        {displayReviews.length === 0 ? (
          <p className="text-center text-[var(--color-ivory-muted)] italic">No reviews yet.</p>
        ) : (
          displayReviews.map((review) => (
            <article key={review._id} className="border border-white/10 bg-white/5 p-4 sm:p-6">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center font-serif text-lg">
                    {review.author?.name ? review.author.name.charAt(0) : 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="break-words font-medium">{review.author?.name || 'Anonymous User'}</p>
                    {review.isVerifiedPurchase && (
                      <p className="text-xs text-gold-400 flex items-center gap-1 mt-0.5">
                        <CheckCircle size={12} /> Verified Purchase
                      </p>
                    )}
                  </div>
                </div>
                <div className="pl-[52px] text-left sm:pl-0 sm:text-right">
                  <div className="flex text-gold-400 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill={i < review.ratings?.overall ? "currentColor" : "none"} />
                    ))}
                  </div>
                  <span className="text-xs text-[var(--color-ivory-muted)]">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <p className="break-words text-[var(--color-ivory)] leading-relaxed">"{review.comment}"</p>
              </div>

              {/* Media gallery */}
              {review.media && review.media.length > 0 && (
                <div className="mt-6 flex gap-4 overflow-x-auto pb-2">
                  {review.media.map((item, idx) => (
                    <div key={idx} className="flex-shrink-0 relative group w-32 h-32 rounded bg-black">
                      {item.type === 'photo' ? (
                        <img src={item.url} alt={item.caption || 'Review photo'} className="w-full h-full object-cover rounded opacity-80 group-hover:opacity-100 transition-opacity" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-white/10 rounded border border-white/20">
                          <Video size={24} className="text-gold-400 mb-2" />
                          <span className="text-xs">Video</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 flex items-center justify-between text-xs text-[var(--color-ivory-muted)] pt-4 border-t border-white/5">
                <button
                  type="button"
                  disabled={Boolean(helpfulLoading[review._id])}
                  onClick={() => handleHelpful(review._id)}
                  className={`flex items-center gap-1.5 transition-colors disabled:opacity-50 ${review.viewerFoundHelpful ? 'text-gold-400' : 'hover:text-white'}`}
                >
                  <ThumbsUp size={14} fill={review.viewerFoundHelpful ? 'currentColor' : 'none'} /> Helpful ({review.helpfulCount || 0})
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Write Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 md:p-8 relative shadow-2xl">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            
            <h3 className="text-2xl font-serif mb-6 text-white">Write a Review</h3>
            
            {submitError && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 text-red-200 rounded text-sm">
                {submitError}
              </div>
            )}
            
            <form onSubmit={handleSubmitReview} className="space-y-6">
              <div>
                <label className="block text-sm text-white/70 mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star 
                        size={32} 
                        fill={star <= rating ? "#D4AF37" : "none"} 
                        className={star <= rating ? "text-[#D4AF37]" : "text-white/20"} 
                      />
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-white/70 mb-2">Your Review</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What did you think about this product?"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-white/30 focus:outline-none focus:border-gold-500/50 min-h-[120px]"
                  required
                />
              </div>
              
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="button button-gold w-full flex justify-center items-center gap-2"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewSection;

import React, { useState } from 'react';
import { Star, CheckCircle, Image as ImageIcon, Video, ThumbsUp } from 'lucide-react';

export const ReviewSection = ({ 
  reviews = [], 
  averageRating = 0, 
  reviewCount = 0 
}) => {
  const [filter, setFilter] = useState('all'); // 'all', 'with_media', 'verified'
  const [sort, setSort] = useState('newest'); // 'newest', 'highest', 'lowest'

  // Sort and filter logic would go here
  const displayReviews = [...reviews];

  return (
    <div className="review-section mt-12 sm:mt-16">
      <div className="mb-10 flex flex-col gap-9 border-b border-white/10 pb-10 sm:mb-12 sm:pb-12 md:flex-row md:gap-12">
        {/* Aggregate Stats */}
        <div className="md:w-1/3 text-center md:text-left">
          <h2 className="mb-2 font-serif text-2xl sm:text-3xl">Customer Reviews</h2>
          <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
            <span className="text-5xl font-light text-gold-400">{Number(averageRating).toFixed(1)}</span>
            <div className="flex flex-col items-start">
              <div className="flex text-gold-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} fill={i < Math.round(averageRating) ? "currentColor" : "none"} />
                ))}
              </div>
              <span className="text-sm text-[var(--color-ivory-muted)] mt-1">Based on {reviewCount} reviews</span>
            </div>
          </div>
          <button className="button button-gold w-full mt-4">Write a Review</button>
        </div>

        {/* Filters (Simplified for demo) */}
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
          </div>
        </div>
      </div>

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
                      <Star key={i} size={14} fill={i < review.ratings.overall ? "currentColor" : "none"} />
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
                <button className="flex items-center gap-1.5 hover:text-white transition-colors">
                  <ThumbsUp size={14} /> Helpful (0)
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewSection;

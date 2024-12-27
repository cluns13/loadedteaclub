'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';
import type { Review } from '@/types/models';
import { LoadingButton } from '../ui/LoadingButton';

interface ReviewSectionProps {
  businessId: string;
  reviews: Review[];
  showReviewForm?: boolean;
}

export default function ReviewSection({ businessId, reviews, showReviewForm }: ReviewSectionProps) {
  const { data: session } = useSession();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // TODO: Implement image upload
    console.log('Image upload not implemented yet');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!session) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId,
          rating,
          text: reviewText,
          images,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      // Reset form
      setRating(0);
      setReviewText('');
      setImages([]);
      
      // Refresh the page to show the new review
      window.location.reload();
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Reviews</h2>

      {/* Review Form */}
      {showReviewForm && session ? (
        <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Write a Review</h3>
          
          {/* Rating */}
          <div className="mb-4">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  onMouseEnter={() => setHoveredRating(value)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1"
                >
                  {value <= (hoveredRating || rating) ? (
                    <StarIcon className="h-8 w-8 text-yellow-400" />
                  ) : (
                    <StarIconOutline className="h-8 w-8 text-gray-300" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Review Text */}
          <div className="mb-4">
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Share your experience..."
              required
            />
          </div>

          {/* Image Upload */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Photos
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
          </div>

          <LoadingButton
            type="submit"
            isLoading={isSubmitting}
            disabled={isSubmitting || rating === 0 || !reviewText.trim()}
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </LoadingButton>
        </form>
      ) : showReviewForm ? (
        <div className="mb-8 text-center">
          <p className="text-gray-600 mb-4">Please sign in to write a review</p>
          <Link
            href="/login"
            className="inline-block px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Sign In
          </Link>
        </div>
      ) : null}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review._id.toString()} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {review.userImage ? (
                  <Image
                    src={review.userImage}
                    alt={review.userName}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-500 font-medium">
                      {review.userName.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{review.userName}</h4>
                    <div className="flex items-center mt-1">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`h-5 w-5 ${
                              i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="mt-2 text-gray-600">{review.text}</p>
                {review.images && review.images.length > 0 && (
                  <div className="mt-4 flex space-x-2">
                    {review.images.map((image, index) => (
                      <Image
                        key={index}
                        src={image}
                        alt={`Review image ${index + 1}`}
                        width={100}
                        height={100}
                        className="rounded-lg object-cover"
                      />
                    ))}
                  </div>
                )}
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <button className="flex items-center space-x-1 hover:text-gray-700">
                    <span>Helpful ({review.likes})</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

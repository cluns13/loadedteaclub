'use client';

import { useState, useEffect } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';

interface ReviewResponse {
  content: string;
  createdAt: string;
  updatedAt?: string;
}

interface Review {
  _id: string;
  businessId: string;
  userId: string;
  rating: number;
  title?: string;
  content: string;
  photos?: string[];
  helpful: number;
  reported: boolean;
  createdAt: string;
  updatedAt: string;
  response?: ReviewResponse;
  user: {
    name: string;
    image?: string;
  };
}

interface ReviewManagementProps {
  businessId: string;
}

export default function ReviewManagement({ businessId }: ReviewManagementProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [response, setResponse] = useState('');
  const [editingResponse, setEditingResponse] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'responded' | 'unresponded'>('all');
  const [sort, setSort] = useState<'newest' | 'oldest' | 'rating'>('newest');

  useEffect(() => {
    fetchReviews();
  }, [businessId]);

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/business/' + businessId + '/reviews');
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      const data = await response.json();
      setReviews(data.reviews);
    } catch (err) {
      setError('Failed to load reviews');
      console.error('Error fetching reviews:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitResponse = async (reviewId: string) => {
    try {
      const apiResponse = await fetch('/api/business/' + businessId + '/reviews/' + reviewId + '/response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: response }),
      });

      if (!apiResponse.ok) {
        throw new Error('Failed to submit response');
      }

      const data = await apiResponse.json();
      setReviews(reviews.map(review => 
        review._id === reviewId 
          ? { ...review, response: data.response }
          : review
      ));
      setResponse('');
      setRespondingTo(null);
    } catch (err) {
      console.error('Error submitting response:', err);
      setError('Failed to submit response');
    }
  };

  const handleUpdateResponse = async (reviewId: string) => {
    try {
      const apiResponse = await fetch('/api/business/' + businessId + '/reviews/' + reviewId + '/response', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: response }),
      });

      if (!apiResponse.ok) {
        throw new Error('Failed to update response');
      }

      const data = await apiResponse.json();
      setReviews(reviews.map(review => 
        review._id === reviewId 
          ? { ...review, response: data.response }
          : review
      ));
      setResponse('');
      setEditingResponse(null);
    } catch (err) {
      console.error('Error updating response:', err);
      setError('Failed to update response');
    }
  };

  const handleDeleteResponse = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this response?')) return;

    try {
      const apiResponse = await fetch('/api/business/' + businessId + '/reviews/' + reviewId + '/response', {
        method: 'DELETE',
      });

      if (!apiResponse.ok) {
        throw new Error('Failed to delete response');
      }

      setReviews(reviews.map(review => 
        review._id === reviewId 
          ? { ...review, response: undefined }
          : review
      ));
    } catch (err) {
      console.error('Error deleting response:', err);
      setError('Failed to delete response');
    }
  };

  const filteredReviews = reviews.filter(review => {
    if (filter === 'responded') return review.response;
    if (filter === 'unresponded') return !review.response;
    return true;
  }).sort((a, b) => {
    if (sort === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sort === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return b.rating - a.rating;
  });

  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-1/4"></div>
      <div className="h-64 bg-gray-200 rounded"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-600">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
          >
            <option value="all">All Reviews</option>
            <option value="responded">Responded</option>
            <option value="unresponded">Needs Response</option>
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="rating">Rating</option>
          </select>
        </div>
        <div className="text-sm text-gray-500">
          {filteredReviews.length} reviews
        </div>
      </div>

      <div className="space-y-6">
        {filteredReviews.map((review) => (
          <div key={review._id} className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              {/* Review Content */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {review.user.image ? (
                    <Image
                      src={review.user.image}
                      alt={review.user.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-500 font-medium">
                        {review.user.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{review.user.name}</h4>
                      <div className="flex items-center mt-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`h-5 w-5 ${
                              i < review.rating ? 'text-yellow-400' : 'text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <time className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </time>
                  </div>
                  {review.title && (
                    <p className="mt-2 font-medium text-gray-900">{review.title}</p>
                  )}
                  <p className="mt-2 text-gray-600">{review.content}</p>
                  {review.photos && review.photos.length > 0 && (
                    <div className="mt-4 flex space-x-2">
                      {review.photos.map((photo, index) => (
                        <Image
                          key={index}
                          src={photo}
                          alt={`Review photo ${index + 1}`}
                          width={100}
                          height={100}
                          className="rounded-md object-cover"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Owner Response */}
              {review.response && editingResponse !== review._id ? (
                <div className="mt-4 pl-14">
                  <div className="bg-gray-50 rounded-md p-4">
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-medium text-gray-900">Owner Response</h5>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setEditingResponse(review._id);
                            setResponse(review.response!.content);
                          }}
                          className="text-sm text-gray-600 hover:text-gray-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteResponse(review._id)}
                          className="text-sm text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      {review.response.content}
                    </p>
                    <time className="mt-1 block text-xs text-gray-500">
                      Responded on {new Date(review.response.createdAt).toLocaleDateString()}
                      {review.response.updatedAt && ' (edited)'}
                    </time>
                  </div>
                </div>
              ) : (
                (respondingTo === review._id || editingResponse === review._id) && (
                  <div className="mt-4 pl-14">
                    <textarea
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      rows={3}
                      placeholder="Write your response..."
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                    />
                    <div className="mt-2 flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          setRespondingTo(null);
                          setEditingResponse(null);
                          setResponse('');
                        }}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (editingResponse) {
                            handleUpdateResponse(review._id);
                          } else {
                            handleSubmitResponse(review._id);
                          }
                        }}
                        disabled={!response.trim()}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                      >
                        {editingResponse ? 'Update Response' : 'Submit Response'}
                      </button>
                    </div>
                  </div>
                )
              )}

              {/* Response Button */}
              {!review.response && respondingTo !== review._id && (
                <div className="mt-4 pl-14">
                  <button
                    onClick={() => setRespondingTo(review._id)}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Respond to Review
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

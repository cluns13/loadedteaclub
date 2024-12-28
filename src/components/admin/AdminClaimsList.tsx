'use client';

import { useState, useEffect } from 'react';
import { ClaimStatus, VerificationStep, VerificationMethod } from '@/types/claims';
import { format, parseISO } from 'date-fns';
import { toast } from 'react-hot-toast';
import { ObjectId } from 'mongodb';

// Define types for business claim
type BusinessClaim = {
  _id?: ObjectId;
  business?: {
    name: string;
    address: string;
    city: string;
    state: string;
  };
  claimant?: {
    name: string;
    email: string;
  };
  createdAt?: Date;
  verificationSteps?: VerificationStep[];
  documents?: {
    [key: string]: string;
  };
};

const VERIFICATION_METHODS: VerificationMethod[] = [
  'documents', 
  'ownership_verification', 
  'menu', 
  'phone', 
  'email'
];

const formatDate = (date: Date | string): string => {
  try {
    return format(new Date(date), 'PPp');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

const safeToString = (id: ObjectId | string | undefined): string => {
  if (!id) return '';
  return typeof id === 'string' ? id : id.toString();
};

export default function AdminClaimsList() {
  const [claims, setClaims] = useState<BusinessClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState<BusinessClaim | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      const response = await fetch('/api/admin/claims?status=pending');
      const data = await response.json();
      
      if (data.claims) {
        setClaims(data.claims);
      } else {
        throw new Error('No claims data received');
      }
    } catch (error) {
      console.error('Error fetching claims:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load claims');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationStep = async (claimId: string, method: VerificationMethod, status: 'in_progress' | 'completed' | 'failed') => {
    try {
      const response = await fetch('/api/admin/verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          claimId,
          method,
          status
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`Verification ${status} for ${method}`);
        fetchClaims(); // Refresh claims
      } else {
        throw new Error(data.error || 'Failed to update verification');
      }
    } catch (error) {
      console.error('Error updating verification:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update verification');
    }
  };

  const handleClaimReview = async (action: 'approve' | 'reject') => {
    if (!selectedClaim) return;

    setSubmittingReview(true);
    try {
      const response = await fetch('/api/admin/claims/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          claimId: safeToString(selectedClaim._id),
          action,
          reviewNotes,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`Claim ${action}d successfully`);
        setSelectedClaim(null);
        setReviewNotes('');
        fetchClaims();
      } else {
        throw new Error(data.error || 'Failed to process review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const getVerificationStepColor = (step: VerificationStep) => {
    switch(step.status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Pending Claims</h2>
      
      {claims.length === 0 ? (
        <p>No pending claims</p>
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => (
            <div key={safeToString(claim._id)} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold">{claim.business?.name}</h3>
                  <p className="text-gray-600">
                    {claim.business?.address}, {claim.business?.city}, {claim.business?.state}
                  </p>
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">
                      Claimed by: {claim.claimant?.name} ({claim.claimant?.email})
                    </p>
                    <p className="text-sm text-gray-600">
                      Submitted: {formatDate(claim.createdAt)}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => setSelectedClaim(claim)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Review Claim
                </button>
              </div>

              {/* Verification Steps */}
              <div className="mt-4">
                <h4 className="font-medium mb-2">Verification Steps</h4>
                <div className="space-y-2">
                  {claim.verificationSteps?.map((step) => (
                    <div 
                      key={step.method} 
                      className={`p-2 rounded flex justify-between items-center ${getVerificationStepColor(step)}`}
                    >
                      <span>{step.method.replace('_', ' ')}</span>
                      <span>{step.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Claim Documents */}
              <div className="mt-4">
                <h4 className="font-medium mb-2">Uploaded Documents</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(claim.documents || {})
                    .filter(([key, value]) => value && key !== 'additionalDocuments')
                    .map(([key, value]) => (
                      <a 
                        href={value as string} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        key={key}
                        className="bg-blue-50 p-2 rounded hover:bg-blue-100 text-blue-700"
                      >
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </a>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Claim Review Modal */}
      {selectedClaim && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Review Claim</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block mb-2 font-medium">Review Notes</label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full p-2 border rounded"
                  rows={4}
                  placeholder="Enter any additional notes for this claim review"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setSelectedClaim(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleClaimReview('reject')}
                  disabled={submittingReview}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  Reject Claim
                </button>
                <button
                  onClick={() => handleClaimReview('approve')}
                  disabled={submittingReview}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  Approve Claim
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

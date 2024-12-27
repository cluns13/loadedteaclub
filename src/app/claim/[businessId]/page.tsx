'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import FileUpload from '@/components/FileUpload/FileUpload';
import { toast } from 'react-hot-toast';

interface ClaimFormData {
  businessLicense: string | null;
  proofOfOwnership: string | null;
  governmentId: string | null;
  utilityBill: string | null;
  additionalNotes: string;
}

export default function ClaimBusinessPage({ 
  params 
}: { 
  params: { businessId: string } 
}) {
  const router = useRouter();
  const [formData, setFormData] = useState<ClaimFormData>({
    businessLicense: null,
    proofOfOwnership: null,
    governmentId: null,
    utilityBill: null,
    additionalNotes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle browser back/refresh
  const handleBeforeUnload = useCallback((e: BeforeUnloadEvent) => {
    if (formData.businessLicense || formData.proofOfOwnership || formData.governmentId || formData.utilityBill) {
      e.preventDefault();
      e.returnValue = '';
    }
  }, [formData]);

  React.useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [handleBeforeUnload]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required files
      const missingDocs = [];
      if (!formData.businessLicense) missingDocs.push('Business License');
      if (!formData.proofOfOwnership) missingDocs.push('Proof of Ownership');
      if (!formData.governmentId) missingDocs.push('Government ID');

      if (missingDocs.length > 0) {
        throw new Error(`Please upload the following required documents: ${missingDocs.join(', ')}`);
      }

      const response = await fetch('/api/business/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId: params.businessId,
          ...formData,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit claim');
      }

      toast.success('Claim submitted successfully!');
      router.push(`/claim/${params.businessId}/confirmation?claimId=${data.claimId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit claim');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (formData.businessLicense || formData.proofOfOwnership || formData.governmentId || formData.utilityBill) {
      if (window.confirm('Are you sure you want to cancel? All uploaded documents will be lost.')) {
        router.back();
      }
    } else {
      router.back();
    }
  };

  const handleUploadComplete = (field: keyof ClaimFormData) => (url: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: url
    }));
    toast.success(`${field} uploaded successfully`);
  };

  const handleUploadError = (error: Error) => {
    toast.error(error.message);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">Claim Your Business</h1>
            <p className="text-gray-600">
              To verify your ownership, please provide the following documents. All files should be clear and legible.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <FileUpload
              purpose="claim"
              label="Business License or Registration"
              helpText="Upload a clear photo or scan of your business license"
              required
              onUploadComplete={handleUploadComplete('businessLicense')}
              onUploadError={handleUploadError}
            />

            <FileUpload
              purpose="claim"
              label="Proof of Ownership"
              helpText="Documents showing you own or are authorized to represent this business"
              required
              onUploadComplete={handleUploadComplete('proofOfOwnership')}
              onUploadError={handleUploadError}
            />

            <FileUpload
              purpose="claim"
              label="Government-issued ID"
              helpText="A valid government-issued photo ID"
              required
              onUploadComplete={handleUploadComplete('governmentId')}
              onUploadError={handleUploadError}
            />

            <FileUpload
              purpose="claim"
              label="Utility Bill or Lease Agreement"
              helpText="Recent utility bill or lease agreement showing business address"
              onUploadComplete={handleUploadComplete('utilityBill')}
              onUploadError={handleUploadError}
            />

            <div>
              <label 
                htmlFor="additional-notes"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Additional Notes
              </label>
              <textarea
                id="additional-notes"
                value={formData.additionalNotes}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  additionalNotes: e.target.value
                }))}
                rows={4}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Any additional information you'd like to provide..."
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 text-sm text-white bg-green-600 rounded-md hover:bg-green-700 ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Claim'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

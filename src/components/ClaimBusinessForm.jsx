import { useState } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import FileUpload from './FileUpload';
import { useFileUpload } from '@/hooks/useFileUpload';

export default function ClaimBusinessForm({ business, onClose }) {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { uploadedFiles, handleUploadComplete, clearFiles } = useFileUpload();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session) {
      toast.error('Please sign in to claim this business');
      return;
    }

    if (uploadedFiles.length === 0) {
      toast.error('Please upload at least one document to verify your ownership');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/claims/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId: business._id,
          documents: uploadedFiles,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit claim');
      }

      toast.success('Claim submitted successfully');
      clearFiles();
      onClose();
    } catch (error) {
      console.error('Claim submission error:', error);
      toast.error(error.message || 'Error submitting claim');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">
        Claim {business.name}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Verification Documents
          </label>
          <p className="text-sm text-gray-500 mb-4">
            Please upload documents that prove your ownership of this business
            (e.g., business license, utility bill, or other official documents)
          </p>
          
          <FileUpload
            purpose="claim"
            onUploadComplete={handleUploadComplete}
          />

          {uploadedFiles.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Uploaded Documents:
              </h3>
              <ul className="text-sm text-gray-600">
                {uploadedFiles.map((fileKey, index) => (
                  <li key={fileKey} className="mb-1">
                    Document {index + 1}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || uploadedFiles.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Claim'}
          </button>
        </div>
      </form>
    </div>
  );
}

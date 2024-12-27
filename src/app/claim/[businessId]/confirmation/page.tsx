'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function ClaimConfirmationPage() {
  const searchParams = useSearchParams();
  const claimId = searchParams.get('claimId');
  const [timeLeft, setTimeLeft] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Claim Submitted Successfully!
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Your claim request has been submitted and is pending review.
              {claimId && (
                <>
                  <br />
                  Claim ID: <span className="font-mono">{claimId}</span>
                </>
              )}
            </p>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                What happens next?
              </p>
              <ol className="list-decimal text-left text-sm text-gray-600 pl-5 space-y-2">
                <li>Our team will review your submitted documents</li>
                <li>We may contact you for additional verification</li>
                <li>You'll receive an email with the review decision</li>
                <li>If approved, you'll get access to manage your business listing</li>
              </ol>
              <div className="mt-6 space-y-4">
                <Link
                  href="/dashboard"
                  className="block w-full text-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Go to Dashboard
                </Link>
                <p className="text-sm text-gray-500">
                  Redirecting to dashboard in {timeLeft} seconds...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-red-100">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="mb-4 text-2xl font-bold text-gray-900">Something went wrong!</h1>
            <p className="mb-8 text-gray-600">
              We apologize for the inconvenience. Please try again later.
            </p>
            <button
              onClick={reset}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-full hover:bg-red-700 transition-colors duration-200 ease-in-out"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

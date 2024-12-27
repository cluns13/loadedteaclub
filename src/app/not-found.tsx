import Link from 'next/link';
import { MapPin } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-gray-100">
          <MapPin className="w-8 h-8 text-gray-600" />
        </div>
        <h1 className="mb-4 text-2xl font-bold text-gray-900">Page Not Found</h1>
        <p className="mb-8 text-gray-600">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link href="/" className="btn-primary">
          Go back home
        </Link>
      </div>
    </div>
  );
}

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold mb-6">
        No Loaded Tea Locations Found
      </h1>
      <p className="text-lg mb-8">
        We couldn't find any loaded tea or nutrition clubs in this location yet.
        Want to add your business? 
      </p>
      <div className="space-x-4">
        <Link 
          href="/"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Search Other Locations
        </Link>
        <Link
          href="/business/register"
          className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
        >
          Add Your Business
        </Link>
      </div>
    </div>
  );
}

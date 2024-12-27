export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-gray-200"></div>
        <div className="w-12 h-12 rounded-full border-4 border-green-600 border-t-transparent animate-spin absolute top-0"></div>
      </div>
    </div>
  );
}

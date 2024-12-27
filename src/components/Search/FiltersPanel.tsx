'use client'

interface FiltersPanelProps {
  isOpen: boolean;
}

export default function FiltersPanel({ isOpen }: FiltersPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="mt-4 p-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Open Now
        </label>
        <select className="w-full rounded-lg border border-gray-200 py-2 px-3">
          <option value="">Any time</option>
          <option value="open">Open now</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Rating
        </label>
        <select className="w-full rounded-lg border border-gray-200 py-2 px-3">
          <option value="">Any rating</option>
          <option value="4">4+ stars</option>
          <option value="3">3+ stars</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Price
        </label>
        <select className="w-full rounded-lg border border-gray-200 py-2 px-3">
          <option value="">Any price</option>
          <option value="low">$</option>
          <option value="medium">$$</option>
          <option value="high">$$$</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Features
        </label>
        <select className="w-full rounded-lg border border-gray-200 py-2 px-3">
          <option value="">Any features</option>
          <option value="wifi">Free WiFi</option>
          <option value="parking">Parking</option>
          <option value="delivery">Delivery</option>
        </select>
      </div>
    </div>
  );
}

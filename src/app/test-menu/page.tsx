import { notFound } from 'next/navigation';
import MenuDisplay from '@/components/business/MenuDisplay';
import MenuUploader from '@/components/business/MenuUploader';

// Only allow test mode in development
const isTestMode = process.env.NODE_ENV === 'development';

// Sample menu data for testing
const sampleMenu = {
  categories: [
    {
      id: '1',
      businessId: 'test-business',
      name: 'Loaded Teas',
      description: 'Our signature loaded teas',
      order: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [
        {
          id: '1',
          categoryId: '1',
          name: 'Mermaid Tea',
          description: 'Blue raspberry and coconut loaded tea',
          price: 7.50,
          calories: 24,
          ingredients: JSON.stringify(['Blue Raspberry', 'Coconut', 'Green Tea']),
          energyLevel: 'High',
          isPopular: true,
          isSugarFree: false,
          hasCustomizableEnergy: true,
          hasSugarFreeOption: true,
          isActive: true,
          order: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          categoryId: '1',
          name: 'Unicorn Tea',
          description: 'Strawberry and cotton candy loaded tea',
          price: 7.50,
          calories: 28,
          ingredients: JSON.stringify(['Strawberry', 'Cotton Candy', 'Green Tea']),
          energyLevel: 'High',
          isPopular: true,
          isSugarFree: false,
          hasCustomizableEnergy: true,
          hasSugarFreeOption: true,
          isActive: true,
          order: 2,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
    },
    {
      id: '2',
      businessId: 'test-business',
      name: 'Shakes',
      description: 'Protein-packed shakes',
      order: 2,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [
        {
          id: '3',
          categoryId: '2',
          name: 'Chocolate Shake',
          description: 'Rich chocolate protein shake',
          price: 8.00,
          calories: 240,
          ingredients: JSON.stringify(['Chocolate Protein', 'Almond Milk', 'Banana']),
          energyLevel: 'Medium',
          isPopular: true,
          isSugarFree: false,
          hasCustomizableEnergy: false,
          hasSugarFreeOption: true,
          isActive: true,
          order: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
    }
  ]
};

const businessId = 'test-business';

export default function TestMenuPage() {
  if (!isTestMode) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Menu Preview</h1>
          
          {/* Menu Display */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer View</h2>
            <div className="bg-white shadow rounded-lg p-6">
              <MenuDisplay categories={sampleMenu.categories} />
            </div>
          </div>

          {/* Menu Uploader */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Business Owner View</h2>
            <div className="bg-white shadow rounded-lg p-6">
              <MenuUploader businessId={businessId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

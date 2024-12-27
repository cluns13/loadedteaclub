import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';

export async function POST() {
  try {
    const db = await getDb();
    
    const mockBusiness = {
      _id: new ObjectId(),
      id: new ObjectId().toString(),
      name: "Cody's Nutrition",
      address: "125 King Street, St. Augustine, FL 32084",
      location: {
        lat: 29.8946,  // St. Augustine coordinates
        lng: -81.3145
      },
      rating: 4.8,
      reviewCount: 42,
      photos: [
        "https://images.unsplash.com/photo-1544025162-d76694265947",
        "https://images.unsplash.com/photo-1606767341197-ef30b5b0a2d5",
        "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e"
      ],
      isOpen: true,
      types: ["loaded_tea", "nutrition_club", "health_food"],
      distance: 0,
      placeId: "mock_place_id",
      city: "St. Augustine",
      state: "FL",
      zipCode: "32084",
      phone: "(904) 555-0123",
      website: "https://codys-nutrition.com",
      description: "St. Augustine's premier loaded tea and nutrition club, offering energizing beverages and healthy alternatives for the community.",
      hours: {
        monday: "7:00 AM - 7:00 PM",
        tuesday: "7:00 AM - 7:00 PM",
        wednesday: "7:00 AM - 7:00 PM",
        thursday: "7:00 AM - 7:00 PM",
        friday: "7:00 AM - 8:00 PM",
        saturday: "8:00 AM - 6:00 PM",
        sunday: "9:00 AM - 5:00 PM"
      },
      menu: [
        {
          name: "Island Paradise",
          description: "Tropical loaded tea with pineapple, coconut, and natural energy boosters",
          category: "DRINKS",
          price: "8.99",
          popular: true,
          benefits: ["Energy", "Focus", "Metabolism"]
        },
        {
          name: "Blue Lightning",
          description: "Blue raspberry loaded tea with B-vitamins and natural caffeine",
          category: "DRINKS",
          price: "8.99",
          benefits: ["Energy", "Hydration"]
        },
        {
          name: "Protein Paradise",
          description: "Vanilla protein shake with 24g protein and almond milk",
          category: "SHAKES",
          price: "9.99",
          benefits: ["Protein", "Muscle Recovery"]
        }
      ],
      amenities: [
        "Free WiFi",
        "Outdoor Seating",
        "Contactless Payment",
        "Curbside Pickup"
      ],
      isClaimed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('businesses').insertOne(mockBusiness);
    
    return NextResponse.json({
      success: true,
      businessId: mockBusiness.id,
      message: "Mock business created successfully"
    });
    
  } catch (error) {
    console.error('Error creating mock business:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create mock business' },
      { status: 500 }
    );
  }
}

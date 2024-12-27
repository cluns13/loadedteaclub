import { getDb } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';
import { notFound } from 'next/navigation';
import BusinessDetails from '@/components/business/BusinessDetails';
import ReviewSection from '@/components/business/ReviewSection';
import type { LoadedTeaClub, Review, MenuItem, BusinessPromotion, BusinessHours } from '@/types/models';

interface PageProps {
  params: {
    id: string;
  };
  searchParams: {
    review?: string;
  };
}

async function getBusinessWithReviews(id: string) {
  const db = await getDb();

  // Get business details
  const business = await db.collection<LoadedTeaClub>('businesses').findOne({
    _id: new ObjectId(id)
  });

  if (!business) {
    return null;
  }

  // Get reviews
  const reviews = await db.collection<Review>('reviews')
    .aggregate([
      {
        $match: {
          businessId: new ObjectId(id),
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $project: {
          id: { $toString: '$_id' },
          userId: { $toString: '$userId' },
          businessId: { $toString: '$businessId' },
          rating: 1,
          comment: 1,
          createdAt: 1,
          user: {
            name: '$user.name',
            image: '$user.image',
          },
        },
      },
    ])
    .toArray();

  const transformedReviews: Review[] = reviews.map(review => ({
    id: review.id,
    userId: review.userId,
    businessId: review.businessId,
    rating: review.rating,
    text: review.comment,
    createdAt: review.createdAt,
    userName: review.user.name,
    userImage: review.user.image,
  }));

  return {
    ...business,
    id: business._id.toString(),
    reviews: transformedReviews,
  };
}

export default async function BusinessPage({ params, searchParams }: PageProps) {
  const data = await getBusinessWithReviews(params.id);

  if (!data) {
    notFound();
  }

  // Add sample menu items for testing
  const sampleMenuItems: MenuItem[] = [
    {
      id: '1',
      name: 'Energy Boost Tea',
      description: 'A powerful blend of green tea and natural energizers',
      price: 5.99,
      category: 'energy',
      benefits: ['Energy', 'Focus', 'Metabolism'],
      calories: 15,
      caffeine: 85,
    },
    {
      id: '2',
      name: 'Beauty Glow Tea',
      description: 'Herbal blend for skin health and natural radiance',
      price: 6.99,
      category: 'beauty',
      benefits: ['Skin Health', 'Anti-aging', 'Hydration'],
      calories: 5,
      caffeine: 0,
    },
    {
      id: '3',
      name: 'Wellness Warrior',
      description: 'Immune-boosting blend with antioxidants',
      price: 6.49,
      category: 'wellness',
      benefits: ['Immunity', 'Antioxidants', 'Vitality'],
      calories: 10,
      caffeine: 30,
    },
  ];

  // Add sample promotion for testing
  const samplePromotion: BusinessPromotion = {
    id: 'promo1',
    text: '🎉 Holiday Special: Buy any 2 loaded teas, get 1 free! Valid until Jan 1st',
    active: true,
    startDate: '2023-12-20',
    endDate: '2024-01-01',
  };

  // Add sample hours for testing
  const sampleHours: BusinessHours = {
    monday: { open: '9:00', close: '18:00' },
    tuesday: { open: '9:00', close: '18:00' },
    wednesday: { open: '9:00', close: '18:00' },
    thursday: { open: '9:00', close: '18:00' },
    friday: { open: '9:00', close: '18:00' },
    saturday: { open: '10:00', close: '16:00' },
    sunday: { open: '10:00', close: '16:00' },
  };

  // Transform MongoDB document to LoadedTeaClub type
  const businessData: LoadedTeaClub = {
    ...data,
    menuItems: sampleMenuItems,
    currentPromotion: samplePromotion,
    featuredItemIds: ['1', '3'], // Feature the Energy Boost and Wellness Warrior teas
    hours: sampleHours,
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <BusinessDetails business={businessData} isBusinessOwner={false} />
    </main>
  );
}

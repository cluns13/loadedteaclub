'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star, MapPin, Phone, Clock, BadgeCheck, Heart } from 'lucide-react';
import { Business } from '@prisma/client';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

interface BusinessCardProps {
  business: Business & {
    _count?: {
      reviews: number
    }
    isOpen?: boolean
    distance?: number
    images?: string[]
    rating?: number
    reviewCount?: number
  }
  onSave?: (businessId: string) => void
  isSaved?: boolean
}

export default function BusinessCard({ business, onSave, isSaved = false }: BusinessCardProps) {
  const { data: session } = useSession();
  const [isHovered, setIsHovered] = useState(false);
  const [localSaved, setLocalSaved] = useState(isSaved);

  const handleSave = () => {
    if (!session) {
      localStorage.setItem('saveIntent', business.id.toString());
      window.location.href = '/login?redirect=' + encodeURIComponent('/discover');
      return;
    }
    setLocalSaved(!localSaved);
    onSave?.(business.id.toString());
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden border border-gray-100"
    >
      <div className="relative h-48 group">
        <Image
          src={business.images?.[0] || '/placeholder-shop.jpg'}
          alt={business.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="absolute top-4 right-4 flex gap-2">
          {business.isVerified && (
            <div className="bg-green-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full flex items-center gap-1 text-sm">
              <BadgeCheck className="w-4 h-4" />
              <span>Verified</span>
            </div>
          )}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSave}
            className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
              localSaved 
                ? 'bg-red-500/90 text-white' 
                : 'bg-black/20 text-white hover:bg-black/40'
            }`}
          >
            <Heart className={`w-5 h-5 ${localSaved ? 'fill-current' : ''}`} />
          </motion.button>
        </div>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-900 hover:text-green-600 transition-colors">
            <Link href={'/business/' + business.id}>{business.name}</Link>
          </h3>
          <div className="flex items-center gap-1">
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
            <span className="font-semibold">{business._count?.reviews || 0}</span>
            <span className="text-gray-500 text-sm">({business._count?.reviews || 0})</span>
          </div>
        </div>

        <div className="space-y-2 text-gray-600">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-sm">
              {business.address}, {business.city}, {business.state} {business.zipCode}
            </span>
          </div>
          {business.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{business.phone}</span>
            </div>
          )}
          {/* Hours section removed temporarily until business hours are added to the schema */}
          <div className="mt-4 flex gap-4">
            <motion.div 
              className="mt-6 grid grid-cols-2 gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <Link
                href={'/business/' + business.id}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                View Details
              </Link>
              <Link
                href={'https://maps.google.com/?q=' + encodeURIComponent(business.address + ' ' + business.city + ' ' + business.state + ' ' + business.zipCode)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors"
              >
                <MapPin className="w-4 h-4" />
                Directions
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

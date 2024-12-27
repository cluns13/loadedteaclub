'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin } from 'lucide-react';
import { LocationService } from '@/lib/services';

interface LocationCardProps {
  city: string;
  state: string;
  count: number;
  image?: string;
}

export function LocationCard({ city, state, count, image }: LocationCardProps) {
  const locationUrl = LocationService.formatLocationUrl(city, state);

  return (
    <Link href={locationUrl}>
      <div className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={image || `/images/locations/default.jpg`}
            alt={`${city}, ${state}`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative p-6 flex flex-col h-48 justify-end">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-4 w-4 text-[var(--primary)]" />
            <p className="text-sm font-medium text-[var(--primary)]">
              {count} {count === 1 ? 'location' : 'locations'}
            </p>
          </div>
          
          <h3 className="text-xl font-bold text-white mb-1 group-hover:text-[var(--primary)] transition-colors">
            {city}
          </h3>
          <p className="text-sm text-white/80">
            {state}
          </p>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#24C6DC]/20 to-[#514A9D]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </div>
    </Link>
  );
}

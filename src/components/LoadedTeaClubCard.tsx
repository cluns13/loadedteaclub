import React from 'react';
import { LoadedTeaClub } from '@/types/models';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { MapPin } from 'lucide-react';

interface LoadedTeaClubCardProps {
  club: LoadedTeaClub;
}

export function LoadedTeaClubCard({ club }: LoadedTeaClubCardProps) {
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(club.address)}`;
  
  return (
    <Card className="w-full overflow-hidden hover:shadow-lg transition-all duration-300 gradient-border">
      <div className="relative aspect-square w-full">
        {club.photos && club.photos.length > 0 ? (
          <Image
            src={club.photos[0]}
            alt={club.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-[hsl(var(--secondary))] flex items-center justify-center">
            <span className="text-[hsl(var(--muted-foreground))]">No image available</span>
          </div>
        )}
      </div>
      <div className="p-6 glass-morphism">
        <h3 className="gradient-text text-xl mb-2 line-clamp-1">{club.name}</h3>
        <p className="text-[hsl(var(--muted-foreground))] text-sm line-clamp-2 mb-4">{club.address}</p>
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {club.rating && club.rating > 0 && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-800">
                ⭐️ {club.rating.toFixed(1)} {club.reviewCount && `(${club.reviewCount})`}
              </span>
            )}
            {club.isOpen && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-800">
                Open Now
              </span>
            )}
          </div>
          <Link 
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[hsl(var(--primary))] text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <MapPin className="w-4 h-4" />
            Directions
          </Link>
        </div>
      </div>
    </Card>
  );
}

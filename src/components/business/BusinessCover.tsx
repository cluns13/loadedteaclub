'use client';

import Image from 'next/image';
import { PhotoIcon } from '@heroicons/react/24/outline';

interface BusinessCoverProps {
  businessName: string;
  coverPhoto?: string;
  height?: string;
}

// Function to generate a unique gradient based on business name
const generateGradient = (name: string) => {
  // Generate hues based on the business name
  const hue1 = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360;
  const hue2 = (hue1 + 40) % 360; // Complementary hue
  const hue3 = (hue1 + 80) % 360; // Triadic hue

  // Create HSL colors with consistent saturation and lightness
  const color1 = `hsl(${hue1}, 70%, 65%)`;
  const color2 = `hsl(${hue2}, 65%, 60%)`;
  const color3 = `hsl(${hue3}, 60%, 55%)`;

  return `linear-gradient(135deg, ${color1}, ${color2}, ${color3})`;
};

export default function BusinessCover({ 
  businessName, 
  coverPhoto, 
  height = "h-64" 
}: BusinessCoverProps) {
  const gradient = generateGradient(businessName);

  return (
    <div 
      className={`relative ${height} transition-all duration-500`}
      style={{ background: !coverPhoto ? gradient : undefined }}
    >
      {coverPhoto ? (
        <>
          {/* Overlay gradient */}
          <div 
            className="absolute inset-0 opacity-20 mix-blend-overlay transition-opacity duration-500"
            style={{ background: gradient }}
          />
          
          {/* Cover photo */}
          <Image
            src={coverPhoto}
            alt={businessName}
            fill
            className="object-cover transition-opacity duration-500"
            sizes="100vw"
          />
          
          {/* Bottom gradient overlay */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent"
          />
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <PhotoIcon className="h-16 w-16 mx-auto mb-2 opacity-50" />
            <h2 className="text-2xl font-bold">{businessName}</h2>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { QRCodeGenerator } from '@/lib/utils/qrCodeGenerator';
import { GeolocationService } from '@/lib/utils/geolocationUtils';
import { 
  CustomerCheckInService 
} from '@/lib/services/customerCheckInService';
import { 
  ClubLocation 
} from '@/lib/services/locationVerificationService';
import { toast } from 'sonner';
import Image from 'next/image';

export function CustomerCheckInComponent() {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [nearbyCubs, setNearbyCubs] = useState<ClubLocation[]>([]);
  const [selectedClub, setSelectedClub] = useState<ClubLocation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [customerQrCode, setCustomerQrCode] = useState<string | null>(null);

  // Request user's location
  useEffect(() => {
    GeolocationService.getCurrentLocation()
      .then((position) => {
        setLocation(position);
        return CustomerCheckInService.findNearbyCubs(position);
      })
      .then(setNearbyCubs)
      .catch((error) => {
        toast.error('Location Error', {
          description: error.message
        });
      });
  }, []);

  const handleClubSelection = async (club: ClubLocation) => {
    setSelectedClub(club);
    setIsLoading(true);

    try {
      // Assuming we have global customer ID from auth context
      const { localCustomerId, isNewMember } = await CustomerCheckInService.checkIn(
        'GLOBAL_CUSTOMER_ID', // Replace with actual global customer ID
        club.clubId,
        location!
      );

      // Generate QR Code for local customer ID
      const qrCodeUrl = await QRCodeGenerator.generateCustomerIdQR(
        localCustomerId, 
        club.clubId
      );

      setCustomerQrCode(qrCodeUrl);

      toast.success(
        isNewMember 
          ? 'Welcome to the club!' 
          : 'Successfully checked in',
        {
          description: `Your local customer ID is: ${localCustomerId}`
        }
      );
    } catch (error) {
      toast.error('Check-in Failed', {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Check In to Your Loaded Tea Club</h2>

      {customerQrCode ? (
        <div className="text-center">
          <h3 className="text-lg mb-2">Your Club Check-In QR Code</h3>
          <Image 
            src={customerQrCode} 
            alt="Customer Check-In QR Code" 
            width={250} 
            height={250} 
            className="mx-auto mb-4"
          />
          <Button 
            onClick={() => setCustomerQrCode(null)} 
            variant="outline"
          >
            Check In to Another Club
          </Button>
        </div>
      ) : location ? (
        <div>
          <h3 className="text-lg mb-2">Nearby Clubs</h3>
          {nearbyCubs.length === 0 ? (
            <p>No clubs found nearby</p>
          ) : (
            <div className="space-y-2">
              {nearbyCubs.map(club => (
                <Button
                  key={club.clubId}
                  onClick={() => handleClubSelection(club)}
                  disabled={isLoading}
                  className="w-full"
                >
                  {club.name}
                </Button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <p>Detecting your location...</p>
      )}
    </div>
  );
}

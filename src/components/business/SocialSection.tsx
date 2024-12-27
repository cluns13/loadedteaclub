import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { CameraIcon, ShareIcon, MapPinIcon } from '@heroicons/react/24/outline';
import type { UserInteraction } from '@/types/social';
import { cn } from '@/lib/utils';

interface SocialSectionProps {
  businessId: string;
  recentPhotos: string[];
  recentCheckIns: UserInteraction[];
  onInteraction?: (interaction: UserInteraction) => void;
}

export default function SocialSection({
  businessId,
  recentPhotos,
  recentCheckIns,
  onInteraction,
}: SocialSectionProps) {
  const { data: session } = useSession();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);

  const handleCheckIn = () => {
    setIsCheckedIn(true);
    onInteraction?.({
      userId: session?.user?.id || 'anonymous',
      type: 'CHECK_IN',
      timestamp: new Date(),
    });
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // TODO: Implement photo upload to cloud storage
    // For now, we'll just simulate it
    const photoUrl = URL.createObjectURL(file);
    
    onInteraction?.({
      userId: session?.user?.id || 'anonymous',
      type: 'PHOTO',
      timestamp: new Date(),
      content: {
        photo: photoUrl,
      },
    });

    setShowPhotoUpload(false);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this loaded tea club!',
          url: window.location.href,
        });
        onInteraction?.({
          userId: session?.user?.id || 'anonymous',
          type: 'SHARE',
          timestamp: new Date(),
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Quick Actions */}
      <div className="flex space-x-4 mb-8">
        <button
          onClick={handleCheckIn}
          disabled={isCheckedIn}
          className={cn(
            'flex items-center px-4 py-2 rounded-lg',
            isCheckedIn
              ? 'bg-green-100 text-green-700'
              : 'bg-purple-600 text-white hover:bg-purple-700'
          )}
        >
          <MapPinIcon className="h-5 w-5 mr-2" />
          {isCheckedIn ? 'Checked In!' : 'Check In'}
        </button>
        
        <button
          onClick={() => setShowPhotoUpload(true)}
          className="flex items-center px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <CameraIcon className="h-5 w-5 mr-2" />
          Add Photo
        </button>
        
        <button
          onClick={handleShare}
          className="flex items-center px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <ShareIcon className="h-5 w-5 mr-2" />
          Share
        </button>
      </div>

      {/* Recent Activity */}
      <div className="space-y-8">
        {/* Recent Photos */}
        {recentPhotos.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Photos</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {recentPhotos.map((photo, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                  <Image
                    src={photo}
                    alt="User uploaded photo"
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Check-ins */}
        {recentCheckIns.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {recentCheckIns.map((checkIn, index) => (
                <div key={index} className="flex items-center space-x-4">
                  {checkIn.content?.photo ? (
                    <div className="relative w-12 h-12 rounded-full overflow-hidden">
                      <Image
                        src={checkIn.content.photo}
                        alt="User"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                      <MapPinIcon className="h-6 w-6 text-purple-600" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {checkIn.userId} checked in
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(checkIn.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Photo Upload Modal */}
      <dialog
        open={showPhotoUpload}
        className="fixed inset-0 z-50 overflow-y-auto"
        onClose={() => setShowPhotoUpload(false)}
      >
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add a Photo</h3>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="w-full"
            />
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setShowPhotoUpload(false)}
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowPhotoUpload(false)}
                className="px-4 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      </dialog>
    </div>
  );
}

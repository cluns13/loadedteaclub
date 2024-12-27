'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { CameraIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface PhotoManagerProps {
  businessId: string;
  photos: string[];
  coverPhoto?: string;
  onPhotosChange?: () => void;
}

export default function PhotoManager({ businessId, photos, coverPhoto, onPhotosChange }: PhotoManagerProps) {
  const { data: session } = useSession();
  const [uploading, setUploading] = useState(false);
  const [draggedPhoto, setDraggedPhoto] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, isCover = false) => {
    const files = event.target.files;
    if (!files?.length) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('businessId', businessId);
    formData.append('isCoverPhoto', isCover.toString());
    
    Array.from(files).forEach(file => {
      formData.append('photos', file);
    });

    try {
      const response = await fetch('/api/business/photos', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');
      onPhotosChange?.();
    } catch (error) {
      console.error('Error uploading photos:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photoUrl: string) => {
    try {
      const response = await fetch(`/api/business/photos?businessId=${businessId}&photoUrl=${encodeURIComponent(photoUrl)}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Delete failed');
      onPhotosChange?.();
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  };

  const handleSetCoverPhoto = async (photoUrl: string) => {
    try {
      const response = await fetch('/api/business/photos', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId,
          photoUrl,
          isCoverPhoto: true,
        }),
      });

      if (!response.ok) throw new Error('Failed to set cover photo');
      onPhotosChange?.();
    } catch (error) {
      console.error('Error setting cover photo:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cover Photo Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Cover Photo</h3>
        <div className="relative h-64 bg-gray-100 rounded-lg overflow-hidden">
          {coverPhoto ? (
            <>
              <Image
                src={coverPhoto}
                alt="Cover"
                fill
                className="object-cover"
              />
              <button
                onClick={() => handleDeletePhoto(coverPhoto)}
                className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-lg hover:bg-gray-100"
              >
                <XMarkIcon className="h-5 w-5 text-gray-600" />
              </button>
            </>
          ) : (
            <label className="flex items-center justify-center h-full cursor-pointer hover:bg-gray-200 transition-colors">
              <div className="text-center">
                <CameraIcon className="h-12 w-12 text-gray-400 mx-auto" />
                <span className="mt-2 block text-sm text-gray-600">Upload Cover Photo</span>
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileUpload(e, true)}
              />
            </label>
          )}
        </div>
      </div>

      {/* Photo Gallery Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Photo Gallery</h3>
          <label className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 cursor-pointer">
            Add Photos
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFileUpload(e, false)}
            />
          </label>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div
              key={photo}
              className="relative aspect-square group"
              draggable
              onDragStart={() => setDraggedPhoto(photo)}
              onDragEnd={() => setDraggedPhoto(null)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (draggedPhoto && draggedPhoto !== photo) {
                  // Handle reordering logic here if needed
                }
              }}
            >
              <Image
                src={photo}
                alt=""
                fill
                className="object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity rounded-lg">
                <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleSetCoverPhoto(photo)}
                    className="p-1 bg-white rounded-full shadow-lg hover:bg-gray-100"
                    title="Set as cover photo"
                  >
                    <CameraIcon className="h-5 w-5 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDeletePhoto(photo)}
                    className="p-1 bg-white rounded-full shadow-lg hover:bg-gray-100"
                  >
                    <XMarkIcon className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {uploading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg">
            <p>Uploading...</p>
          </div>
        </div>
      )}
    </div>
  );
}

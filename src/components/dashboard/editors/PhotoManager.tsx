'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { TrashIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';

interface PhotoManagerProps {
  businessId: string;
  photos?: string[];
  isEditing: boolean;
  onUpdate: (photos: string[]) => void;
}

export function PhotoManager({
  businessId,
  photos = [],
  isEditing,
  onUpdate,
}: PhotoManagerProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('businessId', businessId);
    Array.from(files).forEach((file) => {
      formData.append('photos', file);
    });

    try {
      const response = await fetch('/api/business/photos', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload photos');
      }

      const data = await response.json();
      const updatedPhotos = [...photos, ...data.photoUrls];
      onUpdate(updatedPhotos);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Error uploading photos:', err);
      setError('Failed to upload photos. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (index: number) => {
    try {
      const photoUrl = photos[index];
      const response = await fetch('/api/business/photos?url=' + encodeURIComponent(photoUrl), {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete photo');
      }

      const updatedPhotos = photos.filter((_, i) => i !== index);
      onUpdate(updatedPhotos);
    } catch (err) {
      console.error('Error deleting photo:', err);
      setError('Failed to delete photo. Please try again.');
    }
  };

  const handleReorder = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= photos.length) return;

    const updatedPhotos = [...photos];
    [updatedPhotos[index], updatedPhotos[newIndex]] = [
      updatedPhotos[newIndex],
      updatedPhotos[index],
    ];
    onUpdate(updatedPhotos);
  };

  return (
    <div className="space-y-6">
      {isEditing && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-green-50 file:text-green-700
              hover:file:bg-green-100"
          />
          {uploading && (
            <div className="mt-2 text-sm text-gray-600">
              Uploading...
            </div>
          )}
          {error && (
            <div className="mt-2 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((photo, index) => (
          <div key={photo} className="relative group">
            <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={photo}
                alt="Business photo"
                width={400}
                height={225}
                className="object-cover"
              />
            </div>
            {isEditing && (
              <div className="absolute top-2 right-2 flex space-x-1">
                {index > 0 && (
                  <button
                    onClick={() => handleReorder(index, 'up')}
                    className="p-1 bg-white rounded-full shadow-sm hover:bg-gray-50"
                  >
                    <ArrowUpIcon className="h-4 w-4 text-gray-600" />
                  </button>
                )}
                {index < photos.length - 1 && (
                  <button
                    onClick={() => handleReorder(index, 'down')}
                    className="p-1 bg-white rounded-full shadow-sm hover:bg-gray-50"
                  >
                    <ArrowDownIcon className="h-4 w-4 text-gray-600" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(index)}
                  className="p-1 bg-white rounded-full shadow-sm hover:bg-gray-50"
                >
                  <TrashIcon className="h-4 w-4 text-red-600" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';

import { useFileUpload } from '@/hooks/useFileUpload';
import { useState, useRef } from 'react';
import type { UploadPurpose } from '@/lib/storage/s3';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface FileUploadProps {
  purpose: UploadPurpose;
  accept?: string;
  label: string;
  helpText?: string;
  required?: boolean;
  maxSize?: number;
  onUploadComplete: (url: string) => void;
  onUploadError: (error: Error) => void;
}

export default function FileUpload({
  purpose,
  accept = 'image/jpeg,image/png,image/webp,application/pdf',
  label,
  helpText,
  required = false,
  maxSize = MAX_FILE_SIZE,
  onUploadComplete,
  onUploadError,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneId = `file-upload-${label.toLowerCase().replace(/\s+/g, '-')}`;

  const { uploadState, uploadFile, resetUpload, cancelUpload } = useFileUpload({
    purpose,
    onSuccess: onUploadComplete,
    onError: onUploadError,
  });

  const validateFile = (file: File): Error | null => {
    if (!file) return new Error('No file selected');
    
    // Check file size
    if (file.size > maxSize) {
      return new Error(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
    }

    // Check file type
    const acceptedTypes = accept.split(',').map(type => type.trim());
    const fileType = file.type;
    if (!acceptedTypes.includes(fileType)) {
      return new Error(`File type must be one of: ${acceptedTypes.join(', ')}`);
    }

    return null;
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      const error = validateFile(file);
      if (error) {
        onUploadError(error);
        return;
      }

      try {
        await uploadFile(file);
      } catch (error) {
        // Error is handled by onError callback
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const error = validateFile(file);
      if (error) {
        onUploadError(error);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      try {
        await uploadFile(file);
      } catch (error) {
        // Error is handled by onError callback
      }
    }
  };

  return (
    <div className="space-y-1">
      <label
        htmlFor={dropZoneId}
        className="block text-sm font-medium text-gray-700"
      >
        {label} {required && <span className="text-red-500" aria-hidden="true">*</span>}
        {required && <span className="sr-only">(Required)</span>}
      </label>
      <div
        className={`relative ${
          uploadState.uploading ? 'pointer-events-none opacity-50' : ''
        }`}
      >
        <div
          onDragEnter={handleDragEnter}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
            isDragging
              ? 'border-green-500 bg-green-50'
              : uploadState.error
              ? 'border-red-500 bg-red-50'
              : uploadState.url
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          role="button"
          aria-labelledby={`${dropZoneId}-label`}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              fileInputRef.current?.click();
            }
          }}
        >
          <div className="space-y-1 text-center">
            {uploadState.uploading ? (
              <div className="space-y-2">
                <div className="text-sm text-gray-600" role="status">
                  Uploading... {Math.round(uploadState.progress)}%
                </div>
                <div 
                  className="relative h-2 bg-gray-200 rounded-full overflow-hidden"
                  role="progressbar"
                  aria-valuenow={uploadState.progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="absolute left-0 top-0 h-full bg-green-500 transition-all duration-300"
                    style={{ width: `${uploadState.progress}%` }}
                  />
                </div>
                <button
                  type="button"
                  onClick={cancelUpload}
                  className="text-sm text-red-600 hover:text-red-500"
                  aria-label="Cancel upload"
                >
                  Cancel
                </button>
              </div>
            ) : uploadState.url ? (
              <div className="space-y-2">
                <svg
                  className="mx-auto h-12 w-12 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <div className="text-sm text-gray-600" role="status">Upload complete</div>
                <button
                  type="button"
                  onClick={() => {
                    resetUpload();
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="text-sm text-gray-600 hover:text-gray-500"
                >
                  Upload another file
                </button>
              </div>
            ) : (
              <>
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m0 0v4a4 4 0 004 4h20a4 4 0 004-4V28m-4-4h4M8 32h4m16-24v4m-4-4h4"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600" id={`${dropZoneId}-label`}>
                  <label
                    htmlFor={dropZoneId}
                    className="relative cursor-pointer rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none"
                  >
                    <span>Upload a file</span>
                    <input
                      id={dropZoneId}
                      ref={fileInputRef}
                      name="file-upload"
                      type="file"
                      accept={accept}
                      onChange={handleFileSelect}
                      className="sr-only"
                      aria-describedby={`${dropZoneId}-description`}
                      aria-required={required}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500" id={`${dropZoneId}-description`}>
                  {helpText || `PNG, JPG, WEBP, PDF up to ${Math.round(maxSize / 1024 / 1024)}MB`}
                </p>
              </>
            )}
          </div>
        </div>
        {uploadState.error && (
          <p className="mt-1 text-sm text-red-600" role="alert">{uploadState.error}</p>
        )}
      </div>
    </div>
  );
}

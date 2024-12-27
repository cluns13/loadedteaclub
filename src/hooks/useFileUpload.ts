import { useState, useEffect, useRef } from 'react';
import type { UploadPurpose } from '@/lib/storage/s3';

interface UploadState {
  progress: number;
  error: string | null;
  uploading: boolean;
  url: string | null;
}

interface UseFileUploadOptions {
  purpose: UploadPurpose;
  maxRetries?: number;
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
}

interface UseFileUploadReturn {
  uploadState: UploadState;
  uploadFile: (file: File) => Promise<string>;
  resetUpload: () => void;
  cancelUpload: () => void;
}

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function useFileUpload({
  purpose,
  maxRetries = 3,
  onSuccess,
  onError,
}: UseFileUploadOptions): UseFileUploadReturn {
  const [uploadState, setUploadState] = useState<UploadState>({
    progress: 0,
    error: null,
    uploading: false,
    url: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const validateFile = (file: File): void => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      throw new Error(
        `Invalid file type. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error(
        `File too large. Maximum size allowed: ${MAX_FILE_SIZE / (1024 * 1024)}MB`
      );
    }
  };

  const resetUpload = () => {
    setUploadState({
      progress: 0,
      error: null,
      uploading: false,
      url: null,
    });
    retryCountRef.current = 0;
  };

  const cancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      resetUpload();
    }
  };

  const uploadWithProgress = async (
    url: string,
    file: File,
    abortController: AbortController
  ): Promise<Response> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded * 100) / event.total);
          setUploadState((prev) => ({
            ...prev,
            progress,
          }));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(new Response());
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload cancelled'));
      });

      abortController.signal.addEventListener('abort', () => {
        xhr.abort();
      });

      xhr.open('PUT', url);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    });
  };

  const uploadFile = async (file: File): Promise<string> => {
    try {
      // Client-side validation
      validateFile(file);

      setUploadState((prev) => ({
        ...prev,
        uploading: true,
        error: null,
      }));

      // Create new AbortController for this upload
      abortControllerRef.current = new AbortController();

      // Get presigned URL
      const response = await fetch('/api/upload/url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileType: file.type,
          fileName: file.name,
          fileSize: file.size,
          purpose,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get upload URL');
      }

      const { url, key } = await response.json();

      // Upload to S3 with progress tracking
      const uploadResponse = await uploadWithProgress(
        url,
        file,
        abortControllerRef.current
      );

      if (!uploadResponse.ok && retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        const delay = Math.pow(2, retryCountRef.current) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return uploadFile(file);
      }

      // Get public URL from environment variables
      const publicUrl = `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${key}`;

      setUploadState((prev) => ({
        ...prev,
        progress: 100,
        uploading: false,
        url: publicUrl,
      }));

      onSuccess?.(publicUrl);
      return publicUrl;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload file';
      setUploadState((prev) => ({
        ...prev,
        error: errorMessage,
        uploading: false,
      }));
      onError?.(error instanceof Error ? error : new Error(errorMessage));
      throw error;
    } finally {
      abortControllerRef.current = null;
    }
  };

  return {
    uploadState,
    uploadFile,
    resetUpload,
    cancelUpload,
  };
}

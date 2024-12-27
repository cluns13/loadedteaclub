'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Image, AlertCircle, Check, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface MenuUploaderProps {
  businessId: string;
  onSuccess?: (extractedMenu: any) => void;
}

export default function MenuUploader({ businessId, onSuccess }: MenuUploaderProps) {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'review' | 'complete' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxFiles: 1,
    onDropAccepted: async (acceptedFiles) => {
      console.log('File accepted:', acceptedFiles[0]);
      handleUpload(acceptedFiles[0]);
    },
    onDropRejected: (fileRejections) => {
      console.error('File rejected:', fileRejections);
      setStatus('error');
      setErrorMessage(
        fileRejections[0]?.errors?.[0]?.message || 
        'Please upload a valid JPEG or PNG image file (max 10MB)'
      );
    },
    onError: (error) => {
      console.error('Dropzone error:', error);
      setStatus('error');
      setErrorMessage('Error selecting file. Please try again.');
    }
  });

  const handleUpload = async (file: File) => {
    try {
      // Check file size before uploading
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
      if (file.size > MAX_FILE_SIZE) {
        throw new Error('File is too large. Please upload an image smaller than 10MB.');
      }

      setStatus('uploading');
      setProgress(10);
      setErrorMessage('');

      console.log('Starting upload for file:', {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: new Date(file.lastModified).toISOString()
      });

      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      setProgress(20);

      const apiUrl = `/api/business/${businessId}/menu/extract`;
      console.log('Making API request to:', apiUrl);
      
      // Start the upload with timeout
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000); // 1 minute timeout

      let progressTimeout: NodeJS.Timeout;
      const startTime = Date.now();

      try {
        setStatus('processing');
        
        // Set up progress checker
        let lastProgress = 20;
        progressTimeout = setInterval(() => {
          const elapsedSeconds = (Date.now() - startTime) / 1000;
          if (elapsedSeconds > 60) {
            clearInterval(progressTimeout);
            controller.abort();
            return;
          }
          
          // Increment progress slowly up to 90%
          if (lastProgress < 90) {
            lastProgress += 1;
            setProgress(lastProgress);
          }
        }, 1000);

        const response = await fetch(apiUrl, {
          method: 'POST',
          body: formData,
          signal: controller.signal
        });

        clearTimeout(timeout);
        clearInterval(progressTimeout);

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Server error response:', errorText);
          try {
            const errorJson = JSON.parse(errorText);
            throw new Error(errorJson.error || errorJson.details || 'Upload failed');
          } catch (e) {
            throw new Error('Server error: ' + response.status);
          }
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Non-JSON response received');
          throw new Error('Server returned non-JSON response');
        }

        setProgress(95);
        console.log('Processing response...');
        
        const data = await response.json();
        console.log('Response data:', data);

        if (!data.processedMenu) {
          throw new Error('No menu data received from server');
        }

        setStatus('complete');
        setProgress(100);

        if (onSuccess) {
          onSuccess(data.processedMenu);
        }
      } catch (fetchError) {
        clearTimeout(timeout);
        clearInterval(progressTimeout);
        if (fetchError.name === 'AbortError') {
          throw new Error('Processing is taking longer than expected. Please try uploading a clearer or smaller image.');
        }
        throw fetchError;
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setStatus('error');
      setErrorMessage(
        error instanceof Error 
          ? error.message 
          : 'Failed to process menu. Please try again.'
      );
      setProgress(0);
    }
  };

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${status === 'error' ? 'border-red-500 bg-red-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className="text-gray-600">
            {isDragActive ? (
              <p>Drop the file here</p>
            ) : (
              <>
                <p>Drag and drop a menu file here, or click to select</p>
                <p className="text-sm text-gray-500">(JPEG or PNG, max 10MB)</p>
              </>
            )}
          </div>
          
          {(status === 'uploading' || status === 'processing') && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                {status === 'uploading' && 'Preparing image...'}
                {status === 'processing' && 'Processing menu text...'}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 rounded-full h-2 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500">{progress}% complete</p>
              {status === 'processing' && (
                <p className="text-xs text-gray-500 mt-2">
                  This typically takes 15-45 seconds depending on the image quality.
                </p>
              )}
            </div>
          )}
          
          {status === 'error' && (
            <div className="text-red-500 space-y-2">
              <p className="font-medium">Error</p>
              <p className="text-sm">{errorMessage}</p>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setStatus('idle');
                  setErrorMessage('');
                  setProgress(0);
                }}
                className="text-sm text-blue-500 hover:text-blue-600"
              >
                Try Again
              </button>
            </div>
          )}

          {status === 'complete' && (
            <div className="text-green-500">
              <p>Menu processed successfully!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Upload, FileText, Image, AlertCircle, Check, Loader2 } from 'lucide-react';

interface MenuUploaderProps {
  businessId: string;
}

export default function MenuUploader({ businessId }: MenuUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
    if (acceptedFiles.length > 0) {
      setFiles(acceptedFiles);
      setUploadError(null);
    }

    if (fileRejections.length > 0) {
      const errorMessages = fileRejections.map(
        (rejection) => `${rejection.file.name}: ${rejection.errors[0].message}`
      );
      setUploadError(errorMessages.join(', '));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'application/pdf': ['.pdf']
    },
    maxSize: 5 * 1024 * 1024 // 5MB
  });

  const handleUpload = async () => {
    if (files.length === 0) return;

    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      formData.append('businessId', businessId);

      // Implement your upload logic here
      const response = await fetch('/api/upload/menu', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      // Reset state after successful upload
      setFiles([]);
      setUploadProgress(0);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    }
  };

  return (
    <div>
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed p-6 text-center ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
      >
        <input {...getInputProps()} />
        <p>Drag 'n' drop menu files here, or click to select files</p>
      </div>
      {files.length > 0 && (
        <div>
          {files.map(file => (
            <div key={file.name}>
              <p>{file.name}</p>
            </div>
          ))}
          <button onClick={handleUpload}>Upload</button>
        </div>
      )}
      {uploadError && <p className="text-red-500">{uploadError}</p>}
    </div>
  );
}

import { useState } from 'react';

export function useFileUpload() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadComplete = (fileKey) => {
    setUploadedFiles(prev => [...prev, fileKey]);
  };

  const removeFile = (fileKey) => {
    setUploadedFiles(prev => prev.filter(key => key !== fileKey));
  };

  const clearFiles = () => {
    setUploadedFiles([]);
  };

  return {
    uploadedFiles,
    isUploading,
    handleUploadComplete,
    removeFile,
    clearFiles
  };
}

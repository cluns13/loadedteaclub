import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { FiUpload, FiX, FiFile } from 'react-icons/fi';

const FileUpload = ({ 
  onUploadComplete, 
  purpose = 'general',
  maxSize = 5 * 1024 * 1024, // 5MB
  acceptedTypes = '.pdf,.jpg,.jpeg,.png'
}) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate file size
    if (selectedFile.size > maxSize) {
      toast.error('File size exceeds 5MB limit');
      return;
    }

    setFile(selectedFile);

    // Create preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('purpose', purpose);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      toast.success('File uploaded successfully');
      onUploadComplete?.(data.key);
      
      // Reset state
      setFile(null);
      setPreview(null);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
        {!file ? (
          <>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept={acceptedTypes}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center justify-center space-y-2"
            >
              <FiUpload className="h-8 w-8 text-gray-400" />
              <span className="text-sm text-gray-500">
                Click to upload or drag and drop
              </span>
              <span className="text-xs text-gray-400">
                PDF, JPG, PNG up to 5MB
              </span>
            </label>
          </>
        ) : (
          <div className="space-y-4">
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="max-h-40 mx-auto object-contain"
              />
            ) : (
              <div className="flex items-center justify-center space-x-2 text-gray-500">
                <FiFile className="h-6 w-6" />
                <span>{file.name}</span>
              </div>
            )}
            <div className="flex justify-center space-x-2">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
              <button
                onClick={clearFile}
                disabled={uploading}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
              >
                <FiX />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;

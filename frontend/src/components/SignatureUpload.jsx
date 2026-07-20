import { useState, useRef } from 'react';
import { Upload, X, Image } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const SignatureUpload = ({ currentSignature, onUpload, disabled = false, label = 'Signature' }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentSignature || null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only PNG, JPG, or WebP files are allowed.');
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB.');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('signature', file);

      const res = await api.post('/upload/signature', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const url = res.data.data.url;
      setPreview(url);
      onUpload(url);
      toast.success('Signature uploaded.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const removeSignature = () => {
    setPreview(null);
    onUpload(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <label className="block text-[11px] uppercase tracking-wide text-stone-400 font-medium mb-2">
        {label}
      </label>

      {preview ? (
        <div className="relative inline-block border border-stone-200 rounded-lg p-3 bg-white">
          <img
            src={preview}
            alt={label}
            className="max-h-20 max-w-[200px] object-contain"
          />
          {!disabled && (
            <button
              onClick={removeSignature}
              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      ) : (
        <div
          onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            disabled
              ? 'border-stone-200 bg-stone-50 cursor-not-allowed'
              : 'border-stone-300 hover:border-teal-400 cursor-pointer bg-white'
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-stone-400">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-5 h-5 text-stone-400" />
              <p className="text-xs text-stone-500">
                Click to upload signature
              </p>
              <p className="text-[10px] text-stone-400">PNG, JPG, or WebP (max 2MB)</p>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />
    </div>
  );
};

export default SignatureUpload;

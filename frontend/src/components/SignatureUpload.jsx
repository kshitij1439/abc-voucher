import { useState, useRef, useEffect } from 'react';
import { Upload, X, PenTool, Eye, RotateCcw, Check } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const SignatureUpload = ({ currentSignature, onUpload, disabled = false, label = 'Signature' }) => {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'draw'
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentSignature || null);
  const [showModal, setShowModal] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  // Sync internal state when prop changes
  useEffect(() => {
    setPreview(currentSignature || null);
  }, [currentSignature]);

  // Setup Canvas when 'draw' tab is opened
  useEffect(() => {
    if (activeTab === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = '#1c1917'; // stone-900
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, [activeTab]);

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

    await uploadFileToApi(file);
  };

  const uploadFileToApi = async (file) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('signature', file, 'signature.png');

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

  // Canvas Drawing Handlers
  const startDrawing = (e) => {
    if (disabled) return;
    setIsDrawing(true);
    setHasDrawn(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e) => {
    if (!isDrawing || disabled) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const saveDrawnSignature = () => {
    if (!hasDrawn) {
      toast.error('Please draw your signature first.');
      return;
    }
    const canvas = canvasRef.current;
    canvas.toBlob((blob) => {
      if (blob) {
        uploadFileToApi(blob);
      }
    }, 'image/png');
  };

  const removeSignature = () => {
    setPreview(null);
    onUpload(null);
    setHasDrawn(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-[11px] uppercase tracking-wide text-stone-400 font-medium">
          {label}
        </label>
        {!disabled && !preview && (
          <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                activeTab === 'upload' ? 'bg-white text-stone-800 shadow-xs' : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              Upload Image
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('draw')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                activeTab === 'draw' ? 'bg-white text-stone-800 shadow-xs' : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              Draw Signature
            </button>
          </div>
        )}
      </div>

      {preview ? (
        <div className="relative inline-block border border-stone-200 rounded-lg p-3 bg-white group">
          <img
            src={preview}
            alt={label}
            className="max-h-20 max-w-[220px] object-contain cursor-pointer"
            onClick={() => setShowModal(true)}
          />
          <div className="absolute top-2 right-2 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="w-6 h-6 bg-stone-800/80 hover:bg-stone-900 text-white rounded-full flex items-center justify-center cursor-pointer transition-colors"
              title="View full signature"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            {!disabled && (
              <button
                type="button"
                onClick={removeSignature}
                className="w-6 h-6 bg-red-500/90 hover:bg-red-600 text-white rounded-full flex items-center justify-center cursor-pointer transition-colors"
                title="Remove signature"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      ) : activeTab === 'upload' ? (
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
      ) : (
        /* Draw Signature Canvas */
        <div className="border border-stone-300 rounded-lg p-3 bg-white space-y-2">
          <div className="relative bg-stone-50 border border-stone-200 rounded overflow-hidden">
            <canvas
              ref={canvasRef}
              width={400}
              height={140}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-32 touch-none cursor-crosshair"
            />
            {!hasDrawn && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-stone-400 text-xs gap-1.5 opacity-60">
                <PenTool className="w-3.5 h-3.5" />
                Draw signature here with mouse or touch
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={clearCanvas}
              disabled={disabled || uploading}
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-stone-500 hover:text-stone-800 bg-stone-100 hover:bg-stone-200 rounded cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Clear
            </button>
            <button
              type="button"
              onClick={saveDrawnSignature}
              disabled={disabled || uploading || !hasDrawn}
              className="flex items-center gap-1 px-3 py-1 bg-teal-600 text-white text-xs font-medium rounded hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              {uploading ? (
                'Uploading...'
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Save & Upload
                </>
              )}
            </button>
          </div>
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

      {/* Signature Image Lightbox Modal */}
      {showModal && preview && (
        <div
          onClick={() => setShowModal(false)}
          className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-stone-200 rounded-lg p-6 max-w-lg w-full shadow-xl relative"
          >
            <div className="flex items-center justify-between mb-4 border-b border-stone-100 pb-3">
              <h3 className="text-sm font-semibold text-stone-800" style={{ fontFamily: 'var(--font-heading)' }}>
                {label} Image View
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 rounded text-stone-400 hover:text-stone-600 hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-center bg-stone-50 border border-stone-200 rounded-lg p-6 min-h-[200px]">
              <img
                src={preview}
                alt={label}
                className="max-h-64 object-contain"
              />
            </div>
            <div className="mt-4 flex justify-end">
              <a
                href={preview}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-teal-600 hover:text-teal-700 font-medium underline"
              >
                Open Original Image in New Tab ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignatureUpload;

import { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, X, ExternalLink } from 'lucide-react';

const ImageLightboxModal = ({ isOpen, onClose, imageUrl, title = 'Signature View' }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const containerRef = useRef(null);

  // Reset zoom and position whenever image opens/changes
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen, imageUrl]);

  // Handle keyboard shortcuts (+, -, Esc)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === '+' || e.key === '=') zoomIn();
      if (e.key === '-') zoomOut();
      if (e.key === '0') resetZoom();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, scale]);

  if (!isOpen || !imageUrl) return null;

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.3, 4));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.3, 0.5));
  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Mouse wheel scroll to zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 0.2 : -0.2;
    setScale((prev) => Math.min(Math.max(prev + zoomFactor, 0.5), 4));
  };

  // Drag / Pan Image
  const handleMouseDown = (e) => {
    if (scale <= 1) return; // Only drag when zoomed in
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-stone-200 rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header Toolbar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-stone-200 bg-stone-50">
          <div className="flex items-center gap-2">
            <h3
              className="text-sm font-semibold text-stone-800"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {title}
            </h3>
            <span className="text-[10px] font-mono bg-stone-200 text-stone-600 px-1.5 py-0.5 rounded">
              {Math.round(scale * 100)}%
            </span>
          </div>

          {/* Zoom Controls (+ / - / Reset) */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={zoomOut}
              disabled={scale <= 0.5}
              className="p-1.5 rounded hover:bg-stone-200 text-stone-600 disabled:opacity-40 cursor-pointer transition-colors"
              title="Zoom Out (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={zoomIn}
              disabled={scale >= 4}
              className="p-1.5 rounded hover:bg-stone-200 text-stone-600 disabled:opacity-40 cursor-pointer transition-colors"
              title="Zoom In (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={resetZoom}
              className="p-1.5 rounded hover:bg-stone-200 text-stone-600 cursor-pointer transition-colors"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-4 bg-stone-300 mx-1" />
            <a
              href={imageUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded hover:bg-stone-200 text-stone-600 cursor-pointer transition-colors"
              title="Open Original Image"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded hover:bg-stone-200 text-stone-600 cursor-pointer transition-colors ml-1"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Interactive Smooth Viewport */}
        <div
          ref={containerRef}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`flex-1 bg-stone-900/95 flex items-center justify-center min-h-[320px] p-6 overflow-hidden relative select-none ${
            scale > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
          }`}
        >
          <img
            src={imageUrl}
            alt={title}
            draggable={false}
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transition: isDragging ? 'none' : 'transform 0.15s ease-out',
            }}
            className="max-h-[60vh] max-w-full object-contain pointer-events-auto rounded shadow-lg bg-white/95 p-3"
          />

          {/* Helper hint badge */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-stone-950/70 text-stone-300 text-[11px] px-3 py-1 rounded-full backdrop-blur-xs pointer-events-none">
            Scroll mouse wheel to zoom | Drag image when zoomed in
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageLightboxModal;

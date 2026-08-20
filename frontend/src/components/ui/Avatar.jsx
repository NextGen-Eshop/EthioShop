import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, User, Trash2 } from 'lucide-react';

export default function Avatar({
  src,
  name = 'Staff Member',
  size = 'md', // 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  editable = false,
  onImageChange,
  onImageRemove,
  showBadge = false,
  badgeColor = 'bg-emerald-500',
  className = '',
}) {
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef(null);

  // Size configurations - strictly circular (rounded-full)
  const sizeMap = {
    xs: 'h-6 w-6 text-[10px]',
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-base',
    xl: 'h-20 w-20 text-xl',
    '2xl': 'h-28 w-28 text-3xl',
  };

  const currentSizeClass = sizeMap[size] || sizeMap.md;

  // Extract initials (up to 2 characters)
  const initials = name
    ? name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'U';

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPEG, PNG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageError(false);
      if (onImageChange) {
        onImageChange(event.target.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Strictly Circular Container (rounded-full with aspect-square) */}
      <div
        className={`relative ${currentSizeClass} aspect-square rounded-full overflow-hidden ring-2 ring-slate-200/90 shadow-sm bg-gradient-to-tr from-[#312e81] via-[#3857d6] to-[#4f46e5] flex items-center justify-center select-none ${
          editable ? 'cursor-pointer group' : ''
        }`}
        onClick={() => editable && fileInputRef.current?.click()}
        title={editable ? 'Click to change profile picture' : name}
      >
        {src && !imageError ? (
          <img
            src={src}
            alt={name}
            onError={() => setImageError(true)}
            className="h-full w-full rounded-full aspect-square object-cover object-center transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="font-black text-white tracking-wider flex items-center justify-center">
            {initials}
          </span>
        )}

        {/* Hover Camera Overlay if Editable */}
        {editable && (
          <div className="absolute inset-0 rounded-full bg-black/45 backdrop-blur-[1px] flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Camera className="h-4 w-4 drop-shadow-sm" />
            {size === 'xl' || size === '2xl' ? (
              <span className="text-[10px] font-bold mt-0.5">Upload</span>
            ) : null}
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      {editable && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
      )}

      {/* Online / Active Badge */}
      {showBadge && (
        <span
          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ${badgeColor} ring-2 ring-white shadow-xs`}
        />
      )}
    </div>
  );
}

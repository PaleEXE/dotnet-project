import { useState } from 'react';
import ImageModal from './ImageModal';

/**
 * ProfileAvatar – Reusable avatar component with skeleton loader,
 * placeholder fallback, and optional click-to-expand.
 *
 * Props:
 *   src         – image URL (nullable)
 *   name        – user/org name for placeholder letter
 *   size        – 'sm' | 'md' | 'lg' | 'xl'  (default 'md')
 *   clickable   – if true, clicking opens full-size modal (default true)
 *   className   – extra CSS classes
 *   borderColor – Tailwind border class (default 'border-emerald-200')
 */
export default function ProfileAvatar({
  src,
  name = '?',
  size = 'md',
  clickable = true,
  className = '',
  borderColor = 'border-emerald-200',
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-3xl',
  };

  const sizeClass = sizes[size] || sizes.md;
  const letter = (name || '?').charAt(0).toUpperCase();
  const hasImage = src && !error;

  const handleClick = () => {
    if (clickable && hasImage) setShowModal(true);
  };

  return (
    <>
      <div
        onClick={handleClick}
        className={`
          relative rounded-full overflow-hidden border-2 ${borderColor}
          flex items-center justify-center shrink-0
          bg-emerald-100 text-emerald-700 font-bold
          ${sizeClass}
          ${clickable && hasImage ? 'cursor-pointer hover:ring-2 hover:ring-emerald-400 hover:ring-offset-1 transition-all' : ''}
          ${className}
        `}
        title={name}
      >
        {/* Skeleton loader */}
        {hasImage && !loaded && (
          <div className="absolute inset-0 skeleton-shimmer rounded-full" />
        )}

        {/* Actual image */}
        {hasImage && (
          <img
            src={src}
            alt={name}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
            className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          />
        )}

        {/* Letter placeholder */}
        {!hasImage && (
          <span className="uppercase tracking-tight">{letter}</span>
        )}
      </div>

      {/* Full-size modal */}
      {showModal && (
        <ImageModal
          src={src}
          alt={name}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}

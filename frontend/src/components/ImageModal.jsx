import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useI18n } from '../i18n/I18nContext';

/**
 * ImageModal – Full-screen lightbox overlay for viewing images.
 * Props:
 *   src    – image URL to display
 *   alt    – alt text
 *   onClose – callback to close the modal
 */
export default function ImageModal({ src, alt, onClose }) {
  const { t } = useI18n();
  const overlayRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    // Prevent body scroll while modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  // Close on backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  if (!src) return null;

  return createPortal(
    <div
      ref={overlayRef}
      onClick={handleBackdropClick}
      className="image-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={alt || t('common.viewFullImage')}
    >
      <div className="image-modal-content">
        {/* Close button */}
        <button
          onClick={onClose}
          className="image-modal-close"
          aria-label={t('common.close')}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Image */}
        <img
          src={src}
          alt={alt || t('common.viewFullImage')}
          className="image-modal-img"
        />
      </div>
    </div>,
    document.body
  );
}

import { useState } from 'react';
import ImageModal from './ImageModal';
import { useI18n } from '../i18n/I18nContext';
import { API } from '../App';

/**
 * TaskImageGallery – Renders task images as thumbnails with lightbox.
 *
 * Props:
 *   images   – array of { id, image_url } objects
 *   mode     – 'card' (single thumbnail) | 'detail' (full gallery)
 */
export default function TaskImageGallery({ images = [], mode = 'card' }) {
  const { t } = useI18n();
  const [modalSrc, setModalSrc] = useState(null);
  const [loadedIds, setLoadedIds] = useState(new Set());

  const markLoaded = (id) => {
    setLoadedIds((prev) => new Set(prev).add(id));
  };

  const getFullUrl = (url) => url?.startsWith('/') ? `${API}${url}` : url;

  if (!images || images.length === 0) return null;

  // Card mode: show first image as a banner thumbnail
  if (mode === 'card') {
    const img = images[0];
    return (
      <>
        <div
          className="relative h-44 w-full bg-slate-100 overflow-hidden cursor-pointer group"
          onClick={() => setModalSrc(getFullUrl(img.image_url))}
        >
          {/* Skeleton while loading */}
          {!loadedIds.has(img.id) && (
            <div className="absolute inset-0 skeleton-shimmer" />
          )}
          <img
            src={getFullUrl(img.image_url)}
            alt="Task"
            loading="lazy"
            onLoad={() => markLoaded(img.id)}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
              loadedIds.has(img.id) ? 'opacity-100' : 'opacity-0'
            }`}
          />
          {images.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full font-medium backdrop-blur-sm">
              +{images.length - 1}
            </div>
          )}
        </div>

        {modalSrc && (
          <ImageModal src={modalSrc} alt="Task image" onClose={() => setModalSrc(null)} />
        )}
      </>
    );
  }

  // Detail mode: full scrollable gallery
  return (
    <>
      <div className="h-64 w-full bg-slate-100 border-b border-sand overflow-hidden relative">
        <div className="flex h-full w-full overflow-x-auto snap-x snap-mandatory scrollbar-hide">
          {images.map((img) => (
            <div
              key={img.id}
              className="relative min-w-full h-full snap-start cursor-pointer group"
              onClick={() => setModalSrc(getFullUrl(img.image_url))}
            >
              {/* Skeleton while loading */}
              {!loadedIds.has(img.id) && (
                <div className="absolute inset-0 skeleton-shimmer" />
              )}
              <img
                src={getFullUrl(img.image_url)}
                alt="Task visual"
                loading="lazy"
                onLoad={() => markLoaded(img.id)}
                className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-[1.02] ${
                  loadedIds.has(img.id) ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </div>
          ))}
        </div>
        {images.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full font-medium backdrop-blur-sm">
            {images.length} {t('taskDetail.images')}
          </div>
        )}
      </div>

      {modalSrc && (
        <ImageModal src={modalSrc} alt="Task image" onClose={() => setModalSrc(null)} />
      )}
    </>
  );
}

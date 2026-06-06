import { useState } from 'react';
import { X } from 'lucide-react';

interface ExperiencePhotoGalleryProps {
  photos: string[];
  title: string;
}

export default function ExperiencePhotoGallery({ photos, title }: ExperiencePhotoGalleryProps) {
  const urls = photos.length > 0 ? photos : [];
  const [index, setIndex] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);

  if (urls.length === 0) {
    return <div className="h-52 bg-gamana-100" />;
  }

  return (
    <>
      <div className="relative">
        <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide h-52">
          {urls.map((url, i) => (
            <button
              key={url}
              type="button"
              className="flex-none w-full h-52 snap-center"
              onClick={() => {
                setIndex(i);
                setViewerOpen(true);
              }}
            >
              <img src={url} alt={`${title} ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
        {urls.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {urls.map((_, i) => (
              <span
                key={i}
                className={`w-1.5 h-1.5 rounded-full ${i === index ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </div>
        )}
        {urls.length > 1 && (
          <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/50 text-[10px] font-medium text-white">
            {index + 1} / {urls.length}
          </span>
        )}
      </div>

      {viewerOpen && (
        <div className="absolute inset-0 z-50 bg-black flex flex-col">
          <button
            type="button"
            onClick={() => setViewerOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 text-white z-10"
            aria-label="Close"
          >
            <X size={22} />
          </button>
          <img
            src={urls[index]}
            alt={title}
            className="flex-1 w-full object-contain"
          />
        </div>
      )}
    </>
  );
}

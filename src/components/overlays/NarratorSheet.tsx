import { useState, useRef, useCallback, useEffect } from 'react';
import { X, Check, Mic, Play, Square, BookOpen, MapPin, Compass, ScrollText } from 'lucide-react';
import type { Narrator, NarratorStyle } from '../../types';
import { useOrgContext } from '../../hooks/useOrgContext';

interface NarratorSheetProps {
  narrators: Narrator[];
  selectedId: string | null;
  isOpen: boolean;
  onSelect: (narrator: Narrator) => void;
  onClose: () => void;
}

const STYLE_ICONS: Record<NarratorStyle, typeof Mic> = {
  Historian: BookOpen,
  Local: MapPin,
  Storyteller: ScrollText,
  Explorer: Compass,
};

const STYLE_COLORS: Record<NarratorStyle, { bg: string; text: string }> = {
  Historian: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600' },
  Local: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600' },
  Storyteller: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600' },
  Explorer: { bg: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-600' },
};

export default function NarratorSheet({ narrators, selectedId, isOpen, onSelect, onClose }: NarratorSheetProps) {
  const { config: orgConfig } = useOrgContext();
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [previewProgress, setPreviewProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<number | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  const stopPreview = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (progressRef.current) {
      clearInterval(progressRef.current);
      progressRef.current = null;
    }
    setPreviewingId(null);
    setPreviewProgress(0);
  }, []);

  const playPreview = useCallback((narrator: Narrator) => {
    stopPreview();
    if (!narrator.preview_audio_url) return;

    const audio = new Audio(narrator.preview_audio_url);
    audioRef.current = audio;
    setPreviewingId(narrator.id);

    audio.play().catch(() => {
      setPreviewingId(null);
    });

    audio.addEventListener('ended', () => {
      setPreviewingId(null);
      setPreviewProgress(0);
      if (progressRef.current) clearInterval(progressRef.current);
    });

    progressRef.current = window.setInterval(() => {
      if (audio.duration) {
        setPreviewProgress((audio.currentTime / audio.duration) * 100);
      }
    }, 100);
  }, [stopPreview]);

  const handlePreviewToggle = useCallback((narrator: Narrator, e: React.MouseEvent) => {
    e.stopPropagation();
    if (previewingId === narrator.id) {
      stopPreview();
    } else {
      playPreview(narrator);
    }
  }, [previewingId, stopPreview, playPreview]);

  const handleSelect = useCallback((narrator: Narrator) => {
    stopPreview();
    onSelect(narrator);
  }, [stopPreview, onSelect]);

  const handleClose = useCallback(() => {
    stopPreview();
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  }, [stopPreview, onClose]);

  useEffect(() => {
    if (!isOpen) {
      stopPreview();
      setIsClosing(false);
    }
  }, [isOpen, stopPreview]);

  useEffect(() => {
    return () => stopPreview();
  }, [stopPreview]);

  if (!isOpen && !isClosing) return null;

  const animState = isClosing ? 'closing' : 'open';

  const filteredNarrators =
    orgConfig.allowedNarratorIds.length > 0
      ? narrators.filter((n) => orgConfig.allowedNarratorIds.includes(n.id))
      : narrators;

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div
        className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-200 ${
          animState === 'closing' ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
      />

      <div
        className={`relative bg-surface rounded-t-3xl shadow-elevated transition-transform duration-200 ease-out ${
          animState === 'closing' ? 'translate-y-full' : 'animate-slide-up'
        }`}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-8 h-1 rounded-full bg-surface-muted" />
        </div>

        <div className="px-5 pt-2 pb-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-heading">Choose your narrator</h3>
              <p className="text-xs text-muted mt-0.5">Experience this place through a different lens</p>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-muted hover:bg-surface-muted transition-colors"
            >
              <X size={16} className="text-secondary" />
            </button>
          </div>
        </div>

        <div className="px-5 pt-3 pb-8 flex flex-col gap-2.5">
          {filteredNarrators.map((narrator) => (
            <NarratorRow
              key={narrator.id}
              narrator={narrator}
              isSelected={narrator.id === selectedId}
              isPreviewing={narrator.id === previewingId}
              previewProgress={narrator.id === previewingId ? previewProgress : 0}
              onSelect={handleSelect}
              onPreviewToggle={handlePreviewToggle}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface NarratorRowProps {
  narrator: Narrator;
  isSelected: boolean;
  isPreviewing: boolean;
  previewProgress: number;
  onSelect: (n: Narrator) => void;
  onPreviewToggle: (n: Narrator, e: React.MouseEvent) => void;
}

function NarratorRow({
  narrator,
  isSelected,
  isPreviewing,
  previewProgress,
  onSelect,
  onPreviewToggle,
}: NarratorRowProps) {
  const style = STYLE_COLORS[narrator.style] ?? STYLE_COLORS.Historian;
  const Icon = STYLE_ICONS[narrator.style] ?? Mic;

  return (
    <button
      onClick={() => onSelect(narrator)}
      className={`
        relative flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-150 active:scale-[0.98] overflow-hidden
        ${isSelected
          ? 'bg-gamana-50 dark:bg-gamana-900/20 ring-2 ring-gamana-500'
          : 'bg-canvas ring-1 ring-sand-200 hover:ring-gamana-200'
        }
      `}
    >
      {isPreviewing && (
        <div
          className="absolute inset-y-0 left-0 bg-gamana-50/60 dark:bg-gamana-900/20 transition-all duration-100"
          style={{ width: `${previewProgress}%` }}
        />
      )}

      <div className="relative flex-shrink-0">
        <div className={`w-11 h-11 rounded-full flex items-center justify-center ${style.bg}`}>
          {narrator.avatar_url ? (
            <img src={narrator.avatar_url} alt={narrator.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            <Icon size={20} className={style.text} />
          )}
        </div>
        {isSelected && (
          <div className="absolute -bottom-0.5 -right-0.5 w-[18px] h-[18px] rounded-full bg-gamana-500 flex items-center justify-center ring-2 ring-white">
            <Check size={10} className="text-white" strokeWidth={3} />
          </div>
        )}
      </div>

      <div className="relative flex-1 min-w-0 text-left">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-heading">{narrator.name}</span>
          <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${style.bg} ${style.text}`}>
            {narrator.style}
          </span>
        </div>
        <p className="text-xs text-muted mt-0.5 leading-relaxed line-clamp-1">{narrator.description}</p>
      </div>

      {narrator.preview_audio_url && (
        <div
          onClick={(e) => onPreviewToggle(narrator, e)}
          role="button"
          tabIndex={0}
          className={`
            relative flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all
            ${isPreviewing
              ? 'bg-gamana-500 shadow-md'
              : 'bg-surface-muted hover:bg-surface-muted'
            }
          `}
        >
          {isPreviewing ? (
            <Square size={12} className="text-white" fill="currentColor" />
          ) : (
            <Play size={14} className="text-gamana-600 ml-0.5" fill="currentColor" />
          )}
        </div>
      )}
    </button>
  );
}

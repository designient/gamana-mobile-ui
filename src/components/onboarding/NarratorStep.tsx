import { useState, useRef, useCallback, useEffect } from 'react';
import { Check, Mic, Play, Square, BookOpen, MapPin, Compass, ScrollText } from 'lucide-react';
import type { Narrator, NarratorStyle } from '../../types';
import { useOrgContext } from '../../hooks/useOrgContext';

const STYLE_ICONS: Record<NarratorStyle, typeof Mic> = {
  Historian: BookOpen,
  Local: MapPin,
  Storyteller: ScrollText,
  Explorer: Compass,
};

const STYLE_COLORS: Record<NarratorStyle, { bg: string; text: string }> = {
  Historian: { bg: 'bg-blue-50', text: 'text-blue-600' },
  Local: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
  Storyteller: { bg: 'bg-amber-50', text: 'text-amber-600' },
  Explorer: { bg: 'bg-rose-50', text: 'text-rose-600' },
};

interface NarratorStepProps {
  narrators: Narrator[];
  onNext: (narratorId: string) => void;
}

export default function NarratorStep({ narrators, onNext }: NarratorStepProps) {
  const { config: orgConfig } = useOrgContext();
  const [selectedId, setSelectedId] = useState<string>(narrators[0]?.id ?? '');
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [previewProgress, setPreviewProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<number | null>(null);

  useEffect(() => {
    console.info('narrator_step_viewed', { timestamp: Date.now() });
  }, []);

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

    console.info('narrator_preview_played', { narrator_id: narrator.id });

    const audio = new Audio(narrator.preview_audio_url);
    audioRef.current = audio;
    setPreviewingId(narrator.id);

    audio.play().catch(() => setPreviewingId(null));
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

  const handleTogglePreview = useCallback((narrator: Narrator, e: React.MouseEvent) => {
    e.stopPropagation();
    if (previewingId === narrator.id) stopPreview();
    else playPreview(narrator);
  }, [previewingId, stopPreview, playPreview]);

  const handleSelect = useCallback((narrator: Narrator) => {
    stopPreview();
    setSelectedId(narrator.id);
    console.info('narrator_selected', { narrator_id: narrator.id, style: narrator.style });
  }, [stopPreview]);

  const handleContinue = useCallback(() => {
    stopPreview();
    onNext(selectedId);
  }, [stopPreview, onNext, selectedId]);

  useEffect(() => {
    return () => stopPreview();
  }, [stopPreview]);

  const filteredNarrators = orgConfig.allowedNarratorIds.length > 0
    ? narrators.filter((n) => orgConfig.allowedNarratorIds.includes(n.id))
    : narrators;

  return (
    <div className="flex flex-col h-full bg-canvas animate-fade-in">
      <div className="flex-1 overflow-y-auto scrollbar-hide px-5 pt-12 pb-4">
        <h1 className="text-xl font-semibold text-heading mb-1">
          Choose how you hear stories
        </h1>
        <p className="text-sm text-muted mb-6">
          You can change this anytime
        </p>

        <div className="flex flex-col gap-2.5">
          {filteredNarrators.map((narrator) => {
            const isSelected = narrator.id === selectedId;
            const isPreviewing = narrator.id === previewingId;
            const style = STYLE_COLORS[narrator.style] ?? STYLE_COLORS.Historian;
            const Icon = STYLE_ICONS[narrator.style] ?? Mic;

            return (
              <button
                key={narrator.id}
                onClick={() => handleSelect(narrator)}
                className={`
                  relative flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-150 active:scale-[0.98] overflow-hidden
                  ${isSelected
                    ? 'bg-gamana-50 dark:bg-gamana-900/20 ring-2 ring-gamana-500'
                    : 'bg-surface ring-1 ring-sand-200 hover:ring-gamana-200'
                  }
                `}
              >
                {isPreviewing && (
                  <div
                    className="absolute inset-y-0 left-0 bg-gamana-50/60 dark:bg-gamana-900/15 transition-all duration-100"
                    style={{ width: `${previewProgress}%` }}
                  />
                )}

                <div className="relative flex-shrink-0">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center ${style.bg}`}>
                    <Icon size={20} className={style.text} />
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
                    onClick={(e) => handleTogglePreview(narrator, e)}
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
          })}
        </div>
      </div>

      <div className="px-6 pb-10 pt-4 bg-canvas">
        <button
          onClick={handleContinue}
          disabled={!selectedId}
          className="w-full py-3.5 rounded-2xl bg-gamana-500 text-white text-sm font-semibold shadow-md hover:bg-gamana-600 active:scale-[0.98] transition-all disabled:opacity-40"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

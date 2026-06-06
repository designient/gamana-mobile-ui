import { useEffect, useState, useRef } from 'react';
import { Trophy, MapPin, Clock, Headphones, Share2, Home, Sparkles } from 'lucide-react';
import type { Badge, TourSession } from '../../types';
import { BADGE_CATALOG } from '../../lib/badges';

interface TourCompletionSheetProps {
  session: TourSession;
  earnedBadges: Badge[];
  onGoHome: () => void;
}

// Confetti particle component
function ConfettiParticle({ delay, color }: { delay: number; color: string }) {
  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${Math.random() * 100}%`,
    top: '-10px',
    width: `${Math.random() * 8 + 4}px`,
    height: `${Math.random() * 8 + 4}px`,
    backgroundColor: color,
    borderRadius: Math.random() > 0.5 ? '50%' : '2px',
    animation: `confetti-fall ${Math.random() * 2 + 2}s ease-in ${delay}s forwards`,
    opacity: 0,
  };
  return <div style={style} />;
}

const CONFETTI_COLORS = ['#1A5F7A', '#FFB547', '#10B981', '#F43F5E', '#8B5CF6', '#F97316', '#06B6D4'];

// Badge icon mapping
function getBadgeIcon(iconName: string) {
  const size = 24;
  switch (iconName) {
    case 'footprints': return <MapPin size={size} />;
    case 'landmark': return <Trophy size={size} />;
    case 'church': return <Sparkles size={size} />;
    case 'trees': return <MapPin size={size} />;
    case 'zap': return <Clock size={size} />;
    case 'trophy': return <Trophy size={size} />;
    case 'crown': return <Sparkles size={size} />;
    case 'moon': return <Clock size={size} />;
    case 'sunrise': return <Sparkles size={size} />;
    case 'wifi-off': return <MapPin size={size} />;
    default: return <Trophy size={size} />;
  }
}

export default function TourCompletionSheet({ session, earnedBadges, onGoHome }: TourCompletionSheetProps) {
  const [showStats, setShowStats] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [visibleBadges, setVisibleBadges] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setShowStats(true), 800);
    const t2 = setTimeout(() => setShowBadges(true), 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Stagger badge reveals
  useEffect(() => {
    if (!showBadges || earnedBadges.length === 0) return;
    const interval = setInterval(() => {
      setVisibleBadges((prev) => {
        if (prev >= earnedBadges.length) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 400);
    return () => clearInterval(interval);
  }, [showBadges, earnedBadges.length]);

  const storiesHeard = session.stops.filter((s) => s.status === 'completed' && s.storyId).length;
  const totalStops = session.stops.length;
  const completedStops = session.stops.filter((s) => s.status === 'completed').length;
  const distanceKm = (session.totalDistanceMeters / 1000).toFixed(1);
  const minutes = Math.round(session.totalTimeSeconds / 60);

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-gradient-to-b from-gamana-800 via-gamana-700 to-gamana-900 overflow-hidden">
      {/* Confetti */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 40 }).map((_, i) => (
          <ConfettiParticle
            key={i}
            delay={Math.random() * 1.5}
            color={CONFETTI_COLORS[i % CONFETTI_COLORS.length]}
          />
        ))}
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col items-center px-5 pt-16 pb-32">
        {/* Checkmark animation */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-[scale-bounce_0.6s_ease-out]">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <path
                d="M10 18L16 24L26 12"
                stroke="white"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-[draw-check_0.5s_ease-out_0.3s_both]"
                style={{ strokeDasharray: 40, strokeDashoffset: 40 }}
              />
            </svg>
          </div>
          <div className="absolute -inset-3 rounded-full border-2 border-emerald-400/30 animate-ping" />
        </div>

        <h1 className="text-2xl font-bold text-white text-center">Tour Complete!</h1>
        <p className="text-sm text-white/60 mt-2 text-center">{session.title}</p>

        {/* Stats Card */}
        <div
          className={`w-full mt-6 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 transition-all duration-500 ${
            showStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-4">Tour Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <StatItem icon={<MapPin size={16} />} value={`${completedStops}/${totalStops}`} label="Stops Visited" />
            <StatItem icon={<Headphones size={16} />} value={`${storiesHeard}`} label="Stories Heard" />
            <StatItem icon={<Clock size={16} />} value={`${minutes} min`} label="Time Spent" />
            <StatItem icon={<MapPin size={16} />} value={`${distanceKm} km`} label="Distance" />
          </div>
        </div>

        {/* Badges Earned */}
        {earnedBadges.length > 0 && (
          <div
            className={`w-full mt-5 transition-all duration-500 ${
              showBadges ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles size={12} />
              Badges Earned
            </h3>
            <div className="flex flex-col gap-2.5">
              {earnedBadges.map((badge, i) => (
                <div
                  key={badge.id}
                  className={`flex items-center gap-3 p-3.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 transition-all duration-500 ${
                    i < visibleBadges ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                  }`}
                >
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-white shadow-md shadow-amber-500/20 flex-shrink-0">
                    {getBadgeIcon(badge.icon)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{badge.title}</p>
                    <p className="text-xs text-white/50 mt-0.5">{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="absolute bottom-0 left-0 right-0 bg-gamana-900/80 backdrop-blur-sm px-5 pt-4 pb-8 border-t border-white/10">
        <button
          onClick={onGoHome}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-surface text-heading font-semibold text-sm shadow-lg active:scale-[0.98] transition-transform"
        >
          <Home size={16} />
          Back to Home
        </button>
      </div>

      {/* Animations CSS */}
      <style>{`
        @keyframes confetti-fall {
          0% { opacity: 1; transform: translateY(0) rotate(0deg); }
          100% { opacity: 0; transform: translateY(calc(100vh + 20px)) rotate(720deg); }
        }
        @keyframes scale-bounce {
          0% { transform: scale(0); }
          60% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        @keyframes draw-check {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
}

function StatItem({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white/70 flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-sm font-bold text-white">{value}</p>
        <p className="text-[10px] text-white/40">{label}</p>
      </div>
    </div>
  );
}

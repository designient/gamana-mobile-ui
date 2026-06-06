import { useState, useEffect, useCallback } from 'react';
import { Play, X, ChevronRight, MapPin, Headphones, Compass, Trophy } from 'lucide-react';

interface AppGuideFABProps {
  onDismiss: () => void;
}

const GUIDE_STEPS = [
  {
    icon: Compass,
    title: 'Explore Your City',
    description: 'Discover nearby stories and rich history right where you are. Stories appear based on your GPS location.',
    gradient: 'from-gamana-500 to-gamana-600',
  },
  {
    icon: Headphones,
    title: 'Listen & Learn',
    description: 'Unlock stories with coins and listen to expert narrations. Choose from different narrator styles.',
    gradient: 'from-teal-500 to-emerald-500',
  },
  {
    icon: MapPin,
    title: 'Walk the Tour',
    description: 'Follow walking tours stop by stop. Audio plays automatically when you arrive at each location.',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    icon: Trophy,
    title: 'Earn Badges',
    description: 'Complete tours to earn badges and build your explorer collection. Challenge yourself!',
    gradient: 'from-violet-500 to-purple-500',
  },
];

// FAB shows every session — no localStorage persistence

export default function AppGuideFAB({ onDismiss }: AppGuideFABProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const [showFAB, setShowFAB] = useState(false);
  const [fabEntered, setFabEntered] = useState(false);

  useEffect(() => {
    // Always show on mount — delay for a natural entrance
    const timer = setTimeout(() => {
      setShowFAB(true);
      setTimeout(() => setFabEntered(true), 50);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    setCurrentStep(0);
  }, []);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setIsOpen(false);
    }, 200);
  }, []);

  const handleDismissFAB = useCallback(() => {
    setFabEntered(false);
    setTimeout(() => {
      setShowFAB(false);
      onDismiss();
    }, 300);
  }, [onDismiss]);

  const handleFinish = useCallback(() => {
    handleClose();
    handleDismissFAB();
  }, [handleClose, handleDismissFAB]);

  const handleNext = useCallback(() => {
    if (currentStep < GUIDE_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleFinish();
    }
  }, [currentStep, handleFinish]);

  if (!showFAB && !isOpen) return null;

  const step = GUIDE_STEPS[currentStep];
  const StepIcon = step.icon;

  return (
    <>
      {/* FAB Button */}
      {showFAB && !isOpen && (
        <div
          className={`absolute bottom-20 right-4 z-40 transition-all duration-300 ${
            fabEntered ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 translate-y-4'
          }`}
        >
          <button
            onClick={handleOpen}
            className="relative flex items-center gap-2 pl-3.5 pr-4 py-2.5 rounded-full bg-gamana-500 text-white shadow-lg shadow-gamana-500/30 hover:bg-gamana-600 active:scale-95 transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Play size={14} fill="white" className="ml-0.5" />
            </div>
            <span className="text-[13px] font-semibold whitespace-nowrap">Quick Demo</span>
            {/* Pulse ring */}
            <div className="absolute -inset-1 rounded-full border-2 border-gamana-400/40 animate-ping pointer-events-none" />
          </button>

          {/* Dismiss */}
          <button
            onClick={handleDismissFAB}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gray-600 text-white flex items-center justify-center shadow-sm hover:bg-gray-700"
          >
            <X size={10} />
          </button>
        </div>
      )}

      {/* Guide Overlay */}
      {isOpen && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end">
          <div
            className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${
              isClosing ? 'opacity-0' : 'opacity-100'
            }`}
            onClick={handleClose}
          />

          <div
            className={`relative bg-surface rounded-t-3xl shadow-elevated transition-transform duration-200 ease-out ${
              isClosing ? 'translate-y-full' : 'translate-y-0'
            }`}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-8 h-1 rounded-full bg-surface-muted" />
            </div>

            {/* Step Indicators */}
            <div className="flex items-center gap-1.5 px-6 pt-2">
              {GUIDE_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                    i <= currentStep ? 'bg-gamana-500' : 'bg-surface-muted'
                  }`}
                />
              ))}
            </div>

            {/* Content */}
            <div className="px-6 pt-6 pb-8">
              {/* Icon */}
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center mx-auto mb-5 shadow-lg`}>
                <StepIcon size={28} className="text-white" />
              </div>

              <h3 className="text-xl font-bold text-heading text-center">{step.title}</h3>
              <p className="text-sm text-secondary text-center mt-2.5 leading-relaxed max-w-[280px] mx-auto">
                {step.description}
              </p>

              {/* Actions */}
              <div className="flex flex-col gap-2.5 mt-8">
                <button
                  onClick={handleNext}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gamana-500 text-white font-semibold text-sm transition-all hover:bg-gamana-600 active:scale-[0.98] shadow-md shadow-gamana-500/20"
                >
                  {currentStep < GUIDE_STEPS.length - 1 ? (
                    <>
                      Next
                      <ChevronRight size={16} />
                    </>
                  ) : (
                    'Get Started!'
                  )}
                </button>

                {currentStep < GUIDE_STEPS.length - 1 && (
                  <button
                    onClick={handleFinish}
                    className="w-full py-2.5 text-sm text-muted font-medium hover:text-secondary transition-colors"
                  >
                    Skip Guide
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

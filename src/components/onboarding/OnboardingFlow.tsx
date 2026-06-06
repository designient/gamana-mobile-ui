import { useState, useCallback, useRef } from 'react';
import type { Narrator } from '../../types';
import { setPreferredNarratorId } from '../../lib/localDb';
import WelcomeStep from './WelcomeStep';
import NarratorStep from './NarratorStep';
import LoginStep from './LoginStep';
import LocationStep from './LocationStep';

type Step = 'welcome' | 'narrator' | 'login' | 'location';

interface OnboardingFlowProps {
  narrators: Narrator[];
  onComplete: (narratorId: string, locationGranted: boolean) => void;
}

export default function OnboardingFlow({ narrators, onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState<Step>('welcome');
  const chosenNarratorRef = useRef<string>('');
  const startTimeRef = useRef(Date.now());

  const handleWelcomeNext = useCallback(() => {
    setStep('narrator');
  }, []);

  const handleNarratorNext = useCallback((narratorId: string) => {
    chosenNarratorRef.current = narratorId;
    setPreferredNarratorId(narratorId);
    setStep('login');
  }, []);

  const handleLoginNext = useCallback((skipped: boolean) => {
    console.info('onboarding_login_step', { skipped });
    setStep('location');
  }, []);

  const handleLocationNext = useCallback((locationGranted: boolean) => {
    const durationMs = Date.now() - startTimeRef.current;
    console.info('onboarding_completed', {
      duration_ms: durationMs,
      narrator_id: chosenNarratorRef.current,
      location_granted: locationGranted,
    });
    onComplete(chosenNarratorRef.current, locationGranted);
  }, [onComplete]);

  switch (step) {
    case 'welcome':
      return <WelcomeStep onNext={handleWelcomeNext} />;
    case 'narrator':
      return <NarratorStep narrators={narrators} onNext={handleNarratorNext} />;
    case 'login':
      return <LoginStep onNext={handleLoginNext} />;
    case 'location':
      return <LocationStep onNext={handleLocationNext} />;
  }
}

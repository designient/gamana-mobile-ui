import { useState, useCallback, useEffect } from 'react';
import {
  X, ShieldAlert, Phone, Heart, Flame, LifeBuoy, Shield,
  ChevronDown, MapPin, AlertTriangle, Check,
} from 'lucide-react';
import {
  detectUserCountry,
  getEmergencyInfo,
  getAllCountries,
  setEmergencyCountryOverride,
} from '../../lib/emergencyData';
import type { EmergencyService } from '../../lib/emergencyData';
import { getFamilyGroups } from '../../lib/familyDb';
import { sendSOSAlert } from '../../lib/familyMessages';

interface SOSSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const SERVICE_ICONS: Record<EmergencyService['type'], typeof Phone> = {
  police: Shield,
  ambulance: Heart,
  fire: Flame,
  rescue: LifeBuoy,
  universal: Phone,
};

const SERVICE_COLORS: Record<EmergencyService['type'], { bg: string; text: string }> = {
  police: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600' },
  ambulance: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-500' },
  fire: { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-500' },
  rescue: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600' },
  universal: { bg: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-violet-600' },
};

export default function SOSSheet({ isOpen, onClose }: SOSSheetProps) {
  const [countryCode, setCountryCode] = useState(() => detectUserCountry());
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [alertSent, setAlertSent] = useState(false);
  const [sendingAlert, setSendingAlert] = useState(false);

  const emergencyInfo = getEmergencyInfo(countryCode);
  const allCountries = getAllCountries();

  useEffect(() => {
    if (isOpen) {
      setAlertSent(false);
      setSendingAlert(false);
    }
  }, [isOpen]);

  const handleCountrySelect = useCallback((code: string) => {
    setCountryCode(code);
    setEmergencyCountryOverride(code);
    setShowCountryPicker(false);
  }, []);

  const handleAlertFamily = useCallback(() => {
    setSendingAlert(true);
    const groups = getFamilyGroups();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          groups.forEach((g) => {
            sendSOSAlert(g.id, pos.coords.latitude, pos.coords.longitude);
          });
          setSendingAlert(false);
          setAlertSent(true);
        },
        () => {
          groups.forEach((g) => {
            sendSOSAlert(g.id);
          });
          setSendingAlert(false);
          setAlertSent(true);
        },
        { enableHighAccuracy: true, timeout: 5000 },
      );
    } else {
      groups.forEach((g) => {
        sendSOSAlert(g.id);
      });
      setSendingAlert(false);
      setAlertSent(true);
    }
  }, []);

  if (!isOpen) return null;

  if (showCountryPicker) {
    return (
      <div className="absolute inset-0 z-50 flex flex-col justify-end items-center">
        <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={() => setShowCountryPicker(false)} />
        <div className="relative w-full max-w-[402px] bg-surface rounded-t-3xl flex flex-col max-h-[80%] animate-slide-up">
          <div className="flex items-center justify-between px-6 pt-6 pb-3 border-b border-border-default">
            <h2 className="text-base font-bold text-heading">Select Country</h2>
            <button onClick={() => setShowCountryPicker(false)} className="p-1 rounded-full hover:bg-surface-muted">
              <X size={20} className="text-muted" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-2 py-2">
            {allCountries.map((c) => (
              <button
                key={c.countryCode}
                onClick={() => handleCountrySelect(c.countryCode)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                  c.countryCode === countryCode ? 'bg-gamana-50 dark:bg-gamana-900/20' : 'hover:bg-surface-alt'
                }`}
              >
                <span className="text-sm text-heading flex-1">{c.countryName}</span>
                <span className="text-xs text-muted">{c.countryCode}</span>
                {c.countryCode === countryCode && (
                  <Check size={16} className="text-gamana-500" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const familyGroups = getFamilyGroups();
  const hasGroups = familyGroups.length > 0;

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end items-center">
      <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-[402px] bg-surface rounded-t-3xl p-6 pb-8 animate-slide-up max-h-[85%] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <ShieldAlert size={22} className="text-red-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-heading">Emergency SOS</h2>
              <p className="text-[11px] text-muted">Tap a number to call</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-surface-muted">
            <X size={20} className="text-muted" />
          </button>
        </div>

        {/* Country selector */}
        <button
          onClick={() => setShowCountryPicker(true)}
          className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-alt border border-border-default mb-4 hover:bg-surface-muted transition-colors"
        >
          <MapPin size={14} className="text-muted" />
          <span className="flex-1 text-sm text-heading text-left">{emergencyInfo.countryName}</span>
          <ChevronDown size={14} className="text-muted" />
        </button>

        {/* Emergency numbers */}
        <div className="space-y-2.5 mb-5">
          {emergencyInfo.services.map((service, idx) => {
            const Icon = SERVICE_ICONS[service.type];
            const colorConfig = SERVICE_COLORS[service.type];
            return (
              <a
                key={`${service.number}-${idx}`}
                href={`tel:${service.number}`}
                className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-surface border border-border-default shadow-card hover:border-border-default active:scale-[0.98] transition-all"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorConfig.bg}`}>
                  <Icon size={20} className={colorConfig.text} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-heading">{service.label}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-heading tracking-wide">{service.number}</span>
                  <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                    <Phone size={16} className="text-white" />
                  </div>
                </div>
              </a>
            );
          })}
        </div>

        {/* Alert My Family */}
        {hasGroups && (
          <button
            onClick={handleAlertFamily}
            disabled={sendingAlert || alertSent}
            className={`w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-semibold text-sm transition-all ${
              alertSent
                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border border-emerald-200 dark:border-emerald-800'
                : 'bg-red-500 text-white hover:bg-red-600 active:scale-[0.97]'
            } ${sendingAlert ? 'opacity-60' : ''}`}
          >
            {alertSent ? (
              <>
                <Check size={18} />
                SOS Alert Sent to All Groups
              </>
            ) : (
              <>
                <AlertTriangle size={18} />
                {sendingAlert ? 'Sending Alert...' : 'Alert My Family'}
              </>
            )}
          </button>
        )}

        {/* Disclaimer */}
        <p className="text-[10px] text-muted text-center mt-4 leading-relaxed px-4">
          In a life-threatening emergency, always call local emergency services directly.
          Numbers shown are based on your selected country and may not cover all regions.
        </p>
      </div>
    </div>
  );
}

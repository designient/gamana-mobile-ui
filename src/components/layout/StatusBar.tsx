import { Signal, Wifi, Battery } from 'lucide-react';

export default function StatusBar() {
  const now = new Date();
  const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false });

  return (
    <div className="flex items-center justify-between px-6 py-2 bg-surface/80 backdrop-blur-md">
      <span className="text-sm font-semibold text-heading">{time}</span>
      <div className="flex items-center gap-1.5">
        <Signal size={14} className="text-heading" />
        <Wifi size={14} className="text-heading" />
        <Battery size={14} className="text-heading" />
      </div>
    </div>
  );
}

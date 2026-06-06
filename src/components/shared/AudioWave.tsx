export default function AudioWave() {
  return (
    <div className="flex items-center gap-[3px] h-4">
      <div className="w-[3px] bg-gamana-500 rounded-full animate-wave-1" />
      <div className="w-[3px] bg-gamana-500 rounded-full animate-wave-2" />
      <div className="w-[3px] bg-gamana-500 rounded-full animate-wave-3" />
      <div className="w-[3px] bg-gamana-500 rounded-full animate-wave-1" />
    </div>
  );
}

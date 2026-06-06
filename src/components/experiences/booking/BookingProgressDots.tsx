interface BookingProgressDotsProps {
  current: number;
  total: number;
}

export default function BookingProgressDots({ current, total }: BookingProgressDotsProps) {
  return (
    <div className="flex justify-center gap-1.5 py-2">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-2 rounded-full transition-all ${
            i === current ? 'w-5 bg-gamana-500' : 'w-2 bg-gamana-200'
          }`}
        />
      ))}
    </div>
  );
}

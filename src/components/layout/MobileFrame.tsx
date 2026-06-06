import type { ReactNode } from 'react';

export default function MobileFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex justify-center items-center min-h-screen bg-frame">
      <div className="w-full max-w-[402px] h-[874px] bg-canvas relative overflow-hidden shadow-2xl rounded-[2rem]">
        {children}
      </div>
    </div>
  );
}

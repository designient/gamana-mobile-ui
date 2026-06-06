import { useState, useRef, useCallback, useEffect, type ReactNode } from 'react';

export type SheetState = 'peek' | 'half' | 'expanded';

interface TourBottomSheetProps {
  state: SheetState;
  onStateChange: (state: SheetState) => void;
  peekContent: ReactNode;
  halfContent: ReactNode;
  expandedContent: ReactNode;
}

// Sheet snap heights as percentage from the BOTTOM of the viewport
const SNAP_POINTS: Record<SheetState, number> = {
  peek: 18,     // ~18% from bottom (compact nav bar)
  half: 45,     // ~45% from bottom (stop card + audio player)
  expanded: 88, // ~88% from bottom (full list)
};

export default function TourBottomSheet({
  state,
  onStateChange,
  peekContent,
  halfContent,
  expandedContent,
}: TourBottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ y: number; height: number } | null>(null);
  const [dragHeight, setDragHeight] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const currentSnapHeight = SNAP_POINTS[state];

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    // Only drag from the handle area
    const target = e.target as HTMLElement;
    if (!target.closest('[data-sheet-handle]')) return;

    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragStartRef.current = {
      y: e.clientY,
      height: currentSnapHeight,
    };
  }, [currentSnapHeight]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragStartRef.current || !isDragging) return;
    e.preventDefault();

    const deltaY = dragStartRef.current.y - e.clientY;
    const deltaPercent = (deltaY / window.innerHeight) * 100;
    const newHeight = Math.max(10, Math.min(92, dragStartRef.current.height + deltaPercent));
    setDragHeight(newHeight);
  }, [isDragging]);

  const handlePointerUp = useCallback(() => {
    if (!isDragging || dragHeight === null) {
      setIsDragging(false);
      dragStartRef.current = null;
      return;
    }

    // Snap to nearest point
    let closest: SheetState = 'peek';
    let closestDist = Infinity;
    for (const [snapState, snapHeight] of Object.entries(SNAP_POINTS)) {
      const dist = Math.abs(dragHeight - snapHeight);
      if (dist < closestDist) {
        closestDist = dist;
        closest = snapState as SheetState;
      }
    }

    // Also snap based on velocity/direction: if dragging down fast, go to peek
    if (dragStartRef.current) {
      const delta = dragHeight - dragStartRef.current.height;
      if (delta < -8 && state !== 'peek') {
        // Dragged down significantly
        closest = state === 'expanded' ? 'half' : 'peek';
      } else if (delta > 8 && state !== 'expanded') {
        // Dragged up significantly
        closest = state === 'peek' ? 'half' : 'expanded';
      }
    }

    onStateChange(closest);
    setDragHeight(null);
    setIsDragging(false);
    dragStartRef.current = null;
  }, [isDragging, dragHeight, state, onStateChange]);

  // Cancel drag on pointer leave
  useEffect(() => {
    const handleGlobalUp = () => {
      if (isDragging) {
        handlePointerUp();
      }
    };
    window.addEventListener('pointerup', handleGlobalUp);
    return () => window.removeEventListener('pointerup', handleGlobalUp);
  }, [isDragging, handlePointerUp]);

  const displayHeight = isDragging && dragHeight !== null ? dragHeight : currentSnapHeight;
  const showHalfContent = displayHeight > 22;
  const showExpandedContent = displayHeight > 50;

  return (
    <>
      {/* Backdrop for expanded state */}
      {state === 'expanded' && !isDragging && (
        <div
          className="absolute inset-0 z-30 bg-black/20 backdrop-blur-[2px] transition-opacity duration-300"
          onClick={() => onStateChange('half')}
        />
      )}

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={`absolute left-0 right-0 bottom-0 z-40 flex flex-col bg-surface rounded-t-[20px] shadow-[0_-8px_30px_rgba(0,0,0,0.12)] ${
          isDragging ? '' : 'transition-[height] duration-300 ease-out'
        }`}
        style={{ height: `${displayHeight}%` }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Drag Handle */}
        <div
          data-sheet-handle
          className="flex-shrink-0 flex flex-col items-center pt-2.5 pb-1 cursor-grab active:cursor-grabbing touch-none"
        >
          <div className="w-9 h-1 rounded-full bg-surface-muted" />
        </div>

        {/* Sheet content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Peek content — always visible */}
          <div className="flex-shrink-0 px-4 pb-2">
            {peekContent}
          </div>

          {/* Half content — visible when sheet is above peek */}
          {showHalfContent && (
            <div className="flex-shrink-0 px-4 pb-2 animate-[fadeSlideUp_0.2s_ease-out]">
              {halfContent}
            </div>
          )}

          {/* Expanded content — scrollable list */}
          {showExpandedContent && (
            <div className="flex-1 overflow-y-auto px-4 pb-6 animate-[fadeSlideUp_0.2s_ease-out]">
              {expandedContent}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

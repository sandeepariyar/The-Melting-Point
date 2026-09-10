import React from 'react';

export interface RippleItem {
  id: number;
  x: number;
  y: number;
}

interface TouchRippleContainerProps {
  ripples: RippleItem[];
}

export const TouchRippleContainer: React.FC<TouchRippleContainerProps> = ({ ripples }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {ripples.map((r) => (
        <React.Fragment key={r.id}>
          {/* Inner primary pulse */}
          <span
            style={{ left: `${r.x}px`, top: `${r.y}px` }}
            className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-cyan-400 bg-cyan-400/20 shadow-[0_0_15px_rgba(34,211,238,0.8)] animate-[rippleOut_0.85s_cubic-bezier(0.1,0.8,0.3,1)_forwards]"
          />
          {/* Outer secondary concentric wave */}
          <span
            style={{ left: `${r.x}px`, top: `${r.y}px`, animationDelay: '120ms' }}
            className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-300/80 shadow-[0_0_25px_rgba(56,189,248,0.6)] animate-[rippleOut_1.1s_cubic-bezier(0.1,0.8,0.3,1)_forwards]"
          />
        </React.Fragment>
      ))}
    </div>
  );
};

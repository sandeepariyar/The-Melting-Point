import React from 'react';
import { MapPin } from 'lucide-react';

interface ActHeaderProps {
  label: string;
  title: string;
  dateline?: string;
  visible: boolean;
}

export const ActHeader: React.FC<ActHeaderProps> = ({ label, title, dateline, visible }) => {
  if (!visible) return null;

  return (
    <div className="absolute top-20 left-8 sm:left-10 lg:left-12 z-20 pointer-events-none max-w-xl transition-all duration-700 ease-out animate-fadeIn">
      {/* Category Pill Badge */}
      <div className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.28em] uppercase text-[#7ec8e3] bg-[#0a1418]/75 border border-[#7ec8e3]/30 px-3 py-1 rounded-full backdrop-blur-md mb-2.5 shadow-[0_0_15px_rgba(126,200,227,0.15)]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#7ec8e3] animate-pulse" />
        <span>{label}</span>
      </div>

      {/* Main Act Title */}
      <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-normal leading-[1.05] tracking-tight text-[#eaf2f5] drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)]">
        <em className="italic text-transparent bg-clip-text bg-gradient-to-r from-[#ffffff] via-[#e2f5fa] to-[#7ec8e3]">
          {title}
        </em>
      </h2>

      {/* Dateline & Coordinates */}
      {dateline && (
        <div className="mt-2.5 flex items-center gap-2 font-mono text-xs tracking-[0.18em] text-[#8fa3ab] uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
          <MapPin className="w-3.5 h-3.5 text-[#7ec8e3]/80 flex-shrink-0" />
          <span>{dateline}</span>
        </div>
      )}
    </div>
  );
};

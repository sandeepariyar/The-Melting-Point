import React, { useEffect, useState } from 'react';
import { TranslationSchema } from '../types';
import { MeltingText } from './MeltingText';
import { Sparkles } from 'lucide-react';

interface AttractOverlayProps {
  t: TranslationSchema;
  onStart: () => void;
  visible: boolean;
}

export const AttractOverlay: React.FC<AttractOverlayProps> = ({ t, onStart, visible }) => {
  const [statIndex, setStatIndex] = useState(0);
  const [fadeState, setFadeState] = useState(true);

  useEffect(() => {
    if (!visible) return;

    const interval = setInterval(() => {
      setFadeState(false);
      setTimeout(() => {
        setStatIndex((prev) => (prev + 1) % t.attract_stats.length);
        setFadeState(true);
      }, 450);
    }, 4500);

    return () => clearInterval(interval);
  }, [visible, t.attract_stats.length]);

  if (!visible) return null;

  const currentStat = t.attract_stats[statIndex] || t.attract_stats[0];

  return (
    <div
      onClick={onStart}
      className="absolute inset-0 z-20 flex flex-col items-center justify-between py-16 px-8 cursor-pointer transition-opacity duration-1000 select-none pointer-events-auto"
    >
      {/* Top Curatorial Tag */}
      <div className="flex items-center gap-3 font-mono text-[11px] tracking-[0.3em] uppercase text-[#8fa3ab] bg-[#0a1418]/60 border border-white/10 px-5 py-2 rounded-full backdrop-blur-md">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7ec8e3] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#7ec8e3]"></span>
        </span>
        <span>HIMALAYAN CRYOSPHERE RECORD · EXHIBIT NO. 04</span>
      </div>

      {/* Main Title Centerpiece */}
      <div className="text-center max-w-[1400px] flex flex-col items-center my-auto">
        <h1 className="font-display text-[108px] sm:text-[144px] lg:text-[172px] font-normal leading-[0.9] tracking-[-0.02em] text-[#eaf2f5] mb-4 drop-shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
          The{' '}
          <MeltingText text="Melting" className="inline-block" />
          <br />
          Point
        </h1>

        {/* Subtitle & Curatorial Line */}
        <div className="flex items-center gap-4 font-mono text-sm sm:text-base tracking-[0.25em] uppercase text-[#8fa3ab] mb-8">
          <span className="w-8 h-[1px] bg-gradient-to-r from-transparent to-[#7ec8e3]/60"></span>
          <span>{t.attract_subtitle}</span>
          <span className="w-8 h-[1px] bg-gradient-to-l from-transparent to-[#7ec8e3]/60"></span>
        </div>

        {/* Pure Floating Typographic Metric (No Box) */}
        <div className="min-h-[160px] max-w-[800px] w-full flex flex-col items-center justify-center">
          <div
            className={`font-display text-7xl sm:text-8xl lg:text-9xl leading-none text-transparent bg-clip-text bg-gradient-to-b from-[#ffffff] via-[#d4f2fb] to-[#7ec8e3] font-normal tracking-tight transition-all duration-500 mb-3 drop-shadow-[0_4px_35px_rgba(0,0,0,0.9)] ${
              fadeState ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-2'
            }`}
          >
            {currentStat.big}
          </div>
          <div
            className={`font-body text-lg sm:text-xl text-[#8fa3ab] tracking-wide max-w-[620px] transition-all duration-500 text-center drop-shadow-[0_2px_15px_rgba(0,0,0,0.8)] ${
              fadeState ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {currentStat.small}
          </div>

          {/* Minimal Pagination Dots */}
          <div className="flex items-center gap-2 mt-5">
            {t.attract_stats.map((_, i) => (
              <span
                key={i}
                className={`h-1 rounded-full transition-all duration-400 ${
                  i === statIndex ? 'w-6 bg-[#7ec8e3]' : 'w-1.5 bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* High-Contrast Interactive Touch Call-To-Action */}
      <div className="inline-flex items-center gap-4 font-mono text-xs sm:text-sm tracking-[0.35em] uppercase text-[#eaf2f5] border border-[#7ec8e3]/40 bg-[#7ec8e3]/10 hover:bg-[#7ec8e3]/20 px-8 py-3.5 rounded-full backdrop-blur-xl shadow-[0_0_30px_rgba(126,200,227,0.25)] hover:shadow-[0_0_45px_rgba(126,200,227,0.5)] transition-all animate-[pulse_2.8s_ease-in-out_infinite]">
        <Sparkles className="w-4 h-4 text-[#7ec8e3]" />
        <span>{t.attract_touch}</span>
        <Sparkles className="w-4 h-4 text-[#7ec8e3]" />
      </div>
    </div>
  );
};

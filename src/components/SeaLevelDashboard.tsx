import React, { useState, useEffect, useRef } from 'react';
import { TranslationSchema } from '../types';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface SeaLevelDashboardProps {
  t: TranslationSchema;
  seaLevelMeters: number;
  onSeaLevelChange: (meters: number) => void;
  onClose?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  isAct2Sequence?: boolean;
}

export const SeaLevelDashboard: React.FC<SeaLevelDashboardProps> = ({
  t,
  seaLevelMeters,
  onSeaLevelChange,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const seaLevelRef = useRef<number>(seaLevelMeters);
  seaLevelRef.current = seaLevelMeters;

  // Auto-play timeline progression (just like the Earth Heating Tunnel 1900-2026)
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const nextLevel = parseFloat((seaLevelRef.current + 0.08).toFixed(2));
      if (nextLevel > 6.0) {
        onSeaLevelChange(0);
      } else {
        onSeaLevelChange(nextLevel);
      }
    }, 280);

    return () => clearInterval(interval);
  }, [isPlaying, onSeaLevelChange]);

  // Displaced population calculation based on coastal elevation curves (IPCC SROCC models)
  const displacedMillions = Math.round(
    seaLevelMeters <= 0
      ? 18
      : 18 + Math.pow(seaLevelMeters, 1.45) * 165
  );

  const presets = [
    { name: 'Malediivit', elev: 1.5 },
    { name: 'Venetsia', elev: 1.0 },
    { name: 'Bangladesh', elev: 2.2 },
    { name: 'Mumbai', elev: 2.8 },
    { name: 'New York', elev: 3.1 },
    { name: 'Grönlanti', elev: 6.0 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none z-30 select-none">
      {/* Top Left Title positioned with adequate margin below TopBar */}
      <div className="absolute top-28 left-12 z-20 pointer-events-none animate-fadeIn">
        <div className="flex items-center gap-2 font-mono text-[11px] tracking-[0.28em] uppercase text-[#7ec8e3] mb-1">
          <span>{t.act2_title}</span>
          <span className="text-[#4d6169]">·</span>
          <span className="text-[#8fa3ab]">5/6 {t.act2_step5_label || 'VALTAMERET & RANNIKOT'}</span>
        </div>
        <div className="font-display italic text-4xl lg:text-5xl text-[#7ec8e3] tracking-wide leading-tight drop-shadow-[0_2px_20px_rgba(126,200,227,0.3)]">
          {t.ui_sea_level_toggle || 'Global Oceans'}
        </div>
      </div>

      {/* Top Right High-Contrast Numerical Telemetry */}
      <div className="absolute top-28 right-12 z-20 flex gap-8 lg:gap-14 pointer-events-auto">
        <div className="text-right">
          <div className="font-display text-4xl lg:text-5xl text-[#7ec8e3] font-light leading-none">
            +{seaLevelMeters.toFixed(1)} m
          </div>
          <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#8fa3ab] mt-1.5">
            {t.act3_sea_label || 'Merenpinnan nousu'}
          </div>
        </div>

        <div className="text-right">
          <div className="font-display text-4xl lg:text-5xl text-[#e63946] font-light leading-none">
            {displacedMillions} M
          </div>
          <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#8fa3ab] mt-1.5">
            {t.act3_disp_label || 'Pakolaisuus'}
          </div>
        </div>

        <div className="text-right hidden sm:block">
          <div className="font-display text-4xl lg:text-5xl text-[#eaf2f5] font-light leading-none">
            -5 380 Gt
          </div>
          <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#8fa3ab] mt-1.5">
            {t.act2_greenland_label || 'Grönlannin massahävikki'}
          </div>
        </div>
      </div>

      {/* Bottom Floating Minimalist Ocean Slider & Presets with Auto-play & Scrubbing */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 w-[960px] max-w-[85vw] pointer-events-auto flex flex-col items-center">
        {/* Preset City Pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {presets.map((c) => {
            const isActive = Math.abs(seaLevelMeters - c.elev) < 0.15;
            return (
              <button
                type="button"
                key={c.name}
                onClick={() => {
                  setIsPlaying(false);
                  onSeaLevelChange(c.elev);
                }}
                className={`px-4 py-1.5 font-mono text-xs tracking-wider uppercase transition-all duration-300 border cursor-pointer ${
                  isActive
                    ? 'border-[#7ec8e3] bg-[#7ec8e3]/25 text-[#eaf2f5] shadow-[0_0_20px_rgba(126,200,227,0.35)]'
                    : 'border-white/15 bg-[#0a1418]/70 hover:bg-[#0a1418]/90 text-[#8fa3ab] hover:text-[#eaf2f5] hover:border-white/35 backdrop-blur-md'
                }`}
              >
                <span>{c.name}</span>
                <span className="ml-2 text-[#7ec8e3]">+{c.elev}m</span>
              </button>
            );
          })}
        </div>

        {/* Minimalist Floating Slider Bar with Play / Pause / Reset Controls */}
        <div className="w-full px-6 py-4 bg-[#0a1418]/75 backdrop-blur-xl border border-white/15">
          <div className="flex items-center gap-4">
            {/* Play/Pause Button */}
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-full border border-white/20 bg-white/5 hover:bg-white/15 text-[#7ec8e3] hover:text-white transition-all cursor-pointer"
              title={isPlaying ? 'Pysäytä animaatio' : 'Käynnistä aikajana'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            {/* Reset Button */}
            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                onSeaLevelChange(0);
              }}
              className="p-2 rounded-full border border-white/20 bg-white/5 hover:bg-white/15 text-[#8fa3ab] hover:text-white transition-all cursor-pointer"
              title="Palauta alkuun (0m)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Interactive Timeline Scrubber */}
            <input
              type="range"
              min="0"
              max="6"
              step="0.1"
              value={seaLevelMeters}
              onChange={(e) => {
                setIsPlaying(false);
                onSeaLevelChange(parseFloat(e.target.value));
              }}
              className="flex-1 h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer accent-[#7ec8e3] hover:accent-[#9fe1f5] transition-all"
            />
          </div>

          <div className="flex justify-between text-[10px] font-mono text-[#8fa3ab] mt-3 tracking-widest uppercase pl-16">
            <span>0m (Nykyhetki)</span>
            <span>+1.5m (Malediivit)</span>
            <span>+3.0m (Suurkaupungit)</span>
            <span>+6.0m (Mannerjäätiköt)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { TranslationSchema } from '../types';
import { Play, Pause, RotateCcw, AlertTriangle, ShieldAlert } from 'lucide-react';

interface GlobalDashboardProps {
  t: TranslationSchema;
  scenarioTemp: number;
  onTempChange: (temp: number) => void;
  onClose?: () => void;
}

export const GlobalDashboard: React.FC<GlobalDashboardProps> = ({
  t,
  scenarioTemp,
  onTempChange,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const tempRef = useRef<number>(scenarioTemp);
  tempRef.current = scenarioTemp;

  // Auto-play progression through planetary warming scenarios (1.0°C to 3.0°C)
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const nextTemp = parseFloat((tempRef.current + 0.05).toFixed(2));
      if (nextTemp > 3.0) {
        onTempChange(1.0);
      } else {
        onTempChange(nextTemp);
      }
    }, 250);

    return () => clearInterval(interval);
  }, [isPlaying, onTempChange]);

  const presets = [
    { label: 'Paris Limit', val: 1.5 },
    { label: 'Severe Drift', val: 2.0 },
    { label: 'Runaway Crisis', val: 3.0 },
  ];

  const breachedPoints = scenarioTemp < 1.5 ? 2 : scenarioTemp < 2.2 ? 5 : 7;

  return (
    <div className="absolute inset-0 bg-transparent z-30 pointer-events-none select-none">
      {/* Top Left Title positioned with adequate margin below TopBar */}
      <div className="absolute top-28 left-12 z-20 pointer-events-none animate-fadeIn">
        <div className="flex items-center gap-2 font-mono text-[11px] tracking-[0.28em] uppercase text-[#f39c12] mb-1">
          <span>{t.act2_title}</span>
          <span className="text-[#4d6169]">·</span>
          <span className="text-[#8fa3ab]">6/6 {t.act2_step6_label || 'MAAPALLON KRIISIPISTEET'}</span>
        </div>
        <div className="font-display italic text-4xl lg:text-5xl text-[#f39c12] tracking-wide leading-tight drop-shadow-[0_2px_20px_rgba(243,156,18,0.3)]">
          Planetary Tipping Points
        </div>
      </div>

      {/* Top Right High-Contrast Numerical Telemetry */}
      <div className="absolute top-28 right-12 z-20 flex gap-8 lg:gap-14 pointer-events-auto">
        <div className="text-right">
          <div className="font-display text-4xl lg:text-5xl text-[#f39c12] font-light leading-none">
            +{scenarioTemp.toFixed(1)}°C
          </div>
          <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#8fa3ab] mt-1.5">
            Lämpötilan nousu
          </div>
        </div>

        <div className="text-right">
          <div className="font-display text-4xl lg:text-5xl text-[#e63946] font-light leading-none">
            {breachedPoints} / 7
          </div>
          <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#8fa3ab] mt-1.5">
            Kriisipisteet ylitetty
          </div>
        </div>

        <div className="text-right hidden sm:block">
          <div className="font-display text-4xl lg:text-5xl text-[#eaf2f5] font-light leading-none">
            {scenarioTemp >= 2.0 ? 'Kriittinen' : 'Epävakaa'}
          </div>
          <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#8fa3ab] mt-1.5">
            Biosfäärin tila
          </div>
        </div>
      </div>

      {/* Bottom Floating Minimalist Temperature Slider & Presets */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 w-[960px] max-w-[85vw] pointer-events-auto flex flex-col items-center">
        {/* Preset Pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {presets.map((p) => {
            const isActive = Math.abs(scenarioTemp - p.val) < 0.15;
            return (
              <button
                type="button"
                key={p.label}
                onClick={() => {
                  setIsPlaying(false);
                  onTempChange(p.val);
                }}
                className={`px-4 py-1.5 font-mono text-xs tracking-wider uppercase transition-all duration-300 border cursor-pointer ${
                  isActive
                    ? 'border-[#f39c12] bg-[#f39c12]/25 text-[#eaf2f5] shadow-[0_0_20px_rgba(243,156,18,0.35)]'
                    : 'border-white/15 bg-[#0a1418]/70 hover:bg-[#0a1418]/90 text-[#8fa3ab] hover:text-[#eaf2f5] hover:border-white/35 backdrop-blur-md'
                }`}
              >
                <span>{p.label}</span>
                <span className="ml-2 text-[#f39c12]">+{p.val}C</span>
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
              className="p-2 rounded-full border border-white/20 bg-white/5 hover:bg-white/15 text-[#f39c12] hover:text-white transition-all cursor-pointer"
              title={isPlaying ? 'Pysäytä animaatio' : 'Käynnistä aikajana'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            {/* Reset Button */}
            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                onTempChange(1.0);
              }}
              className="p-2 rounded-full border border-white/20 bg-white/5 hover:bg-white/15 text-[#8fa3ab] hover:text-white transition-all cursor-pointer"
              title="Palauta alkuun (+1.0°C)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Interactive Timeline Scrubber */}
            <input
              type="range"
              min="1.0"
              max="3.0"
              step="0.1"
              value={scenarioTemp}
              onChange={(e) => {
                setIsPlaying(false);
                onTempChange(parseFloat(e.target.value));
              }}
              className="flex-1 h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer accent-[#f39c12] hover:accent-[#f5b041] transition-all"
            />
          </div>

          <div className="flex justify-between text-[10px] font-mono text-[#8fa3ab] mt-3 tracking-widest uppercase pl-16">
            <span>+1.0°C (Viitekausi)</span>
            <span>+1.5°C (Pariisin tavoite)</span>
            <span>+2.0°C (Vaaravyöhyke)</span>
            <span>+3.0°C (Kriittinen keikahdus)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

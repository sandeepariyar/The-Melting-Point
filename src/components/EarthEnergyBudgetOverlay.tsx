import React, { useState, useEffect, useRef } from 'react';
import { TranslationSchema } from '../types';
import { HEAT_RESERVOIRS, HeatReservoir, ENERGY_IMBALANCE_SUMMARY } from '../data/energyBudgetData';
import { Flame, Waves, Mountain, Wind, Radio, Info, X, Zap } from 'lucide-react';
import { audioService } from '../services/audioService';

interface EarthEnergyBudgetOverlayProps {
  t: TranslationSchema;
  visible: boolean;
  onClose?: () => void;
  stepIndicator?: string;
  isAct2Sequence?: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetReservoir: 'oceans' | 'cryosphere' | 'land' | 'atmosphere';
  color: string;
  size: number;
  alpha: number;
}

export const EarthEnergyBudgetOverlay: React.FC<EarthEnergyBudgetOverlayProps> = ({
  t,
  visible,
  onClose,
  stepIndicator,
  isAct2Sequence = false,
}) => {
  if (!visible) return null;

  const [selectedReservoir, setSelectedReservoir] = useState<HeatReservoir>(HEAT_RESERVOIRS[0]);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Dynamic real-time atomic bomb & energy accumulation ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const totalJoulesAccumulatedInView = elapsedSeconds * ENERGY_IMBALANCE_SUMMARY.wattsTrappedGlobal;
  const bombsDetonatedEquivalent = (elapsedSeconds * ENERGY_IMBALANCE_SUMMARY.hiroshimaEquivalentPerSec).toFixed(1);

  // Particle System Canvas Visualizing Radiation Flow
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    let animationFrameId: number;

    const particles: Particle[] = [];
    const maxParticles = 140;

    // Reservoir target coordinates on canvas
    const targets = {
      oceans: { x: width * 0.28, y: height * 0.72, color: '#0284c7' },
      cryosphere: { x: width * 0.48, y: height * 0.68, color: '#38bdf8' },
      land: { x: width * 0.68, y: height * 0.72, color: '#f59e0b' },
      atmosphere: { x: width * 0.86, y: height * 0.62, color: '#ef4444' },
    };

    const spawnParticle = () => {
      // Pick random reservoir according to real physical percentage
      const rand = Math.random() * 100;
      let resId: 'oceans' | 'cryosphere' | 'land' | 'atmosphere' = 'oceans';
      if (rand > 89 + 5 + 4) resId = 'atmosphere';
      else if (rand > 89 + 5) resId = 'land';
      else if (rand > 89) resId = 'cryosphere';

      const target = targets[resId];
      particles.push({
        x: width * 0.15 + Math.random() * (width * 0.7),
        y: 40 + Math.random() * 60, // top atmosphere entry
        vx: (target.x - (width * 0.15 + Math.random() * (width * 0.7))) * 0.005,
        vy: 1.5 + Math.random() * 2.5,
        targetReservoir: resId,
        color: target.color,
        size: 2.5 + Math.random() * 3,
        alpha: 0.9,
      });
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Spawn new energy quantum particles
      if (particles.length < maxParticles) {
        spawnParticle();
      }

      // Draw Upper Atmosphere Radiative Forcing Line (+1.48 W/m²)
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(width * 0.08, 90);
      ctx.lineTo(width * 0.92, 90);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = '10px monospace';
      ctx.fillStyle = 'rgba(239, 68, 68, 0.75)';
      ctx.textAlign = 'right';
      ctx.fillText('YLÄILMAKEHÄN SÄTEILYEPÄTASAPAINO (+1.48 W/m²)', width * 0.92, 80);

      // Update & render particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Trace glow
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.restore();

        // Check if reached reservoir level
        if (p.y >= height * 0.65) {
          p.alpha -= 0.04;
          if (p.alpha <= 0) {
            particles.splice(i, 1);
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="absolute inset-0 z-30 pointer-events-auto select-none bg-[#030708]/85 backdrop-blur-md transition-opacity duration-700">
      {/* Dynamic Background Energy Flow Canvas */}
      <canvas
        ref={canvasRef}
        width={1400}
        height={850}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Top Header Information floating cleanly */}
      <div className="absolute top-28 left-12 z-20 pointer-events-none">
        <div className="flex items-center gap-2 font-mono text-[11px] tracking-[0.28em] uppercase text-[#38bdf8] mb-1">
          <span>{t.act2_title}</span>
          <span className="text-[#4d6169]">·</span>
          <span className="text-[#8fa3ab]">{stepIndicator || 'MAAPALLON ENERGIATALOUS & LÄMPÖVARASTOT'}</span>
        </div>
        <div className="font-display italic text-4xl lg:text-5xl text-[#eaf2f5] tracking-wide leading-tight">
          Earth's Trapped Energy Budget
        </div>
        <div className="font-mono text-xs tracking-wider text-[#8fa3ab] max-w-xl mt-1.5 leading-relaxed">
          Kasvihuonekaasut estävät lämmön säteilemisen avaruuteen. Ylimääräinen lämpöenergia kertyy neljään fysikaaliseen nieluun. Nepalin vuoden 2026 katastrofi oli tämän energian suora purkautuma.
        </div>
      </div>

      {/* Top Right High-Contrast Real-time Atomic Bomb Equivalent Ticker */}
      <div className="absolute top-28 right-12 z-20 pointer-events-none text-right">
        <div className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#ef4444] mb-1 flex items-center justify-end gap-2">
          <Flame className="w-3.5 h-3.5 animate-pulse" />
          <span>VANGITTU ENERGIAREAALIAJASSA</span>
        </div>
        <div className="font-display text-4xl lg:text-5xl font-light text-white tracking-tight leading-none">
          {bombsDetonatedEquivalent}
        </div>
        <div className="font-mono text-xs tracking-wider text-[#8fa3ab] mt-1.5 uppercase">
          Hiroshiman pommin energiaa / tämän istunnon aikana
        </div>
        <div className="font-mono text-[10px] tracking-widest text-[#ef4444]/90 mt-1 uppercase">
          5.2 POMMIA JOKA SEKUNTI (460 TERAWATTIA)
        </div>
      </div>

      {/* Center Interactive Heat Reservoirs Display */}
      <div className="absolute bottom-28 left-12 right-12 z-20 flex flex-col items-center pointer-events-auto">
        {/* Reservoir Percentage Selector Bars */}
        <div className="w-full max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {HEAT_RESERVOIRS.map((res) => {
            const isSelected = selectedReservoir.id === res.id;
            return (
              <button
                key={res.id}
                type="button"
                onClick={() => {
                  setSelectedReservoir(res);
                  audioService.tick();
                }}
                className={`p-5 text-left border transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? 'bg-[#0a1820]/90 border-[#38bdf8] shadow-[0_0_30px_rgba(56,189,248,0.3)]'
                    : 'bg-[#060c10]/70 hover:bg-[#0a1820]/80 border-white/10 hover:border-white/30 backdrop-blur-md'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[11px] tracking-[0.25em] uppercase text-[#8fa3ab]">
                    {res.id === 'oceans' ? '89 % LÄMMÖSTÄ' : `${res.percentage} % LÄMMÖSTÄ`}
                  </span>
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: res.color, boxShadow: `0 0 10px ${res.color}` }}
                  />
                </div>
                <div className="font-display text-3xl font-light text-white mb-1">
                  {res.percentage}%
                </div>
                <div className="font-mono text-xs font-semibold text-[#eaf2f5] tracking-wide truncate">
                  {res.title.fi}
                </div>
                <div className="font-mono text-[11px] text-[#38bdf8] mt-2">
                  {res.metricValue}
                </div>
              </button>
            );
          })}
        </div>

        {/* Focused Reservoir Deep-Dive Explanation */}
        <div className="w-full max-w-5xl p-6 bg-[#071217]/85 border border-white/15 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2.5 font-mono text-xs tracking-widest text-[#38bdf8] uppercase mb-1">
              <Zap className="w-4 h-4 text-[#facc15]" />
              <span>FYSIKAALINEN VAIKUTUS MEKANISMIIN: {selectedReservoir.title.fi}</span>
            </div>
            <div className="text-sm text-[#eaf2f5] font-light leading-relaxed">
              {selectedReservoir.primaryImpact.fi}
            </div>
          </div>
          <div className="text-right border-l border-white/10 pl-6 hidden md:block">
            <div className="font-mono text-[10px] tracking-widest text-[#8fa3ab] uppercase mb-1">
              KERTALUOKKA
            </div>
            <div className="font-display text-2xl text-white">
              {selectedReservoir.energyZJ} ZJ
            </div>
            <div className="font-mono text-[10px] text-[#8fa3ab] mt-0.5">
              10²¹ Joulea sitoutunut
            </div>
          </div>
        </div>
      </div>

      {/* Close Button (if opened standalone) */}
      {onClose && !isAct2Sequence && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-28 right-8 z-30 p-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all cursor-pointer"
          title="Sulje"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

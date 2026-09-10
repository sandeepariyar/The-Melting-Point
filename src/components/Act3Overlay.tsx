import React from 'react';
import { TranslationSchema } from '../types';
import { FUTURES } from '../data/climateData';
import { BookOpen, Share2, HeartHandshake } from 'lucide-react';

interface Act3OverlayProps {
  t: TranslationSchema;
  scenarioTemp: number;
  onSelectScenario: (temp: number) => void;
  showClosingCard: boolean;
  onOpenActionModal: (type: 'learn' | 'share' | 'act') => void;
  visible: boolean;
}

export const Act3Overlay: React.FC<Act3OverlayProps> = ({
  t,
  scenarioTemp,
  onSelectScenario,
  showClosingCard,
  onOpenActionModal,
  visible,
}) => {
  if (!visible) return null;

  const currentFuture = FUTURES[scenarioTemp.toFixed(1)] || FUTURES['1.5'];

  return (
    <>
      {/* Interactive Scenario Selection */}
      {!showClosingCard && (
        <div className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 z-20 w-[94vw] max-w-[1100px] pointer-events-auto transition-opacity duration-700 animate-fadeIn">
          <div className="text-center mb-6">
            <h3 className="font-display text-3xl sm:text-4xl lg:text-5xl italic text-[#eaf2f5] drop-shadow-[0_4px_30px_rgba(0,0,0,0.85)]">
              {t.act3_intro}
            </h3>
          </div>

          {/* Scenario Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-5">
            {(['1.5', '2.0', '3.0', '4.0'] as const).map((tempKey) => {
              const numTemp = parseFloat(tempKey);
              const isActive = Math.abs(scenarioTemp - numTemp) < 0.05;

              let activeStyles = 'border-white/10 bg-[#05090b]/75 text-[#8fa3ab] hover:border-white/30 hover:text-[#eaf2f5]';
              let badgeColor = 'bg-white/10 text-[#8fa3ab]';

              if (isActive) {
                if (numTemp === 1.5) {
                  activeStyles = 'border-[#7ec8e3] bg-[#7ec8e3]/15 text-[#eaf2f5] shadow-[0_0_30px_rgba(126,200,227,0.3)] ring-1 ring-[#7ec8e3]/60';
                  badgeColor = 'bg-[#7ec8e3]/20 text-[#7ec8e3]';
                } else if (numTemp === 2.0) {
                  activeStyles = 'border-[#f4a261] bg-[#f4a261]/15 text-[#eaf2f5] shadow-[0_0_30px_rgba(244,162,97,0.3)] ring-1 ring-[#f4a261]/60';
                  badgeColor = 'bg-[#f4a261]/20 text-[#f4a261]';
                } else {
                  activeStyles = 'border-[#e63946] bg-[#e63946]/15 text-[#eaf2f5] shadow-[0_0_30px_rgba(230,57,70,0.35)] ring-1 ring-[#e63946]/60';
                  badgeColor = 'bg-[#e63946]/20 text-[#e63946]';
                }
              }

              return (
                <button
                  key={tempKey}
                  onClick={() => onSelectScenario(numTemp)}
                  className={`p-5 rounded-2xl border backdrop-blur-2xl transition-all duration-300 text-left cursor-pointer flex flex-col justify-between ${activeStyles}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full ${badgeColor}`}>
                      {numTemp === 1.5 ? 'Pariisin tavoite' : numTemp === 2.0 ? 'Kynnysarvo' : numTemp === 3.0 ? 'Epävakaa' : 'Kriittinen'}
                    </span>
                  </div>
                  <div className="font-display text-4xl sm:text-5xl leading-none mb-2 font-normal text-transparent bg-clip-text bg-gradient-to-b from-[#ffffff] to-[#e2f5fa]">
                    +{tempKey}°C
                  </div>
                  <div className="font-mono text-[10px] tracking-[0.15em] uppercase text-[#8fa3ab] leading-snug">
                    {t.act3_scenarios[tempKey]}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Pure Floating Metrics Row (No Box) */}
          <div className="flex flex-wrap justify-center items-end gap-8 sm:gap-14 lg:gap-20 pt-3">
            <div className="text-center sm:text-left">
              <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#8fa3ab] mb-1.5">
                {t.act3_sea_label}
              </div>
              <div className="font-display text-4xl sm:text-5xl text-[#7ec8e3] leading-none drop-shadow-[0_0_25px_rgba(126,200,227,0.3)]">
                +{(currentFuture.seaRise2100 / 10).toFixed(0)} cm
              </div>
            </div>

            <div className="text-center sm:text-left">
              <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#8fa3ab] mb-1.5">
                {t.act3_ice_remain}
              </div>
              <div className="font-display text-4xl sm:text-5xl text-[#b8e6f2] leading-none drop-shadow-[0_0_25px_rgba(184,230,242,0.3)]">
                {Math.round(currentFuture.iceRemaining * 100)}%
              </div>
            </div>

            <div className="text-center sm:text-left">
              <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#8fa3ab] mb-1.5">
                {t.act3_disp_label}
              </div>
              <div className="font-display text-4xl sm:text-5xl text-[#e63946] leading-none drop-shadow-[0_0_25px_rgba(230,57,70,0.3)]">
                {currentFuture.displaced >= 1e9
                  ? `${(currentFuture.displaced / 1e9).toFixed(1)} B`
                  : `${(currentFuture.displaced / 1e6).toFixed(0)} M`}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Act III Memorial Closing - Pure Floating Memorial Typography (No Box) */}
      {showClosingCard && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-auto transition-opacity duration-1000 animate-fadeIn px-6">
          <div className="text-center max-w-4xl mx-auto">
            <p className="font-display italic text-4xl sm:text-6xl lg:text-7xl leading-[1.15] text-[#eaf2f5] mb-10 drop-shadow-[0_4px_45px_rgba(0,0,0,0.98)]">
              "{t.act3_close}"
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-10">
              <button
                onClick={() => onOpenActionModal('learn')}
                className="flex items-center gap-2 px-8 py-3.5 rounded-full border border-white/20 bg-white/5 hover:bg-white/15 text-[#eaf2f5] font-mono text-xs tracking-[0.25em] uppercase backdrop-blur-xl transition-all cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              >
                <BookOpen className="w-4 h-4 text-[#7ec8e3]" />
                <span>{t.act3_cta_learn}</span>
              </button>

              <button
                onClick={() => onOpenActionModal('share')}
                className="flex items-center gap-2 px-8 py-3.5 rounded-full border border-white/20 bg-white/5 hover:bg-white/15 text-[#eaf2f5] font-mono text-xs tracking-[0.25em] uppercase backdrop-blur-xl transition-all cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              >
                <Share2 className="w-4 h-4 text-[#7ec8e3]" />
                <span>{t.act3_cta_share}</span>
              </button>

              <button
                onClick={() => onOpenActionModal('act')}
                className="flex items-center gap-2 px-8 py-3.5 rounded-full border border-[#7ec8e3]/60 bg-[#7ec8e3]/20 hover:bg-[#7ec8e3]/30 text-[#eaf2f5] font-mono text-xs tracking-[0.25em] uppercase backdrop-blur-xl transition-all cursor-pointer shadow-[0_0_30px_rgba(126,200,227,0.3)]"
              >
                <HeartHandshake className="w-4 h-4 text-[#7ec8e3]" />
                <span>{t.act3_cta_act}</span>
              </button>
            </div>

            <div className="font-display italic text-base sm:text-lg text-[#8fa3ab] max-w-xl mx-auto border-t border-white/10 pt-6 drop-shadow">
              {t.dedication}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

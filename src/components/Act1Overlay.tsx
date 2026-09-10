import React from 'react';
import { TranslationSchema, LiveDisasterReport } from '../types';
import { Radio, ArrowRight, Thermometer, Waves, Globe, Sparkles, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface VisitedDrivers {
  stripes: boolean;
  sealevel: boolean;
  global: boolean;
}

interface Act1OverlayProps {
  t: TranslationSchema;
  currentBeatText: string | null;
  showToll: boolean;
  showTollCause: boolean;
  visible: boolean;
  disasterReport?: LiveDisasterReport;
  visitedDrivers: VisitedDrivers;
  onOpenWarmingStripes: () => void;
  onOpenSeaLevel: () => void;
  onOpenGlobal: () => void;
  onContinueToAct2: () => void;
  onOpenRealtimeData?: () => void;
}

export const Act1Overlay: React.FC<Act1OverlayProps> = ({
  t,
  currentBeatText,
  showToll,
  showTollCause,
  visible,
  disasterReport,
  visitedDrivers,
  onOpenWarmingStripes,
  onOpenSeaLevel,
  onOpenGlobal,
  onContinueToAct2,
  onOpenRealtimeData,
}) => {
  if (!visible) return null;

  const dead = disasterReport?.dead ?? 1356;
  const missing = disasterReport?.missing ?? 587;
  const displaced = disasterReport?.displaced ?? 5200;
  const affected = disasterReport?.affected ?? 28400;

  return (
    <>
      {/* Lower-third Cinematic Narration Beat - Pure Floating Typography (No Box) */}
      <AnimatePresence mode="wait">
        {currentBeatText && !showToll && (
          <motion.div
            key={currentBeatText}
            initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -12, filter: 'blur(6px)' }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-8 right-8 bottom-36 sm:bottom-44 z-20 text-center pointer-events-none select-none"
          >
            <p className="font-display italic text-3xl sm:text-5xl lg:text-6xl font-normal leading-[1.2] text-[#eaf2f5] drop-shadow-[0_4px_45px_rgba(0,0,0,0.98)] max-w-5xl mx-auto">
              "{currentBeatText}"
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Casualty & Aftermath Toll - Pure Floating Numbers (No Box) */}
      {showToll && (
        <div className="absolute left-6 right-6 sm:left-10 sm:right-10 bottom-20 z-20 pointer-events-none select-none transition-opacity duration-1000 animate-fadeIn">
          {/* Floating Casualty Numbers */}
          <div className="flex flex-wrap justify-center items-end gap-8 sm:gap-14 lg:gap-24 mb-8">
            {/* Confirmed Dead */}
            <div className="text-center">
              <div className="font-display text-6xl sm:text-7xl lg:text-[96px] leading-none text-[#e63946] mb-2 font-normal drop-shadow-[0_0_35px_rgba(230,57,70,0.45)]">
                {dead}+
              </div>
              <div className="font-mono text-[10px] sm:text-xs tracking-[0.25em] uppercase text-[#8fa3ab]">
                {t.act1_toll_dead}
              </div>
            </div>

            {/* Missing In Debris */}
            <div className="text-center">
              <div className="font-display text-6xl sm:text-7xl lg:text-[96px] leading-none text-[#f4a261] mb-2 font-normal drop-shadow-[0_0_35px_rgba(244,162,97,0.35)]">
                {missing}
              </div>
              <div className="font-mono text-[10px] sm:text-xs tracking-[0.25em] uppercase text-[#8fa3ab]">
                {t.act1_toll_missing}
              </div>
            </div>

            {/* Displaced Families */}
            <div className="text-center">
              <div className="font-display text-6xl sm:text-7xl lg:text-[96px] leading-none text-[#eaf2f5] mb-2 font-normal drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)]">
                {displaced.toLocaleString()}
              </div>
              <div className="font-mono text-[10px] sm:text-xs tracking-[0.25em] uppercase text-[#8fa3ab]">
                {t.act1_toll_disp}
              </div>
            </div>

            {/* Critically Affected */}
            <div className="text-center">
              <div className="font-display text-6xl sm:text-7xl lg:text-[96px] leading-none text-[#7ec8e3] mb-2 font-normal drop-shadow-[0_0_35px_rgba(126,200,227,0.35)]">
                {affected.toLocaleString()}
              </div>
              <div className="font-mono text-[10px] sm:text-xs tracking-[0.25em] uppercase text-[#8fa3ab]">
                {t.act1_toll_affected}
              </div>
            </div>
          </div>

          {/* Narrative Question & Prominent "Next / What Caused This?" Flow */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col items-center text-center mt-1 pointer-events-auto"
          >
            {/* The poignant question */}
            <div className="font-display italic text-2xl sm:text-3xl lg:text-4xl text-[#eaf2f5] mb-1 drop-shadow-md">
              {t.act1_question || 'Miksi vuori murtui?'}
            </div>
            <div className="font-mono text-xs tracking-[0.22em] text-[#8fa3ab] uppercase mb-4">
              {t.act1_toll_cause}
            </div>

            {/* Prominent Centered Call to Action: Explore the Cause */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-2">
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={onContinueToAct2}
                className="group relative flex items-center gap-3.5 px-9 py-4 bg-[#7ec8e3]/20 hover:bg-[#7ec8e3]/30 border border-[#7ec8e3]/70 hover:border-[#7ec8e3] text-[#eaf2f5] font-mono text-xs sm:text-sm tracking-[0.25em] uppercase rounded-full shadow-[0_0_40px_rgba(126,200,227,0.4)] hover:shadow-[0_0_60px_rgba(126,200,227,0.7)] backdrop-blur-xl transition-all duration-300 cursor-pointer"
              >
                <span className="font-semibold">{t.act1_explore_cause_btn || t.act1_explore_cause || 'TUTKI SYITÄ'}</span>
                <ArrowRight className="w-4 h-4 text-[#7ec8e3] group-hover:translate-x-1.5 transition-transform duration-300" />
              </motion.button>
            </div>

            {/* Live Data Source Attribution */}
            <div className="mt-1 flex items-center justify-center gap-2 font-mono text-[10px] tracking-wider text-[#7ec8e3]/80 uppercase">
              <Radio className="w-3 h-3 text-[#e63946] animate-pulse" />
              <span>{disasterReport?.sourceTitle || t.act1_live_source}</span>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

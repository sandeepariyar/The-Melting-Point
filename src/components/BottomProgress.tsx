import React from 'react';
import { ActType, TranslationSchema } from '../types';
import { RotateCcw, ArrowRight, ArrowLeft } from 'lucide-react';

interface BottomProgressProps {
  currentAct: ActType;
  t: TranslationSchema;
  onNext: () => void;
  onPrev?: () => void;
  onReplay: () => void;
  visible: boolean;
  act2Step?: 1 | 2 | 3 | 4 | 5 | 6;
  canContinue?: boolean;
  act3ClosingCard?: boolean;
}

export const BottomProgress: React.FC<BottomProgressProps> = ({
  currentAct,
  t,
  onNext,
  onPrev,
  onReplay,
  visible,
  act2Step = 1,
  canContinue = true,
  act3ClosingCard = false,
}) => {
  if (!visible) return null;

  const actMap: Record<ActType, number> = {
    attract: -1,
    act1: 0,
    act2: 1,
    act3: 2,
  };
  const currentIdx = actMap[currentAct];

  const acts = [
    { name: t.act1_subtitle, idx: 0 },
    {
      name: currentAct === 'act2' ? `${t.act2_subtitle} (${act2Step}/6)` : t.act2_subtitle,
      idx: 1,
    },
    { name: t.act3_subtitle, idx: 2 },
  ];

  // Determine the next button label based on current state
  let nextLabel = t.ui_next;
  let showNext = canContinue;
  let showPrev = false;

  if (currentAct === 'act1') {
    // In Act 1, the centered hero call-to-action button handles advancing to Act 2
    showNext = false;
  } else if (currentAct === 'act2') {
    showNext = true;
    if (act2Step === 1) {
      nextLabel = t.act2_next_tunnel || 'Lämpenemistunneli (2/6)';
    } else if (act2Step === 2) {
      nextLabel = t.act2_next_spiral || 'Lämpöspiraali (3/6)';
      showPrev = true;
    } else if (act2Step === 3) {
      nextLabel = t.act2_next_energy || 'Energiatalous & nielut (4/6)';
      showPrev = true;
    } else if (act2Step === 4) {
      nextLabel = t.act2_next_ocean || 'Valtameret & rannikot (5/6)';
      showPrev = true;
    } else if (act2Step === 5) {
      nextLabel = t.act2_next_global || 'Kriisipisteet (6/6)';
      showPrev = true;
    } else if (act2Step === 6) {
      nextLabel = t.act2_next_future || 'Tulevaisuus (Näytös III)';
      showPrev = true;
    }
  } else if (currentAct === 'act3') {
    showNext = true;
    if (!act3ClosingCard) {
      nextLabel = t.act3_close || 'Muistomerkki';
      showPrev = true;
    } else {
      nextLabel = t.ui_replay || 'Palaa alkuun';
    }
  }

  return (
    <>
      {/* Act Progress Indicators (Center Bottom) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex justify-center gap-4 sm:gap-8 items-center pointer-events-none select-none max-w-[55vw]">
        {acts.map((act) => {
          const isDone = act.idx < currentIdx;
          const isActive = act.idx === currentIdx;

          return (
            <div
              key={act.idx}
              className={`flex items-center gap-2.5 font-mono text-[10px] tracking-[0.25em] uppercase transition-all duration-400 ${
                isActive ? 'text-[#eaf2f5]' : isDone ? 'text-[#8fa3ab]' : 'text-[#4d6169]'
              }`}
            >
              <div
                className={`h-[2px] rounded-full transition-all duration-400 ${
                  isActive
                    ? 'w-16 bg-[#7ec8e3] shadow-[0_0_10px_#7ec8e3]'
                    : isDone
                    ? 'w-10 bg-[#8fa3ab]/70'
                    : 'w-6 bg-white/10'
                }`}
              />
              <span className={isActive ? 'font-medium' : ''}>{act.name}</span>
            </div>
          );
        })}
      </div>

      {/* FIXED PERSISTENT NAVIGATION CONTROLS - ALWAYS AT EXACT SAME SCREEN LOCATION */}
      <div className="absolute right-8 sm:right-10 bottom-5 z-50 flex items-center gap-2.5 pointer-events-auto select-none">
        {/* Previous Button (Only when going back within cause sequence or future) */}
        {showPrev && onPrev && (
          <button
            type="button"
            onClick={onPrev}
            className="flex items-center gap-2 font-mono text-[11px] tracking-wider uppercase px-4 py-2 rounded-full border border-white/15 bg-[#0a1418]/80 hover:bg-[#0e2530] backdrop-blur-xl text-[#8fa3ab] hover:text-[#eaf2f5] hover:border-[#7ec8e3]/50 transition-all cursor-pointer shadow-[0_4px_16px_rgba(0,0,0,0.5)]"
            title="Palaa edelliseen vaiheeseen"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Edellinen</span>
          </button>
        )}

        {/* Replay/Restart Button for Act 3 end */}
        {currentAct === 'act3' && act3ClosingCard && (
          <button
            type="button"
            onClick={onReplay}
            className="flex items-center gap-2 font-mono text-[11px] tracking-wider uppercase px-5 py-2 rounded-full border border-[#7ec8e3]/40 bg-[#7ec8e3]/20 hover:bg-[#7ec8e3]/30 backdrop-blur-xl text-[#eaf2f5] transition-all cursor-pointer shadow-[0_0_20px_rgba(126,200,227,0.3)]"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#7ec8e3]" />
            <span>{t.ui_replay || 'Aloita alusta'}</span>
          </button>
        )}

        {/* Primary Continue / Next Action Button */}
        {showNext && !(currentAct === 'act3' && act3ClosingCard) && (
          <button
            type="button"
            onClick={onNext}
            className="flex items-center gap-2 font-mono text-[11px] tracking-wider uppercase px-5 py-2 rounded-full border border-[#7ec8e3]/60 bg-[#7ec8e3]/20 hover:bg-[#7ec8e3]/30 hover:border-[#7ec8e3] backdrop-blur-xl text-[#eaf2f5] transition-all cursor-pointer shadow-[0_0_25px_rgba(126,200,227,0.35)] hover:shadow-[0_0_35px_rgba(126,200,227,0.55)]"
          >
            <span className="font-semibold">{nextLabel}</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#7ec8e3]" />
          </button>
        )}
      </div>
    </>
  );
};

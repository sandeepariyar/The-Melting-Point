import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface WarmingStripesButtonProps {
  onClick: () => void;
  isActive?: boolean;
}

export const WarmingStripesButton: React.FC<WarmingStripesButtonProps> = ({
  onClick,
  isActive = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="absolute left-6 top-1/2 -translate-y-1/2 z-30 pointer-events-auto flex items-center">
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`group relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-xl border cursor-pointer ${
          isActive
            ? 'bg-red-950/80 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]'
            : 'bg-[#09151e]/85 hover:bg-[#0d1f2d] border-white/20 hover:border-white/40 shadow-xl'
        }`}
        aria-label="Open Warming Stripes Visualization (1900 - 2026)"
      >
        {/* Animated pulse halo */}
        <span className="absolute inset-0 rounded-full animate-ping opacity-20 bg-gradient-to-r from-blue-500 to-red-500 pointer-events-none" />

        {/* Circular Mini Warming Stripes Icon */}
        <div className="w-7 h-7 rounded-full overflow-hidden flex shadow-inner border border-white/20">
          <div className="flex-1 bg-[#08306b]" />
          <div className="flex-1 bg-[#2171b5]" />
          <div className="flex-1 bg-[#6baed6]" />
          <div className="flex-1 bg-[#c6dbef]" />
          <div className="flex-1 bg-[#fee0d2]" />
          <div className="flex-1 bg-[#fc9272]" />
          <div className="flex-1 bg-[#ef3b2c]" />
          <div className="flex-1 bg-[#67000d]" />
        </div>
      </button>

      {/* Floating Tooltip sliding out to the right */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: -8, scale: 0.95 }}
            animate={{ opacity: 1, x: 8, scale: 1 }}
            exit={{ opacity: 0, x: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="ml-2 px-3 py-1.5 rounded-sm bg-[#09151e]/90 backdrop-blur-md border border-white/20 shadow-2xl pointer-events-none whitespace-nowrap"
          >
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-widest text-white font-medium">
                Warming Stripes
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                1900 — 2026
              </span>
            </div>
            <div className="text-[10px] text-white/50 font-mono tracking-tight mt-0.5">
              showyourstripes.info • Ed Hawkins
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

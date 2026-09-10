import React from 'react';
import { motion } from 'motion/react';
import { User, Code, Compass, ShieldCheck, X } from 'lucide-react';
import { TranslationSchema } from '../types';

interface DeveloperModalProps {
  t: TranslationSchema;
  onClose: () => void;
}

export const DeveloperModal: React.FC<DeveloperModalProps> = ({ t, onClose }) => {
  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        className="w-full max-w-2xl bg-[#0a1218] border border-white/15 p-10 rounded-sm text-white shadow-2xl relative"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/10">
          <div className="w-14 h-14 rounded-full bg-cyan-950/80 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
            <User className="w-7 h-7" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-cyan-400 font-mono">
              {t.developer_role}
            </div>
            <h2 className="text-3xl font-light tracking-wide text-white">
              {t.developer_name}
            </h2>
          </div>
        </div>

        <p className="text-lg text-white/80 font-light leading-relaxed mb-8">
          {t.developer_bio}
        </p>

        <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
          <div className="p-4 bg-white/[0.03] border border-white/10 rounded-sm">
            <div className="flex items-center gap-2 text-cyan-300 font-mono text-xs uppercase mb-1">
              <Code className="w-4 h-4" /> Architecture
            </div>
            <div className="text-white/70">
              Procedural WebGL GLSL terrain displacement, Web Audio harmonic synthesis, and multi-agency live data feeds.
            </div>
          </div>
          <div className="p-4 bg-white/[0.03] border border-white/10 rounded-sm">
            <div className="flex items-center gap-2 text-cyan-300 font-mono text-xs uppercase mb-1">
              <Compass className="w-4 h-4" /> Mission
            </div>
            <div className="text-white/70">
              Transforming climate statistics into emotional spatial awareness and tactile global warming education.
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 text-xs font-mono text-white/50">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            Verified Non-Commercial Educational Installation
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-medium tracking-wider uppercase transition-colors"
          >
            {t.modal_close}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

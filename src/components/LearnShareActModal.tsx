import React from 'react';
import { TranslationSchema } from '../types';
import { BookOpen, Share2, HeartHandshake, X, ExternalLink, QrCode } from 'lucide-react';

interface LearnShareActModalProps {
  type: 'learn' | 'share' | 'act' | null;
  t: TranslationSchema;
  onClose: () => void;
}

export const LearnShareActModal: React.FC<LearnShareActModalProps> = ({ type, t, onClose }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#0a1418] border border-[#7ec8e3]/40 p-10 text-left shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-[#8fa3ab] hover:text-[#eaf2f5] transition-colors cursor-pointer"
          aria-label={t.modal_close}
        >
          <X className="w-6 h-6" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          {type === 'learn' && <BookOpen className="w-6 h-6 text-[#7ec8e3]" />}
          {type === 'share' && <Share2 className="w-6 h-6 text-[#7ec8e3]" />}
          {type === 'act' && <HeartHandshake className="w-6 h-6 text-[#7ec8e3]" />}
          <h3 className="font-display text-3xl text-[#eaf2f5]">
            {type === 'learn' && t.modal_learn_title}
            {type === 'share' && t.modal_share_title}
            {type === 'act' && t.modal_act_title}
          </h3>
        </div>

        {/* Modal Body */}
        <div className="space-y-4 text-[#8fa3ab] font-body text-base leading-relaxed mb-8">
          <p>
            {type === 'learn' && t.modal_learn_body}
            {type === 'share' && t.modal_share_body}
            {type === 'act' && t.modal_act_body}
          </p>

          {type === 'learn' && (
            <div className="mt-4 p-4 border border-white/10 bg-black/40 font-mono text-xs space-y-2 text-[#eaf2f5]">
              <div className="text-[#7ec8e3] font-medium tracking-wider">PRIMARY DATA CITATIONS:</div>
              <div>• ICIMOD Hindu Kush Himalaya Glacier Assessment (2025/2026)</div>
              <div>• NASA GISS Surface Temperature Analysis (GISTEMP v4)</div>
              <div>• Copernicus Climate Change Service (ERA5 Global Reanalysis)</div>
              <div>• IPCC 6th Assessment Report (WG1 / Physical Science Basis)</div>
            </div>
          )}

          {type === 'share' && (
            <div className="mt-6 flex flex-col items-center justify-center p-6 border border-white/10 bg-black/40 space-y-4">
              <div className="p-4 bg-white rounded-none inline-block">
                <QrCode className="w-32 h-32 text-[#05090b]" />
              </div>
              <div className="font-mono text-xs text-[#7ec8e3] tracking-wider text-center">
                SCAN TO OPEN KIOSK EXPERIENCE ON MOBILE
              </div>
              <div className="font-mono text-[11px] text-[#8fa3ab] select-all bg-[#05090b] px-4 py-2 border border-white/10 max-w-md text-center truncate">
                https://the-melting-point.memorial/nepal-2026
              </div>
            </div>
          )}

          {type === 'act' && (
            <div className="mt-6 space-y-3 font-mono text-xs">
              <a
                href="https://www.icimod.org"
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center justify-between p-3 border border-white/10 bg-black/30 hover:border-[#7ec8e3]/50 text-[#eaf2f5] transition-colors"
              >
                <span>ICIMOD High-Mountain Early Warning Support</span>
                <ExternalLink className="w-4 h-4 text-[#7ec8e3]" />
              </a>
              <a
                href="https://www.nepalredcross.org"
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center justify-between p-3 border border-white/10 bg-black/30 hover:border-[#7ec8e3]/50 text-[#eaf2f5] transition-colors"
              >
                <span>Nepal Flood Relief & Trishuli Basin Resilience (Nepal Red Cross)</span>
                <ExternalLink className="w-4 h-4 text-[#7ec8e3]" />
              </a>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-white/20 text-[#eaf2f5] font-mono text-xs tracking-wider uppercase hover:border-[#7ec8e3] hover:text-[#7ec8e3] transition-colors cursor-pointer"
          >
            {t.modal_close}
          </button>
        </div>
      </div>
    </div>
  );
};

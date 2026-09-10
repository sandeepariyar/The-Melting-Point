import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, BookOpen, Mountain, Thermometer, CloudRain, Globe, ShieldAlert, Sparkles } from 'lucide-react';
import { TranslationSchema, Language } from '../types';

interface MuseumInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen?: () => void;
  t: TranslationSchema;
  currentLang?: Language;
  onLanguageChange?: (lang: Language) => void;
}

export const MuseumInfoModal: React.FC<MuseumInfoModalProps> = ({
  isOpen,
  onClose,
  onOpen,
  t,
  currentLang = 'en',
  onLanguageChange,
}) => {
  const [activeTab, setActiveTab] = useState<number>(1);

  const sections = [
    {
      id: 1,
      icon: Mountain,
      title: t.museum_info_section1_title || '1. What Happened: The Langtang Collapse',
      content: t.museum_info_section1_body,
    },
    {
      id: 2,
      icon: Thermometer,
      title: t.museum_info_section2_title || '2. The Cause: Melting Frozen Glue',
      content: t.museum_info_section2_body,
    },
    {
      id: 3,
      icon: CloudRain,
      title: t.museum_info_section3_title || '3. Supercharged Storms: Moisture Surge',
      content: t.museum_info_section3_body,
    },
    {
      id: 4,
      icon: Globe,
      title: t.museum_info_section4_title || '4. The Global Chain Reaction',
      content: t.museum_info_section4_body,
    },
    {
      id: 5,
      icon: ShieldAlert,
      title: t.museum_info_section5_title || '5. What We Can Do Today',
      content: t.museum_info_section5_body,
    },
  ];

  return (
    <>
      {/* Floating Kiosk Trigger Tab */}
      {!isOpen && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={onOpen}
          className="fixed left-5 top-1/2 -translate-y-1/2 z-35
                     flex items-center gap-2.5 px-4 py-2.5 rounded-full
                     bg-[#07131a]/85 border border-[#7ec8e3]/30 backdrop-blur-xl
                     text-[#eaf2f5] hover:border-[#7ec8e3] hover:shadow-[0_0_25px_rgba(126,200,227,0.3)]
                     text-xs font-mono tracking-widest uppercase transition-all cursor-pointer group shadow-2xl"
          title="Open plain-language guide for museum visitors"
        >
          <span className="w-2 h-2 rounded-full bg-[#7ec8e3] animate-ping" />
          <BookOpen className="w-3.5 h-3.5 text-[#7ec8e3] group-hover:scale-110 transition-transform" />
          <span className="font-semibold tracking-wider">
            {t.ui_info_btn || 'Info'} · {currentLang === 'fi' ? 'Nepalin 2026 tulva' : currentLang === 'sv' ? 'Nepals 2026 flod' : 'Nepal 2026 Flood'}
          </span>
        </motion.button>
      )}

      {/* Full Accessible Slide-Over / Modal Guide */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-black/80 backdrop-blur-md overflow-y-auto pointer-events-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="w-full max-w-4xl bg-[#081217] border border-[#7ec8e3]/30 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] text-[#eaf2f5] overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Top Header */}
              <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-white/10 bg-[#050d12]/90">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#7ec8e3]/15 border border-[#7ec8e3]/30 flex items-center justify-center text-[#7ec8e3]">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#7ec8e3] font-semibold">
                        {t.museum_info_badge || 'CLIMATE REALITY · NEPAL AUGUST 2026'}
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-light tracking-wide text-white">
                      {t.museum_info_title}
                    </h2>
                  </div>
                </div>

                {/* Right controls: Language + Close */}
                <div className="flex items-center gap-3">
                  {onLanguageChange && (
                    <div className="flex items-center border border-white/15 rounded-lg p-0.5 bg-black/40 font-mono text-[11px]">
                      {(['en', 'fi', 'sv'] as const).map((lng) => (
                        <button
                          key={lng}
                          onClick={() => onLanguageChange(lng)}
                          className={`px-2.5 py-1 rounded transition-colors uppercase ${
                            currentLang === lng
                              ? 'bg-[#7ec8e3]/30 text-white font-semibold'
                              : 'text-[#8fa3ab] hover:text-white'
                          }`}
                        >
                          {lng}
                        </button>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
                    aria-label="Close guide"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Quick Glance Key Metrics Pill Row for Normal Visitors */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 px-6 sm:px-8 py-4 bg-[#0a161c] border-b border-white/10">
                <div className="p-2.5 rounded-xl bg-black/30 border border-white/10">
                  <div className="font-mono text-[9px] uppercase tracking-wider text-[#8fa3ab]">
                    {currentLang === 'fi' ? 'Lämpeneminen' : currentLang === 'sv' ? 'Uppvärmning' : 'Global Heating'}
                  </div>
                  <div className="font-display text-lg text-[#f4a261] font-semibold">
                    +1.47°C
                  </div>
                  <div className="font-mono text-[9px] text-[#8fa3ab]/80">
                    {currentLang === 'fi' ? 'Esit. verrattuna' : currentLang === 'sv' ? 'Över baslinje' : 'Above baseline'}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-black/30 border border-white/10">
                  <div className="font-mono text-[9px] uppercase tracking-wider text-[#8fa3ab]">
                    {currentLang === 'fi' ? 'Kuolonuhrit' : currentLang === 'sv' ? 'Omkomna' : 'Confirmed Dead'}
                  </div>
                  <div className="font-display text-lg text-[#e63946] font-semibold">
                    1,100+
                  </div>
                  <div className="font-mono text-[9px] text-[#8fa3ab]/80">
                    {currentLang === 'fi' ? 'Tuhansia kateissa' : currentLang === 'sv' ? 'Tusentals saknade' : 'Thousands missing'}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-black/30 border border-white/10">
                  <div className="font-mono text-[9px] uppercase tracking-wider text-[#8fa3ab]">
                    {currentLang === 'fi' ? 'Tulvan matka' : currentLang === 'sv' ? 'Störtflodens väg' : 'Flood Surge'}
                  </div>
                  <div className="font-display text-lg text-[#7ec8e3] font-semibold">
                    ~100 km
                  </div>
                  <div className="font-mono text-[9px] text-[#8fa3ab]/80">
                    Trishuli & Lende Khola
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-black/30 border border-white/10">
                  <div className="font-mono text-[9px] uppercase tracking-wider text-[#8fa3ab]">
                    {currentLang === 'fi' ? 'Vesiseinämä' : currentLang === 'sv' ? 'Vattenvägg' : 'Sudden Rise'}
                  </div>
                  <div className="font-display text-lg text-[#7ec8e3] font-semibold">
                    9 meters
                  </div>
                  <div className="font-mono text-[9px] text-[#8fa3ab]/80">
                    {currentLang === 'fi' ? 'Alle 30 minuutissa' : currentLang === 'sv' ? 'Inom 30 minuter' : 'In under 30 min'}
                  </div>
                </div>
              </div>

              {/* Body: Navigation Tabs + Reading Pane */}
              <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                {/* Left Chapter Nav */}
                <div className="w-full md:w-72 border-b md:border-b-0 md:border-r border-white/10 p-3 sm:p-4 space-y-1 bg-[#060e12]/60 overflow-y-auto">
                  {sections.map((sec) => {
                    const IconComponent = sec.icon;
                    const isActive = activeTab === sec.id;
                    return (
                      <button
                        key={sec.id}
                        onClick={() => setActiveTab(sec.id)}
                        className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#7ec8e3]/20 border border-[#7ec8e3]/50 text-white shadow-md'
                            : 'hover:bg-white/5 text-[#8fa3ab] hover:text-white border border-transparent'
                        }`}
                      >
                        <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#7ec8e3]' : 'text-[#8fa3ab]'}`} />
                        <span className="font-mono text-xs tracking-tight line-clamp-1">
                          {sec.title}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Right Content View */}
                <div className="flex-1 p-6 sm:p-8 overflow-y-auto bg-gradient-to-b from-[#081217] to-[#04090c]">
                  {sections
                    .filter((sec) => sec.id === activeTab)
                    .map((sec) => (
                      <motion.div
                        key={sec.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                      >
                        <h3 className="text-xl sm:text-2xl font-light text-white flex items-center gap-2.5">
                          <span>{sec.title}</span>
                        </h3>

                        <div className="prose prose-invert max-w-none text-sm sm:text-base leading-relaxed text-[#b8ced6] space-y-3 font-sans font-light">
                          {sec.content.split('\n\n').map((paragraph, pIdx) => (
                            <p key={pIdx} className="leading-relaxed">
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-6 sm:px-8 py-4 border-t border-white/10 bg-[#050d12] text-xs font-mono text-[#8fa3ab]">
                <div>
                  {t.dedication}
                </div>
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-lg border border-white/20 hover:border-[#7ec8e3] text-white hover:text-[#7ec8e3] transition-colors cursor-pointer"
                >
                  {t.museum_info_close || 'Close Guide'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TranslationSchema, LiveStationWeather, Language } from '../types';
import {
  PLANETARY_VITAL_SIGNS,
  PlanetaryVitalSign,
} from '../services/planetaryTelemetryService';
import {
  Radio,
  Activity,
  Wind,
  Thermometer,
  Droplets,
  Gauge,
  Layers,
  Flame,
  Globe2,
  ExternalLink,
  ChevronRight,
  Info,
  X,
  Compass,
  Mountain,
} from 'lucide-react';

interface RealtimeClimatePageProps {
  t: TranslationSchema;
  language?: Language;
  onNavigateStep?: (step: 1 | 2 | 3 | 4 | 5) => void;
  liveWeather?: LiveStationWeather | null;
}

export const RealtimeClimatePage: React.FC<RealtimeClimatePageProps> = ({
  t,
  language = 'fi',
  onNavigateStep,
  liveWeather,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'atmosphere' | 'energy' | 'cryosphere' | 'oceans'
  >('all');
  const [selectedSign, setSelectedSign] = useState<PlanetaryVitalSign | null>(null);
  const [heartbeatTime, setHeartbeatTime] = useState<string>(() =>
    new Date().toLocaleTimeString()
  );
  const [telemetryPulse, setTelemetryPulse] = useState<boolean>(true);

  // Simulated authentic telemetry refresh
  useEffect(() => {
    const timer = setInterval(() => {
      setHeartbeatTime(new Date().toLocaleTimeString());
      setTelemetryPulse((prev) => !prev);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const isFi = language === 'fi';

  const categories = [
    { id: 'all', label: isFi ? 'Kaikki elintoiminnot' : 'All Planetary Vital Signs' },
    { id: 'atmosphere', label: isFi ? 'Ilmakehä & Kasvihuonekaasut' : 'Atmosphere & Greenhouse Gases' },
    { id: 'energy', label: isFi ? 'Säteily- & Lämpöenergia' : 'Thermal & Radiant Energy' },
    { id: 'cryosphere', label: isFi ? 'Kryosfääri & Jäätiköt' : 'Cryosphere & Ice Sheets' },
    { id: 'oceans', label: isFi ? 'Valtameret & Merenpinta' : 'Oceans & Sea Level' },
  ];

  const filteredSigns =
    selectedCategory === 'all'
      ? PLANETARY_VITAL_SIGNS
      : PLANETARY_VITAL_SIGNS.filter((s) => s.category === selectedCategory);

  return (
    <div className="absolute inset-0 z-20 pointer-events-auto select-none overflow-y-auto overflow-x-hidden pt-24 pb-32 px-6 sm:px-12 lg:px-16 animate-fadeIn custom-scrollbar">
      {/* Page Header: Pure Floating Typography (No Card Box) */}
      <div className="max-w-7xl mx-auto mb-10">
        {/* Cause Act & Step Indicator */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-3 font-mono text-[11px] tracking-[0.25em] uppercase text-[#7ec8e3]">
            <span className="font-semibold">{t.act2_title}</span>
            <span className="text-white/30">/</span>
            <span className="text-[#8fa3ab]">
              {isFi ? 'VAIHE 2/5: REAALIAIKAISET ILMASTOTIEDOT' : 'STEP 2/5: REAL-TIME PLANETARY VITAL SIGNS'}
            </span>
          </div>

          {/* Live Telemetry Heartbeat Status */}
          <div className="flex items-center gap-2.5 font-mono text-[10px] tracking-wider uppercase text-[#8fa3ab]">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#10b981]"></span>
            </span>
            <span className="text-[#10b981] font-semibold">
              {isFi ? 'SATELLIITTI- JA MITTAUSVERKKO AKTIIVINEN' : 'SATELLITE & SENSOR NETWORK LIVE'}
            </span>
            <span className="text-white/20">|</span>
            <span className="text-[#8fa3ab]">{heartbeatTime}</span>
          </div>
        </div>

        {/* Monumental Headline */}
        <h1 className="font-display italic text-4xl sm:text-6xl lg:text-7xl text-[#eaf2f5] leading-[1.1] mb-3 drop-shadow-[0_4px_35px_rgba(0,0,0,0.9)]">
          {isFi ? 'Maapallon reaaliaikaiset elintoiminnot' : 'Real-Time Planetary Vital Signs'}
        </h1>
        <p className="font-body text-base sm:text-lg text-[#8fa3ab] max-w-4xl leading-relaxed drop-shadow">
          {isFi
            ? 'Tarkastele maailmanlaajuisia mittausasemia ja satelliittidataa, jotka kuvaavat planeetan lämpöenergian kertymistä ja selittävät, miksi Himalajan jäinen peruskallio petti.'
            : 'Explore live multi-satellite observations and global research networks tracking planetary thermal accumulation and the atmospheric forces that destabilized the Himalayas.'}
        </p>

        {/* Live Station Feed at Langtang Lirung / Rasuwa Altitude (4,200m) */}
        {liveWeather && (
          <div className="flex flex-wrap items-center gap-6 sm:gap-10 mt-6 pt-5 border-t border-white/10 font-mono text-xs text-[#8fa3ab]">
            <div className="flex items-center gap-2 text-[#7ec8e3]">
              <Mountain className="w-4 h-4 text-[#7ec8e3]" />
              <span className="font-medium tracking-wider uppercase">
                {isFi ? 'Langtangin alppiasema (4 200 m)' : 'Langtang Alpine Station (4,200m)'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Thermometer className="w-3.5 h-3.5 text-[#e63946]" />
              <span className="text-[#eaf2f5] font-semibold">{liveWeather.temp}°C</span>
            </div>
            <div className="flex items-center gap-2">
              <Droplets className="w-3.5 h-3.5 text-[#7ec8e3]" />
              <span className="text-[#eaf2f5]">{liveWeather.humidity}% {isFi ? 'kosteus' : 'RH'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Wind className="w-3.5 h-3.5 text-[#b8ced6]" />
              <span className="text-[#eaf2f5]">{liveWeather.windSpeed} km/h ({liveWeather.windDir})</span>
            </div>
            <div className="flex items-center gap-2 hidden md:flex">
              <Gauge className="w-3.5 h-3.5 text-[#8fa3ab]" />
              <span className="text-[#eaf2f5]">{liveWeather.pressure} hPa</span>
            </div>
          </div>
        )}

        {/* Minimalist Filter Navigation (Unboxed Pills) */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mt-8">
          {categories.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-4 py-2 rounded-full font-mono text-xs tracking-wider uppercase transition-all duration-300 cursor-pointer ${
                  active
                    ? 'border border-[#7ec8e3] bg-[#7ec8e3]/20 text-[#eaf2f5] shadow-[0_0_20px_rgba(126,200,227,0.3)] font-semibold'
                    : 'border border-white/15 hover:border-white/40 text-[#8fa3ab] hover:text-[#eaf2f5] bg-transparent'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Vital Signs Grid - Completely Unboxed Typography (No Card Boxes, No Enclosing Borders) */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-12 mb-16">
        {filteredSigns.map((sign) => {
          const isSelected = selectedSign?.id === sign.id;
          const isCritical = sign.status === 'critical';

          return (
            <div
              key={sign.id}
              onClick={() => setSelectedSign(sign)}
              className={`group text-left cursor-pointer transition-all duration-300 border-t pt-5 ${
                isSelected
                  ? 'border-[#7ec8e3] opacity-100'
                  : 'border-white/15 hover:border-white/50 opacity-95 hover:opacity-100'
              }`}
            >
              {/* Category & Source Metadata */}
              <div className="flex items-center justify-between font-mono text-[9px] sm:text-[10px] tracking-[0.22em] uppercase text-[#8fa3ab] mb-2">
                <span className="text-[#7ec8e3] font-semibold">{sign.code}</span>
                <span className="truncate max-w-[200px]">{sign.instrumentSensor}</span>
              </div>

              {/* Title */}
              <div className="font-display text-lg sm:text-xl text-[#eaf2f5] group-hover:text-[#ffffff] leading-snug mb-2 transition-colors">
                {isFi ? sign.nameFi : sign.nameEn}
              </div>

              {/* Huge Display Number - Completely Unboxed */}
              <div
                className={`font-display text-5xl sm:text-6xl lg:text-7xl leading-none font-normal tracking-tight mb-3 transition-transform duration-300 group-hover:scale-[1.02] ${
                  isCritical
                    ? 'text-[#e63946] drop-shadow-[0_0_35px_rgba(230,57,70,0.4)]'
                    : 'text-[#7ec8e3] drop-shadow-[0_0_35px_rgba(126,200,227,0.35)]'
                }`}
              >
                {sign.displayValue}
              </div>

              {/* Comparison Subline & Trend Rate */}
              <div className="font-mono text-[11px] text-[#8fa3ab] space-y-1">
                <div className="flex items-center justify-between">
                  <span>{isFi ? 'Esiteollinen taso:' : 'Pre-industrial:'}</span>
                  <span className="text-[#b8ced6]">{sign.preIndustrialDisplay}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{isFi ? 'Turvallinen raja:' : 'Safe boundary:'}</span>
                  <span className="text-[#f4a261]">{sign.safeBoundaryDisplay}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[10px]">
                  <span className="text-[#7ec8e3]">{sign.trendRate}</span>
                  <span className="flex items-center gap-1 text-[#eaf2f5] group-hover:translate-x-1 transition-transform">
                    {isFi ? 'Avaa fysiikka' : 'Explain physics'}
                    <ChevronRight className="w-3 h-3 text-[#7ec8e3]" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Slide-in Scientific Explanation Drawer when user taps any vital sign */}
      <AnimatePresence>
        {selectedSign && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-6 sm:inset-x-16 bottom-20 z-40 max-w-4xl mx-auto bg-[#061014]/95 border border-[#7ec8e3]/40 backdrop-blur-2xl rounded-2xl p-6 sm:p-8 shadow-[0_25px_80px_rgba(0,0,0,0.95)] pointer-events-auto text-left"
          >
            <button
              type="button"
              onClick={() => setSelectedSign(null)}
              className="absolute top-5 right-5 text-[#8fa3ab] hover:text-[#eaf2f5] p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              title={isFi ? 'Sulje' : 'Close'}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.25em] uppercase text-[#7ec8e3] mb-2">
              <span>{selectedSign.code}</span>
              <span>·</span>
              <span>{selectedSign.institutionSource}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 mb-4 border-b border-white/10 pb-4">
              <h3 className="font-display text-2xl sm:text-3xl text-[#eaf2f5]">
                {isFi ? selectedSign.nameFi : selectedSign.nameEn}
              </h3>
              <div className="font-display text-4xl sm:text-5xl text-[#e63946] leading-none">
                {selectedSign.displayValue}
              </div>
            </div>

            {/* Scientific Explanation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-body text-sm leading-relaxed mb-4">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#8fa3ab] mb-1.5 font-semibold">
                  {isFi ? '1. Planetaarinen fysiikka & merkitys' : '1. Planetary Physics & Impact'}
                </div>
                <p className="text-[#eaf2f5]">
                  {isFi ? selectedSign.humanPhysicsFi : selectedSign.humanPhysicsEn}
                </p>
              </div>

              <div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#7ec8e3] mb-1.5 font-semibold">
                  {isFi ? '2. Yhteys Nepalin vuoden 2026 tulvaan' : '2. Connection to Nepal 2026 Flood'}
                </div>
                <p className="text-[#b8ced6]">
                  {isFi ? selectedSign.nepalFloodConnectionFi : selectedSign.nepalFloodConnectionEn}
                </p>
              </div>
            </div>

            {/* Instrument Sensor Attribution */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10 font-mono text-[10px] text-[#8fa3ab]">
              <div>
                {isFi ? 'Mittauslaite:' : 'Instrument:'} {selectedSign.instrumentSensor}
              </div>
              <div className="text-[#7ec8e3]">
                {selectedSign.trendRate}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

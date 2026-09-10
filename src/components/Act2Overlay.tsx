import React, { useRef, useState } from 'react';
import { TranslationSchema } from '../types';
import {
  getIceAt,
  getTempAt,
  getCO2At,
  getSeaAt,
  getOceanHeatAt,
  getCH4At,
  getGreenlandIceLossAt,
  YEAR_MAX,
  YEAR_MIN
} from '../data/climateData';
import { audioService } from '../services/audioService';
import { Info, X, ChevronRight, Activity, Thermometer, Droplets, Flame, Waves, Globe, ArrowRight, Wind } from 'lucide-react';

interface Act2OverlayProps {
  t: TranslationSchema;
  year: number;
  onYearChange: (newYear: number) => void;
  visible: boolean;
  introText: string | null;
  onNextStep?: () => void;
}

type ActiveMetricId = 'temp' | 'ice' | 'greenland' | 'co2' | 'sea' | 'ocean' | null;

export const Act2Overlay: React.FC<Act2OverlayProps> = ({
  t,
  year,
  onYearChange,
  visible,
  introText,
  onNextStep,
}) => {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeMetric, setActiveMetric] = useState<ActiveMetricId>(null);
  const lastTickYearRef = useRef<number>(year);

  if (!visible) return null;

  const isEn = t.lang_name === 'English';
  const isSv = t.lang_name === 'Svenska';

  const currentTemp = getTempAt(year);
  const currentIce = getIceAt(year);
  const currentGreenland = getGreenlandIceLossAt(year);
  const currentCO2 = getCO2At(year);
  const currentSea = getSeaAt(year);
  const currentOceanHeat = getOceanHeatAt(year);
  const currentCH4 = getCH4At(year);
  const pct = (year - YEAR_MIN) / (YEAR_MAX - YEAR_MIN);

  const triggerYearChange = (newYear: number) => {
    const clampedYear = Math.max(YEAR_MIN, Math.min(YEAR_MAX, newYear));
    if (clampedYear !== lastTickYearRef.current) {
      audioService.tick();
      lastTickYearRef.current = clampedYear;
    }
    onYearChange(clampedYear);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    updateYearFromClientX(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updateYearFromClientX(e.clientX);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const updateYearFromClientX = (clientX: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clampedX = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const fraction = clampedX / rect.width;
    const computedYear = Math.round(YEAR_MIN + fraction * (YEAR_MAX - YEAR_MIN));
    triggerYearChange(computedYear);
  };

  const toggleMetric = (id: ActiveMetricId) => {
    audioService.tick();
    setActiveMetric((prev) => (prev === id ? null : id));
  };

  // Generate tick markers
  const ticks = [];
  for (let y = YEAR_MIN; y <= YEAR_MAX; y++) {
    const isMajor = y % 10 === 0 || y === YEAR_MAX || y === YEAR_MIN;
    const tickPct = ((y - YEAR_MIN) / (YEAR_MAX - YEAR_MIN)) * 100;
    ticks.push({ year: y, isMajor, pct: tickPct });
  }

  // Non-technical public descriptions with pre-industrial baselines and direct link to Nepal 2026 flood
  const metricDetails: Record<
    Exclude<ActiveMetricId, null>,
    {
      title: string;
      unit: string;
      val: string;
      preIndustrial: string;
      headline: string;
      plainDescription: string;
      floodConnection: string;
      accentColor: string;
      icon: React.ReactNode;
    }
  > = {
    temp: {
      title: t.act2_temp_label,
      unit: '°C',
      val: `${currentTemp >= 0 ? `+${currentTemp.toFixed(2)}` : currentTemp.toFixed(2)}°C`,
      preIndustrial: '+0.00°C',
      headline: t.metric_temp_desc || 'Average planetary heating above pre-industrial baseline.',
      plainDescription:
        'Because mountain regions amplify warmth, the Hindu Kush Himalaya warms at twice the global rate (+2.9°C). This melts high-altitude permafrost that glues steep moraine slopes together.',
      floodConnection:
        'Thawed permafrost destabilized the steep peaks of Langtang Lirung, triggering the massive rock and ice avalanche into the Trishuli and Lende Khola rivers.',
      accentColor: '#e63946',
      icon: <Thermometer className="w-4 h-4 text-[#e63946]" />,
    },
    ice: {
      title: t.act2_ice_label,
      unit: '%',
      val: `${Math.round(currentIce * 100)}%`,
      preIndustrial: '100% (Intact)',
      headline: t.metric_ice_desc || 'Nearly half of Himalayan glacier volume lost since 1980.',
      plainDescription:
        'The Himalayas are Earth’s "Third Pole", storing more snow and ice than anywhere outside the poles. As glaciers retreat up the valleys, their meltwater collects behind unstable natural gravel dams.',
      floodConnection:
        'Over 200 glacial lakes across Nepal are now classified as high-risk. When moraine walls give way, millions of tons of water rush downstream in minutes.',
      accentColor: '#b8e6f2',
      icon: <Droplets className="w-4 h-4 text-[#b8e6f2]" />,
    },
    greenland: {
      title: t.act2_greenland_label || 'Greenland Ice Loss',
      unit: 'Gt',
      val: `${currentGreenland >= 0 ? '0' : currentGreenland.toLocaleString()} Gt`,
      preIndustrial: '0 Gt (Mass Balance)',
      headline: t.metric_greenland_desc || 'NASA GRACE gravimetry: -5,380 billion tons of continental ice lost.',
      plainDescription:
        'Greenland holds 2.9 million cubic kilometers of ice. Since 2000, warming summer air and sea currents have caused severe net ablation (~275 Gt/yr lost). If Greenland melts entirely, global sea levels rise by 7.4 meters (24 ft).',
      floodConnection:
        'The Nepal 2026 disaster and Greenland ice sheet collapse are two sides of the same planetary crisis: mountain melt triggers deadly inland flash floods, while polar melt submerges coastal civilizations.',
      accentColor: '#38bdf8',
      icon: <Globe className="w-4 h-4 text-[#38bdf8]" />,
    },
    co2: {
      title: t.act2_co2_label,
      unit: 'ppm',
      val: `${currentCO2.toFixed(1)} ppm`,
      preIndustrial: '280 ppm (Stable for 10,000 yrs)',
      headline: t.metric_co2_desc || 'Acts like an invisible thermal blanket trapping solar heat.',
      plainDescription:
        'For ten thousand years of human civilization, atmospheric CO₂ remained steady at ~280 ppm. Burning coal, oil, and gas has pushed it to over 427 ppm today—a 53% increase that traps excess heat 24/7.',
      floodConnection:
        'Trapped heat provides the continuous thermal energy that fuels mountain cloudbursts and accelerates glacier thaw.',
      accentColor: '#f4a261',
      icon: <Flame className="w-4 h-4 text-[#f4a261]" />,
    },
    sea: {
      title: t.act3_sea_label,
      unit: 'mm',
      val: `+${currentSea.toFixed(0)} mm`,
      preIndustrial: '0 mm',
      headline: t.metric_sea_desc || 'Global sea level rise from melting ice sheets and warm ocean expansion.',
      plainDescription:
        'Every cubic meter of ice melted in Nepal’s mountains eventually flows down the Ganges delta into the sea. Water knows no borders: mountain melt combines with thermal expansion to drown coastal deltas worldwide.',
      floodConnection:
        'Illustrates the global planetary loop: melting Himalayan water heads toward Bangladesh, Maldives, and coastal cities around the world.',
      accentColor: '#7ec8e3',
      icon: <Waves className="w-4 h-4 text-[#7ec8e3]" />,
    },
    ocean: {
      title: t.act2_ocean_heat_label || 'Ocean Heat Trapping',
      unit: 'ZJ',
      val: `+${currentOceanHeat.toFixed(0)} ZJ`,
      preIndustrial: '0 ZJ',
      headline: t.metric_ocean_desc || 'Over 90% of trapped planetary heat is stored in the oceans.',
      plainDescription:
        'Oceans have absorbed an enormous 382 Zettajoules of excess energy. Warmer oceans cause hyper-intense evaporation, forming airborne "atmospheric rivers" that travel thousands of miles inland to mountain summits.',
      floodConnection:
        'Warm ocean air holds 7% more moisture per degree Celsius. When it collided with Himalayan peaks on August 26, it triggered unprecedented cloudburst rainfall.',
      accentColor: '#e76f51',
      icon: <Activity className="w-4 h-4 text-[#e76f51]" />,
    },
  };

  return (
    <>
      {/* Intro narration beat if active - Pure Floating Typography (No Box) */}
      {introText && (
        <div className="absolute left-10 right-10 bottom-64 z-20 text-center pointer-events-none transition-opacity duration-700">
          <p className="font-display italic text-3xl sm:text-5xl lg:text-6xl text-[#eaf2f5] drop-shadow-[0_4px_45px_rgba(0,0,0,0.98)] max-w-5xl mx-auto">
            "{introText}"
          </p>
        </div>
      )}

      {/* Wind deflection hint capsule (top right) */}
      <div className="absolute top-20 right-6 sm:right-10 z-20 pointer-events-none select-none">
        <div className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.22em] uppercase text-[#8fa3ab] px-3 py-1.5 drop-shadow-md">
          <Wind className="w-3.5 h-3.5 text-[#7ec8e3]" />
          <span>{t.act2_wind_prompt}</span>
        </div>
      </div>

      {/* Floating Public Explanation Modal (Appears when visitor taps any metric) */}
      {activeMetric && metricDetails[activeMetric] && (
        <div className="absolute bottom-64 right-10 z-30 max-w-md w-[92vw] sm:w-[420px] pointer-events-auto animate-fadeIn">
          <div className="border border-white/15 bg-[#061014]/95 backdrop-blur-2xl p-6 shadow-[0_25px_60px_rgba(0,0,0,0.9)] text-left relative rounded-2xl">
            <button
              onClick={() => setActiveMetric(null)}
              className="absolute top-4 right-4 text-[#8fa3ab] hover:text-[#eaf2f5] p-1.5 cursor-pointer rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              title="Sulje / Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-2 font-mono text-[10px] tracking-[0.25em] uppercase text-[#8fa3ab]">
              {metricDetails[activeMetric].icon}
              <span>{metricDetails[activeMetric].title}</span>
            </div>

            <div className="flex items-baseline gap-3 mb-3">
              <div
                className="font-display text-4xl font-semibold leading-none"
                style={{ color: metricDetails[activeMetric].accentColor }}
              >
                {metricDetails[activeMetric].val}
              </div>
              <div className="font-mono text-[10px] text-[#8fa3ab] tracking-wider">
                {isEn ? 'Pre-industrial baseline: ' : isSv ? 'Förindustriell baslinje: ' : 'Esiteollinen vertailutaso: '}
                {metricDetails[activeMetric].preIndustrial}
              </div>
            </div>

            <p className="font-body text-sm text-[#eaf2f5] leading-relaxed mb-4">
              {metricDetails[activeMetric].plainDescription}
            </p>

            <div className="border-t border-white/10 pt-3 mt-3 bg-white/[0.02] -mx-6 -mb-6 p-6 rounded-b-2xl">
              <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#7ec8e3] mb-1.5 font-semibold">
                {isEn ? 'Connection to Nepal 2026 flood:' : isSv ? 'Koppling till Nepals översvämning 2026:' : 'Yhteys Nepalin vuoden 2026 tulvaan:'}
              </div>
              <p className="font-body text-xs text-[#b8ced6] leading-relaxed">
                {metricDetails[activeMetric].floodConnection}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Scrubber & Telemetry Area - Floating Layout safely positioned above bottom controls */}
      <div className="absolute bottom-24 sm:bottom-28 left-6 right-6 sm:left-10 sm:right-10 z-20 pointer-events-auto select-none transition-opacity duration-700 animate-fadeIn">
        <div>
          {/* Header row: Big Year on left + Multi-Parameter Climate Metrics on right */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-4 font-mono gap-4">
            {/* Big Year display with dynamic prompt when stopping at 2000 */}
            <div className="flex items-end gap-3 sm:gap-4 shrink-0 pb-1">
              <div className="font-display text-7xl sm:text-8xl lg:text-9xl leading-none text-[#eaf2f5] tracking-tight drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)]">
                {year}
              </div>
              <div className="font-mono text-[10px] sm:text-[11px] tracking-[0.2em] uppercase flex flex-col justify-end pb-1.5 sm:pb-2.5 drop-shadow-sm">
                {year <= 2000 ? (
                  <span className="h-7 inline-flex items-center gap-1.5 text-[#7ec8e3] font-medium bg-[#7ec8e3]/10 border border-[#7ec8e3]/30 px-3 py-1 rounded-full whitespace-nowrap shadow-[0_0_12px_rgba(126,200,227,0.15)]">
                    <span>
                      {isEn
                        ? '1980–2000 Baseline · Drag slider to 2026'
                        : isSv
                        ? '1980–2000 Baslinje · Dra reglaget till 2026'
                        : '1980–2000 Lähtötaso · Vedä säädintä kohti 2026'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#7ec8e3] animate-pulse shrink-0" />
                  </span>
                ) : year === 2026 ? (
                  <span className="h-7 inline-flex items-center gap-1.5 text-[#e63946] font-medium bg-[#e63946]/10 border border-[#e63946]/30 px-3 py-1 rounded-full whitespace-nowrap shadow-[0_0_12px_rgba(230,57,70,0.2)]">
                    <span>
                      {isEn ? '2026 · Nepal Flood Disaster' : isSv ? '2026 · Nepals Flodkatastrof' : '2026 · Nepalin tulvakatastrofi'}
                    </span>
                  </span>
                ) : (
                  <span className="h-7 inline-flex items-center gap-1.5 text-[#8fa3ab] font-medium bg-white/[0.04] border border-white/10 px-3 py-1 rounded-full whitespace-nowrap">
                    <span>
                      {isEn ? 'Historical Trajectory · Accelerating' : isSv ? 'Historisk utveckling · Accelererar' : 'Historiallinen kehitys · Kiihtyy'}
                    </span>
                  </span>
                )}
              </div>
            </div>

            {/* Telemetry Metrics Columns - Pure Floating Numbers Without Card Boxes */}
            <div className="flex flex-wrap gap-4 sm:gap-6 lg:gap-8 items-end justify-end">
              {/* 1. Temperature Anomaly */}
              <button
                onClick={() => toggleMetric('temp')}
                className={`flex flex-col justify-end items-end text-right group cursor-pointer transition-all duration-200 min-w-[70px] focus:outline-none shrink-0 ${
                  activeMetric === 'temp' ? 'scale-105' : 'hover:opacity-80'
                }`}
                title="Kosketa nähdäksesi selityksen / Tap to explain"
              >
                <div className="font-mono text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-[#8fa3ab] mb-1.5 group-hover:text-[#eaf2f5] transition-colors flex items-center justify-end gap-1 h-4">
                  <span>{t.act2_temp_label}</span>
                  <Info className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100" />
                </div>
                <div className="font-display text-3xl sm:text-4xl lg:text-5xl text-[#e63946] leading-none drop-shadow-[0_0_20px_rgba(230,57,70,0.3)] flex items-baseline justify-end">
                  <span>{currentTemp >= 0 ? `+${currentTemp.toFixed(2)}` : currentTemp.toFixed(2)}</span>
                  <span className="text-xs sm:text-sm font-sans font-normal text-[#8fa3ab] ml-1">°C</span>
                </div>
              </button>

              {/* 2. Himalayan Ice Remaining */}
              <button
                onClick={() => toggleMetric('ice')}
                className={`flex flex-col justify-end items-end text-right group cursor-pointer transition-all duration-200 min-w-[70px] focus:outline-none shrink-0 ${
                  activeMetric === 'ice' ? 'scale-105' : 'hover:opacity-80'
                }`}
                title="Kosketa nähdäksesi selityksen / Tap to explain"
              >
                <div className="font-mono text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-[#8fa3ab] mb-1.5 group-hover:text-[#eaf2f5] transition-colors flex items-center justify-end gap-1 h-4">
                  <span>{t.act2_ice_label}</span>
                  <Info className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100" />
                </div>
                <div className="font-display text-3xl sm:text-4xl lg:text-5xl text-[#b8e6f2] leading-none drop-shadow-[0_0_20px_rgba(184,230,242,0.3)] flex items-baseline justify-end">
                  <span>{Math.round(currentIce * 100)}</span>
                  <span className="text-xs sm:text-sm font-sans font-normal text-[#8fa3ab] ml-1">%</span>
                </div>
              </button>

              {/* 3. Greenland Ice Sheet Cumulative Loss */}
              <button
                onClick={() => toggleMetric('greenland')}
                className={`flex flex-col justify-end items-end text-right group cursor-pointer transition-all duration-200 min-w-[70px] focus:outline-none shrink-0 ${
                  activeMetric === 'greenland' ? 'scale-105' : 'hover:opacity-80'
                }`}
                title="Kosketa nähdäksesi selityksen / Tap to explain Greenland Ice Loss"
              >
                <div className="font-mono text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-[#8fa3ab] mb-1.5 group-hover:text-[#eaf2f5] transition-colors flex items-center justify-end gap-1 h-4">
                  <span>{t.act2_greenland_label || 'Grönlannin jää'}</span>
                  <Info className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100" />
                </div>
                <div className="font-display text-3xl sm:text-4xl lg:text-5xl text-[#38bdf8] leading-none drop-shadow-[0_0_20px_rgba(56,189,248,0.3)] flex items-baseline justify-end">
                  <span>{currentGreenland >= 0 ? '0' : currentGreenland.toLocaleString()}</span>
                  <span className="text-xs sm:text-sm font-sans font-normal text-[#8fa3ab] ml-1">Gt</span>
                </div>
              </button>

              {/* 4. Atmospheric CO2 */}
              <button
                onClick={() => toggleMetric('co2')}
                className={`flex flex-col justify-end items-end text-right group cursor-pointer transition-all duration-200 min-w-[70px] focus:outline-none shrink-0 ${
                  activeMetric === 'co2' ? 'scale-105' : 'hover:opacity-80'
                }`}
                title="Kosketa nähdäksesi selityksen / Tap to explain"
              >
                <div className="font-mono text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-[#8fa3ab] mb-1.5 group-hover:text-[#eaf2f5] transition-colors flex items-center justify-end gap-1 h-4">
                  <span>{t.act2_co2_label || 'Ilmakehän CO₂'}</span>
                  <Info className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100" />
                </div>
                <div className="font-display text-3xl sm:text-4xl lg:text-5xl text-[#f4a261] leading-none drop-shadow-[0_0_20px_rgba(244,162,97,0.3)] flex items-baseline justify-end">
                  <span>{currentCO2.toFixed(1)}</span>
                  <span className="text-xs sm:text-sm font-sans font-normal text-[#8fa3ab] ml-1">ppm</span>
                </div>
              </button>

              {/* 5. Sea Level Rise */}
              <button
                onClick={() => toggleMetric('sea')}
                className={`flex flex-col justify-end items-end text-right group cursor-pointer transition-all duration-200 min-w-[70px] focus:outline-none shrink-0 hidden sm:flex ${
                  activeMetric === 'sea' ? 'scale-105' : 'hover:opacity-80'
                }`}
                title="Kosketa nähdäksesi selityksen / Tap to explain"
              >
                <div className="font-mono text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-[#8fa3ab] mb-1.5 group-hover:text-[#eaf2f5] transition-colors flex items-center justify-end gap-1 h-4">
                  <span>{t.act3_sea_label}</span>
                  <Info className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100" />
                </div>
                <div className="font-display text-3xl sm:text-4xl lg:text-5xl text-[#7ec8e3] leading-none drop-shadow-[0_0_20px_rgba(126,200,227,0.3)] flex items-baseline justify-end">
                  <span>+{currentSea.toFixed(0)}</span>
                  <span className="text-xs sm:text-sm font-sans font-normal text-[#8fa3ab] ml-1">mm</span>
                </div>
              </button>
            </div>
          </div>

          {/* Touch-Friendly Scrubber Track */}
          <div
            ref={trackRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="relative h-14 cursor-ew-resize select-none touch-none flex items-center my-2"
            title="Vedä kulkeaksesi ajassa / Drag to scrub year"
          >
            {/* Rail Gradient Line */}
            <div className="absolute left-0 right-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-gradient-to-r from-[#7ec8e3]/50 via-[#f4a261]/70 to-[#e63946]" />

            {/* Year Ticks */}
            <div className="absolute inset-0 pointer-events-none">
              {ticks.map((tick) => (
                <div
                  key={tick.year}
                  style={{ left: `${tick.pct}%` }}
                  className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                >
                  <div
                    className={`w-[1px] ${
                      tick.isMajor ? 'h-5 bg-[#8fa3ab]' : 'h-2 bg-[#4d6169]/80'
                    }`}
                  />
                  {tick.isMajor && (
                    <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-widest text-[#8fa3ab]">
                      {tick.year}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Glowing Scrubber Needle Indicator */}
            <div
              style={{ left: `${pct * 100}%` }}
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-[3px] h-10 bg-[#b8e6f2] pointer-events-none shadow-[0_0_20px_#7ec8e3,0_0_35px_#7ec8e3] rounded-full"
            >
              {/* Interactive Slide Hint when at or before 2000 */}
              {year <= 2000 && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-0.5 rounded-full bg-[#0a1820]/90 border border-[#7ec8e3] text-[#7ec8e3] font-mono text-[9px] tracking-widest uppercase animate-pulse shadow-[0_0_15px_rgba(126,200,227,0.5)]">
                  {isEn ? 'Slide →' : isSv ? 'Dra →' : 'Liu’uta →'}
                </div>
              )}
              {/* Top needle head */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[7px] border-t-[#b8e6f2]" />
              {/* Bottom needle pip */}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#b8e6f2]" />
            </div>
          </div>

          {/* Drag Hint & Quick-Milestone Touch Chips for Public Kiosk */}
          <div className="flex flex-col sm:flex-row items-center justify-between mt-3 font-mono text-[11px] text-[#8fa3ab] gap-2 pt-2 border-t border-white/5">
            {/* Primary Drag instruction */}
            <div className="tracking-[0.24em] uppercase text-xs text-[#8fa3ab]">
              {t.act2_scrubber}
            </div>

            {/* Touch-Friendly Historical Milestones */}
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <span className="text-[10px] uppercase tracking-wider text-[#4d6169] hidden md:inline">
                {isEn ? 'Jump:' : isSv ? 'Snabbval:' : 'Pikavalinta:'}
              </span>
              {[
                { label: '1980', y: 1980, sub: isEn ? 'Baseline' : isSv ? 'Baslinje' : 'Lähtötaso' },
                { label: '2000', y: 2000, sub: isEn ? 'Acceleration' : isSv ? 'Acceleration' : 'Kiihtyminen' },
                { label: '2015', y: 2015, sub: isEn ? 'Paris' : isSv ? 'Paris' : 'Pariisi' },
                { label: '2026', y: 2026, sub: isEn ? 'Flood' : isSv ? 'Katastrof' : 'Tulva' },
              ].map((milestone) => (
                <button
                  key={milestone.y}
                  onClick={() => triggerYearChange(milestone.y)}
                  className={`px-3 py-1 text-[10px] tracking-wider uppercase rounded-full border transition-all cursor-pointer ${
                    year === milestone.y
                      ? 'border-[#7ec8e3] text-[#eaf2f5] bg-[#7ec8e3]/20 shadow-[0_0_15px_rgba(126,200,227,0.3)]'
                      : 'border-white/10 text-[#8fa3ab] hover:text-[#eaf2f5] hover:border-white/20 bg-[#0a1418]/60'
                  } backdrop-blur-sm`}
                  title={`${milestone.label} (${milestone.sub})`}
                >
                  {milestone.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

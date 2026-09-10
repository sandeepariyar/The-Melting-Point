import React, { useState, useEffect } from 'react';
import { Language, TranslationSchema, LiveStationWeather } from '../types';
import { Volume2, VolumeX, Activity, Compass, Wind, Thermometer, User, ShieldCheck, Waves, Globe, Droplets, Info, RotateCcw } from 'lucide-react';
import { audioService } from '../services/audioService';
import { disasterService } from '../services/disasterService';

interface TopBarProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  t: TranslationSchema;
  visible?: boolean;
  onOpenDeveloper: () => void;
  onOpenDataSources: () => void;
  onOpenInfo: () => void;
  onResetToAttract?: () => void;
  currentAct?: string;
  onToggleSeaLevel: () => void;
  seaLevelActive?: boolean;
  onToggleGlobal: () => void;
  globalActive?: boolean;
  onToggleWaterEmergency?: () => void;
  waterEmergencyActive?: boolean;
  isCauseSection?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentLang,
  onLanguageChange,
  t,
  visible = true,
  onOpenDeveloper,
  onOpenDataSources,
  onOpenInfo,
  onResetToAttract,
  currentAct,
  onToggleSeaLevel,
  seaLevelActive = false,
  onToggleGlobal,
  globalActive = false,
  onToggleWaterEmergency,
  waterEmergencyActive = false,
  isCauseSection = false,
}) => {
  const [isMuted, setIsMuted] = useState(audioService.isMuted());
  const [showWeatherDetail, setShowWeatherDetail] = useState(false);
  const [weather, setWeather] = useState<LiveStationWeather | null>(null);

  useEffect(() => {
    disasterService.getLiveWeather().then((w) => setWeather(w));
    const interval = setInterval(() => {
      disasterService.getLiveWeather().then((w) => setWeather(w));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleSound = () => {
    const muted = audioService.toggleMute();
    setIsMuted(muted);
  };

  if (!visible) return null;

  return (
    <header className="absolute top-5 left-6 right-6 sm:left-10 sm:right-10 flex justify-between items-center z-30 pointer-events-auto">
      {/* Brand Identification Capsule */}
      <div className="flex items-center gap-3.5 px-4 py-2 bg-[#05090b]/80 border border-white/10 rounded-full backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
        <span className="w-2 h-2 rounded-full bg-[#7ec8e3] animate-pulse" />
        <div className="flex flex-col">
          <span className="font-mono text-[10px] tracking-[0.3em] text-[#8fa3ab] uppercase leading-tight font-medium">
            THE MELTING POINT
          </span>
          <span className="font-display italic text-[#7ec8e3] text-xs tracking-wide">
            {t.attract_subtitle}
          </span>
        </div>
      </div>

      {/* Controls Capsule: Info + Station + Dev + Legal + Language + Sound + Screen 0 Reset */}
      <div className="flex items-center gap-2">
        {/* Museum Exhibit Info / What is this about button */}
        <button
          onClick={onOpenInfo}
          className="flex items-center gap-1.5 font-mono text-[11px] tracking-wider uppercase px-3.5 py-1.5 rounded-full border border-[#7ec8e3]/40 bg-[#7ec8e3]/15 hover:bg-[#7ec8e3]/25 text-[#eaf2f5] hover:border-[#7ec8e3] backdrop-blur-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(126,200,227,0.2)]"
          title="Info: Mistä tässä on kyse? / Museum Guide"
        >
          <Info className="w-3.5 h-3.5 text-[#7ec8e3]" />
          <span>{t.ui_info_btn || 'Info'}</span>
        </button>

        {/* Return to Screen 0 / Attract Loop (Kiosk Reset) */}
        {currentAct && currentAct !== 'attract' && onResetToAttract && (
          <button
            onClick={onResetToAttract}
            className="flex items-center gap-1.5 font-mono text-[11px] tracking-wider uppercase px-3 py-1.5 rounded-full border border-white/15 bg-[#0a1418]/80 hover:bg-[#0a1418] hover:border-[#7ec8e3]/40 text-[#8fa3ab] hover:text-[#eaf2f5] backdrop-blur-xl transition-all cursor-pointer"
            title="Palaa alkuun (Ruutu 0) / Return to Screen 0"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#8fa3ab]" />
            <span className="hidden sm:inline">{t.ui_reset_kiosk || 'Alkuun'}</span>
          </button>
        )}

        {/* Langtang Live Station Status */}
        <div className="relative">
          <button
            onClick={() => setShowWeatherDetail(!showWeatherDetail)}
            className="flex items-center gap-2 font-mono text-[11px] tracking-wider uppercase px-3 py-1.5 rounded-full border border-white/10 bg-[#0a1418]/80 backdrop-blur-xl text-[#8fa3ab] hover:text-[#eaf2f5] hover:border-[#7ec8e3]/40 transition-colors cursor-pointer"
            title="Langtang Alpine Meteorological Telemetry"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7ec8e3] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#7ec8e3]"></span>
            </span>
            <span className="hidden lg:inline">
              Langtang · {weather ? `${weather.temp.toFixed(1)}°C` : '-3.2°C'} · {weather ? `${weather.windSpeed.toFixed(0)} km/h ${weather.windDir}` : '18 km/h NW'}
            </span>
            <span className="lg:hidden">4,200m</span>
          </button>

          {showWeatherDetail && (
            <div className="absolute right-0 top-10 w-80 p-4 border border-[#7ec8e3]/30 bg-[#0a1418]/95 backdrop-blur-2xl shadow-2xl z-50 text-left font-mono rounded-xl">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
                <div className="flex items-center gap-2 text-xs text-[#7ec8e3]">
                  <Activity className="w-3.5 h-3.5 animate-pulse" />
                  <span>LANGTANG TELEMETRY STREAM</span>
                </div>
                <span className="text-[10px] text-[#8fa3ab]">ERA5/Open-Meteo</span>
              </div>
              <div className="space-y-2 text-xs text-[#eaf2f5]">
                <div className="flex justify-between items-center">
                  <span className="text-[#8fa3ab] flex items-center gap-1.5"><Thermometer className="w-3.5 h-3.5 text-[#7ec8e3]" /> Elevation:</span>
                  <span>4,200 m a.s.l.</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#8fa3ab] flex items-center gap-1.5"><Thermometer className="w-3.5 h-3.5 text-[#f4a261]" /> Temperature:</span>
                  <span className="text-[#f4a261]">{weather ? `${weather.temp.toFixed(1)}°C` : '-3.2°C'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#8fa3ab] flex items-center gap-1.5"><Wind className="w-3.5 h-3.5 text-[#7ec8e3]" /> Wind Speed:</span>
                  <span>{weather ? `${weather.windSpeed.toFixed(1)} km/h ${weather.windDir}` : '18.4 km/h NW'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#8fa3ab] flex items-center gap-1.5"><Compass className="w-3.5 h-3.5 text-[#7ec8e3]" /> Surface Pressure:</span>
                  <span>{weather ? `${weather.pressure.toFixed(1)} hPa` : '612.4 hPa'}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-white/10 text-[#e63946]">
                  <span>Glacial Outburst Risk:</span>
                  <span className="font-bold">CRITICAL</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Developer Attribution Button */}
        <button
          onClick={onOpenDeveloper}
          className="flex items-center gap-1.5 font-mono text-[11px] tracking-wider uppercase px-3 py-1.5 rounded-full border border-white/10 bg-[#0a1418]/80 backdrop-blur-xl text-[#8fa3ab] hover:text-[#eaf2f5] hover:border-white/30 transition-colors cursor-pointer"
          title="Developer: Sandeep Pariyar"
        >
          <User className="w-3.5 h-3.5 text-[#7ec8e3]" />
          <span className="hidden md:inline">Sandeep Pariyar</span>
        </button>

        {/* Legal & Data Sources Button */}
        <button
          onClick={onOpenDataSources}
          className="flex items-center gap-1.5 font-mono text-[11px] tracking-wider uppercase px-3 py-1.5 rounded-full border border-white/10 bg-[#0a1418]/80 backdrop-blur-xl text-[#8fa3ab] hover:text-[#eaf2f5] hover:border-white/30 transition-colors cursor-pointer"
          title={t.ui_data_sources}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-[#7ec8e3]" />
          <span className="hidden lg:inline">{t.ui_data_sources}</span>
        </button>

        {/* Trilingual Toggle */}
        <div className="flex border border-white/10 bg-[#0a1418]/80 backdrop-blur-xl rounded-full p-0.5">
          {(['en', 'fi', 'sv'] as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => onLanguageChange(lang)}
              className={`font-mono text-[11px] tracking-widest px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                currentLang === lang
                  ? 'text-[#7ec8e3] bg-[#7ec8e3]/15 font-medium'
                  : 'text-[#8fa3ab] hover:text-[#eaf2f5]'
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Audio Mute Chip */}
        <button
          onClick={handleToggleSound}
          className={`flex items-center gap-1.5 font-mono text-[11px] tracking-wider uppercase px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
            !isMuted
              ? 'border-[#7ec8e3]/40 bg-[#7ec8e3]/15 text-[#7ec8e3]'
              : 'border-white/10 bg-[#0a1418]/80 text-[#8fa3ab] hover:text-[#eaf2f5]'
          } backdrop-blur-xl`}
          title={isMuted ? t.ui_sound_off : t.ui_sound_on}
        >
          {!isMuted ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{t.ui_mute}</span>
        </button>
      </div>
    </header>
  );
};

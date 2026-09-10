import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ActType, CameraPresetName, Language, LiveDisasterReport, LiveStationWeather } from './types';
import { TRANSLATIONS } from './data/i18n';
import { audioService } from './services/audioService';
import { disasterService } from './services/disasterService';
import { ThreeScene } from './components/ThreeScene';
import { TopBar } from './components/TopBar';
import { AttractOverlay } from './components/AttractOverlay';
import { ActHeader } from './components/ActHeader';
import { Act1Overlay } from './components/Act1Overlay';
import { Act2Overlay } from './components/Act2Overlay';
import { ClimateSpiralOverlay } from './components/ClimateSpiralOverlay';
import { EarthEnergyBudgetOverlay } from './components/EarthEnergyBudgetOverlay';
import { Act3Overlay } from './components/Act3Overlay';
import { BottomProgress } from './components/BottomProgress';
import { LearnShareActModal } from './components/LearnShareActModal';
import { DeveloperModal } from './components/DeveloperModal';
import { DataSourcesModal } from './components/DataSourcesModal';
import { SeaLevelDashboard } from './components/SeaLevelDashboard';
import { GlobalDashboard } from './components/GlobalDashboard';
import { WarmingStripesOverlay } from './components/WarmingStripesOverlay';
import { WaterEmergencyShaderOverlay } from './components/WaterEmergencyShaderOverlay';
import { TouchRippleContainer, RippleItem } from './components/TouchRipple';
import { MuseumInfoModal } from './components/MuseumInfoModal';

export default function App() {
  const [currentAct, setCurrentAct] = useState<ActType>('attract');
  const [waterEmergencyActive, setWaterEmergencyActive] = useState<boolean>(false);
  const [waterEmergencyIntensity, setWaterEmergencyIntensity] = useState<number>(0);
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('kiosk_lang') as Language;
      if (saved && (saved === 'en' || saved === 'fi' || saved === 'sv')) return saved;
    } catch {
      // fallback
    }
    return 'en';
  });

  // Stage scaling
  const [stageScale, setStageScale] = useState(1);
  const [stageOffset, setStageOffset] = useState({ x: 0, y: 0 });

  // Scene parameters
  const [year, setYear] = useState<number>(2026);
  const [scenarioTemp, setScenarioTemp] = useState<number>(1.5);
  const [floodProgress, setFloodProgress] = useState<number>(0);
  const [cameraPreset, setCameraPreset] = useState<CameraPresetName>('attract');

  // Sea Level Rise & Global Simulation
  const [seaLevelDashboardOpen, setSeaLevelDashboardOpen] = useState(false);
  const [globalDashboardOpen, setGlobalDashboardOpen] = useState(false);
  const [warmingStripesOpen, setWarmingStripesOpen] = useState(false);
  const [seaLevelMeters, setSeaLevelMeters] = useState<number>(0);

  // Modals for Developer and Legal Data Sources
  const [developerModalOpen, setDeveloperModalOpen] = useState(false);
  const [dataSourcesModalOpen, setDataSourcesModalOpen] = useState(false);
  const [museumInfoOpen, setMuseumInfoOpen] = useState(false);

  // Live Disaster Reporting
  const [disasterReport, setDisasterReport] = useState<LiveDisasterReport | undefined>(undefined);

  // Act 1 progression states
  const [act1BeatText, setAct1BeatText] = useState<string | null>(null);
  const [act1ShowToll, setAct1ShowToll] = useState<boolean>(false);
  const [act1ShowTollCause, setAct1ShowTollCause] = useState<boolean>(false);
  const [visitedDrivers, setVisitedDrivers] = useState<{
    stripes: boolean;
    sealevel: boolean;
    global: boolean;
  }>({
    stripes: false,
    sealevel: false,
    global: false,
  });

  // Touch and pointer ripples state
  const [ripples, setRipples] = useState<RippleItem[]>([]);
  const rippleIdRef = useRef<number>(0);

  // Act 2 progression states
  const [act2IntroText, setAct2IntroText] = useState<string | null>(null);
  const [act2Step, setAct2Step] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [liveWeather, setLiveWeather] = useState<LiveStationWeather | null>(null);

  // Act 3 progression states
  const [act3ClosingCard, setAct3ClosingCard] = useState<boolean>(false);
  const [actionModal, setActionModal] = useState<'learn' | 'share' | 'act' | null>(null);

  // Timers ref for narrative sequence
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const t = TRANSLATIONS[language];

  // Fetch live disaster report data & live alpine weather
  useEffect(() => {
    disasterService.getDisasterData().then((rep) => setDisasterReport(rep));
    disasterService.getLiveWeather().then((w) => setLiveWeather(w));

    const interval = setInterval(() => {
      disasterService.getDisasterData().then((rep) => setDisasterReport(rep));
      disasterService.getLiveWeather().then((w) => setLiveWeather(w));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const addTimer = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  // Responsive stage scaling (16:9 1920x1080 fixed base letterbox)
  useEffect(() => {
    const updateScale = () => {
      const sx = window.innerWidth / 1920;
      const sy = window.innerHeight / 1080;
      const s = Math.min(sx, sy);
      const tx = (window.innerWidth - 1920 * s) / 2;
      const ty = (window.innerHeight - 1080 * s) / 2;
      setStageScale(s);
      setStageOffset({ x: tx, y: ty });
    };

    window.addEventListener('resize', updateScale);
    updateScale();
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // Narrative transitions
  const goToAttract = useCallback(() => {
    clearAllTimers();
    setCurrentAct('attract');
    setCameraPreset('attract');
    setYear(2026);
    setFloodProgress(0);
    setWaterEmergencyActive(false);
    setWaterEmergencyIntensity(0);
    setAct1BeatText(null);
    setAct1ShowToll(false);
    setAct1ShowTollCause(false);
    setAct2IntroText(null);
    setAct2Step(1);
    setSeaLevelMeters(0);
    setAct3ClosingCard(false);
    setActionModal(null);
    setDeveloperModalOpen(false);
    setDataSourcesModalOpen(false);
    setMuseumInfoOpen(false);
    setSeaLevelDashboardOpen(false);
    setGlobalDashboardOpen(false);
    setWarmingStripesOpen(false);
    setVisitedDrivers({ stripes: false, sealevel: false, global: false });

    audioService.fade('wind', 0.38, 3);
    audioService.fade('drone', 0.16, 3);
    audioService.fade('bowlDrone', 0.12, 3);
    audioService.fade('water', 0, 2);
    audioService.fade('rain', 0, 2);
  }, [clearAllTimers]);

  // Idle timeout (38s of inactivity automatically resets to attract mode / screen 0 for public kiosk)
  const IDLE_TIMEOUT_MS = 38000;

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (currentAct !== 'attract') {
      idleTimerRef.current = setTimeout(() => {
        goToAttract();
      }, IDLE_TIMEOUT_MS);
    }
  }, [currentAct, goToAttract]);

  useEffect(() => {
    let lastEventTime = 0;
    let lastX = -1;
    let lastY = -1;

    const handleUserActivity = (e: Event) => {
      // If it's a mousemove/pointermove, ignore minor sensor drift / jitter
      if (e.type === 'pointermove' || e.type === 'mousemove') {
        const me = e as MouseEvent;
        if (lastX >= 0 && lastY >= 0) {
          const dist = Math.hypot(me.clientX - lastX, me.clientY - lastY);
          if (dist < 15) return; // Ignore small movements
        }
        lastX = me.clientX;
        lastY = me.clientY;
      }

      const now = Date.now();
      if (now - lastEventTime > 300) {
        lastEventTime = now;
        resetIdleTimer();
      }
    };

    const events = ['pointerdown', 'pointermove', 'touchstart', 'touchend', 'keydown', 'wheel', 'click'];
    events.forEach((evt) => window.addEventListener(evt, handleUserActivity, { passive: true }));
    resetIdleTimer();

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleUserActivity));
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [resetIdleTimer]);

  // Language change handler
  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    try {
      localStorage.setItem('kiosk_lang', newLang);
    } catch {
      // ignore
    }
  };

  const startAct1 = useCallback(() => {
    clearAllTimers();
    setCurrentAct('act1');
    setYear(2026);
    setCameraPreset('act1_wide');
    setAct1ShowToll(false);
    setAct1ShowTollCause(false);
    setWaterEmergencyActive(false);
    setWaterEmergencyIntensity(0);

    audioService.fade('wind', 0.55, 4);
    audioService.fade('drone', 0.28, 4);
    audioService.fade('bowlDrone', 0.2, 4);

    // t=2s: Beat 1
    addTimer(() => {
      setAct1BeatText(t.act1_beat1);
    }, 2000);

    // t=6.5s: Beat 2 + camera valley
    addTimer(() => {
      setCameraPreset('act1_valley');
      setAct1BeatText(t.act1_beat2);
      audioService.fade('water', 0.2, 3);
    }, 6500);

    // t=11s: Beat 3 ("The valley below is asleep.")
    // User requested: "when it says valley below is sleeping it shows wave of water particles right? what if we show this water particles so it covers the whole screen to show the emergency and [shader]"
    addTimer(() => {
      setAct1BeatText(t.act1_beat3);
      setWaterEmergencyActive(true);
      // Softly swell water immersion from 0 to 0.45 leading into the catastrophic flood wave
      const start = performance.now();
      const duration = 4000;
      const animateRisingWater = (now: number) => {
        const p = Math.min(1, (now - start) / duration);
        setWaterEmergencyIntensity(p * 0.45);
        if (p < 1) {
          requestAnimationFrame(animateRisingWater);
        }
      };
      requestAnimationFrame(animateRisingWater);
    }, 11000);

    // t=15s: Beat 4 + camera flood + audio impact + flood wave surge animation ("The flood arrives.")
    addTimer(() => {
      setCameraPreset('act1_flood');
      setAct1BeatText(t.act1_beat4);
      audioService.impact();
      audioService.fade('water', 0.75, 1);

      // Surge water immersion to full 1.0 (covers the whole screen for catastrophic emergency)
      const startWater = performance.now();
      const waterSurgeDuration = 1800;
      const animateSurge = (now: number) => {
        const p = Math.min(1, (now - startWater) / waterSurgeDuration);
        setWaterEmergencyIntensity(0.45 + p * 0.55);
        if (p < 1) {
          requestAnimationFrame(animateSurge);
        }
      };
      requestAnimationFrame(animateSurge);

      // Flood wave animation
      const start = performance.now();
      const duration = 8500;
      const animateWave = (now: number) => {
        const progress = Math.min(1, (now - start) / duration);
        const ease = 1 - Math.pow(1 - progress, 2.2);
        setFloodProgress(ease);
        if (progress < 1) {
          requestAnimationFrame(animateWave);
        } else {
          setTimeout(() => setFloodProgress(0), 1200);
        }
      };
      requestAnimationFrame(animateWave);
    }, 15000);

    // t=22.5s: Wave drains down as aftermath approaches
    addTimer(() => {
      const startDrain = performance.now();
      const drainDuration = 1500;
      const animateDrain = (now: number) => {
        const p = Math.min(1, (now - startDrain) / drainDuration);
        setWaterEmergencyIntensity(Math.max(0, 1.0 - p));
        if (p < 1) {
          requestAnimationFrame(animateDrain);
        } else {
          setWaterEmergencyActive(false);
          setWaterEmergencyIntensity(0);
        }
      };
      requestAnimationFrame(animateDrain);
    }, 22500);

    // t=24s: Toll reveal
    addTimer(() => {
      setCameraPreset('act1_aftermath');
      setAct1BeatText(null);
      setAct1ShowToll(true);
      setWaterEmergencyActive(false);
      setWaterEmergencyIntensity(0);
    }, 24000);

    // t=30s: Cause investigation hub revealed (user explores 3 planetary drivers and taps Next)
    addTimer(() => {
      setAct1ShowTollCause(true);
      resetIdleTimer();
    }, 30000);
  }, [addTimer, clearAllTimers, t]);

  const startAct2 = useCallback(() => {
    clearAllTimers();
    setCurrentAct('act2');
    setAct2Step(1);
    setWarmingStripesOpen(false);
    setSeaLevelDashboardOpen(false);
    setGlobalDashboardOpen(false);
    setWaterEmergencyActive(false);
    setWaterEmergencyIntensity(0);
    setAct1ShowToll(false);
    setAct1ShowTollCause(false);
    setAct1BeatText(null);
    setCameraPreset('act2');

    audioService.fade('water', 0.08, 3);
    audioService.fade('wind', 0.45, 4);

    // Intro narration
    addTimer(() => {
      setAct2IntroText(t.act2_intro);
    }, 1500);

    // Show scrubber and animate time from 1980 to 2000 over 6s, then STOP at 2000 so user can manually slide to 2026
    addTimer(() => {
      setAct2IntroText(null);
      setYear(1980);

      const start = performance.now();
      const duration = 6000;
      const animateScrubber = (now: number) => {
        const p = Math.min(1, (now - start) / duration);
        const ease = 0.5 - Math.cos(p * Math.PI) / 2;
        const currentY = Math.round(1980 + ease * (2000 - 1980));
        setYear(currentY);
        if (p < 1) {
          requestAnimationFrame(animateScrubber);
        }
      };
      requestAnimationFrame(animateScrubber);
    }, 4500);
  }, [addTimer, clearAllTimers, t]);

  const startAct3 = useCallback(() => {
    clearAllTimers();
    setCurrentAct('act3');
    setWaterEmergencyActive(false);
    setWaterEmergencyIntensity(0);
    setCameraPreset('act3');
    setScenarioTemp(1.5);
    setAct3ClosingCard(false);

    audioService.fade('wind', 0.5, 3);

    // After 22s transition to closing memorial card
    addTimer(() => {
      setCameraPreset('act3_close');
      setAct3ClosingCard(true);
    }, 22000);
  }, [addTimer, clearAllTimers]);

  const handleToggleWaterEmergency = useCallback(() => {
    if (waterEmergencyActive) {
      setWaterEmergencyActive(false);
      setWaterEmergencyIntensity(0);
    } else {
      setWaterEmergencyActive(true);
      setWaterEmergencyIntensity(1.0);
      audioService.impact();
      audioService.fade('water', 0.8, 1);
    }
  }, [waterEmergencyActive]);

  const handleNextAct = useCallback(() => {
    if (currentAct === 'attract') {
      audioService.init();
      startAct1();
    } else if (currentAct === 'act1') {
      startAct2();
    } else if (currentAct === 'act2') {
      if (act2Step === 1) {
        setAct2Step(2);
        setCameraPreset('act2');
        audioService.tick();
      } else if (act2Step === 2) {
        setAct2Step(3);
        setCameraPreset('act2');
        audioService.tick();
      } else if (act2Step === 3) {
        setAct2Step(4);
        setCameraPreset('act2');
        audioService.tick();
      } else if (act2Step === 4) {
        setAct2Step(5);
        setCameraPreset('sea_level_focus');
        audioService.tick();
      } else if (act2Step === 5) {
        setAct2Step(6);
        setCameraPreset('global_earth');
        audioService.tick();
      } else {
        startAct3();
      }
    } else if (currentAct === 'act3') {
      if (!act3ClosingCard) {
        setCameraPreset('act3_close');
        setAct3ClosingCard(true);
      } else {
        goToAttract();
      }
    }
  }, [currentAct, act2Step, act3ClosingCard, startAct1, startAct2, startAct3, goToAttract]);

  const handlePrevAct = useCallback(() => {
    if (currentAct === 'act2') {
      if (act2Step === 6) {
        setAct2Step(5);
        setCameraPreset('sea_level_focus');
        audioService.tick();
      } else if (act2Step === 5) {
        setAct2Step(4);
        setCameraPreset('act2');
        audioService.tick();
      } else if (act2Step === 4) {
        setAct2Step(3);
        setCameraPreset('act2');
        audioService.tick();
      } else if (act2Step === 3) {
        setAct2Step(2);
        setCameraPreset('act2');
        audioService.tick();
      } else if (act2Step === 2) {
        setAct2Step(1);
        setCameraPreset('act2');
        audioService.tick();
      }
    } else if (currentAct === 'act3') {
      if (act3ClosingCard) {
        setAct3ClosingCard(false);
        setCameraPreset('act3');
      } else {
        setCurrentAct('act2');
        setAct2Step(6);
        setCameraPreset('global_earth');
        audioService.tick();
      }
    }
  }, [currentAct, act2Step, act3ClosingCard]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        handleNextAct();
      } else if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
        handlePrevAct();
      } else if (e.key.toLowerCase() === 'r') {
        goToAttract();
      } else if (e.key.toLowerCase() === 'm') {
        audioService.toggleMute();
      } else if (e.key === '1') {
        audioService.init();
        startAct1();
      } else if (e.key === '2') {
        audioService.init();
        startAct2();
      } else if (e.key === '3') {
        audioService.init();
        startAct3();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextAct, handlePrevAct, goToAttract, startAct1, startAct2, startAct3]);

  // Touch / Pointer ripples on canvas & stage with spatial audio
  const handleCanvasPointerDown = (x: number, y: number) => {
    const id = ++rippleIdRef.current;
    setRipples((prev) => [...prev.slice(-10), { id, x, y }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 1100);

    // 3D Spatial audio touch tone
    audioService.touchTone(x / 1920, 1 - y / 1080);
  };

  const handleStartExperience = () => {
    audioService.init();
    startAct1();
  };

  const handleToggleSeaLevel = () => {
    if (!seaLevelDashboardOpen) {
      setGlobalDashboardOpen(false);
      setCameraPreset('sea_level_focus');
    } else {
      setCameraPreset(currentAct === 'attract' ? 'attract' : currentAct === 'act1' ? 'act1_aftermath' : currentAct === 'act2' ? 'act2' : 'act3');
    }
    setSeaLevelDashboardOpen(!seaLevelDashboardOpen);
  };

  const handleToggleGlobal = () => {
    if (!globalDashboardOpen) {
      setSeaLevelDashboardOpen(false);
      setCameraPreset('global_earth');
    } else {
      setCameraPreset(currentAct === 'attract' ? 'attract' : currentAct === 'act1' ? 'act1_aftermath' : currentAct === 'act2' ? 'act2' : 'act3');
    }
    setGlobalDashboardOpen(!globalDashboardOpen);
  };

  // Dedicated Cause Section Driver Openers (records visited state & switches to Act 2 steps)
  const handleOpenWarmingStripesDriver = useCallback(() => {
    setVisitedDrivers((prev) => ({ ...prev, stripes: true }));
    setCurrentAct('act2');
    setAct2Step(2);
    setCameraPreset('act2');
    setSeaLevelDashboardOpen(false);
    setGlobalDashboardOpen(false);
    audioService.tick();
  }, []);

  const handleOpenSpiralDriver = useCallback(() => {
    setCurrentAct('act2');
    setAct2Step(3);
    setCameraPreset('act2');
    setSeaLevelDashboardOpen(false);
    setGlobalDashboardOpen(false);
    audioService.tick();
  }, []);

  const handleOpenEnergyDriver = useCallback(() => {
    setCurrentAct('act2');
    setAct2Step(4);
    setCameraPreset('act2');
    setSeaLevelDashboardOpen(false);
    setGlobalDashboardOpen(false);
    audioService.tick();
  }, []);

  const handleOpenSeaLevelDriver = useCallback(() => {
    setVisitedDrivers((prev) => ({ ...prev, sealevel: true }));
    setGlobalDashboardOpen(false);
    setCurrentAct('act2');
    setAct2Step(5);
    setCameraPreset('sea_level_focus');
    audioService.tick();
  }, []);

  const handleOpenGlobalDriver = useCallback(() => {
    setVisitedDrivers((prev) => ({ ...prev, global: true }));
    setSeaLevelDashboardOpen(false);
    setCurrentAct('act2');
    setAct2Step(6);
    setCameraPreset('global_earth');
    audioService.tick();
  }, []);

  const handleCloseWarmingStripes = useCallback(() => {
    setWarmingStripesOpen(false);
  }, []);

  const handleCloseSeaLevel = useCallback(() => {
    setSeaLevelDashboardOpen(false);
    if (currentAct === 'act1') {
      setCameraPreset('act1_aftermath');
    } else {
      setCameraPreset(currentAct === 'attract' ? 'attract' : currentAct === 'act2' ? 'act2' : 'act3');
    }
  }, [currentAct]);

  const handleCloseGlobal = useCallback(() => {
    setGlobalDashboardOpen(false);
    if (currentAct === 'act1') {
      setCameraPreset('act1_aftermath');
    } else {
      setCameraPreset(currentAct === 'attract' ? 'attract' : currentAct === 'act2' ? 'act2' : 'act3');
    }
  }, [currentAct]);

  return (
    <div className="fixed inset-0 bg-black overflow-hidden select-none">
      {/* 16:9 Centered Kiosk Stage with Screen-space Vignette & Film Grain */}
      <div
        id="stage"
        style={{
          width: '1920px',
          height: '1080px',
          position: 'absolute',
          left: `${stageOffset.x}px`,
          top: `${stageOffset.y}px`,
          transform: `scale(${stageScale})`,
          transformOrigin: '0 0',
        }}
        className="overflow-hidden bg-[#05090b] shadow-[0_40px_120px_rgba(0,0,0,0.85)] stage-vignette stage-grain"
      >
        {/* Three.js 3D WebGL Canvas */}
        <ThreeScene
          currentAct={currentAct}
          year={year}
          scenarioTemp={scenarioTemp}
          floodProgress={floodProgress}
          cameraPreset={cameraPreset}
          seaLevelVisualizerActive={seaLevelDashboardOpen || (currentAct === 'act2' && act2Step === 5)}
          seaLevelOffsetMeters={seaLevelMeters}
          globalVisualizerActive={globalDashboardOpen || (currentAct === 'act2' && act2Step === 6)}
          onCanvasPointerDown={handleCanvasPointerDown}
        />

        {/* Full-Screen Water Emergency Shader Overlay (Greenbird10 Wave Simulation with Fallback) */}
        <WaterEmergencyShaderOverlay
          active={waterEmergencyActive}
          intensity={waterEmergencyIntensity}
          beatText={act1BeatText}
        />

        {/* Pointer Ripple Animations */}
        <TouchRippleContainer ripples={ripples} />

        {/* UI Overlay Container */}
        <div id="ui-root" className="absolute inset-0 pointer-events-none z-10">
          {/* Top Bar with Brand & Global Controls */}
          <TopBar
            currentLang={language}
            onLanguageChange={handleLanguageChange}
            t={t}
            visible={true}
            onOpenDeveloper={() => setDeveloperModalOpen(true)}
            onOpenDataSources={() => setDataSourcesModalOpen(true)}
            onOpenInfo={() => setMuseumInfoOpen((prev) => !prev)}
            onResetToAttract={goToAttract}
            currentAct={currentAct}
            onToggleSeaLevel={handleToggleSeaLevel}
            seaLevelActive={seaLevelDashboardOpen}
            onToggleGlobal={handleToggleGlobal}
            globalActive={globalDashboardOpen}
            onToggleWaterEmergency={handleToggleWaterEmergency}
            waterEmergencyActive={waterEmergencyActive}
            isCauseSection={currentAct === 'act1' && act1ShowTollCause}
          />

          {/* Attract Mode Screen */}
          <AttractOverlay
            t={t}
            onStart={handleStartExperience}
            visible={currentAct === 'attract'}
          />

          {/* Act Headers */}
          <ActHeader
            label={t.act1_title}
            title={t.act1_subtitle}
            dateline={t.act1_dateline}
            visible={currentAct === 'act1' && !act1ShowTollCause && !globalDashboardOpen && !warmingStripesOpen && !seaLevelDashboardOpen}
          />
          <ActHeader
            label={t.act2_title}
            title={t.act2_subtitle}
            visible={currentAct === 'act2' && act2Step <= 2 && !globalDashboardOpen && !warmingStripesOpen && !seaLevelDashboardOpen}
          />
          <ActHeader
            label={t.act3_title}
            title={t.act3_subtitle}
            visible={currentAct === 'act3' && !act3ClosingCard && !globalDashboardOpen && !warmingStripesOpen && !seaLevelDashboardOpen}
          />

          {/* Act 1 Overlay with Cause Investigation Hub */}
          <Act1Overlay
            t={t}
            currentBeatText={act1BeatText}
            showToll={act1ShowToll}
            showTollCause={act1ShowTollCause}
            visible={currentAct === 'act1' && !globalDashboardOpen && !warmingStripesOpen && !seaLevelDashboardOpen}
            disasterReport={disasterReport}
            visitedDrivers={visitedDrivers}
            onOpenWarmingStripes={handleOpenWarmingStripesDriver}
            onOpenSeaLevel={handleOpenSeaLevelDriver}
            onOpenGlobal={handleOpenGlobalDriver}
            onContinueToAct2={startAct2}
          />

          {/* Act 2 Step 1: Cryosphere & Atmosphere Scrubber Overlay (Himalayan Ice Loss, Greenland Mass Loss, CO2) */}
          <Act2Overlay
            t={t}
            year={year}
            onYearChange={setYear}
            visible={currentAct === 'act2' && act2Step === 1 && !globalDashboardOpen && !warmingStripesOpen && !seaLevelDashboardOpen}
            introText={act2IntroText}
          />

          {/* Act 3 Scenario & Memorial Close Overlay */}
          <Act3Overlay
            t={t}
            scenarioTemp={scenarioTemp}
            onSelectScenario={setScenarioTemp}
            showClosingCard={act3ClosingCard}
            onOpenActionModal={setActionModal}
            visible={currentAct === 'act3' && !globalDashboardOpen && !warmingStripesOpen && !seaLevelDashboardOpen}
          />
        </div>

        {/* Act 2 Step 2: Earth Heating Tunnel 1900–2026 (Warming Stripes) */}
        {(warmingStripesOpen || (currentAct === 'act2' && act2Step === 2)) && (
          <WarmingStripesOverlay
            onClose={() => {
              setWarmingStripesOpen(false);
              if (currentAct === 'act2') {
                setAct2Step(1);
              }
            }}
            stepIndicator={t.act2_step2_label || 'VAIHE 2/6: MAAPALLON LÄMPENEMISTUNNELI'}
            isAct2Sequence={currentAct === 'act2'}
          />
        )}

        {/* Act 2 Step 3: Planetary Climate Spiral 1880–2026 (Hawkins Polar Vortex 3D Spiral) */}
        {currentAct === 'act2' && act2Step === 3 && (
          <ClimateSpiralOverlay
            t={t}
            visible={true}
            stepIndicator={t.act2_step3_label || 'VAIHE 3/6: MAAPALLON LÄMPÖSPIRAALI'}
            isAct2Sequence={true}
          />
        )}

        {/* Act 2 Step 4: Earth Trapped Energy Budget & Heat Sinks (Planetary Radiative Forcing 380+ ZJ) */}
        {currentAct === 'act2' && act2Step === 4 && (
          <EarthEnergyBudgetOverlay
            t={t}
            visible={true}
            stepIndicator={t.act2_step4_label || 'VAIHE 4/6: MAAPALLON ENERGIATALOUS'}
            isAct2Sequence={true}
          />
        )}

        {/* Act 2 Step 5: Global Oceans, Greenland Ice Sheet & Coastal Flooding Simulation */}
        {(seaLevelDashboardOpen || (currentAct === 'act2' && act2Step === 5)) && (
          <SeaLevelDashboard
            t={t}
            seaLevelMeters={seaLevelMeters}
            onSeaLevelChange={setSeaLevelMeters}
            onClose={() => {
              setSeaLevelDashboardOpen(false);
              if (currentAct === 'act2') {
                setAct2Step(4);
                setCameraPreset('act2');
              } else {
                handleCloseSeaLevel();
              }
            }}
            isAct2Sequence={currentAct === 'act2'}
          />
        )}

        {/* Act 2 Step 6: Global Impacts & Planetary Tipping Points (Interactive 3D Earth) */}
        {(globalDashboardOpen || (currentAct === 'act2' && act2Step === 6)) && (
          <GlobalDashboard
            t={t}
            scenarioTemp={scenarioTemp}
            onTempChange={setScenarioTemp}
            onClose={() => {
              setGlobalDashboardOpen(false);
              if (currentAct === 'act2') {
                setAct2Step(5);
                setCameraPreset('sea_level_focus');
              } else {
                handleCloseGlobal();
              }
            }}
          />
        )}

        {/* Canonical Persistent Bottom Navigation (Always in the same location, on top of all acts) */}
        <BottomProgress
          currentAct={currentAct}
          t={t}
          onNext={handleNextAct}
          onPrev={handlePrevAct}
          onReplay={goToAttract}
          visible={currentAct !== 'attract'}
          act2Step={act2Step}
          canContinue={currentAct !== 'act1' || act1ShowToll}
          act3ClosingCard={act3ClosingCard}
        />

        {/* Developer Attribution Modal: Sandeep Pariyar */}
        {developerModalOpen && (
          <DeveloperModal
            t={t}
            onClose={() => setDeveloperModalOpen(false)}
          />
        )}

        {/* Legal & Data Provenance Compliance Modal */}
        {dataSourcesModalOpen && (
          <DataSourcesModal
            t={t}
            onClose={() => setDataSourcesModalOpen(false)}
          />
        )}

        {/* Museum Exhibit Plain-Language Info Guide */}
        <MuseumInfoModal
          isOpen={museumInfoOpen}
          onClose={() => setMuseumInfoOpen(false)}
          onOpen={() => setMuseumInfoOpen(true)}
          t={t}
          currentLang={language}
          onLanguageChange={handleLanguageChange}
        />

        {/* Learn, Share, Act Rich Modals */}
        <LearnShareActModal
          type={actionModal}
          t={t}
          onClose={() => setActionModal(null)}
        />
      </div>
    </div>
  );
}

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Compass,
  Eye,
  EyeOff,
  Info,
  ExternalLink,
  AlertTriangle,
  Zap,
  Flame,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import {
  WARMING_STRIPES_1900_DATA,
  getWarmingStripeCssRgb,
  generateModernStripesTextureData,
} from '../data/warmingStripesData';
import { audioService } from '../services/audioService';

interface WarmingStripesOverlayProps {
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  stepIndicator?: string;
  isAct2Sequence?: boolean;
}

const START_YEAR = 1900;
const END_YEAR = 2026;
const TOTAL_YEARS = END_YEAR - START_YEAR + 1; // 127 years
const TUNNEL_LENGTH = (TOTAL_YEARS - 1) * 2.0; // 252.0 units

export const WarmingStripesOverlay: React.FC<WarmingStripesOverlayProps> = ({
  onClose,
  onNext,
  onPrev,
  stepIndicator = 'VAIHE 2/6: MAAPALLON LÄMPENEMISTUNNELI',
  isAct2Sequence = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // View state: 'tunnel' (abstract 3D light corridor) vs 'stripes' (pure 2D monolith)
  const [viewMode, setViewMode] = useState<'tunnel' | 'stripes'>('tunnel');
  const [isZenMode, setIsZenMode] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [currentYear, setCurrentYear] = useState<number>(1900);
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(() => audioService.isMuted());
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);

  // Climax state when reaching 2026
  const [isAtClimax, setIsAtClimax] = useState<boolean>(false);
  const [dismissedClimaxBanner, setDismissedClimaxBanner] = useState<boolean>(false);

  // Warp / Fast-forward on click & hold
  const [isWarping, setIsWarping] = useState<boolean>(false);
  const warpTimerRef = useRef<number | null>(null);
  const pointerDownPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Smooth steer / look angle in 3D Tunnel
  const [lookAngle, setLookAngle] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Web Audio Synth references for meditative ambient harmonic drone
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const osc1Ref = useRef<OscillatorNode | null>(null);
  const osc2Ref = useRef<OscillatorNode | null>(null);
  const oscClimaxRef = useRef<OscillatorNode | null>(null);
  const climaxGainRef = useRef<GainNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);

  // Sync refs for requestAnimationFrame loop
  const currentYearRef = useRef<number>(1900);
  currentYearRef.current = currentYear;

  const isPlayingRef = useRef<boolean>(true);
  isPlayingRef.current = isPlaying;

  const speedRef = useRef<number>(1.0);
  speedRef.current = playbackSpeed;

  const viewModeRef = useRef<'tunnel' | 'stripes'>('tunnel');
  viewModeRef.current = viewMode;

  const lookAngleRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  lookAngleRef.current = lookAngle;

  const hoveredYearRef = useRef<number | null>(null);
  hoveredYearRef.current = hoveredYear;

  const isWarpingRef = useRef<boolean>(false);
  isWarpingRef.current = isWarping;

  const isAtClimaxRef = useRef<boolean>(false);
  isAtClimaxRef.current = isAtClimax;

  // Active year data calculation
  const activeYear = hoveredYear ?? Math.round(currentYear);
  const activeData = useMemo(() => {
    return (
      WARMING_STRIPES_1900_DATA.find((d) => d.year === activeYear) || {
        year: activeYear,
        anomaly: 0,
      }
    );
  }, [activeYear]);

  // Keyboard shortcuts: ESC, Space, Z
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showInfoModal) {
          setShowInfoModal(false);
        } else if (isZenMode) {
          setIsZenMode(false);
        } else {
          onClose();
        }
      } else if (e.key === ' ' && !showInfoModal) {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if ((e.key === 'z' || e.key === 'Z') && !showInfoModal) {
        setIsZenMode((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, isZenMode, showInfoModal]);

  // Meditative Harmonic Soundscape with Climax Warning resonance
  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const master = ctx.createGain();
      master.gain.setValueAtTime(isMuted ? 0 : 0.08, ctx.currentTime);
      master.connect(ctx.destination);
      masterGainRef.current = master;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(260, ctx.currentTime);
      filter.Q.setValueAtTime(1.2, ctx.currentTime);
      filter.connect(master);
      filterRef.current = filter;

      // Deep root tone (65.41 Hz = C2)
      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(65.41, ctx.currentTime);
      osc1.connect(filter);
      osc1.start();
      osc1Ref.current = osc1;

      // Overtone tracking temperature anomaly
      const osc2 = ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(130.81, ctx.currentTime);
      const osc2Gain = ctx.createGain();
      osc2Gain.gain.setValueAtTime(0.3, ctx.currentTime);
      osc2.connect(osc2Gain);
      osc2Gain.connect(filter);
      osc2.start();
      osc2Ref.current = osc2;

      // Climax warning low sub-pulse oscillator (beating urgency without harsh noise)
      const oscClimax = ctx.createOscillator();
      oscClimax.type = 'sine';
      oscClimax.frequency.setValueAtTime(43.65, ctx.currentTime); // F1 low solemn note
      const climaxGain = ctx.createGain();
      climaxGain.gain.setValueAtTime(0, ctx.currentTime);
      oscClimax.connect(climaxGain);
      climaxGain.connect(filter);
      oscClimax.start();
      oscClimaxRef.current = oscClimax;
      climaxGainRef.current = climaxGain;
    } catch {
      // Audio context policy handled gracefully
    }
  }, [isMuted]);

  const toggleAudio = () => {
    if (!audioCtxRef.current) {
      initAudio();
      setIsMuted(false);
      return;
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setTargetAtTime(
        nextMuted ? 0 : 0.08,
        audioCtxRef.current.currentTime,
        0.08
      );
    }
  };

  // Start heating tunnel sound on mount, stop on unmount
  useEffect(() => {
    if (!audioService.isMuted()) {
      audioService.startHeatingTunnel();
    }
    return () => {
      audioService.stopHeatingTunnel();
    };
  }, []);

  // Track if climax alarm was already triggered for current run
  const climaxAlarmFiredRef = useRef<boolean>(false);

  // Adjust audio pitch and urgency with active temperature anomaly and climax state
  useEffect(() => {
    const progress = (activeYear - START_YEAR) / (END_YEAR - START_YEAR);
    audioService.updateHeatingTunnel(progress, activeData.anomaly);

    if (isAtClimax && !climaxAlarmFiredRef.current) {
      climaxAlarmFiredRef.current = true;
      audioService.triggerClimaxAlarm();
    } else if (!isAtClimax) {
      climaxAlarmFiredRef.current = false;
    }

    if (!audioCtxRef.current || !osc2Ref.current || !filterRef.current || isMuted) return;
    const anomaly = activeData.anomaly;
    const norm = Math.max(0, Math.min(1, (anomaly + 0.5) / 1.95));
    const targetOvertone = 98 + norm * 165;
    const targetCutoff = 200 + norm * 450;

    osc2Ref.current.frequency.setTargetAtTime(
      targetOvertone,
      audioCtxRef.current.currentTime,
      0.12
    );
    filterRef.current.frequency.setTargetAtTime(
      targetCutoff,
      audioCtxRef.current.currentTime,
      0.12
    );

    if (climaxGainRef.current) {
      climaxGainRef.current.gain.setTargetAtTime(
        isAtClimax ? 0.45 : 0,
        audioCtxRef.current.currentTime,
        0.2
      );
    }
  }, [activeData.anomaly, isAtClimax, isMuted, activeYear]);

  // Clean up Web Audio on unmount
  useEffect(() => {
    return () => {
      try {
        audioService.stopHeatingTunnel();
        if (osc1Ref.current) osc1Ref.current.stop();
        if (osc2Ref.current) osc2Ref.current.stop();
        if (oscClimaxRef.current) oscClimaxRef.current.stop();
        if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
          audioCtxRef.current.close();
        }
      } catch {
        // ignore
      }
    };
  }, []);

  // WebGL Renderer: 1900–2026 Abstract 3D Architecture Light Tunnel + 2D Monolith
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', {
      antialias: true,
      alpha: false,
      depth: false,
      powerPreference: 'high-performance',
    });
    if (!gl) return;

    const vsSource = `
      attribute vec2 aPosition;
      void main() {
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

    // Mode 0: Abstract Architectural Light Tunnel:
    // Pure geometric rings of light for 1900 to 2026.
    // Enhanced with:
    // - uClimax: Thermal crimson radiant surge & atmospheric heat haze at 2026
    // - uWarp: Speed stretching streaks when user presses and holds
    const fsSource = `
      precision highp float;
      uniform vec2 iResolution;
      uniform float iTime;
      uniform sampler2D iChannel0;
      uniform float uZPosition;
      uniform vec2 uLookAngle;
      uniform float uYearProgress;
      uniform float uHoverNorm;
      uniform int uViewMode; // 0: Abstract Light Tunnel, 1: 2D Stripes Monolith
      uniform float uClimax; // 0.0 to 1.0: climax warning intensity at 2026
      uniform float uWarp;   // 0.0 to 1.0: acceleration warp factor

      #define PI 3.14159265359
      #define TOTAL_LEN 252.0 // 126 intervals * 2.0 units per year

      // Curving tunnel centerline path
      vec2 path(float z) {
        return vec2(sin(z * 0.065) * 1.6, cos(z * 0.045) * 1.1);
      }

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }

      // Distance estimation for the Abstract Light Tunnel
      // matId: 1.0 = Dark architectural boundary, 2.0 = Glowing annual stripe light ring
      vec2 mapTunnel(vec3 p) {
        vec2 pxy = p.xy - path(p.z);
        float r = length(pxy);
        
        // Circular gallery gallery corridor (radius = 2.45)
        float dWall = 2.45 - r;

        // Annual light rings spaced every 2.0 units along Z
        // 1900 at z=0, 2026 at z=252.0 (127 annual rings)
        float ringLocalZ = mod(p.z + 1.0, 2.0) - 1.0;
        float ringWidth = 0.16 + uWarp * 0.12; // stretch slightly when warping
        float isRing = step(abs(ringLocalZ), ringWidth);

        float matId = 1.0;
        if (isRing > 0.5 && p.z >= -1.0 && p.z <= (TOTAL_LEN + 4.0)) {
          matId = 2.0;
        }

        return vec2(dWall, matId);
      }

      vec3 calcNormal(vec3 p) {
        vec2 e = vec2(0.004, 0.0);
        return normalize(vec3(
          mapTunnel(p + e.xyy).x - mapTunnel(p - e.xyy).x,
          mapTunnel(p + e.yxy).x - mapTunnel(p - e.yxy).x,
          mapTunnel(p + e.yyx).x - mapTunnel(p - e.yyx).x
        ));
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * iResolution.xy) / iResolution.y;
        vec2 normUv = gl_FragCoord.xy / iResolution.xy;

        // ========================================================
        // VIEW MODE 1: PURE 2D MONOLITH (showyourstripes.info)
        // ========================================================
        if (uViewMode == 1) {
          float numStripes = 127.0;
          float stripeIndex = floor(normUv.x * numStripes);
          float stripeU = (stripeIndex + 0.5) / numStripes;

          vec3 stripeCol = texture2D(iChannel0, vec2(stripeU, 0.5)).rgb;

          // Fine museum paper / analog light texture
          float grain = (hash(gl_FragCoord.xy + fract(iTime * 0.08)) - 0.5) * 0.02;
          vec3 col = stripeCol + vec3(grain);

          // Climax warning glow at 2026 (right edge pulse)
          if (uClimax > 0.0) {
            float edgeDist = smoothstep(0.7, 1.0, normUv.x);
            float pulse = 0.5 + 0.5 * sin(iTime * 5.0);
            vec3 crimson = vec3(0.95, 0.1, 0.08);
            col = mix(col, crimson, edgeDist * uClimax * (0.35 + 0.2 * pulse));
          }

          // Subtle vertical vignette
          float vertVig = smoothstep(0.0, 0.15, normUv.y) * smoothstep(1.0, 0.85, normUv.y);
          col *= mix(0.93, 1.0, vertVig);

          // Hairline cursor tracking
          if (uHoverNorm >= 0.0) {
            float hoverX = (floor(uHoverNorm * numStripes) + 0.5) / numStripes;
            float dist = abs(normUv.x - hoverX);
            if (dist < 0.0009) {
              col = mix(col, vec3(1.0), 0.85);
            }
          }

          // Active playback marker line
          float curX = (floor(uYearProgress * numStripes) + 0.5) / numStripes;
          float curDist = abs(normUv.x - curX);
          if (curDist < 0.0014) {
            vec3 markerCol = uClimax > 0.0 ? vec3(1.0, 0.2, 0.2) : vec3(1.0);
            col = mix(col, markerCol, 0.95);
          }

          gl_FragColor = vec4(col, 1.0);
          return;
        }

        // ========================================================
        // VIEW MODE 0: ABSTRACT ARCHITECTURAL LIGHT TUNNEL
        // ========================================================
        float camZ = uZPosition;

        // Subtle heat distortion at climax
        vec2 heatUv = uv;
        if (uClimax > 0.0) {
          float wave = sin(uv.y * 22.0 + iTime * 6.0) * 0.004 * uClimax;
          heatUv.x += wave;
        }

        vec3 ro = vec3(path(camZ), camZ);

        // Look target down tunnel with smooth user steering
        float lookAhead = 4.0;
        vec3 target = vec3(path(camZ + lookAhead), camZ + lookAhead);
        target.x += uLookAngle.x * 2.0;
        target.y += uLookAngle.y * 1.5;

        vec3 fwd = normalize(target - ro);
        vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), fwd));
        vec3 up = cross(fwd, right);

        // Field of view stretches dynamically during warp acceleration
        float fovMod = 0.96 - uWarp * 0.16;
        vec3 rd = normalize(fwd + (heatUv.x * right + heatUv.y * up) * fovMod);

        // Raymarching
        float t = 0.06;
        vec2 hit = vec2(0.0);
        for (int i = 0; i < 56; i++) {
          vec3 p = ro + rd * t;
          hit = mapTunnel(p);
          if (hit.x < 0.0035 || t > 36.0) break;
          t += hit.x * 0.84;
        }

        // Deep void background
        vec3 col = vec3(0.012, 0.018, 0.028);

        if (t < 36.0) {
          vec3 p = ro + rd * t;
          vec3 n = calcNormal(p);

          // Sample exact warming stripes data (1900 to 2026: 252.0 units)
          float stripeU = clamp(p.z / TOTAL_LEN, 0.001, 0.999);
          vec3 stripeCol = texture2D(iChannel0, vec2(stripeU, 0.5)).rgb;

          // Camera headlight & attenuation
          vec3 lightDir = normalize(ro - p);
          float diff = max(dot(n, lightDir), 0.0);
          float distLight = length(ro - p);
          float atten = 1.0 / (1.0 + 0.07 * distLight + 0.01 * distLight * distLight);

          // Specular highlight on dark matte gallery surface
          vec3 halfDir = normalize(lightDir - rd);
          float spec = pow(max(dot(n, halfDir), 0.0), 32.0);

          if (hit.y == 2.0) {
            // Luminous glowing stripe light ring
            float emissionBoost = 2.6 + uClimax * 1.2;
            col = stripeCol * emissionBoost;
          } else {
            // Minimalist architectural wall (dark neutral matte finish)
            vec3 wallBase = vec3(0.035, 0.042, 0.055);
            col = wallBase * (diff * atten + 0.2);
            col += stripeCol * (0.5 + uClimax * 0.4) * atten;
            col += vec3(0.25) * spec * atten;
          }

          // Volumetric atmospheric depth fog
          vec3 fogCol = mix(vec3(0.015, 0.02, 0.03), stripeCol * 0.35, 0.65);
          float fogAmount = 1.0 - exp(-t * 0.058);
          col = mix(col, fogCol, fogAmount);
        }

        // Warp speed streaks when holding down
        if (uWarp > 0.0) {
          float angle = atan(uv.y, uv.x);
          float rad = length(uv);
          float warpStreak = sin(angle * 24.0 + iTime * 28.0) * 0.5 + 0.5;
          warpStreak *= smoothstep(0.1, 0.7, rad);
          col += vec3(0.3, 0.5, 0.9) * warpStreak * uWarp * 0.35;
        }

        // CLIMAX EMERGENCY WARNING SURGE AT 2026:
        // Deep thermal crimson pulse fills the atmospheric corridor
        if (uClimax > 0.0) {
          float pulse = 0.5 + 0.5 * sin(iTime * 4.2);
          vec3 warningCrimson = vec3(0.88, 0.06, 0.02);
          float vignetteSurge = dot(uv * 0.8, uv * 0.8);
          col += warningCrimson * uClimax * (0.32 + 0.28 * pulse) * (0.5 + vignetteSurge);
        }

        // Soft peripheral optical vignette
        float vig = 1.0 - dot(uv * 0.68, uv * 0.68);
        col *= clamp(vig, 0.0, 1.0);

        gl_FragColor = vec4(col, 1.0);
      }
    `;

    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = compileShader(gl.VERTEX_SHADER, vsSource);
    const fs = compileShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    // Quad geometry
    const quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );
    const aPos = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    // Texture: 127 modern warming stripes palette (1900 -> 2026)
    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    const textureData = generateModernStripesTextureData();
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      WARMING_STRIPES_1900_DATA.length,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      textureData
    );

    // Uniform locations
    const uRes = gl.getUniformLocation(program, 'iResolution');
    const uTime = gl.getUniformLocation(program, 'iTime');
    const uChannel0 = gl.getUniformLocation(program, 'iChannel0');
    const uZPos = gl.getUniformLocation(program, 'uZPosition');
    const uLook = gl.getUniformLocation(program, 'uLookAngle');
    const uProgress = gl.getUniformLocation(program, 'uYearProgress');
    const uHover = gl.getUniformLocation(program, 'uHoverNorm');
    const uMode = gl.getUniformLocation(program, 'uViewMode');
    const uClimaxLoc = gl.getUniformLocation(program, 'uClimax');
    const uWarpLoc = gl.getUniformLocation(program, 'uWarp');

    gl.uniform1i(uChannel0, 0);

    let animId = 0;
    let lastTime = performance.now();
    const startTime = performance.now();
    let smoothClimax = 0;
    let smoothWarp = 0;

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2.0);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Animation & render loop
    const render = (now: number) => {
      const dt = (now - lastTime) * 0.001;
      lastTime = now;
      const elapsed = (now - startTime) * 0.001;

      // Check if warping (user holding down)
      const effectiveSpeedMult = isWarpingRef.current ? 4.5 : 1.0;
      const effectiveSpeed = speedRef.current * effectiveSpeedMult;

      // Auto-advance timeline when playing (or when held down)
      const shouldAdvance = isPlayingRef.current || isWarpingRef.current;
      if (shouldAdvance && currentYearRef.current < END_YEAR) {
        const advance = dt * 2.4 * effectiveSpeed;
        const nextYear = currentYearRef.current + advance;

        if (nextYear >= END_YEAR) {
          // PAUSE AT 2026 & TRIGGER CLIMAX!
          currentYearRef.current = END_YEAR;
          setCurrentYear(END_YEAR);
          setIsPlaying(false);
          setIsAtClimax(true);
          setDismissedClimaxBanner(false);
        } else {
          currentYearRef.current = nextYear;
          setCurrentYear(nextYear);
        }
      }

      // Smooth interpolation for Climax & Warp uniforms
      const targetClimax = isAtClimaxRef.current || currentYearRef.current >= 2025.5 ? 1.0 : 0.0;
      smoothClimax += (targetClimax - smoothClimax) * Math.min(1.0, dt * 4.0);

      const targetWarp = isWarpingRef.current ? 1.0 : 0.0;
      smoothWarp += (targetWarp - smoothWarp) * Math.min(1.0, dt * 6.0);

      // 1900 -> Z=0, 2026 -> Z=252.0 (2.0 units per year)
      const currentZ = (currentYearRef.current - START_YEAR) * 2.0;
      const yearProgress = (currentYearRef.current - START_YEAR) / (END_YEAR - START_YEAR);
      const hoverNorm =
        hoveredYearRef.current !== null
          ? (hoveredYearRef.current - START_YEAR) / (END_YEAR - START_YEAR)
          : -1.0;

      gl.uniform1f(uTime, elapsed);
      gl.uniform1f(uZPos, currentZ);
      gl.uniform2f(uLook, lookAngleRef.current.x, lookAngleRef.current.y);
      gl.uniform1f(uProgress, yearProgress);
      gl.uniform1f(uHover, hoverNorm);
      gl.uniform1i(uMode, viewModeRef.current === 'tunnel' ? 0 : 1);
      gl.uniform1f(uClimaxLoc, smoothClimax);
      gl.uniform1f(uWarpLoc, smoothWarp);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      gl.deleteProgram(program);
      gl.deleteBuffer(quadBuffer);
      gl.deleteTexture(texture);
    };
  }, []);

  // Pointer Handlers: Drag to look around OR click & hold to accelerate
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    pointerDownPosRef.current = { x: e.clientX, y: e.clientY };

    // Start timer for click & hold fast-forward (speedup after 160ms)
    if (warpTimerRef.current) clearTimeout(warpTimerRef.current);
    warpTimerRef.current = window.setTimeout(() => {
      setIsWarping(true);
    }, 160);

    if (viewMode === 'stripes') {
      handleScrub2D(e);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (viewMode === 'tunnel') {
      if (!isDraggingRef.current) return;
      const dx = (e.clientX - lastMousePosRef.current.x) * 0.003;
      const dy = (e.clientY - lastMousePosRef.current.y) * 0.003;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };

      setLookAngle((prev) => ({
        x: Math.max(-1.0, Math.min(1.0, prev.x - dx)),
        y: Math.max(-0.6, Math.min(0.6, prev.y + dy)),
      }));
    } else {
      handleHover2D(e);
      if (isDraggingRef.current) {
        handleScrub2D(e);
      }
    }
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
    if (warpTimerRef.current) {
      clearTimeout(warpTimerRef.current);
      warpTimerRef.current = null;
    }
    setIsWarping(false);
  };

  const handlePointerLeave = () => {
    isDraggingRef.current = false;
    if (warpTimerRef.current) {
      clearTimeout(warpTimerRef.current);
      warpTimerRef.current = null;
    }
    setIsWarping(false);
    setHoveredYear(null);
  };

  const handleHover2D = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const normX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const yearIndex = Math.floor(normX * WARMING_STRIPES_1900_DATA.length);
    const clampedIndex = Math.max(0, Math.min(WARMING_STRIPES_1900_DATA.length - 1, yearIndex));
    const year = WARMING_STRIPES_1900_DATA[clampedIndex].year;
    setHoveredYear(year);
  };

  const handleScrub2D = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const normX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const yearIndex = Math.floor(normX * WARMING_STRIPES_1900_DATA.length);
    const clampedIndex = Math.max(0, Math.min(WARMING_STRIPES_1900_DATA.length - 1, yearIndex));
    const year = WARMING_STRIPES_1900_DATA[clampedIndex].year;
    jumpToYear(year);
  };

  const jumpToYear = (year: number) => {
    currentYearRef.current = year;
    setCurrentYear(year);
    if (year < 2025) {
      setIsAtClimax(false);
    } else if (year >= 2026) {
      setIsAtClimax(true);
      setDismissedClimaxBanner(false);
    }
  };

  const restartTimeline = () => {
    jumpToYear(START_YEAR);
    setIsPlaying(true);
    setIsAtClimax(false);
    setDismissedClimaxBanner(false);
  };

  const activeColorRgb = getWarmingStripeCssRgb(activeData.anomaly);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="absolute inset-0 z-50 bg-[#03070b] flex flex-col pointer-events-auto select-none overflow-hidden"
    >
      {/* ========================================================= */}
      {/* TOP NAVIGATION BAR (Hidden in Zen Mode) */}
      {/* ========================================================= */}
      <AnimatePresence>
        {!isZenMode && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-between px-8 py-3.5 z-20 border-b border-white/8 bg-[#04090e]/85 backdrop-blur-md"
          >
            {/* Exhibition Meta Title */}
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <div className="flex items-center gap-3">
                  {isAct2Sequence && (
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-sm bg-[#7ec8e3]/20 text-[#7ec8e3] border border-[#7ec8e3]/40 font-semibold tracking-widest uppercase">
                      {stepIndicator}
                    </span>
                  )}
                  <span className="text-lg md:text-xl font-light tracking-wide text-white">
                    Warming Stripes
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-red-500/15 text-red-300 border border-red-500/30">
                    1900 — 2026
                  </span>
                  <span className="text-xs text-white/40 font-mono hidden md:inline">
                    Modern Industrial Era • Global Heating Tunnel
                  </span>
                </div>
                <span className="text-xs text-white/50 font-light mt-0.5 tracking-tight">
                  Design by Prof. Ed Hawkins • National Centre for Atmospheric Science
                </span>
              </div>
            </div>

            {/* Controls for Library Showcase */}
            <div className="flex items-center gap-3">
              {/* Mode Switcher: 3D Tunnel vs 2D Stripes */}
              <div className="flex items-center rounded-sm bg-black/40 border border-white/15 p-0.5">
                <button
                  onClick={() => setViewMode('tunnel')}
                  className={`px-3.5 py-1 text-xs font-mono transition-all rounded-xs cursor-pointer ${
                    viewMode === 'tunnel'
                      ? 'bg-white text-black font-semibold shadow-sm'
                      : 'text-white/60 hover:text-white'
                  }`}
                  title="Abstract 3D architectural corridor of light"
                >
                  3D TUNNEL
                </button>
                <button
                  onClick={() => setViewMode('stripes')}
                  className={`px-3.5 py-1 text-xs font-mono transition-all rounded-xs cursor-pointer ${
                    viewMode === 'stripes'
                      ? 'bg-white text-black font-semibold shadow-sm'
                      : 'text-white/60 hover:text-white'
                  }`}
                  title="Pure 2D full-bleed stripes (showyourstripes.info)"
                >
                  2D STRIPES
                </button>
              </div>

              {/* Ambient Soundscape Toggle */}
              <button
                onClick={toggleAudio}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm border transition-all text-xs font-mono cursor-pointer ${
                  !isMuted
                    ? 'bg-white/15 border-white/40 text-white'
                    : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10'
                }`}
                title="Toggle ambient meditative harmonic soundscape"
              >
                {!isMuted ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{!isMuted ? 'SOUND ON' : 'SOUND'}</span>
              </button>

              {/* Contemplation / Zen Mode */}
              <button
                onClick={() => setIsZenMode(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all border border-white/10 text-xs font-mono cursor-pointer"
                title="Enter pure contemplation mode (press ESC or Z to exit)"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">CONTEMPLATE</span>
              </button>

              {/* About Modal */}
              <button
                onClick={() => setShowInfoModal(true)}
                className="p-1.5 rounded-sm bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all border border-white/10 cursor-pointer"
                title="About the warming stripes"
              >
                <Info className="w-4 h-4" />
              </button>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-white/5 hover:bg-white/15 text-white/60 hover:text-white border border-white/10 text-xs font-mono transition-colors cursor-pointer ml-1"
                title="Sulje / Close"
              >
                <X className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Sulje</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MAIN VIEWPORT CANVAS */}
      {/* ========================================================= */}
      <div className="relative flex-1 w-full h-full overflow-hidden flex flex-col justify-center items-center bg-[#03070b]">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
          className={`w-full h-full block select-none ${
            viewMode === 'tunnel' ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair'
          }`}
        />

        {/* Warp / Fast-Forward Visual Feedback HUD */}
        <AnimatePresence>
          {isWarping && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute top-20 z-30 pointer-events-none flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/80 backdrop-blur-md border border-cyan-400/40 text-cyan-200 text-xs font-mono shadow-[0_0_20px_rgba(6,182,212,0.35)]"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
              <span className="font-semibold tracking-wider">FAST FORWARD (4.5x)</span>
              <span className="text-cyan-400/60">• HOLDING</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========================================================= */}
        {/* 2026 CLIMAX WARNING BANNER (High Impact for Library Kiosk) */}
        {/* ========================================================= */}
        <AnimatePresence>
          {isAtClimax && !dismissedClimaxBanner && !isZenMode && (
            <motion.div
              initial={{ opacity: 0, y: -30, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="absolute top-12 max-w-xl w-[90%] z-40 bg-gradient-to-b from-red-950/95 to-[#1a0404]/95 backdrop-blur-2xl border-2 border-red-500/70 p-6 rounded-xl shadow-[0_0_60px_rgba(239,68,68,0.45)] text-white"
            >
              {/* Emergency Header */}
              <div className="flex items-start justify-between gap-4 border-b border-red-500/30 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-red-600/30 border border-red-500 flex items-center justify-center animate-pulse">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono tracking-widest uppercase text-red-300 font-bold">
                        Climate Warning Climax
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/30 text-red-200 border border-red-400/40">
                        YEAR 2026
                      </span>
                    </div>
                    <div className="text-xl font-light tracking-wide text-white mt-0.5">
                      Critical Warming Threshold Reached
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setDismissedClimaxBanner(true)}
                  className="p-1 rounded text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Minimize warning"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Metrics Display */}
              <div className="grid grid-cols-2 gap-4 my-4">
                <div className="bg-black/40 border border-red-500/20 rounded-lg p-3">
                  <span className="text-[11px] font-mono uppercase text-red-300/70">
                    2026 Global Anomaly
                  </span>
                  <div className="text-3xl font-mono font-bold text-red-400 mt-0.5">
                    +1.47<span className="text-lg font-light text-red-200">°C</span>
                  </div>
                  <span className="text-[10px] font-mono text-white/50">
                    Above 1961–1990 baseline
                  </span>
                </div>

                <div className="bg-black/40 border border-red-500/20 rounded-lg p-3">
                  <span className="text-[11px] font-mono uppercase text-red-300/70">
                    Paris Target Limit
                  </span>
                  <div className="text-3xl font-mono font-bold text-amber-400 mt-0.5">
                    1.50<span className="text-lg font-light text-amber-200">°C</span>
                  </div>
                  <span className="text-[10px] font-mono text-white/50">
                    Threshold of critical risk
                  </span>
                </div>
              </div>

              <p className="text-xs text-white/80 font-light leading-relaxed mb-5">
                The tunnel has traveled from cool early-century blues into unprecedented thermal
                crimson. The world now directly approaches the irreversible +1.5°C Paris Agreement limit.
              </p>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={restartTimeline}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-semibold tracking-wider transition-all shadow-lg hover:shadow-red-500/30 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>REPLAY TIMELINE</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDismissedClimaxBanner(true)}
                  className="flex-1 py-2.5 px-4 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono text-xs transition-colors border border-white/20 cursor-pointer text-center"
                >
                  EXPLORE TIMELINE
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========================================================= */}
        {/* REFINED TELEMETRY CARD (Minimalist Swiss Typography) */}
        {/* ========================================================= */}
        <AnimatePresence>
          {!isZenMode && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-28 left-8 sm:left-12 pointer-events-none z-20 max-w-md"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-white/40 shadow-sm"
                    style={{ backgroundColor: activeColorRgb }}
                  />
                  <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#8fa3ab]">
                    {stepIndicator}
                  </span>
                </div>

                <div className="flex items-baseline gap-4 mt-1">
                  <span className="font-display text-5xl sm:text-6xl text-[#eaf2f5] font-light leading-none drop-shadow-[0_2px_20px_rgba(0,0,0,0.8)]">
                    {activeYear}
                  </span>
                  <span
                    className="font-display text-4xl sm:text-5xl font-light tracking-tight leading-none drop-shadow-[0_2px_25px_rgba(0,0,0,0.8)]"
                    style={{
                      color:
                        activeData.anomaly >= 0.5
                          ? '#f87171'
                          : activeData.anomaly >= 0.0
                          ? '#fdba74'
                          : '#93c5fd',
                    }}
                  >
                    {activeData.anomaly >= 0 ? `+${activeData.anomaly.toFixed(2)}` : activeData.anomaly.toFixed(2)}
                    <span className="text-2xl font-light ml-0.5">°C</span>
                  </span>
                </div>

                <div className="font-mono text-[10px] tracking-wider uppercase text-[#8fa3ab] mt-1.5 drop-shadow">
                  Lämpötilapoikkeama · Vertailutaso 1961–1990
                </div>

                {activeData.milestone && (
                  <div className="mt-3 text-sm font-body text-[#eaf2f5] leading-relaxed drop-shadow-[0_1px_10px_rgba(0,0,0,0.8)] max-w-sm">
                    {activeData.milestone}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Zen Mode Exit Reminder */}
        {isZenMode && (
          <button
            onClick={() => setIsZenMode(false)}
            className="absolute top-6 right-6 z-30 px-3.5 py-1.5 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/20 text-xs font-mono text-white/70 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-lg"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>EXIT CONTEMPLATION (ESC)</span>
          </button>
        )}

        {/* Tunnel Mode Hint: Drag to Look & Hold to Warp */}
        {viewMode === 'tunnel' && !isZenMode && (
          <div className="absolute top-8 right-8 pointer-events-none z-20 flex flex-col items-end gap-1.5 text-[11px] font-mono text-white/60">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded bg-black/50 backdrop-blur-md border border-white/10">
              <Compass className="w-3.5 h-3.5 text-white/80" />
              <span>Drag to steer perspective</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-black/40 backdrop-blur-md border border-white/10 text-[10px] text-cyan-300/80">
              <Zap className="w-3 h-3 text-cyan-400" />
              <span>Hold press on tunnel to speed up</span>
            </div>
          </div>
        )}

        {/* 2D Mode Timeline Ticks (1900 to 2026) */}
        {viewMode === 'stripes' && !isZenMode && (
          <div className="absolute bottom-24 inset-x-8 pointer-events-none z-20 flex justify-between text-[11px] font-mono text-white/40">
            {[1900, 1920, 1940, 1960, 1980, 2000, 2026].map((yr) => (
              <div key={yr} className="flex flex-col items-center">
                <div className="w-[1px] h-2 bg-white/30 mb-1" />
                <span className={yr === 2026 ? 'text-red-400 font-bold' : ''}>{yr}</span>
              </div>
            ))}
          </div>
        )}

        {/* ========================================================= */}
        {/* BOTTOM TIMELINE & TRANSPORT (Suited for Kiosk Visitors) */}
        {/* ========================================================= */}
        <AnimatePresence>
          {!isZenMode && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-22 sm:bottom-24 inset-x-8 z-20 bg-[#04090e]/85 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-lg shadow-2xl flex flex-col gap-2 pointer-events-auto max-w-4xl mx-auto"
            >
              {/* Scrub range bar */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-white/50 w-10">1900</span>
                <input
                  type="range"
                  min={START_YEAR}
                  max={END_YEAR}
                  step={1}
                  value={activeYear}
                  onChange={(e) => jumpToYear(parseInt(e.target.value, 10))}
                  className="flex-1 h-1.5 bg-gradient-to-r from-[#08306b] via-[#6baed6] via-[#fee0d2] via-[#fc9272] to-[#67000d] rounded-full appearance-none cursor-pointer accent-white"
                />
                <span className="text-xs font-mono text-red-400 font-semibold w-10 text-right">
                  2026
                </span>
              </div>

              {/* Transport controls & Era Shortcuts */}
              <div className="flex items-center justify-between pt-0.5 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (currentYear >= END_YEAR) {
                        restartTimeline();
                      } else {
                        setIsPlaying((p) => !p);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-sm bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/15 cursor-pointer font-mono text-xs"
                  >
                    {currentYear >= END_YEAR ? (
                      <>
                        <RotateCcw className="w-3 h-3 text-red-400" />
                        <span>REPLAY</span>
                      </>
                    ) : isPlaying ? (
                      <>
                        <Pause className="w-3 h-3" />
                        <span>PAUSE</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3" />
                        <span>TRAVEL</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => jumpToYear(START_YEAR)}
                    className="p-1 rounded-sm bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors border border-white/10 cursor-pointer"
                    title="Rewind to 1900"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>

                  {/* Playback speed selector */}
                  <div className="flex items-center rounded-sm bg-black/40 border border-white/10 p-0.5 ml-2">
                    {[0.5, 1.0, 2.0].map((spd) => (
                      <button
                        key={spd}
                        onClick={() => setPlaybackSpeed(spd)}
                        className={`px-1.5 py-0.5 text-[10px] font-mono rounded-xs cursor-pointer ${
                          playbackSpeed === spd
                            ? 'bg-white text-black font-semibold'
                            : 'text-white/40 hover:text-white'
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>

                  {/* Reset perspective button for tunnel mode */}
                  {viewMode === 'tunnel' && (lookAngle.x !== 0 || lookAngle.y !== 0) && (
                    <button
                      onClick={() => setLookAngle({ x: 0, y: 0 })}
                      className="text-[10px] text-white/40 hover:text-white ml-2 transition-colors cursor-pointer"
                    >
                      Reset View
                    </button>
                  )}
                </div>

                {/* Fast Era Milestones (1900 — 2026) for Library Visitors */}
                <div className="hidden md:flex items-center gap-1.5">
                  {[
                    { year: 1900, label: '1900' },
                    { year: 1940, label: '1940' },
                    { year: 1970, label: '1970 Earth Day' },
                    { year: 1988, label: '1988 IPCC' },
                    { year: 1998, label: '1998 El Niño' },
                    { year: 2015, label: '2015 Paris' },
                    { year: 2026, label: '2026 Warning ⚠️' },
                  ].map((m) => (
                    <button
                      key={m.year}
                      onClick={() => jumpToYear(m.year)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all cursor-pointer ${
                        activeYear === m.year
                          ? m.year === 2026
                            ? 'bg-red-500/30 text-red-200 font-bold border border-red-500/50'
                            : 'bg-white/20 text-white font-semibold border border-white/30'
                          : m.year === 2026
                          ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
                          : 'text-white/50 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                {/* Direct link to showyourstripes.info */}
                <a
                  href="https://showyourstripes.info/s/globe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[11px] text-white/50 hover:text-white transition-colors cursor-pointer"
                >
                  <span>showyourstripes.info</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ========================================================= */}
      {/* METHODOLOGY & ABOUT MODAL */}
      {/* ========================================================= */}
      <AnimatePresence>
        {showInfoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
            onClick={() => setShowInfoModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#09151f] border border-white/20 rounded-lg p-6 max-w-lg w-full shadow-2xl text-white select-text"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-lg font-light tracking-wide text-white">
                  About the Warming Stripes (1900 — 2026)
                </h3>
                <button
                  onClick={() => setShowInfoModal(false)}
                  className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs text-white/80 font-light leading-relaxed">
                <p>
                  Created in 2018 by <strong>Prof. Ed Hawkins</strong> at the University of
                  Reading / National Centre for Atmospheric Science (NCAS), the "warming stripes"
                  are an iconic visual representation of measured temperature changes across the globe.
                </p>
                <p>
                  This exhibition highlights the <strong>1900 to 2026 modern industrial era</strong>,
                  illustrating the dramatic transition from the cool baselines of the early 20th century
                  into the persistent, dangerous heat records of recent decades.
                </p>
                <p>
                  Each stripe represents the temperature in a single year compared to the average
                  temperature of the period between <strong>1961 and 1990</strong>.
                </p>
                <div className="p-3 bg-white/5 rounded border border-white/10 mt-4 text-[11px] font-mono text-white/70">
                  <div className="text-white font-medium mb-1">Color Scale (ColorBrewer RdBu):</div>
                  <div>• Deep Navy Blue: -0.50°C or cooler below baseline</div>
                  <div>• Light Cyan / Off-White: Near 1961–1990 baseline</div>
                  <div>• Incandescent Orange / Crimson: Up to +1.47°C above baseline</div>
                </div>
              </div>

              <div className="mt-6 flex justify-between items-center border-t border-white/10 pt-4">
                <a
                  href="https://showyourstripes.info"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-[#5eead4] hover:underline flex items-center gap-1"
                >
                  Visit showyourstripes.info <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  onClick={() => setShowInfoModal(false)}
                  className="px-4 py-1.5 bg-white text-black font-semibold text-xs rounded hover:bg-white/90 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

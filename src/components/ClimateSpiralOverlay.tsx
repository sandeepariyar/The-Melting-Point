import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import {
  Play,
  Pause,
  RotateCcw,
  Compass,
  Maximize2,
  Eye,
  ZoomIn,
  Sparkles,
  Flame,
  AlertTriangle,
  ChevronRight,
  Info,
  Layers,
  Activity,
  X,
} from 'lucide-react';
import { CLIMATE_SPIRAL_DATA, MONTH_NAMES, getSpiralColor } from '../data/climateSpiralData';
import { TranslationSchema } from '../types';
import { audioService } from '../services/audioService';

interface ClimateSpiralOverlayProps {
  t: TranslationSchema;
  visible: boolean;
  onClose?: () => void;
  stepIndicator?: string;
  isAct2Sequence?: boolean;
}

type CameraViewMode = 'funnel' | 'polar' | 'breach';

export const ClimateSpiralOverlay: React.FC<ClimateSpiralOverlayProps> = ({
  t,
  visible,
  onClose,
  stepIndicator,
  isAct2Sequence = false,
}) => {
  if (!visible) return null;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Playback state
  const [currentYearIdx, setCurrentYearIdx] = useState<number>(CLIMATE_SPIRAL_DATA.length - 1);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 1x, 2x, 0.5x
  const [viewMode, setViewMode] = useState<CameraViewMode>('funnel');
  const [isZoomedAt2026, setIsZoomedAt2026] = useState<boolean>(false);
  const [showBreachAlert, setShowBreachAlert] = useState<boolean>(false);

  // Active year & month data
  const activeYearData = CLIMATE_SPIRAL_DATA[currentYearIdx] || CLIMATE_SPIRAL_DATA[CLIMATE_SPIRAL_DATA.length - 1];
  const isAt2026 = currentYearIdx === CLIMATE_SPIRAL_DATA.length - 1;

  // Interaction refs
  const interactionRef = useRef({
    isDragging: false,
    prevPointer: { x: 0, y: 0 },
    orbitTheta: 0.8, // azimuth angle
    orbitPhi: 0.55, // polar angle
    distance: 42,
    targetLookAt: new THREE.Vector3(0, -1, 0),
    cameraPosTarget: new THREE.Vector3(0, 26, 38),
  });

  // Pre-calculate all 3D vertices for the entire 146-year dataset (1880–2026)
  const spiralGeometryData = useMemo(() => {
    const totalYears = CLIMATE_SPIRAL_DATA.length;
    const points: { pos: THREE.Vector3; color: THREE.Color; year: number; month: number; anomaly: number }[] = [];

    // Helper: Map temperature anomaly to 3D radius
    // -0.5°C => radius 7.5, 0.0°C => radius 12.5, +1.0°C => radius 22.5, +1.5°C => radius 27.5
    const anomalyToRadius = (anomaly: number) => {
      const clamped = Math.max(-0.6, Math.min(2.0, anomaly));
      return 12.5 + clamped * 10.0;
    };

    CLIMATE_SPIRAL_DATA.forEach((yearData, yIdx) => {
      const tNorm = yIdx / (totalYears - 1); // 0 (1880) to 1 (2026)
      const heightY = -12 + tNorm * 22; // funnel height: 1880 at bottom (-12), 2026 at top (+10)

      yearData.months.forEach((m) => {
        // Angle: 12 months in a circle, Jan at top (-PI/2)
        const angle = (m.month / 12) * Math.PI * 2 - Math.PI / 2;
        const radius = anomalyToRadius(m.anomaly);

        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        const hexColor = getSpiralColor(m.anomaly);
        const color = new THREE.Color(hexColor);

        points.push({
          pos: new THREE.Vector3(x, heightY, z),
          color,
          year: yearData.year,
          month: m.month,
          anomaly: m.anomaly,
        });
      });
    });

    return points;
  }, []);

  // Set up Three.js scene
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;

    // 2. Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020608, 0.009);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 300);
    camera.position.set(0, 26, 38);
    camera.lookAt(0, -1, 0);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xe0f2fe, 1.2);
    dirLight.position.set(20, 50, 30);
    scene.add(dirLight);

    // Dynamic tip point light (tracks the 2026 / latest tip)
    const tipLight = new THREE.PointLight(0xfacc15, 3.5, 45, 1.2);
    scene.add(tipLight);

    // 4. Reference Threshold Rings (0.0°C, +1.0°C, +1.5°C Paris, +2.0°C Danger)
    const createThresholdRing = (anomaly: number, color: number, dashSize = 0, isPulsing = false) => {
      const radius = 12.5 + anomaly * 10.0;
      const ringSegments = 128;
      const ringPoints: THREE.Vector3[] = [];

      for (let i = 0; i <= ringSegments; i++) {
        const theta = (i / ringSegments) * Math.PI * 2;
        ringPoints.push(new THREE.Vector3(Math.cos(theta) * radius, 0, Math.sin(theta) * radius));
      }

      const ringGeo = new THREE.BufferGeometry().setFromPoints(ringPoints);
      const ringMat = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: isPulsing ? 0.85 : 0.45,
        linewidth: isPulsing ? 2 : 1,
      });

      const ringLine = new THREE.Line(ringGeo, ringMat);
      ringLine.position.y = 10; // align near top (2026 level) for crisp threshold visibility
      scene.add(ringLine);

      // Subtle base copy ring at Y = -12 (1880 level) for 3D depth cylinder
      const baseRingMat = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: isPulsing ? 0.35 : 0.15,
      });
      const baseRing = new THREE.Line(ringGeo.clone(), baseRingMat);
      baseRing.position.y = -12;
      scene.add(baseRing);

      return { ringLine, isPulsing };
    };

    const ringZero = createThresholdRing(0.0, 0x38bdf8); // 0°C Cyan
    const ringOne = createThresholdRing(1.0, 0xfacc15); // +1.0°C Yellow
    const ringParis = createThresholdRing(1.5, 0xef4444, 0, true); // +1.5°C Critical Paris Boundary
    const ringTwo = createThresholdRing(2.0, 0xdc2626); // +2.0°C Red

    // 5. Radial Month Axes (12 Spokes with glowing labels)
    const spokeGroup = new THREE.Group();
    spokeGroup.position.y = 10;

    for (let m = 0; m < 12; m++) {
      const angle = (m / 12) * Math.PI * 2 - Math.PI / 2;
      const innerR = 7.5;
      const outerR = 33.0;

      const spokeGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(Math.cos(angle) * innerR, 0, Math.sin(angle) * innerR),
        new THREE.Vector3(Math.cos(angle) * outerR, 0, Math.sin(angle) * outerR),
      ]);
      const spokeMat = new THREE.LineBasicMaterial({
        color: 0x475569,
        transparent: true,
        opacity: 0.3,
      });
      const spokeLine = new THREE.Line(spokeGeo, spokeMat);
      spokeGroup.add(spokeLine);

      // Month Text Canvas Sprite
      const spriteCanvas = document.createElement('canvas');
      spriteCanvas.width = 128;
      spriteCanvas.height = 64;
      const sCtx = spriteCanvas.getContext('2d');
      if (sCtx) {
        sCtx.font = 'bold 28px monospace';
        sCtx.fillStyle = '#8fa3ab';
        sCtx.textAlign = 'center';
        sCtx.textBaseline = 'middle';
        sCtx.fillText(MONTH_NAMES[m]?.en || '', 64, 32);
      }
      const spriteTex = new THREE.CanvasTexture(spriteCanvas);
      const spriteMat = new THREE.SpriteMaterial({ map: spriteTex, transparent: true, opacity: 0.85 });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.position.set(Math.cos(angle) * (outerR + 2.8), 0.5, Math.sin(angle) * (outerR + 2.8));
      sprite.scale.set(3.8, 1.9, 1);
      spokeGroup.add(sprite);
    }
    scene.add(spokeGroup);

    // 6. Volumetric 3D Spiral Ribbon / Tube
    // We create a wide BufferGeometry with dynamic draw range and vertex colors
    const maxPoints = spiralGeometryData.length;
    const ribbonPositions = new Float32Array(maxPoints * 6); // 2 vertices per slice (inner and outer edge for ribbon)
    const ribbonColors = new Float32Array(maxPoints * 6);

    // Generate ribbon vertices along the 3D spiral curve
    for (let i = 0; i < maxPoints; i++) {
      const pt = spiralGeometryData[i];
      const normRadius = Math.sqrt(pt.pos.x * pt.pos.x + pt.pos.z * pt.pos.z);
      const dirX = pt.pos.x / (normRadius || 1);
      const dirZ = pt.pos.z / (normRadius || 1);

      // Ribbon width: 0.45 units perpendicular along radial direction
      const halfW = 0.28;

      // Vertex 1: Inner
      ribbonPositions[i * 6 + 0] = pt.pos.x - dirX * halfW;
      ribbonPositions[i * 6 + 1] = pt.pos.y - 0.08;
      ribbonPositions[i * 6 + 2] = pt.pos.z - dirZ * halfW;

      ribbonColors[i * 6 + 0] = pt.color.r;
      ribbonColors[i * 6 + 1] = pt.color.g;
      ribbonColors[i * 6 + 2] = pt.color.b;

      // Vertex 2: Outer
      ribbonPositions[i * 6 + 3] = pt.pos.x + dirX * halfW;
      ribbonPositions[i * 6 + 4] = pt.pos.y + 0.08;
      ribbonPositions[i * 6 + 5] = pt.pos.z + dirZ * halfW;

      ribbonColors[i * 6 + 3] = pt.color.r * 1.15;
      ribbonColors[i * 6 + 4] = pt.color.g * 1.15;
      ribbonColors[i * 6 + 5] = pt.color.b * 1.15;
    }

    // Triangle indices for triangle strip ribbon
    const indices: number[] = [];
    for (let i = 0; i < maxPoints - 1; i++) {
      const v0 = i * 2;
      const v1 = i * 2 + 1;
      const v2 = (i + 1) * 2;
      const v3 = (i + 1) * 2 + 1;

      indices.push(v0, v1, v2);
      indices.push(v2, v1, v3);
    }

    const ribbonGeo = new THREE.BufferGeometry();
    ribbonGeo.setAttribute('position', new THREE.BufferAttribute(ribbonPositions, 3));
    ribbonGeo.setAttribute('color', new THREE.BufferAttribute(ribbonColors, 3));
    ribbonGeo.setIndex(indices);

    const ribbonMat = new THREE.MeshBasicMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
    });

    const ribbonMesh = new THREE.Mesh(ribbonGeo, ribbonMat);
    scene.add(ribbonMesh);

    // Also a bright thin center line for crisp edge illumination
    const centerLinePositions = new Float32Array(maxPoints * 3);
    const centerLineColors = new Float32Array(maxPoints * 3);
    for (let i = 0; i < maxPoints; i++) {
      const pt = spiralGeometryData[i];
      centerLinePositions[i * 3 + 0] = pt.pos.x;
      centerLinePositions[i * 3 + 1] = pt.pos.y + 0.05;
      centerLinePositions[i * 3 + 2] = pt.pos.z;

      centerLineColors[i * 3 + 0] = pt.color.r * 1.3;
      centerLineColors[i * 3 + 1] = pt.color.g * 1.3;
      centerLineColors[i * 3 + 2] = pt.color.b * 1.3;
    }
    const centerLineGeo = new THREE.BufferGeometry();
    centerLineGeo.setAttribute('position', new THREE.BufferAttribute(centerLinePositions, 3));
    centerLineGeo.setAttribute('color', new THREE.BufferAttribute(centerLineColors, 3));
    const centerLineMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
    });
    const centerLineMesh = new THREE.Line(centerLineGeo, centerLineMat);
    scene.add(centerLineMesh);

    // 7. Glowing Leading Tip Sphere (Active Date Indicator)
    const tipGeo = new THREE.SphereGeometry(0.55, 16, 16);
    const tipMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const tipMesh = new THREE.Mesh(tipGeo, tipMat);
    scene.add(tipMesh);

    // 8. Heat Ember Particles rising through the spiral funnel
    const emberCount = 280;
    const emberGeo = new THREE.BufferGeometry();
    const emberPos = new Float32Array(emberCount * 3);
    const emberVel = new Float32Array(emberCount);
    for (let i = 0; i < emberCount; i++) {
      const r = 4 + Math.random() * 26;
      const th = Math.random() * Math.PI * 2;
      emberPos[i * 3 + 0] = Math.cos(th) * r;
      emberPos[i * 3 + 1] = -12 + Math.random() * 24;
      emberPos[i * 3 + 2] = Math.sin(th) * r;
      emberVel[i] = 0.03 + Math.random() * 0.07;
    }
    emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPos, 3));
    const emberMat = new THREE.PointsMaterial({
      color: 0xfacc15,
      size: 0.45,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });
    const emberPoints = new THREE.Points(emberGeo, emberMat);
    scene.add(emberPoints);

    // 9. Resize Observer
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // 10. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Pulsing effect on +1.5°C Paris ring
      if (ringParis.ringLine.material instanceof THREE.LineBasicMaterial) {
        ringParis.ringLine.material.opacity = 0.65 + Math.sin(elapsedTime * 4.5) * 0.35;
      }

      // Animate ambient embers upward
      const posAttr = emberGeo.attributes.position;
      const pArr = posAttr.array as Float32Array;
      for (let i = 0; i < emberCount; i++) {
        pArr[i * 3 + 1] += emberVel[i];
        if (pArr[i * 3 + 1] > 12) {
          pArr[i * 3 + 1] = -12;
        }
      }
      posAttr.needsUpdate = true;

      // Subtle ambient spiral rotation if not actively dragging
      if (!interactionRef.current.isDragging) {
        interactionRef.current.orbitTheta += 0.0015;
      }

      // Camera position interpolation based on ViewMode & 2026 Zoom
      const state = interactionRef.current;
      const targetPos = state.cameraPosTarget;
      const targetLook = state.targetLookAt;

      camera.position.lerp(targetPos, 0.065);
      camera.lookAt(targetLook);

      renderer.render(scene, camera);
    };
    animate();

    // Store references for updates
    (container as any).__threeData = {
      scene,
      camera,
      renderer,
      ribbonGeo,
      centerLineGeo,
      tipMesh,
      tipLight,
      maxPoints,
    };

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      renderer.dispose();
      ribbonGeo.dispose();
      centerLineGeo.dispose();
      emberGeo.dispose();
    };
  }, [spiralGeometryData]);

  // Update Ribbon Draw Range & Tip Position based on currentYearIdx
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const data = (container as any).__threeData;
    if (!data) return;

    // Calculate how many points to show: all months up to currentYearIdx
    const visiblePointsCount = Math.min(spiralGeometryData.length, (currentYearIdx + 1) * 12);

    // Update ribbon draw range: each step has 2 triangles (6 indices)
    if (data.ribbonGeo) {
      data.ribbonGeo.setDrawRange(0, Math.max(0, (visiblePointsCount - 1) * 6));
    }
    if (data.centerLineGeo) {
      data.centerLineGeo.setDrawRange(0, visiblePointsCount);
    }

    // Update Leading Tip Mesh & Tip Light
    const latestPt = spiralGeometryData[visiblePointsCount - 1] || spiralGeometryData[0];
    if (latestPt && data.tipMesh && data.tipLight) {
      data.tipMesh.position.copy(latestPt.pos);
      data.tipLight.position.copy(latestPt.pos);
      data.tipLight.color = latestPt.color;
      data.tipMesh.material.color = latestPt.color;
    }
  }, [currentYearIdx, spiralGeometryData]);

  // Camera ViewMode and Cinematic 2026 Zoom Engine
  useEffect(() => {
    const state = interactionRef.current;

    if (isZoomedAt2026) {
      // Cinematic close-up zoom into the 2026 breach point
      const lastPoint = spiralGeometryData[spiralGeometryData.length - 1];
      if (lastPoint) {
        // Position camera right next to the 2026 apex looking down the breach ribbon
        state.cameraPosTarget.set(lastPoint.pos.x + 9, lastPoint.pos.y + 4.5, lastPoint.pos.z + 8.5);
        state.targetLookAt.copy(lastPoint.pos);
      }
    } else if (viewMode === 'polar') {
      // Top-Down classic 2D Polar Circle looking straight down
      state.cameraPosTarget.set(0, 52, 0.01);
      state.targetLookAt.set(0, 0, 0);
    } else if (viewMode === 'breach') {
      // Dramatic angled threshold slice
      state.cameraPosTarget.set(18, 14, 20);
      state.targetLookAt.set(0, 8, 0);
    } else {
      // Default: 3D Tornado / Funnel view with spherical orbit coords
      const x = state.distance * Math.sin(state.orbitPhi) * Math.sin(state.orbitTheta);
      const y = state.distance * Math.cos(state.orbitPhi);
      const z = state.distance * Math.sin(state.orbitPhi) * Math.cos(state.orbitTheta);
      state.cameraPosTarget.set(x, y, z);
      state.targetLookAt.set(0, -1, 0);
    }
  }, [viewMode, isZoomedAt2026, spiralGeometryData]);

  // Core Playback Engine with 2026 Auto-Stop and Cinematic Zoom-In
  useEffect(() => {
    if (!isPlaying) return;

    const baseDelay = 110 / playbackSpeed;
    const interval = setInterval(() => {
      setCurrentYearIdx((prev) => {
        // When we reach the final year (2026):
        // 1. STOP the loop as requested: "when it hits 2026 and stops the cycle"
        // 2. Trigger cinematic zoom-in!
        if (prev >= CLIMATE_SPIRAL_DATA.length - 1) {
          setIsPlaying(false);
          setIsZoomedAt2026(true);
          setShowBreachAlert(true);
          audioService.tick();
          return CLIMATE_SPIRAL_DATA.length - 1;
        }

        audioService.tick();
        return prev + 1;
      });
    }, baseDelay);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  // Pointer Orbit Controls (Touch + Mouse Drag)
  const handlePointerDown = (e: React.PointerEvent) => {
    interactionRef.current.isDragging = true;
    interactionRef.current.prevPointer = { x: e.clientX, y: e.clientY };
    if (isZoomedAt2026) {
      setIsZoomedAt2026(false); // allow user to break out of locked zoom into free orbit
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!interactionRef.current.isDragging) return;
    const dx = e.clientX - interactionRef.current.prevPointer.x;
    const dy = e.clientY - interactionRef.current.prevPointer.y;
    interactionRef.current.prevPointer = { x: e.clientX, y: e.clientY };

    const state = interactionRef.current;
    state.orbitTheta += dx * 0.007;
    state.orbitPhi = Math.max(0.12, Math.min(Math.PI / 2 + 0.1, state.orbitPhi - dy * 0.006));

    if (viewMode === 'funnel') {
      const x = state.distance * Math.sin(state.orbitPhi) * Math.sin(state.orbitTheta);
      const y = state.distance * Math.cos(state.orbitPhi);
      const z = state.distance * Math.sin(state.orbitPhi) * Math.cos(state.orbitTheta);
      state.cameraPosTarget.set(x, y, z);
    }
  };

  const handlePointerUp = () => {
    interactionRef.current.isDragging = false;
  };

  // Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    const state = interactionRef.current;
    state.distance = Math.max(12, Math.min(75, state.distance + e.deltaY * 0.035));
    if (viewMode === 'funnel' && !isZoomedAt2026) {
      const x = state.distance * Math.sin(state.orbitPhi) * Math.sin(state.orbitTheta);
      const y = state.distance * Math.cos(state.orbitPhi);
      const z = state.distance * Math.sin(state.orbitPhi) * Math.cos(state.orbitTheta);
      state.cameraPosTarget.set(x, y, z);
    }
  };

  // Replay from beginning (1880)
  const handleReplay = useCallback(() => {
    setIsZoomedAt2026(false);
    setShowBreachAlert(false);
    setViewMode('funnel');
    interactionRef.current.distance = 42;
    interactionRef.current.orbitPhi = 0.55;
    interactionRef.current.targetLookAt.set(0, -1, 0);
    setCurrentYearIdx(0);
    setIsPlaying(true);
    audioService.tick();
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-30 pointer-events-auto select-none bg-[#020608]/90 overflow-hidden"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
    >
      {/* 3D WebGL Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Left Header & Context floating cleanly */}
      <div className="absolute top-28 left-12 z-20 pointer-events-none">
        <div className="flex items-center gap-2 font-mono text-[11px] tracking-[0.28em] uppercase text-[#facc15] mb-1">
          <span>{t.act2_title}</span>
          <span className="text-[#4d6169]">·</span>
          <span className="text-[#8fa3ab]">{stepIndicator || 'MAAPALLON LÄMPÖSPIRAALI (1880–2026)'}</span>
        </div>
        <div className="font-display italic text-4xl lg:text-5xl text-[#eaf2f5] tracking-wide leading-tight">
          Planetary Climate Spiral
        </div>
        <div className="font-mono text-xs tracking-wider text-[#8fa3ab] max-w-xl mt-1.5 leading-relaxed">
          Kuukausittainen globaali lämpötilapoikkeama esiteolliseen aikaan (1850–1900) nähden. 1880-luvun viileä ydin laajenee spiraalina kohti 2026 kriittistä +1.5 °C kynnysrajaa.
        </div>

        {/* View Mode Switcher Pills */}
        <div className="flex items-center gap-2 mt-4 pointer-events-auto">
          <button
            type="button"
            onClick={() => {
              setIsZoomedAt2026(false);
              setViewMode('funnel');
              audioService.tick();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-[11px] tracking-widest uppercase transition-all cursor-pointer border ${
              viewMode === 'funnel' && !isZoomedAt2026
                ? 'bg-[#38bdf8]/20 border-[#38bdf8] text-[#eaf2f5] shadow-[0_0_15px_rgba(56,189,248,0.3)]'
                : 'bg-white/5 border-white/10 text-[#8fa3ab] hover:border-white/30'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>3D TORNADO</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsZoomedAt2026(false);
              setViewMode('polar');
              audioService.tick();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-[11px] tracking-widest uppercase transition-all cursor-pointer border ${
              viewMode === 'polar' && !isZoomedAt2026
                ? 'bg-[#38bdf8]/20 border-[#38bdf8] text-[#eaf2f5] shadow-[0_0_15px_rgba(56,189,248,0.3)]'
                : 'bg-white/5 border-white/10 text-[#8fa3ab] hover:border-white/30'
            }`}
          >
            <Compass className="w-3 h-3" />
            <span>2D POLAARIKUVA</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsZoomedAt2026(true);
              audioService.tick();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-[11px] tracking-widest uppercase transition-all cursor-pointer border ${
              isZoomedAt2026
                ? 'bg-[#ef4444]/25 border-[#ef4444] text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                : 'bg-white/5 border-white/10 text-[#8fa3ab] hover:border-white/30'
            }`}
          >
            <ZoomIn className="w-3 h-3 text-[#ef4444]" />
            <span>2026 LÄHIKUVA</span>
          </button>
        </div>
      </div>

      {/* Top Right Live Telemetry Badge */}
      <div className="absolute top-28 right-12 z-20 pointer-events-none text-right">
        <div className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#8fa3ab] mb-1">
          LÄMPÖTILAPOIKKEAMA
        </div>
        <div
          className="font-display text-5xl lg:text-6xl font-light tracking-tight leading-none"
          style={{ color: getSpiralColor(activeYearData.annualAvg) }}
        >
          {activeYearData.annualAvg >= 0 ? `+${activeYearData.annualAvg.toFixed(2)}` : activeYearData.annualAvg.toFixed(2)} °C
        </div>
        <div className="font-mono text-xs tracking-widest text-[#8fa3ab] mt-2 uppercase">
          {activeYearData.annualAvg >= 1.4
            ? 'PARIISIN +1.5 °C RAJA VAARASSA'
            : activeYearData.annualAvg >= 1.0
            ? 'KIIHTYVÄ LÄMPENEMINEN'
            : 'HISTORIALLINEN PERUSTASO'}
        </div>
        <div className="font-mono text-[10px] tracking-widest text-[#4d6169] mt-1">
          NASA GISTEMP v4 / COPERNICUS ERA5
        </div>
      </div>

      {/* Floating Center Large Year Display */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none text-center">
        <div className="font-display text-7xl sm:text-8xl lg:text-9xl font-light text-white/80 tracking-tighter drop-shadow-2xl">
          {activeYearData.year}
        </div>
        <div className="font-mono text-xs tracking-[0.35em] uppercase text-[#8fa3ab]">
          146 VUODEN HISTORIALLINEN SYKLI
        </div>
      </div>

      {/* 2026 Breach Callout Notification Card (appears when cycle hits 2026 and zooms in) */}
      {showBreachAlert && isAt2026 && (
        <div className="absolute top-[38%] right-12 z-30 max-w-sm p-6 bg-[#0a141a]/90 border border-[#ef4444]/60 backdrop-blur-xl shadow-[0_0_40px_rgba(239,68,68,0.3)] animate-fade-in pointer-events-auto">
          <div className="flex items-center justify-between gap-2 text-[#ef4444] font-mono text-xs tracking-widest uppercase mb-2">
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-[#ef4444] animate-pulse" />
              <span>2026 KYNNYSRAJA MURRETTU</span>
            </span>
            <button
              type="button"
              onClick={() => setShowBreachAlert(false)}
              className="text-[#8fa3ab] hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="font-display text-2xl text-white font-light leading-snug mb-2">
            +1.42 °C Lämpötilapoikkeama
          </div>
          <p className="font-mono text-xs text-[#8fa3ab] leading-relaxed mb-4">
            Spiraali on laajentunut ulos esiteollisesta radastaan. Vuosi 2026 hipoo Pariisin ilmastosopimuksen +1.5 °C:n turvarajaa, jonka ylittäminen laukaisee peruuttamattomia takaisinkytkentöjä.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReplay}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-[#ef4444]/20 hover:bg-[#ef4444]/35 border border-[#ef4444]/60 text-white font-mono text-xs tracking-wider uppercase transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Käynnistä uudelleen</span>
            </button>
          </div>
        </div>
      )}

      {/* Bottom Timeline Controls Bar */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 w-[880px] max-w-[90vw] flex flex-col items-center">
        <div className="w-full flex items-center gap-4 px-6 py-3.5 bg-[#061014]/85 border border-white/15 rounded-full backdrop-blur-2xl shadow-2xl">
          {/* Play / Pause Toggle */}
          <button
            type="button"
            onClick={() => {
              if (isAt2026) {
                // If at end, replay from start
                handleReplay();
              } else {
                setIsPlaying(!isPlaying);
                audioService.tick();
              }
            }}
            className="p-2.5 rounded-full border border-white/20 bg-white/5 hover:bg-white/15 text-[#facc15] hover:text-white transition-all cursor-pointer"
            title={isPlaying ? 'Pysäytä spiraali' : isAt2026 ? 'Toista alusta' : 'Käynnistä spiraali'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          {/* Reset Button */}
          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setIsZoomedAt2026(false);
              setShowBreachAlert(false);
              setCurrentYearIdx(0);
              audioService.tick();
            }}
            className="p-2.5 rounded-full border border-white/20 bg-white/5 hover:bg-white/15 text-[#8fa3ab] hover:text-white transition-all cursor-pointer"
            title="Palauta vuoteen 1880"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Interactive Timeline Range Slider */}
          <div className="flex-1 flex items-center gap-3">
            <span className="font-mono text-xs text-[#8fa3ab]">1880</span>
            <input
              type="range"
              min={0}
              max={CLIMATE_SPIRAL_DATA.length - 1}
              value={currentYearIdx}
              onChange={(e) => {
                setIsPlaying(false);
                setIsZoomedAt2026(false);
                setShowBreachAlert(false);
                setCurrentYearIdx(parseInt(e.target.value, 10));
              }}
              className="flex-1 accent-[#facc15] h-1.5 bg-white/15 rounded-lg cursor-pointer"
            />
            <span className="font-mono text-xs text-[#ef4444] font-semibold">2026</span>
          </div>

          {/* Speed Toggle (1x, 2x, 0.5x) */}
          <div className="flex items-center gap-1 border-l border-white/10 pl-3">
            {[0.5, 1, 2].map((spd) => (
              <button
                key={spd}
                type="button"
                onClick={() => {
                  setPlaybackSpeed(spd);
                  audioService.tick();
                }}
                className={`px-2 py-1 font-mono text-[10px] rounded transition-all cursor-pointer ${
                  playbackSpeed === spd ? 'bg-[#facc15] text-black font-bold' : 'text-[#8fa3ab] hover:text-white'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* 3D Interaction Hint */}
        <div className="mt-2.5 flex items-center gap-4 font-mono text-[10px] tracking-widest text-[#8fa3ab]/70 uppercase">
          <span className="flex items-center gap-1.5">
            <Compass className="w-3 h-3 text-[#38bdf8]" />
            <span>PYÖRITÄ VETÄMÄLLÄ 360°</span>
          </span>
          <span>·</span>
          <span>VIERITÄ HIIRELLÄ ZOOMATAKSESI</span>
          <span>·</span>
          <span className="text-[#ef4444]">PUNAINEN KEHÄ = +1.5 °C PARIISI</span>
        </div>
      </div>

      {/* Standalone Close Button (if invoked outside sequence) */}
      {onClose && !isAct2Sequence && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-28 right-8 z-30 p-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all cursor-pointer"
          title="Sulje"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

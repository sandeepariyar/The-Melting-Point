import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ActType, CameraPresetName } from '../types';
import { getIceAt, getSeaAt, getTempAt } from '../data/climateData';
import { audioService } from '../services/audioService';

interface ThreeSceneProps {
  currentAct: ActType;
  year: number;
  scenarioTemp: number;
  floodProgress: number;
  cameraPreset: CameraPresetName;
  seaLevelVisualizerActive?: boolean;
  seaLevelOffsetMeters?: number;
  globalVisualizerActive?: boolean;
  onCanvasPointerDown?: (x: number, y: number) => void;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({
  currentAct,
  year,
  scenarioTemp,
  floodProgress,
  cameraPreset,
  seaLevelVisualizerActive = false,
  seaLevelOffsetMeters = 0,
  globalVisualizerActive = false,
  onCanvasPointerDown,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const sceneRefs = useRef<{
    renderer?: THREE.WebGLRenderer;
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    terrainMat?: THREE.ShaderMaterial;
    oceanMat?: THREE.ShaderMaterial;
    windMat?: THREE.ShaderMaterial;
    rainMat?: THREE.ShaderMaterial;
    floodMat?: THREE.ShaderMaterial;
    starsMat?: THREE.ShaderMaterial;
    earthMat?: THREE.ShaderMaterial;
    earthMesh?: THREE.Mesh;
    earthAtmosphere?: THREE.Mesh;
    cityWater?: THREE.Mesh;
    cityWaterMat?: THREE.ShaderMaterial;
    touchSparkGeo?: THREE.BufferGeometry;
    touchSparkMat?: THREE.ShaderMaterial;
    clock?: THREE.Clock;
    cameraDesired: THREE.Vector3;
    cameraLookAt: THREE.Vector3;
    cameraLookAtDesired: THREE.Vector3;
    cameraParallax: THREE.Vector3;
    cameraParallaxDesired: THREE.Vector3;
    globeRotation: { x: number; y: number };
    globeVelocity: { x: number; y: number };
    isDraggingGlobe: boolean;
    windDeflect: THREE.Vector2;
    rainIntensity: number;
    touchWorldPos: THREE.Vector2;
    touchIntensity: number;
    animFrameId?: number;
    act: ActType;
    year: number;
    scenarioTemp: number;
    floodProgress: number;
    globalActive: boolean;
    seaLevelActive: boolean;
    seaLevelOffset: number;
  }>({
    cameraDesired: new THREE.Vector3(0, 90, 200),
    cameraLookAt: new THREE.Vector3(0, 20, 0),
    cameraLookAtDesired: new THREE.Vector3(0, 20, 0),
    cameraParallax: new THREE.Vector3(0, 0, 0),
    cameraParallaxDesired: new THREE.Vector3(0, 0, 0),
    globeRotation: { x: 0.35, y: 0.0 },
    globeVelocity: { x: 0, y: 0.002 },
    isDraggingGlobe: false,
    windDeflect: new THREE.Vector2(0, 0),
    rainIntensity: 0,
    touchWorldPos: new THREE.Vector2(0, 0),
    touchIntensity: 0,
    act: currentAct,
    year,
    scenarioTemp,
    floodProgress,
    globalActive: globalVisualizerActive,
    seaLevelActive: seaLevelVisualizerActive,
    seaLevelOffset: seaLevelOffsetMeters,
  });

  useEffect(() => {
    sceneRefs.current.act = currentAct;
  }, [currentAct]);

  useEffect(() => {
    sceneRefs.current.globalActive = globalVisualizerActive;
  }, [globalVisualizerActive]);

  useEffect(() => {
    sceneRefs.current.seaLevelActive = seaLevelVisualizerActive;
    sceneRefs.current.seaLevelOffset = seaLevelOffsetMeters;
    const refs = sceneRefs.current;
    
    if (refs.oceanMat) {
      if (seaLevelVisualizerActive) {
        refs.oceanMat.uniforms.uSeaLevel.value = -2.0 + (seaLevelOffsetMeters / 10) * 8.0;
      } else {
        const sea = getSeaAt(year) / 1000;
        refs.oceanMat.uniforms.uSeaLevel.value = -2.0 + sea * 3.0;
      }
    }

    if (refs.cityWater) {
       // visually scale the 6 meters up to building heights (which are around 5 to 50)
       // Let's make 6m sea level rise visually map to 30 units in 3D space
       refs.cityWater.position.y = -2 + (seaLevelOffsetMeters * 5.0);
    }
  }, [seaLevelVisualizerActive, seaLevelOffsetMeters, year]);

  useEffect(() => {
    sceneRefs.current.year = year;
    const refs = sceneRefs.current;
    if (refs.terrainMat && refs.oceanMat) {
      const temp = getTempAt(year);
      const ice = getIceAt(year);
      refs.terrainMat.uniforms.uYear.value = year;
      refs.terrainMat.uniforms.uTemp.value = temp;
      refs.terrainMat.uniforms.uIce.value = ice;

      if (!refs.seaLevelActive) {
        const sea = getSeaAt(year) / 1000;
        refs.oceanMat.uniforms.uSeaLevel.value = -2.0 + sea * 3.0;
      }

      if (refs.windMat) {
        refs.windMat.uniforms.uTemp.value = temp;
      }
      
      if (refs.earthMat) {
        refs.earthMat.uniforms.uTemp.value = temp;
      }
    }
  }, [year]);

  useEffect(() => {
    sceneRefs.current.scenarioTemp = scenarioTemp;
    const refs = sceneRefs.current;
    // Always update earthMat with current scenario temperature immediately
    if (refs.earthMat) {
      refs.earthMat.uniforms.uTemp.value = scenarioTemp;
    }
    if (refs.terrainMat && refs.oceanMat && currentAct === 'act3') {
      const iceRemain =
        scenarioTemp === 1.5 ? 0.55 : scenarioTemp === 2.0 ? 0.35 : scenarioTemp === 3.0 ? 0.15 : 0.04;
      const seaRise =
        scenarioTemp === 1.5 ? 430 : scenarioTemp === 2.0 ? 560 : scenarioTemp === 3.0 ? 810 : 1100;
      refs.terrainMat.uniforms.uTemp.value = scenarioTemp;
      refs.terrainMat.uniforms.uIce.value = iceRemain;
      if (!refs.seaLevelActive) {
        refs.oceanMat.uniforms.uSeaLevel.value = -2.0 + (seaRise / 1000) * 4.0;
      }
      if (refs.windMat) {
        refs.windMat.uniforms.uTemp.value = scenarioTemp;
      }
    }
  }, [scenarioTemp, currentAct]);

  useEffect(() => {
    sceneRefs.current.floodProgress = floodProgress;
    const refs = sceneRefs.current;
    if (refs.terrainMat && refs.floodMat) {
      refs.terrainMat.uniforms.uFloodProgress.value = floodProgress;
      refs.terrainMat.uniforms.uFloodPathAmp.value = floodProgress > 0 ? 1.0 : 0.0;
      refs.floodMat.uniforms.uFloodProgress.value = floodProgress;
      refs.floodMat.uniforms.uActive.value = floodProgress > 0 ? 1.0 : 0.0;
    }
  }, [floodProgress]);

  // Camera Presets
  useEffect(() => {
    const presets: Record<CameraPresetName, { pos: THREE.Vector3; look: THREE.Vector3 }> = {
      attract: { pos: new THREE.Vector3(0, 90, 200), look: new THREE.Vector3(0, 20, 0) },
      act1_wide: { pos: new THREE.Vector3(-80, 55, 140), look: new THREE.Vector3(0, 15, -40) },
      act1_valley: { pos: new THREE.Vector3(20, 22, 60), look: new THREE.Vector3(0, 5, -20) },
      act1_flood: { pos: new THREE.Vector3(45, 18, 40), look: new THREE.Vector3(-5, 3, 0) },
      act1_aftermath: { pos: new THREE.Vector3(0, 120, 220), look: new THREE.Vector3(0, 0, -20) },
      act2: { pos: new THREE.Vector3(-60, 130, 200), look: new THREE.Vector3(0, 30, -40) },
      act3: { pos: new THREE.Vector3(0, 180, 280), look: new THREE.Vector3(0, 20, -20) },
      act3_close: { pos: new THREE.Vector3(0, 240, 380), look: new THREE.Vector3(0, 40, 0) },
      sea_level_focus: { pos: new THREE.Vector3(-1000, 60, 200), look: new THREE.Vector3(-1000, 0, 0) },
      global_earth: { pos: new THREE.Vector3(1000, 300, 400), look: new THREE.Vector3(1000, 300, 0) },
    };

    const p = presets[cameraPreset] || presets.attract;
    sceneRefs.current.cameraDesired.copy(p.pos);
    sceneRefs.current.cameraLookAtDesired.copy(p.look);
  }, [cameraPreset]);

  // Main Scene Setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const clock = new THREE.Clock();
    sceneRefs.current.clock = clock;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(1920, 1080, false);
    renderer.setClearColor(0x05090b, 1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a1418, 0.0028);

    const camera = new THREE.PerspectiveCamera(38, 1920 / 1080, 0.5, 2000);
    camera.position.set(0, 90, 200);
    camera.lookAt(0, 20, 0);

    sceneRefs.current.renderer = renderer;
    sceneRefs.current.scene = scene;
    sceneRefs.current.camera = camera;

    // Lights
    const hemi = new THREE.HemisphereLight(0x88a8b8, 0x1a2028, 0.65);
    scene.add(hemi);

    const moon = new THREE.DirectionalLight(0xb8d4e6, 1.25);
    moon.position.set(-80, 130, 60);
    scene.add(moon);

    const rim = new THREE.DirectionalLight(0xe8a06f, 0.4);
    rim.position.set(120, 40, -80);
    scene.add(rim);

    // Stars
    const starCount = 1600;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starSizes = new Float32Array(starCount);
    for (let i = 0; i < starCount; i++) {
      const r = 900 + Math.random() * 250;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.55;
      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.cos(phi) * 0.6 + 90;
      starPositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      starSizes[i] = Math.random() * 2.0 + 0.4;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));

    const starsMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: `
        attribute float size;
        uniform float uTime;
        varying float vBright;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (320.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
          vBright = 0.6 + 0.4 * sin(uTime * 1.2 + position.x * 0.01);
        }
      `,
      fragmentShader: `
        varying float vBright;
        void main() {
          vec2 c = gl_PointCoord - 0.5;
          float d = length(c);
          if (d > 0.5) discard;
          float a = smoothstep(0.5, 0.0, d) * vBright;
          gl_FragColor = vec4(vec3(0.85, 0.95, 1.0), a * 0.8);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    sceneRefs.current.starsMat = starsMat;
    const starPoints = new THREE.Points(starGeo, starsMat);
    scene.add(starPoints);

    // Himalayan Terrain with Interactive Touch Ripple Perturbation
    const terrainGeo = new THREE.PlaneGeometry(640, 640, 320, 320);
    terrainGeo.rotateX(-Math.PI / 2);

    const terrainMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uYear: { value: year },
        uTemp: { value: getTempAt(year) },
        uIce: { value: getIceAt(year) },
        uFloodProgress: { value: 0 },
        uFloodPathAmp: { value: 0 },
        uSnowLine: { value: 40.0 },
        uAmp: { value: 68.0 },
        uTouchPos: { value: new THREE.Vector2(0, 0) },
        uTouchIntensity: { value: 0 },
        uColdColor: { value: new THREE.Color(0x1e3644) },
        uWarmColor: { value: new THREE.Color(0x4a4238) },
        uIceColor: { value: new THREE.Color(0xdaeef7) },
        uWaterColor: { value: new THREE.Color(0x12242f) },
        uFogColor: { value: new THREE.Color(0x0a1418) },
        uCameraPos: { value: new THREE.Vector3() },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uAmp;
        uniform float uIce;
        uniform float uFloodProgress;
        uniform float uFloodPathAmp;
        uniform vec2 uTouchPos;
        uniform float uTouchIntensity;
        varying vec3 vPos;
        varying vec3 vWorldPos;
        varying float vElev;
        varying float vSlope;
        varying float vTouchWave;

        vec2 hash2(vec2 p) {
          p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
          return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
        }
        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(
            mix(dot(hash2(i), f), dot(hash2(i + vec2(1,0)), f - vec2(1,0)), u.x),
            mix(dot(hash2(i + vec2(0,1)), f - vec2(0,1)), dot(hash2(i + vec2(1,1)), f - vec2(1,1)), u.x),
          u.y);
        }
        float fbm(vec2 p) {
          float v = 0.0;
          float a = 0.5;
          for (int i = 0; i < 6; i++) {
            v += a * noise(p);
            p *= 2.0;
            a *= 0.5;
          }
          return v;
        }
        float ridge(vec2 p) {
          float n = 0.0;
          float a = 0.5;
          for (int i = 0; i < 5; i++) {
            n += a * (1.0 - abs(noise(p)));
            p *= 2.0;
            a *= 0.5;
          }
          return n;
        }

        void main() {
          vec2 p = position.xz * 0.008;
          float base = fbm(p * 0.4) * 0.6;
          float mountains = pow(ridge(p * 0.9 + vec2(2.1, -0.7)), 1.8);

          float spineDist = abs(position.z + 40.0);
          float spineMask = smoothstep(220.0, 0.0, spineDist);
          float spine = pow(ridge(p * 1.4 + vec2(0.0, uTime * 0.005)), 2.2) * spineMask * 1.4;

          float h = (base * 0.55 + mountains * 0.7 + spine) * uAmp;

          // Trishuli and Lende Khola Valley channel
          float valleyX = sin(position.z * 0.012) * 18.0;
          float valleyDist = abs(position.x - valleyX);
          float valleyMask = smoothstep(38.0, 0.0, valleyDist);
          h -= valleyMask * 22.0;

          // Flood wave displacement
          float floodLead = 1.0 - abs((position.z / 300.0 + 0.5) - uFloodProgress) * 6.0;
          floodLead = clamp(floodLead, 0.0, 1.0);
          float floodBulge = floodLead * valleyMask * uFloodPathAmp * 12.0;
          h += floodBulge;

          // Interactive Touch Ripple Deformation
          float distToTouch = length(position.xz - uTouchPos);
          float touchWave = sin(distToTouch * 0.15 - uTime * 6.0) * exp(-distToTouch * 0.02) * uTouchIntensity;
          h += touchWave * 3.5;
          vTouchWave = touchWave;

          // Ice thinning as uIce decreases
          float iceLoss = (1.0 - uIce) * 1.2;
          if (h > 30.0) {
            h -= (h - 30.0) * iceLoss * 0.35;
          }

          vec3 newPos = position;
          newPos.y += h;
          vElev = h;

          vec2 pdx = (position.xz + vec2(1.0, 0.0)) * 0.008;
          vec2 pdz = (position.xz + vec2(0.0, 1.0)) * 0.008;
          float hx = fbm(pdx * 0.4) * 0.6 + pow(ridge(pdx * 0.9 + vec2(2.1, -0.7)), 1.8) * 0.7;
          float hz = fbm(pdz * 0.4) * 0.6 + pow(ridge(pdz * 0.9 + vec2(2.1, -0.7)), 1.8) * 0.7;
          vSlope = length(vec2(h - hx * uAmp, h - hz * uAmp)) * 0.01;
          vPos = newPos;

          vec4 world = modelMatrix * vec4(newPos, 1.0);
          vWorldPos = world.xyz;
          gl_Position = projectionMatrix * viewMatrix * world;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uTemp;
        uniform float uIce;
        uniform float uSnowLine;
        uniform float uFloodProgress;
        uniform vec3 uColdColor;
        uniform vec3 uWarmColor;
        uniform vec3 uIceColor;
        uniform vec3 uWaterColor;
        uniform vec3 uFogColor;
        uniform vec3 uCameraPos;
        varying vec3 vPos;
        varying vec3 vWorldPos;
        varying float vElev;
        varying float vSlope;
        varying float vTouchWave;

        void main() {
          float h = vElev;
          float dynSnow = uSnowLine + uTemp * 10.0 + (1.0 - uIce) * 22.0;

          vec3 rockLow = vec3(0.06, 0.09, 0.13);
          vec3 rockMid = vec3(0.14, 0.18, 0.24);
          vec3 rockHigh = vec3(0.26, 0.30, 0.36);
          vec3 rock = mix(rockLow, rockMid, smoothstep(-10.0, 25.0, h));
          rock = mix(rock, rockHigh, smoothstep(25.0, 60.0, h));

          vec3 ice = uIceColor;

          float snowMix = smoothstep(dynSnow - 3.0, dynSnow + 8.0, h);
          snowMix *= 1.0 - smoothstep(0.3, 0.9, vSlope);
          snowMix *= smoothstep(0.1, 0.7, uIce);

          vec3 col = mix(rock, ice, snowMix);

          // Exposed lower valley warning tone under extreme temp
          float warmMask = smoothstep(1.2, 2.5, uTemp) * (1.0 - smoothstep(0.0, 14.0, h)) * (1.0 - snowMix);
          col = mix(col, vec3(0.38, 0.22, 0.14), warmMask * 0.4);

          // Sub-sea level
          float waterMask = smoothstep(2.0, -3.0, h);
          col = mix(col, uWaterColor, waterMask);

          // Flood wave luminescence
          float valleyX = sin(vPos.z * 0.012) * 18.0;
          float valleyDist = abs(vPos.x - valleyX);
          float valleyMask = smoothstep(38.0, 0.0, valleyDist);
          float floodBand = 1.0 - abs((vPos.z / 300.0 + 0.5) - uFloodProgress) * 6.0;
          floodBand = clamp(floodBand, 0.0, 1.0);
          vec3 floodGlow = mix(vec3(0.5, 0.75, 0.95), vec3(0.95, 0.55, 0.35), uTemp * 0.5);
          col += floodBand * valleyMask * floodGlow * 0.8;

          // Touch perturbation luminescence
          col += vec3(0.45, 0.8, 0.95) * max(0.0, vTouchWave) * 0.4;

          // Cartographic contour lines (scientific aesthetic)
          float contourSpacing = 8.0;
          float contour = abs(fract(h / contourSpacing - 0.5) - 0.5) / fwidth(h / contourSpacing);
          float contourLine = 1.0 - min(contour, 1.0);
          col += vec3(0.4, 0.65, 0.85) * contourLine * 0.14;

          // Atmospheric fog
          float dist = length(uCameraPos - vWorldPos);
          float fogFactor = 1.0 - exp(-pow(dist * 0.0024, 2.0));
          col = mix(col, uFogColor, fogFactor);

          // Ice peak glow
          col += ice * snowMix * 0.22;

          gl_FragColor = vec4(col, 1.0);
        }
      `,
      side: THREE.DoubleSide,
    });
    sceneRefs.current.terrainMat = terrainMat;
    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    scene.add(terrain);

    // Ocean Plane (Rises during Sea Level Simulation & Act 3)
    const oceanGeo = new THREE.PlaneGeometry(1600, 1600, 1, 1);
    oceanGeo.rotateX(-Math.PI / 2);
    const oceanMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uSeaLevel: { value: -2.0 },
        uColor: { value: new THREE.Color(0x0a1e28) },
        uCameraPos: { value: new THREE.Vector3(0, 90, 200) },
      },
      vertexShader: `
        uniform float uSeaLevel;
        varying vec3 vWorldPos;
        void main() {
          vec3 p = position;
          p.y = uSeaLevel;
          vec4 world = modelMatrix * vec4(p, 1.0);
          vWorldPos = world.xyz;
          gl_Position = projectionMatrix * viewMatrix * world;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor;
        uniform vec3 uCameraPos;
        varying vec3 vWorldPos;

        // Cornus Ammonis inspired multiscale fluid dynamics & GGX microfacet specular
        float fluidPotential(vec2 p, float t, int maxOctaves) {
          float h = 0.0;
          float amp = 1.0;
          float freq = 0.024;
          mat2 rot = mat2(0.866, -0.5, 0.5, 0.866);
          vec2 pos = p * freq;

          for (int i = 0; i < 4; i++) {
            if (i >= maxOctaves) break;
            float fi = float(i);
            vec2 drift = vec2(
              sin(pos.y * 1.5 + t * (0.35 + fi * 0.12)),
              cos(pos.x * 1.5 - t * (0.3 + fi * 0.1))
            ) * 0.55;
            vec2 q = pos + drift;
            float curl = sin(q.x * 2.1 + t * (0.7 + fi * 0.25)) * cos(q.y * 2.1 - t * (0.55 + fi * 0.2));
            curl += cos(q.x * 3.3 - q.y * 2.7 + t * 0.85) * 0.45;
            h += curl * amp;

            pos = rot * pos * 1.85 + vec2(t * 0.06, -t * 0.04);
            amp *= 0.5;
          }
          return h;
        }

        vec2 fluidGradient(vec2 p, float t, out float outOcc) {
          vec2 dxy = vec2(0.0);
          float occAcc = 0.0;
          float dBase = fluidPotential(p, t, 4);

          for (int s = 0; s < 3; s++) {
            float scale = float(s);
            float stepDist = (s == 0) ? 0.9 : (s == 1) ? 2.2 : 5.0;
            float weight = 1.0 / pow(1.8, scale + 1.0);

            float d_e  = fluidPotential(p + vec2( stepDist, 0.0), t, s + 2);
            float d_w  = fluidPotential(p + vec2(-stepDist, 0.0), t, s + 2);
            float d_n  = fluidPotential(p + vec2(0.0,  stepDist), t, s + 2);
            float d_s  = fluidPotential(p + vec2(0.0, -stepDist), t, s + 2);

            float d_ne = fluidPotential(p + vec2( stepDist,  stepDist) * 0.7071, t, s + 2);
            float d_nw = fluidPotential(p + vec2(-stepDist,  stepDist) * 0.7071, t, s + 2);
            float d_se = fluidPotential(p + vec2( stepDist, -stepDist) * 0.7071, t, s + 2);
            float d_sw = fluidPotential(p + vec2(-stepDist, -stepDist) * 0.7071, t, s + 2);

            vec2 grad = vec2(
              0.5 * (d_e - d_w) + 0.25 * (d_ne - d_nw + d_se - d_sw),
              0.5 * (d_n - d_s) + 0.25 * (d_ne + d_nw - d_se - d_sw)
            ) / stepDist;

            dxy += grad * weight;
            float dCoarse = (d_e + d_w + d_n + d_s) * 0.25;
            occAcc += clamp(dBase - dCoarse, -2.0, 2.0) / pow(1.5, scale + 1.0);
          }

          outOcc = pow(max(0.0, clamp(occAcc * 0.45 + 0.5, 0.15, 0.95)), 0.6);
          return dxy / 3.0;
        }

        float ggxBRDF(vec3 n, vec3 v, vec3 l, float roughness, float f0) {
          vec3 h = normalize(v + l);
          float NdotH = clamp(dot(n, h), 0.0, 1.0);
          float NdotV = clamp(dot(n, v), 0.001, 1.0);
          float NdotL = clamp(dot(n, l), 0.0, 1.0);
          float VdotH = clamp(dot(v, h), 0.0, 1.0);

          float alpha = roughness * roughness;
          float alpha2 = alpha * alpha;

          float denom = NdotH * NdotH * (alpha2 - 1.0) + 1.0;
          float D = alpha2 / (3.14159265 * denom * denom + 0.00001);

          float F = f0 + (1.0 - f0) * pow(1.0 - VdotH, 5.0);

          float k = alpha * 0.5;
          float G1_V = NdotV / (NdotV * (1.0 - k) + k);
          float G1_L = NdotL / (NdotL * (1.0 - k) + k);
          float G = G1_V * G1_L;

          return (D * F * G) / (4.0 * NdotV * NdotL + 0.0001);
        }

        float logSpecular(float spec) {
          const float LOG_SPEC = 1000.0;
          return (log(LOG_SPEC + 1.0) / LOG_SPEC) * log(1.0 + LOG_SPEC * spec);
        }

        void main() {
          float occ = 1.0;
          vec2 dxy = fluidGradient(vWorldPos.xz, uTime, occ);

          // Normal estimation from multiscale gradient
          float bump = 2.2;
          vec3 normal = normalize(vec3(-dxy.x * bump, 1.0, -dxy.y * bump));

          // Viewing & lighting vectors
          vec3 vDir = normalize(uCameraPos - vWorldPos);
          vec3 lDir = normalize(vec3(0.35, 0.85, -0.4));
          vec3 skyLDir = normalize(vec3(-0.4, 0.9, 0.3));

          // GGX Specular with logarithmic highlight compression
          float spec1 = logSpecular(ggxBRDF(normal, vDir, lDir, 0.12, 0.08));
          float spec2 = logSpecular(ggxBRDF(normal, vDir, skyLDir, 0.26, 0.04)) * 0.4;
          float totalSpec = spec1 + spec2;

          // Velocity field from orthogonal stream gradient
          vec2 vel = vec2(-dxy.y, dxy.x) * 3.6;
          float speed = length(vel);

          // Atmospheric palette
          vec3 deepBase = uColor;
          vec3 currentTeal = vec3(0.08, 0.32, 0.44);
          vec3 shallowAqua = vec3(0.18, 0.62, 0.74);
          vec3 foamGlint = vec3(0.65, 0.92, 1.0);

          vec3 diffuse = mix(deepBase, currentTeal, clamp(speed * 1.6, 0.0, 1.0));
          diffuse = mix(diffuse, shallowAqua, smoothstep(0.38, 0.85, speed));
          diffuse = mix(diffuse, foamGlint, smoothstep(0.7, 1.1, speed + dxy.x * 0.4) * 0.35);

          // Cornus Ammonis specular & diffuse blending
          vec3 col = diffuse + 3.8 * mix(vec3(totalSpec), 1.6 * diffuse * totalSpec, 0.35);

          // Multiscale occlusion
          col = mix(vec3(1.0), vec3(occ), 0.65) * col;

          // Film contrast
          col = clamp((col - 0.5) * 1.3 + 0.5, 0.0, 1.0);

          // Distance atmospheric fog
          float dist = length(uCameraPos - vWorldPos);
          float fogFactor = 1.0 - exp(-pow(dist * 0.0018, 2.0));
          col = mix(col, vec3(0.02, 0.05, 0.08), fogFactor);

          gl_FragColor = vec4(col, 0.94);
        }
      `,
      transparent: true,
    });
    sceneRefs.current.oceanMat = oceanMat;
    const ocean = new THREE.Mesh(oceanGeo, oceanMat);
    ocean.position.y = -2;
    scene.add(ocean);

    // Global Earth Group (Planetary Climate Teleconnection Model)
    const earthGroup = new THREE.Group();
    earthGroup.position.set(1000, 300, 0); // Offset away from mountain basin
    scene.add(earthGroup);

    // Primary Earth Sphere Geometry
    const earthGeo = new THREE.SphereGeometry(132, 64, 64);
    const earthMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uTemp: { value: scenarioTemp || getTempAt(year) }
      },
      vertexShader: `
        uniform float uTime;
        uniform float uTemp;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPos;
        
        // Simplex noise function
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
        float snoise(vec3 v) {
          const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
          const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
          vec3 i  = floor(v + dot(v, C.yyy) );
          vec3 x0 = v - i + dot(i, C.xxx) ;
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min( g.xyz, l.zxy );
          vec3 i2 = max( g.xyz, l.zxy );
          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;
          i = mod289(i);
          vec4 p = permute( permute( permute(
                     i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                   + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
                   + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
          float n_ = 0.142857142857;
          vec3  ns = n_ * D.wyz - D.xzx;
          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_ );
          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          vec4 b0 = vec4( x.xy, y.xy );
          vec4 b1 = vec4( x.zw, y.zw );
          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
          vec3 p0 = vec3(a0.xy,h.x);
          vec3 p1 = vec3(a0.zw,h.y);
          vec3 p2 = vec3(a1.xy,h.z);
          vec3 p3 = vec3(a1.zw,h.w);
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
        }

        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vPos = position;
          
          float severity = clamp((uTemp - 1.0) / 2.0, 0.0, 1.0); 
          float n = snoise(position * 0.03 + uTime * 0.1);
          
          // Gentle vertex displacement proportional to thermal anomalies
          vec3 displacedPos = position + normal * (n * severity * 4.0);
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uTemp;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPos;

        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
        float snoise(vec3 v) {
          const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
          const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
          vec3 i  = floor(v + dot(v, C.yyy) );
          vec3 x0 = v - i + dot(i, C.xxx) ;
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min( g.xyz, l.zxy );
          vec3 i2 = max( g.xyz, l.zxy );
          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;
          i = mod289(i);
          vec4 p = permute( permute( permute(
                     i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                   + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
                   + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
          float n_ = 0.142857142857;
          vec3  ns = n_ * D.wyz - D.xzx;
          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_ );
          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          vec4 b0 = vec4( x.xy, y.xy );
          vec4 b1 = vec4( x.zw, y.zw );
          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
          vec3 p0 = vec3(a0.xy,h.x);
          vec3 p1 = vec3(a0.zw,h.y);
          vec3 p2 = vec3(a1.xy,h.z);
          vec3 p3 = vec3(a1.zw,h.w);
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
        }
        
        void main() {
          vec3 normPos = normalize(vPos);
          float severity = clamp((uTemp - 1.0) / 2.0, 0.0, 1.0); 

          // Spherical latitude and longitude coordinates
          float lat = asin(clamp(normPos.y, -1.0, 1.0));
          float lon = atan(normPos.z, normPos.x);

          // Continents: Multi-octave procedural continents
          float c1 = snoise(normPos * 1.85);
          float c2 = snoise(normPos * 3.8);
          float c3 = snoise(normPos * 7.5);
          float continentShape = c1 * 0.65 + c2 * 0.28 + c3 * 0.12;

          // Latitudinal bias for Northern landmasses & Antarctica
          continentShape += smoothstep(0.05, 0.65, normPos.y) * 0.14;
          if (normPos.y < -0.72) continentShape += 0.38;

          float isLand = smoothstep(0.04, 0.12, continentShape);
          float isCoast = smoothstep(0.02, 0.05, continentShape) * (1.0 - smoothstep(0.12, 0.18, continentShape));

          // Polar Ice Caps: Melt and shrink dynamically with temperature
          float polarThreshold = 0.86 - (1.0 - severity) * 0.14; // 0.72 at 1C, 0.86 at 3C
          float isIce = smoothstep(polarThreshold, polarThreshold + 0.07, abs(normPos.y));

          // Base Oceanic Palette: Deep Indigo to Marine Cyan
          vec3 deepOcean = vec3(0.02, 0.08, 0.14);
          vec3 shallowOcean = vec3(0.05, 0.18, 0.28);
          float oceanDepth = smoothstep(-0.4, 0.04, continentShape);
          vec3 oceanCol = mix(deepOcean, shallowOcean, oceanDepth);

          // Land Palette: Dark Scientific Slate
          vec3 landBase = vec3(0.08, 0.17, 0.22);
          vec3 landHigh = vec3(0.13, 0.26, 0.30);
          vec3 landCol = mix(landBase, landHigh, smoothstep(0.15, 0.45, continentShape));

          // Polar Ice Color: Luminous Crystalline Frost
          vec3 iceCol = vec3(0.85, 0.95, 1.0);

          // Cybernetic Latitude / Longitude Lines
          float latGrid = step(0.965, fract(lat * 8.0 / 3.14159));
          float lonGrid = step(0.965, fract((lon / 6.28318) * 16.0));
          float grid = max(latGrid, lonGrid);

          // Dynamic Thermal Heat Anomaly Plumes
          float heatFlow = sin(lat * 3.0 + uTime * 0.5) * cos(lon * 2.5 - uTime * 0.3) * 0.5 + 0.5;
          heatFlow += snoise(normPos * 3.0 + vec3(uTime * 0.15)) * 0.35;
          float heatMask = smoothstep(0.40, 0.88, heatFlow) * severity * (1.0 - isIce * 0.8);

          // Assemble Surface Color
          vec3 col = mix(oceanCol, landCol, isLand);
          col = mix(col, iceCol, isIce * (1.0 - severity * 0.45));

          // Coastline luminous cyan trace
          col += vec3(0.25, 0.75, 0.95) * isCoast * 0.65;

          // Lat/Long telemetry grid lines
          vec3 gridCol = mix(vec3(0.14, 0.48, 0.68), vec3(0.92, 0.42, 0.18), severity);
          col += gridCol * grid * 0.35;

          // Thermal Heat Waves (fiery coral to emergency red)
          vec3 hotPlume = mix(vec3(0.95, 0.45, 0.12), vec3(1.0, 0.15, 0.05), severity);
          col = mix(col, hotPlume, heatMask * 0.85);

          // Atmospheric Fresnel Rim Glow
          float rim = 1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0);
          rim = pow(rim, 2.2);
          vec3 rimCol = mix(vec3(0.2, 0.65, 0.95), vec3(1.0, 0.35, 0.12), severity);
          col += rimCol * rim * 1.5;

          gl_FragColor = vec4(col, 0.98);
        }
      `,
      transparent: true,
    });

    const earth = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earth);
    sceneRefs.current.earthMat = earthMat;
    sceneRefs.current.earthMesh = earth;

    // Atmospheric Fresnel Glow Outer Sphere
    const atmoGeo = new THREE.SphereGeometry(138, 48, 48);
    const atmoMat = new THREE.ShaderMaterial({
      uniforms: {
        uTemp: { value: scenarioTemp || getTempAt(year) },
      },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTemp;
        varying vec3 vNormal;
        void main() {
          float severity = clamp((uTemp - 1.0) / 2.0, 0.0, 1.0);
          float intensity = pow(0.72 - dot(vNormal, vec3(0, 0, 1.0)), 2.8);
          vec3 atmoCol = mix(vec3(0.15, 0.65, 0.95), vec3(1.0, 0.35, 0.15), severity);
          gl_FragColor = vec4(atmoCol, intensity * 0.85);
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
    });
    const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
    earthGroup.add(atmoMesh);
    sceneRefs.current.earthAtmosphere = atmoMesh;

    // Planetary Cryosphere Tipping Point Nodes & Teleconnection Arcs
    const tippingPoints = [
      { name: 'Langtang Lirung / Trishuli (Nepal 2026 Flood)', lat: 28.25, lon: 85.51, color: 0x38bdf8 },
      { name: 'Arctic Sea Ice', lat: 80.0, lon: 0.0, color: 0x67e8f9 },
      { name: 'Greenland Ice Sheet', lat: 72.0, lon: -40.0, color: 0x93c5fd },
      { name: 'Antarctic Ice Sheet (Thwaites)', lat: -75.0, lon: -106.0, color: 0xa5f3fc },
      { name: 'AMOC Atlantic Conveyor', lat: 45.0, lon: -35.0, color: 0xf59e0b },
    ];

    const latLonToVector3 = (lat: number, lon: number, radius: number) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      );
    };

    const nodeGeo = new THREE.SphereGeometry(2.4, 16, 16);
    tippingPoints.forEach((tp) => {
      const pos = latLonToVector3(tp.lat, tp.lon, 133);
      const nodeMat = new THREE.MeshBasicMaterial({
        color: tp.color,
        transparent: true,
        opacity: 0.95,
      });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.copy(pos);
      earth.add(nodeMesh);

      // Outer radar pulse ring around each tipping point node
      const ringGeo = new THREE.RingGeometry(3.5, 4.8, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: tp.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.65,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(pos);
      ringMesh.lookAt(new THREE.Vector3(0, 0, 0));
      earth.add(ringMesh);
    });

    // Great Circle Teleconnection Data Arcs from Langtang to Polar Tipping Points
    const langtangPos = latLonToVector3(28.25, 85.51, 133);
    tippingPoints.slice(1).forEach((dest) => {
      const destPos = latLonToVector3(dest.lat, dest.lon, 133);
      const midPoint = langtangPos.clone().add(destPos).multiplyScalar(0.5);
      const midLen = midPoint.length();
      midPoint.normalize().multiplyScalar(midLen + 28); // Elevated arc curve

      const curve = new THREE.QuadraticBezierCurve3(langtangPos, midPoint, destPos);
      const curvePoints = curve.getPoints(40);
      const arcGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
      const arcMat = new THREE.LineBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.55,
        linewidth: 1.5,
      });
      const arcLine = new THREE.Line(arcGeo, arcMat);
      earth.add(arcLine);
    });

    // Coastal City (Abstract Data-Driven Representation)
    const cityOffset = new THREE.Vector3(-1000, 0, 0);
    const numBuildings = 800;
    const buildingGeo = new THREE.BoxGeometry(2, 1, 2);
    // Center geometry so scaling Y scales upwards from bottom
    buildingGeo.translate(0, 0.5, 0);
    const buildingMat = new THREE.MeshBasicMaterial({ 
      color: 0x228899,
      transparent: true,
      opacity: 0.6,
      wireframe: true
    });
    
    const cityMesh = new THREE.InstancedMesh(buildingGeo, buildingMat, numBuildings);
    const dummy = new THREE.Object3D();
    const buildingHeights: number[] = [];
    
    for (let i = 0; i < numBuildings; i++) {
      // Gaussian-ish distribution around center
      const r = Math.pow(Math.random(), 2) * 150;
      const theta = Math.random() * Math.PI * 2;
      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;
      
      // Central business district is taller
      const heightBase = Math.max(1, 50 - (r * 0.3));
      const height = heightBase * (0.2 + Math.random() * 0.8) + (Math.random() * 5);
      buildingHeights.push(height);
      
      dummy.position.set(x + cityOffset.x, -2, z + cityOffset.z);
      dummy.scale.set(1 + Math.random()*2, height, 1 + Math.random()*2);
      dummy.updateMatrix();
      cityMesh.setMatrixAt(i, dummy.matrix);
    }
    scene.add(cityMesh);
    
    // Add a specific water plane for the city to handle sea level rise visually
    const cityWaterGeo = new THREE.PlaneGeometry(600, 600, 1, 1);
    const cityWaterMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uCameraPos: { value: new THREE.Vector3(-1000, 60, 200) },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldPos;
        void main() {
          vUv = uv;
          vec4 world = modelMatrix * vec4(position, 1.0);
          vWorldPos = world.xyz;
          gl_Position = projectionMatrix * viewMatrix * world;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uCameraPos;
        varying vec2 vUv;
        varying vec3 vWorldPos;

        // Multiscale fluid dynamics & GGX microfacet specular
        float fluidPotential(vec2 p, float t, int maxOctaves) {
          float h = 0.0;
          float amp = 1.0;
          float freq = 0.028;
          mat2 rot = mat2(0.866, -0.5, 0.5, 0.866);
          vec2 pos = p * freq;

          for (int i = 0; i < 4; i++) {
            if (i >= maxOctaves) break;
            float fi = float(i);
            vec2 drift = vec2(
              sin(pos.y * 1.5 + t * (0.4 + fi * 0.12)),
              cos(pos.x * 1.5 - t * (0.35 + fi * 0.1))
            ) * 0.55;
            vec2 q = pos + drift;
            float curl = sin(q.x * 2.1 + t * (0.75 + fi * 0.25)) * cos(q.y * 2.1 - t * (0.6 + fi * 0.2));
            curl += cos(q.x * 3.3 - q.y * 2.7 + t * 0.85) * 0.45;
            h += curl * amp;

            pos = rot * pos * 1.85 + vec2(t * 0.06, -t * 0.04);
            amp *= 0.5;
          }
          return h;
        }

        vec2 fluidGradient(vec2 p, float t, out float outOcc) {
          vec2 dxy = vec2(0.0);
          float occAcc = 0.0;
          float dBase = fluidPotential(p, t, 4);

          for (int s = 0; s < 3; s++) {
            float scale = float(s);
            float stepDist = (s == 0) ? 0.9 : (s == 1) ? 2.2 : 5.0;
            float weight = 1.0 / pow(1.8, scale + 1.0);

            float d_e  = fluidPotential(p + vec2( stepDist, 0.0), t, s + 2);
            float d_w  = fluidPotential(p + vec2(-stepDist, 0.0), t, s + 2);
            float d_n  = fluidPotential(p + vec2(0.0,  stepDist), t, s + 2);
            float d_s  = fluidPotential(p + vec2(0.0, -stepDist), t, s + 2);

            float d_ne = fluidPotential(p + vec2( stepDist,  stepDist) * 0.7071, t, s + 2);
            float d_nw = fluidPotential(p + vec2(-stepDist,  stepDist) * 0.7071, t, s + 2);
            float d_se = fluidPotential(p + vec2( stepDist, -stepDist) * 0.7071, t, s + 2);
            float d_sw = fluidPotential(p + vec2(-stepDist, -stepDist) * 0.7071, t, s + 2);

            vec2 grad = vec2(
              0.5 * (d_e - d_w) + 0.25 * (d_ne - d_nw + d_se - d_sw),
              0.5 * (d_n - d_s) + 0.25 * (d_ne + d_nw - d_se - d_sw)
            ) / stepDist;

            dxy += grad * weight;
            float dCoarse = (d_e + d_w + d_n + d_s) * 0.25;
            occAcc += clamp(dBase - dCoarse, -2.0, 2.0) / pow(1.5, scale + 1.0);
          }

          outOcc = pow(max(0.0, clamp(occAcc * 0.45 + 0.5, 0.15, 0.95)), 0.6);
          return dxy / 3.0;
        }

        float ggxBRDF(vec3 n, vec3 v, vec3 l, float roughness, float f0) {
          vec3 h = normalize(v + l);
          float NdotH = clamp(dot(n, h), 0.0, 1.0);
          float NdotV = clamp(dot(n, v), 0.001, 1.0);
          float NdotL = clamp(dot(n, l), 0.0, 1.0);
          float VdotH = clamp(dot(v, h), 0.0, 1.0);

          float alpha = roughness * roughness;
          float alpha2 = alpha * alpha;

          float denom = NdotH * NdotH * (alpha2 - 1.0) + 1.0;
          float D = alpha2 / (3.14159265 * denom * denom + 0.00001);

          float F = f0 + (1.0 - f0) * pow(1.0 - VdotH, 5.0);

          float k = alpha * 0.5;
          float G1_V = NdotV / (NdotV * (1.0 - k) + k);
          float G1_L = NdotL / (NdotL * (1.0 - k) + k);
          float G = G1_V * G1_L;

          return (D * F * G) / (4.0 * NdotV * NdotL + 0.0001);
        }

        float logSpecular(float spec) {
          const float LOG_SPEC = 1000.0;
          return (log(LOG_SPEC + 1.0) / LOG_SPEC) * log(1.0 + LOG_SPEC * spec);
        }

        void main() {
          float occ = 1.0;
          vec2 dxy = fluidGradient(vWorldPos.xz, uTime, occ);

          // Normal estimation from multiscale gradient
          float bump = 2.4;
          vec3 normal = normalize(vec3(-dxy.x * bump, 1.0, -dxy.y * bump));

          // Viewing & lighting vectors
          vec3 vDir = normalize(uCameraPos - vWorldPos);
          vec3 lDir = normalize(vec3(0.35, 0.85, -0.4));
          vec3 skyLDir = normalize(vec3(-0.4, 0.9, 0.3));

          // GGX Specular with logarithmic highlight compression
          float spec1 = logSpecular(ggxBRDF(normal, vDir, lDir, 0.11, 0.08));
          float spec2 = logSpecular(ggxBRDF(normal, vDir, skyLDir, 0.25, 0.04)) * 0.4;
          float totalSpec = spec1 + spec2;

          // Velocity field
          vec2 vel = vec2(-dxy.y, dxy.x) * 3.8;
          float speed = length(vel);

          // Deep coastal palette
          vec3 deepOcean = vec3(0.02, 0.1, 0.16);
          vec3 surgeTeal = vec3(0.06, 0.35, 0.48);
          vec3 crestCyan = vec3(0.15, 0.72, 0.86);
          vec3 foamBright = vec3(0.7, 0.95, 1.0);

          vec3 diffuse = mix(deepOcean, surgeTeal, clamp(speed * 1.5, 0.0, 1.0));
          diffuse = mix(diffuse, crestCyan, smoothstep(0.35, 0.8, speed));
          diffuse = mix(diffuse, foamBright, smoothstep(0.68, 1.05, speed + dxy.x * 0.4) * 0.35);

          // Submerged luminous street grid caustics
          float gridX = abs(fract(vWorldPos.x * 0.25) - 0.5) * 2.0;
          float gridZ = abs(fract(vWorldPos.z * 0.25) - 0.5) * 2.0;
          float streetGrid = step(0.92, max(gridX, gridZ));
          diffuse += vec3(0.1, 0.45, 0.6) * streetGrid * 0.25;

          // Cornus Ammonis specular & diffuse blending
          vec3 col = diffuse + 3.8 * mix(vec3(totalSpec), 1.6 * diffuse * totalSpec, 0.35);

          // Multiscale occlusion
          col = mix(vec3(1.0), vec3(occ), 0.65) * col;

          // Film contrast
          col = clamp((col - 0.5) * 1.3 + 0.5, 0.0, 1.0);

          // Radial edge fade for smooth horizon blend
          float edgeFade = 1.0 - smoothstep(0.38, 0.49, length(vUv - 0.5));

          gl_FragColor = vec4(col, 0.88 * edgeFade);
        }
      `,
      transparent: true,
      depthWrite: false,
    });
    const cityWater = new THREE.Mesh(cityWaterGeo, cityWaterMat);
    cityWater.rotation.x = -Math.PI / 2;
    cityWater.position.copy(cityOffset);
    cityWater.position.y = -2;
    scene.add(cityWater);
    
    // We attach cityWater to a ref to update its Y position based on seaLevelOffset
    sceneRefs.current.cityWater = cityWater;
    sceneRefs.current.cityWaterMat = cityWaterMat;

    // Wind Particles
    const windCount = 3500;
    const windGeo = new THREE.BufferGeometry();
    const windPositions = new Float32Array(windCount * 3);
    const windSeeds = new Float32Array(windCount);
    for (let i = 0; i < windCount; i++) {
      windPositions[i * 3] = (Math.random() - 0.5) * 700;
      windPositions[i * 3 + 1] = 20 + Math.random() * 140;
      windPositions[i * 3 + 2] = (Math.random() - 0.5) * 700;
      windSeeds[i] = Math.random();
    }
    windGeo.setAttribute('position', new THREE.BufferAttribute(windPositions, 3));
    windGeo.setAttribute('seed', new THREE.BufferAttribute(windSeeds, 1));

    const windMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uDeflect: { value: new THREE.Vector2(0, 0) },
        uIntensity: { value: 0.6 },
        uTemp: { value: getTempAt(year) },
      },
      vertexShader: `
        attribute float seed;
        uniform float uTime;
        uniform vec2 uDeflect;
        uniform float uIntensity;
        uniform float uTemp;
        varying float vAlpha;
        varying float vHeat;

        void main() {
          vec3 p = position;
          float t = uTime * (0.15 + seed * 0.4);

          float bandSpeed = 8.0 + seed * 24.0 + uTemp * 4.0;
          p.x += mod(t * bandSpeed + seed * 700.0, 700.0) - 350.0;
          p.y += sin(t * 0.6 + seed * 6.28) * 6.0;
          p.z += cos(t * 0.4 + seed * 6.28) * 12.0;

          float altFactor = smoothstep(20.0, 80.0, position.y) * (1.0 - smoothstep(120.0, 200.0, position.y));
          p.x += uDeflect.x * 40.0 * altFactor;
          p.y += uDeflect.y * 40.0 * altFactor;

          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = (1.5 + seed * 2.4) * (200.0 / -mv.z);
          gl_Position = projectionMatrix * mv;

          vAlpha = 0.3 + 0.4 * uIntensity;
          vHeat = smoothstep(0.5, 1.8, uTemp);
        }
      `,
      fragmentShader: `
        varying float vAlpha;
        varying float vHeat;
        void main() {
          vec2 c = gl_PointCoord - 0.5;
          float d = length(c);
          if (d > 0.5) discard;
          float a = smoothstep(0.5, 0.0, d) * vAlpha;
          vec3 col = mix(vec3(0.5, 0.75, 0.9), vec3(1.0, 0.6, 0.35), vHeat);
          gl_FragColor = vec4(col, a);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    sceneRefs.current.windMat = windMat;
    const windPoints = new THREE.Points(windGeo, windMat);
    scene.add(windPoints);

    // Rain Particles
    const rainCount = 4000;
    const rainGeo = new THREE.BufferGeometry();
    const rainPositions = new Float32Array(rainCount * 3);
    const rainSeeds = new Float32Array(rainCount);
    for (let i = 0; i < rainCount; i++) {
      rainPositions[i * 3] = (Math.random() - 0.5) * 400;
      rainPositions[i * 3 + 1] = 20 + Math.random() * 200;
      rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 400;
      rainSeeds[i] = Math.random();
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
    rainGeo.setAttribute('seed', new THREE.BufferAttribute(rainSeeds, 1));

    const rainMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uIntensity: { value: 0 },
      },
      vertexShader: `
        attribute float seed;
        uniform float uTime;
        uniform float uIntensity;
        varying float vAlpha;
        void main() {
          vec3 p = position;
          float fallSpeed = 55.0 + seed * 30.0;
          float y = mod(position.y - uTime * fallSpeed + seed * 220.0, 220.0);
          p.y = y - 10.0;
          p.x += sin(uTime * 0.4 + seed * 6.28) * 3.0;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = (1.2 + seed * 1.5) * (140.0 / -mv.z) * uIntensity;
          gl_Position = projectionMatrix * mv;
          vAlpha = uIntensity;
        }
      `,
      fragmentShader: `
        varying float vAlpha;
        void main() {
          vec2 c = gl_PointCoord - 0.5;
          float d = length(c);
          if (d > 0.5) discard;
          gl_FragColor = vec4(0.7, 0.85, 1.0, smoothstep(0.5, 0.0, d) * vAlpha * 0.85);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    sceneRefs.current.rainMat = rainMat;
    const rainPoints = new THREE.Points(rainGeo, rainMat);
    scene.add(rainPoints);

    // Flood Particles - High-Realism GPGPU-inspired Multi-Phase Hydraulic Deluge
    const floodCount = 36000;
    const floodGeo = new THREE.BufferGeometry();
    const floodPositions = new Float32Array(floodCount * 3);
    const floodSeeds = new Float32Array(floodCount);
    const floodPhases = new Float32Array(floodCount);

    for (let i = 0; i < floodCount; i++) {
      // Valley corridor distribution
      floodPositions[i * 3] = (Math.random() - 0.5) * 50;
      floodPositions[i * 3 + 1] = Math.random() * 8;
      floodPositions[i * 3 + 2] = (Math.random() - 0.5) * 580;
      floodSeeds[i] = Math.random();

      // Multi-phase classification:
      // 0: Torrent Core (45%), 1: Hydraulic Bore Wavefront (25%), 2: Airborne Mist/Spray (20%), 3: Moraine Silt/Debris (10%)
      const r = Math.random();
      if (r < 0.45) {
        floodPhases[i] = 0.0;
      } else if (r < 0.70) {
        floodPhases[i] = 1.0;
      } else if (r < 0.90) {
        floodPhases[i] = 2.0;
      } else {
        floodPhases[i] = 3.0;
      }
    }

    floodGeo.setAttribute('position', new THREE.BufferAttribute(floodPositions, 3));
    floodGeo.setAttribute('seed', new THREE.BufferAttribute(floodSeeds, 1));
    floodGeo.setAttribute('phase', new THREE.BufferAttribute(floodPhases, 1));

    const floodMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uFloodProgress: { value: 0 },
        uActive: { value: 0 },
      },
      vertexShader: `
        attribute float seed;
        attribute float phase;
        uniform float uTime;
        uniform float uFloodProgress;
        uniform float uActive;
        varying float vAlpha;
        varying float vPhase;
        varying float vAeration;
        varying float vSpeed;

        // Simplex 3D noise for physical curl/vorticity simulation
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

        float snoise(vec3 v) {
          const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
          vec3 i  = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);
          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;
          i = mod289(i);
          vec4 p = permute(permute(permute(
                    i.z + vec4(0.0, i1.z, i2.z, 1.0))
                  + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                  + i.x + vec4(0.0, i1.x, i2.x, 1.0));
          float n_ = 0.142857142857;
          vec3 ns = n_ * D.wyz - D.xzx;
          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);
          vec4 x = x_ * ns.x + ns.yyyy;
          vec4 y = y_ * ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);
          vec4 s0 = floor(b0) * 2.0 + 1.0;
          vec4 s1 = floor(b1) * 2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
          vec3 p0 = vec3(a0.xy, h.x);
          vec3 p1 = vec3(a0.zw, h.y);
          vec3 p2 = vec3(a1.xy, h.z);
          vec3 p3 = vec3(a1.zw, h.w);
          vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
          p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
          vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
        }

        // 3D Curl Noise for rotational fluid vorticity and turbulent boiling
        vec3 computeCurl(vec3 p, float t) {
          float eps = 0.8;
          vec3 dx = vec3(eps, 0.0, 0.0);
          vec3 dy = vec3(0.0, eps, 0.0);
          vec3 dz = vec3(0.0, 0.0, eps);

          float n1 = snoise(p * 0.04 + vec3(0.0, t * 0.4, 0.0));
          float n2 = snoise(p * 0.04 + vec3(13.5, 0.0, t * 0.4));
          float n3 = snoise(p * 0.04 + vec3(0.0, 27.2, t * 0.35));

          float dFydz = (snoise((p + dz) * 0.04) - snoise((p - dz) * 0.04)) / (2.0 * eps);
          float dFzdy = (snoise((p + dy) * 0.04) - snoise((p - dy) * 0.04)) / (2.0 * eps);
          float dFzdx = (snoise((p + dx) * 0.04) - snoise((p - dx) * 0.04)) / (2.0 * eps);
          float dFxdz = (snoise((p + dz) * 0.04) - snoise((p - dz) * 0.04)) / (2.0 * eps);
          float dFxdy = (snoise((p + dy) * 0.04) - snoise((p - dy) * 0.04)) / (2.0 * eps);
          float dFydx = (snoise((p + dx) * 0.04) - snoise((p - dx) * 0.04)) / (2.0 * eps);

          return vec3(dFzdy - dFydz, dFxdz - dFzdx, dFydx - dFxdy);
        }

        void main() {
          vec3 p = position;
          vPhase = phase;

          // Valley gorge morphology (analytical trajectory through steep Himalayas)
          float zFront = (uFloodProgress - 0.5) * 520.0;
          float valleyX = sin(p.z * 0.012) * 19.0 + sin(p.z * 0.032) * 6.5;
          float valleyWidth = 24.0 + sin(p.z * 0.009) * 8.0;

          // Distance relative to the surging hydraulic bore wavefront
          float distToFront = zFront - p.z;
          float leadDist = abs(p.z / 520.0 + 0.5 - uFloodProgress);
          float atCrest = smoothstep(24.0, 0.0, abs(distToFront));
          float behindCrest = smoothstep(-10.0, 25.0, distToFront) * (1.0 - smoothstep(140.0, 360.0, distToFront));

          // Physical flow advection velocity down the mountain gradient
          float surgeSpeed = (phase == 0.0) ? 38.0 : (phase == 1.0) ? 46.0 : (phase == 2.0) ? 52.0 : 28.0;
          float flowOffset = mod(uTime * surgeSpeed + seed * 300.0, max(1.0, distToFront + 40.0));
          p.z = zFront - flowOffset;

          // Recalculate valley position along the flow
          valleyX = sin(p.z * 0.012) * 19.0 + sin(p.z * 0.032) * 6.5;

          // 3D Curl noise field for hydraulic turbulence
          vec3 curl = computeCurl(p, uTime);

          // Phase-specific physical behavior:
          float aeration = 0.0;
          float ptSize = 1.0;
          float alphaFactor = 1.0;

          if (phase < 0.5) {
            // PHASE 0: Deep Hydrodynamic Torrent Core (Heavy raging water)
            p.x = valleyX + (position.x * 0.5) + curl.x * 4.0;
            p.y = -1.5 + abs(curl.y) * 3.5 + sin(uTime * 5.0 + seed * 12.0) * 1.2;
            aeration = clamp(length(curl) * 0.6, 0.1, 0.7);
            ptSize = 4.5 + seed * 3.5;
            alphaFactor = 0.85;
          } else if (phase < 1.5) {
            // PHASE 1: Hydraulic Bore Wavefront (Aerated breaking crest wall)
            p.x = valleyX + position.x * 1.2 + curl.x * 8.0;
            float crestLift = atCrest * (16.0 + seed * 12.0);
            p.y = -0.5 + crestLift + abs(curl.y) * 6.0;
            aeration = 0.85 + atCrest * 0.15;
            ptSize = 6.0 + atCrest * 10.0 + seed * 5.0;
            alphaFactor = 0.95;
          } else if (phase < 2.5) {
            // PHASE 2: Airborne Atomized Spray & Mist Plumes (Blown by violent updrafts)
            p.x = valleyX + position.x * 1.8 + curl.x * 14.0 + sin(uTime * 2.0 + seed * 6.0) * 6.0;
            float sprayAscent = atCrest * (26.0 + seed * 20.0) + abs(curl.y) * 10.0;
            p.y = 1.0 + sprayAscent + sin(uTime * 4.0 + seed * 18.0) * 4.0;
            aeration = 0.95;
            ptSize = 8.0 + seed * 8.0 + atCrest * 12.0;
            alphaFactor = 0.55;
          } else {
            // PHASE 3: Suspended Moraine Sediment & Rock Debris Silt
            p.x = valleyX + position.x * 0.6 + curl.x * 2.5;
            p.y = -2.2 + abs(curl.y) * 2.0;
            aeration = 0.15;
            ptSize = 3.5 + seed * 3.0;
            alphaFactor = 0.75;
          }

          // Elevation along canyon slope
          p.y += -p.z * 0.04;

          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = ptSize * (260.0 / -mv.z) * uActive;
          gl_Position = projectionMatrix * mv;

          vAlpha = clamp(behindCrest * 1.4, 0.0, 1.0) * alphaFactor * uActive;
          vAeration = aeration;
          vSpeed = clamp(length(curl) * 0.8 + atCrest * 0.5, 0.0, 1.0);
        }
      `,
      fragmentShader: `
        varying float vAlpha;
        varying float vPhase;
        varying float vAeration;
        varying float vSpeed;

        void main() {
          vec2 c = gl_PointCoord - 0.5;
          float d = length(c);
          if (d > 0.5) discard;

          // Soft Gaussian fluid droplet profile with brilliant specular glint center
          float softEdge = smoothstep(0.5, 0.0, d);
          float specularCore = smoothstep(0.2, 0.0, d);

          // Multi-phase color synthesis:
          // Core: Deep glacial teal-slate
          vec3 deepGlacial = vec3(0.04, 0.26, 0.38);
          // Whitewater Aeration: Intense foaming crystalline froth
          vec3 whitewaterFroth = vec3(0.94, 0.98, 1.0);
          // Atmospheric Spray: Translucent mountain aqua mist
          vec3 sprayMist = vec3(0.72, 0.90, 0.98);
          // Moraine Sediment: Turbid alpine silt debris
          vec3 moraineDebris = vec3(0.42, 0.35, 0.28);

          vec3 baseColor;
          if (vPhase < 0.5) {
            baseColor = mix(deepGlacial, whitewaterFroth, vAeration * 0.6);
          } else if (vPhase < 1.5) {
            baseColor = mix(deepGlacial, whitewaterFroth, vAeration);
          } else if (vPhase < 2.5) {
            baseColor = sprayMist;
          } else {
            baseColor = mix(moraineDebris, deepGlacial, 0.35);
          }

          // Add bright specular glint on water droplets
          vec3 finalColor = baseColor + vec3(0.3, 0.45, 0.55) * specularCore * 0.65;

          gl_FragColor = vec4(finalColor, softEdge * vAlpha * 0.92);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    sceneRefs.current.floodMat = floodMat;
    const floodPoints = new THREE.Points(floodGeo, floodMat);
    scene.add(floodPoints);

    // Animation Render Loop
    let time = 0;
    const animate = () => {
      const dt = clock.getDelta();
      time += dt;

      // Smooth camera position with parallax offset
      sceneRefs.current.cameraParallax.lerp(sceneRefs.current.cameraParallaxDesired, 0.05);
      const camTargetPos = sceneRefs.current.cameraDesired.clone().add(sceneRefs.current.cameraParallax);
      camera.position.lerp(camTargetPos, 0.032);
      sceneRefs.current.cameraLookAt.lerp(sceneRefs.current.cameraLookAtDesired, 0.035);
      camera.lookAt(sceneRefs.current.cameraLookAt);

      // Attract mode auto-orbit (only when not viewing global earth or sea level)
      if (sceneRefs.current.act === 'attract' && !sceneRefs.current.globalActive && !sceneRefs.current.seaLevelActive) {
        const r = 180;
        const a = time * 0.04;
        sceneRefs.current.cameraDesired.set(
          Math.sin(a) * r,
          45 + Math.sin(time * 0.12) * 6,
          Math.cos(a) * r * 0.7
        );
        sceneRefs.current.cameraLookAtDesired.set(Math.sin(a * 1.1) * 30, 25, -30);

        // Attract Event Loop: Animate the Himalayan flood surge automatically on loop for passersby
        const loopDuration = 18.0;
        const loopTime = (time % loopDuration) / loopDuration;
        let attractWave = 0;
        if (loopTime < 0.6) {
          const p = loopTime / 0.6;
          attractWave = 1.0 - Math.pow(1.0 - p, 2.2);
        } else {
          attractWave = 0.0;
        }

        if (sceneRefs.current.terrainMat && sceneRefs.current.floodMat) {
          sceneRefs.current.terrainMat.uniforms.uFloodProgress.value = attractWave;
          sceneRefs.current.terrainMat.uniforms.uFloodPathAmp.value = attractWave > 0 ? 1.0 : 0.0;
          sceneRefs.current.floodMat.uniforms.uFloodProgress.value = attractWave;
          sceneRefs.current.floodMat.uniforms.uActive.value = attractWave > 0 ? 1.0 : 0.0;
        }
      }

      // Decay touch wave intensity gradually
      sceneRefs.current.touchIntensity *= 0.965;

      // Update uniforms
      if (terrainMat) {
        terrainMat.uniforms.uTime.value = time;
        terrainMat.uniforms.uCameraPos.value.copy(camera.position);
        terrainMat.uniforms.uTouchPos.value.copy(sceneRefs.current.touchWorldPos);
        terrainMat.uniforms.uTouchIntensity.value = sceneRefs.current.touchIntensity;
      }
      if (oceanMat) {
        oceanMat.uniforms.uTime.value = time;
        oceanMat.uniforms.uCameraPos.value.copy(camera.position);
      }
      if (starsMat) starsMat.uniforms.uTime.value = time;
      if (windMat) {
        windMat.uniforms.uTime.value = time;
        sceneRefs.current.windDeflect.multiplyScalar(0.985);
        windMat.uniforms.uDeflect.value.copy(sceneRefs.current.windDeflect);
      }
      if (rainMat) {
        rainMat.uniforms.uTime.value = time;
        sceneRefs.current.rainIntensity *= 0.995;
        rainMat.uniforms.uIntensity.value = sceneRefs.current.rainIntensity;
      }
      if (floodMat) floodMat.uniforms.uTime.value = time;
      
      // Interactive Earth Rotation with Inertia & Atmosphere Sync
      if (sceneRefs.current.earthMesh) {
        if (!sceneRefs.current.isDraggingGlobe) {
          // Continuous planetary axial spin + momentum damping
          sceneRefs.current.globeRotation.y += sceneRefs.current.globeVelocity.y + 0.0018;
          sceneRefs.current.globeRotation.x += sceneRefs.current.globeVelocity.x;
          sceneRefs.current.globeVelocity.y *= 0.94;
          sceneRefs.current.globeVelocity.x *= 0.94;
        }
        sceneRefs.current.earthMesh.rotation.y = sceneRefs.current.globeRotation.y;
        sceneRefs.current.earthMesh.rotation.x = Math.max(-0.85, Math.min(0.85, sceneRefs.current.globeRotation.x));
        if (sceneRefs.current.earthAtmosphere) {
          sceneRefs.current.earthAtmosphere.rotation.y = sceneRefs.current.earthMesh.rotation.y;
          sceneRefs.current.earthAtmosphere.rotation.x = sceneRefs.current.earthMesh.rotation.x;
        }
      }
      if (sceneRefs.current.earthMat) {
        sceneRefs.current.earthMat.uniforms.uTime.value = time;
      }
      
      if (sceneRefs.current.cityWaterMat) {
        sceneRefs.current.cityWaterMat.uniforms.uTime.value = time;
        sceneRefs.current.cityWaterMat.uniforms.uCameraPos.value.copy(camera.position);
      }

      renderer.render(scene, camera);
      sceneRefs.current.animFrameId = requestAnimationFrame(animate);
    };

    sceneRefs.current.animFrameId = requestAnimationFrame(animate);

    return () => {
      if (sceneRefs.current.animFrameId) {
        cancelAnimationFrame(sceneRefs.current.animFrameId);
      }
      renderer.dispose();
    };
  }, []);

  const lastMoveRef = useRef<{ x: number; y: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scale = 1920 / rect.width;
    const x = (e.clientX - rect.left) * scale;
    const y = (e.clientY - rect.top) * scale;

    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;

    lastMoveRef.current = { x: nx, y: ny };
    const isGlobal = sceneRefs.current.globalActive || cameraPreset === 'global_earth';

    if (isGlobal) {
      sceneRefs.current.isDraggingGlobe = true;
      sceneRefs.current.globeVelocity.x = 0;
      sceneRefs.current.globeVelocity.y = 0;
    } else {
      // Map screen click to terrain plane world coordinate
      const worldX = (x / 1920 - 0.5) * 380;
      const worldZ = (y / 1080 - 0.5) * 380;
      sceneRefs.current.touchWorldPos.set(worldX, worldZ);
      sceneRefs.current.touchIntensity = 1.0;

      onCanvasPointerDown?.(x, y);

      // In Act 1: excite rain & water
      if (sceneRefs.current.act === 'act1') {
        sceneRefs.current.rainIntensity = 1.0;
        audioService.fade('rain', 0.4, 0.4);
        setTimeout(() => audioService.fade('rain', 0, 2.5), 2500);
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scale = 1920 / rect.width;
    const x = (e.clientX - rect.left) * scale;
    const y = (e.clientY - rect.top) * scale;

    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;

    const isGlobal = sceneRefs.current.globalActive || cameraPreset === 'global_earth';

    if (isGlobal) {
      if (lastMoveRef.current) {
        const dx = nx - lastMoveRef.current.x;
        const dy = ny - lastMoveRef.current.y;

        if (sceneRefs.current.isDraggingGlobe) {
          // Direct drag rotation
          sceneRefs.current.globeRotation.y += dx * 3.5;
          sceneRefs.current.globeRotation.x += dy * 2.5;
          sceneRefs.current.globeVelocity.y = dx * 0.8;
          sceneRefs.current.globeVelocity.x = dy * 0.8;
        } else {
          // Subtle interactive hover tilt
          sceneRefs.current.globeRotation.y += dx * 0.35;
          sceneRefs.current.globeRotation.x += dy * 0.25;
        }
      }
      sceneRefs.current.cameraParallaxDesired.set(nx * 14.0, -ny * 8.0, 0);
    } else {
      // Main Scene: Map cursor directly to terrain world space on hover!
      const worldX = (x / 1920 - 0.5) * 380;
      const worldZ = (y / 1080 - 0.5) * 380;
      sceneRefs.current.touchWorldPos.set(worldX, worldZ);

      // Continuous reactive wave/wake beneath cursor on hover
      sceneRefs.current.touchIntensity = Math.max(sceneRefs.current.touchIntensity, 0.72);

      if (lastMoveRef.current) {
        const dx = nx - lastMoveRef.current.x;
        const dy = ny - lastMoveRef.current.y;

        // Deflect wind and water field
        sceneRefs.current.windDeflect.x += dx * 4.5;
        sceneRefs.current.windDeflect.y += -dy * 3.0;
        sceneRefs.current.windDeflect.clampScalar(-4, 4);

        if (sceneRefs.current.act === 'act1') {
          sceneRefs.current.rainIntensity = Math.min(1.0, sceneRefs.current.rainIntensity + 0.08);
        }
      }

      // Parallax camera response on hover
      sceneRefs.current.cameraParallaxDesired.set(nx * 10.0, -ny * 6.0, 0);
    }

    lastMoveRef.current = { x: nx, y: ny };
  };

  const handlePointerUp = () => {
    sceneRefs.current.isDraggingGlobe = false;
    lastMoveRef.current = null;
  };

  return (
    <canvas
      ref={canvasRef}
      id="webgl-canvas"
      width={1920}
      height={1080}
      className="absolute inset-0 w-full h-full block cursor-default"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    />
  );
};

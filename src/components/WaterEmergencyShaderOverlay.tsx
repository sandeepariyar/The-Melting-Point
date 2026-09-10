import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AlertTriangle, Waves, ShieldAlert, RefreshCw } from 'lucide-react';

interface WaterEmergencyShaderOverlayProps {
  active: boolean;
  intensity: number; // 0.0 to 1.0
  beatText?: string | null;
  onDismiss?: () => void;
}

const VERTEX_SHADER_SRC = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

// Created by greenbird10
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0
// Adapted for WebGL 1.0 / 2.0 with strict typing and emergency flood immersion
const FRAGMENT_SHADER_SRC = `
precision highp float;

uniform vec2 iResolution;
uniform float iTime;
uniform float uIntensity;
uniform float uEmergencyPulse;

float hash(vec2 p) {
  return 0.5 * (
    sin(dot(p, vec2(271.319, 413.975)) + 1217.13 * p.x * p.y)
  ) + 0.5;
}

float noise(vec2 p) {
  vec2 w = fract(p);
  w = w * w * (3.0 - 2.0 * w);
  vec2 fl = floor(p);
  return mix(
    mix(hash(fl + vec2(0.0, 0.0)), hash(fl + vec2(1.0, 0.0)), w.x),
    mix(hash(fl + vec2(0.0, 1.0)), hash(fl + vec2(1.0, 1.0)), w.x),
    w.y
  );
}

// wave octave inspiration: Alexander Alekseev - Seascape
float map_octave(vec2 uv) {
  uv = (uv + noise(uv)) / 2.5;
  uv = vec2(uv.x * 0.6 - uv.y * 0.8, uv.x * 0.8 + uv.y * 0.6);
  vec2 uvsin = 1.0 - abs(sin(uv));
  vec2 uvcos = abs(cos(uv));
  uv = mix(uvsin, uvcos, uvsin);
  float val = 1.0 - pow(max(0.0001, abs(uv.x * uv.y)), 0.65);
  return val;
}

float map(vec3 p) {
  vec2 uv = p.xz + iTime / 2.0;
  float amp = 0.6;
  float freq = 2.0;
  float val = 0.0;
  for(int i = 0; i < 3; ++i) {
    val += map_octave(uv) * amp;
    amp *= 0.3;
    uv *= freq;
  }
  uv = p.xz - 1000.0 - iTime / 2.0;
  amp = 0.6;
  freq = 2.0;
  for(int i = 0; i < 3; ++i) {
    val += map_octave(uv) * amp;
    amp *= 0.3;
    uv *= freq;
  }
  return val + 3.0 - p.y;
}

vec3 getNormal(vec3 p) {
  float eps = 1.0 / max(iResolution.x, 100.0);
  vec3 px = p + vec3(eps, 0.0, 0.0);
  vec3 pz = p + vec3(0.0, 0.0, eps);
  return normalize(vec3(map(px), eps, map(pz)));
}

// raymarch inspiration: Alexander Alekseev - Seascape
float raymarch(vec3 ro, vec3 rd, out vec3 outP, out float outT) {
  float l = 0.0;
  float r = 26.0;
  float dist = 1000000.0;
  for(int i = 0; i < 16; ++i) {
    float mid = (r + l) * 0.5;
    float mapmid = map(ro + rd * mid);
    dist = min(dist, abs(mapmid));
    if(mapmid > 0.0) {
      l = mid;
    } else {
      r = mid;
    }
    if(r - l < 1.0 / max(iResolution.x, 100.0)) break;
  }
  outP = ro + rd * l;
  outT = l;
  return dist;
}

float fbm(vec2 n) {
  float total = 0.0;
  float amplitude = 1.0;
  for (int i = 0; i < 5; i++) {
    total += noise(n) * amplitude; 
    n += n;
    amplitude *= 0.4; 
  }
  return total;
}

float lightShafts(vec2 st) {
  float angle = -0.2;
  vec2 _st = st;
  float t = iTime / 16.0;
  st = vec2(st.x * cos(angle) - st.y * sin(angle), 
            st.x * sin(angle) + st.y * cos(angle));
  float val = fbm(vec2(st.x * 2.0 + 200.0 + t, st.y / 4.0));
  val += fbm(vec2(st.x * 2.0 + 200.0 - t, st.y / 4.0));
  val = val / 3.0;
  float mask = pow(clamp(1.0 - abs(_st.y - 0.15), 0.0, 1.0) * 0.49 + 0.5, 2.0);
  mask *= clamp(1.0 - abs(_st.x + 0.2), 0.0, 1.0) * 0.49 + 0.5;
  return pow(val * mask, 2.0);
}

vec2 bubble(vec2 uv, float scale) {
  if(uv.y > 0.2) return vec2(0.0);
  float t = iTime / 4.0;
  vec2 st = uv * scale;
  vec2 _st = floor(st);
  vec2 bias = vec2(0.0, 4.0 * sin(_st.x * 128.0 + t));
  float mask = smoothstep(0.1, 0.2, -cos(_st.x * 128.0 + t));
  st += bias;
  vec2 _st_ = floor(st);
  st = fract(st);
  float size = noise(_st_) * 0.07 + 0.01;
  vec2 pos = vec2(noise(vec2(t, _st_.y * 64.1)) * 0.8 + 0.1, 0.5);
  if(length(st.xy - pos) < size) {
    return (st + pos) * vec2(0.1, 0.2) * mask;
  }
  return vec2(0.0);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec3 ro = vec3(0.0, 0.0, 2.0);
  vec3 lightPos = vec3(8.0, 3.0, -3.0);

  // adjust uv
  vec2 uv = fragCoord;
  uv = (-iResolution.xy + 2.0 * uv) / iResolution.y;
  uv.y *= 0.5;
  uv.x *= 0.45;
  uv += bubble(uv, 12.0) + bubble(uv, 24.0); // add bubbles

  vec3 rd = normalize(vec3(uv, -1.0));
  vec3 hitPos;
  float hitT;
  vec3 seaColor = vec3(11.0, 82.0, 142.0) / 255.0;
  vec3 color;
  
  // waves
  float dist = raymarch(ro, rd, hitPos, hitT);
  float diffuse = dot(getNormal(hitPos), rd) * 0.5 + 0.5;
  color = mix(seaColor, vec3(15.0, 120.0, 152.0) / 255.0, diffuse);
  color += pow(clamp(diffuse, 0.0, 1.0), 12.0);

  // refraction
  vec3 ref = normalize(refract(hitPos - lightPos, getNormal(hitPos), 0.05));
  float refraction = clamp(dot(ref, rd), 0.0, 1.0);
  color += vec3(245.0, 250.0, 220.0) / 255.0 * 0.6 * pow(refraction, 1.5);

  vec3 col = vec3(0.0);
  col = mix(color, seaColor, pow(clamp(dist, 0.0, 1.0), 0.2)); // glow edge
  col += vec3(225.0, 230.0, 200.0) / 255.0 * lightShafts(uv); // light shafts

  // tone map
  col = (col * col + sin(col)) / vec3(1.8, 1.8, 1.9);

  // emergency pulse (crimson-deluge alert undertone during catastrophic flood breach)
  vec3 emergencyTint = vec3(0.9, 0.2, 0.15);
  col = mix(col, emergencyTint, uEmergencyPulse * 0.28);
  
  // vignette: Inigo Quilez style
  vec2 q = fragCoord / iResolution.xy;
  col *= 0.7 + 0.3 * pow(16.0 * q.x * q.y * (1.0 - q.x) * (1.0 - q.y), 0.2);

  fragColor = vec4(col, 1.0);
}

void main() {
  mainImage(gl_FragColor, gl_FragCoord.xy);
}
`;

export const WaterEmergencyShaderOverlay: React.FC<WaterEmergencyShaderOverlayProps> = ({
  active,
  intensity,
  beatText,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fallbackCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [useFallback, setUseFallback] = useState(false);
  const [shaderCompiled, setShaderCompiled] = useState(false);
  const animFrameIdRef = useRef<number | null>(null);

  // WebGL Shader setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let gl: WebGLRenderingContext | null = null;
    try {
      gl = (canvas.getContext('webgl', { alpha: true, antialias: false }) ||
        canvas.getContext('experimental-webgl', { alpha: true, antialias: false })) as WebGLRenderingContext;
    } catch (e) {
      console.warn('WebGL initialization failed for Water Emergency Shader, falling back:', e);
      setUseFallback(true);
      return;
    }

    if (!gl) {
      console.warn('WebGL context not available for Water Emergency Shader, falling back.');
      setUseFallback(true);
      return;
    }

    // Compile helper
    const compileShader = (type: number, src: string) => {
      if (!gl) return null;
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error('Water Emergency Shader error:', gl.getShaderInfoLog(s));
        gl.deleteShader(s);
        return null;
      }
      return s;
    };

    const vert = compileShader(gl.VERTEX_SHADER, VERTEX_SHADER_SRC);
    const frag = compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SRC);

    if (!vert || !frag) {
      console.warn('Shader compilation failed, falling back to 2D particle simulation.');
      setUseFallback(true);
      return;
    }

    const program = gl.createProgram();
    if (!program) {
      setUseFallback(true);
      return;
    }

    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      setUseFallback(true);
      return;
    }

    gl.useProgram(program);
    setShaderCompiled(true);

    // Quad geometry
    const quad = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

    const posAttr = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(posAttr);
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

    const uResolution = gl.getUniformLocation(program, 'iResolution');
    const uTime = gl.getUniformLocation(program, 'iTime');
    const uIntensityLoc = gl.getUniformLocation(program, 'uIntensity');
    const uEmergencyPulseLoc = gl.getUniformLocation(program, 'uEmergencyPulse');

    const startTime = performance.now();

    const render = () => {
      if (!gl || !canvas) return;

      const elapsed = (performance.now() - startTime) / 1000;
      
      // Render at half-stage resolution for high framerate
      const w = 960;
      const h = 540;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }

      gl.useProgram(program);
      gl.uniform2f(uResolution, w, h);
      gl.uniform1f(uTime, elapsed);
      gl.uniform1f(uIntensityLoc, intensity);

      // Catastrophic alert pulse
      const pulse = 0.5 + 0.5 * Math.sin(elapsed * 4.5);
      gl.uniform1f(uEmergencyPulseLoc, intensity > 0.4 ? pulse : 0);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      if (gl) {
        gl.deleteProgram(program);
        gl.deleteShader(vert);
        gl.deleteShader(frag);
        gl.deleteBuffer(buf);
      }
    };
  }, [intensity]);

  // Fallback 2D Canvas Animation if WebGL fails or fallback requested
  useEffect(() => {
    if (!useFallback) return;
    const canvas = fallbackCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    // Particle system for fallback
    const particles = Array.from({ length: 180 }).map(() => ({
      x: Math.random() * 960,
      y: Math.random() * 540,
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 8 + 3,
      size: Math.random() * 6 + 1.5,
      alpha: Math.random() * 0.7 + 0.3,
      seed: Math.random() * Math.PI * 2,
    }));

    const renderFallback = () => {
      time += 0.03;
      const w = 960;
      const h = 540;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }

      ctx.clearRect(0, 0, w, h);

      // Deep ocean gradient surge
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, 'rgba(11, 82, 142, 0.88)');
      grad.addColorStop(0.5, 'rgba(15, 120, 152, 0.92)');
      grad.addColorStop(1, 'rgba(5, 40, 75, 0.96)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Wave octaves in 2D
      ctx.fillStyle = 'rgba(245, 250, 220, 0.15)';
      ctx.beginPath();
      ctx.moveTo(0, h * 0.4);
      for (let x = 0; x <= w; x += 20) {
        const y = h * 0.4 + Math.sin(x * 0.015 + time * 3) * 35 + Math.cos(x * 0.03 - time * 2) * 20;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();

      // Light shafts
      const shaftGrad = ctx.createLinearGradient(0, 0, w, h * 0.8);
      shaftGrad.addColorStop(0, 'rgba(225, 230, 200, 0.22)');
      shaftGrad.addColorStop(0.5, 'rgba(225, 230, 200, 0.05)');
      shaftGrad.addColorStop(1, 'rgba(225, 230, 200, 0)');
      ctx.fillStyle = shaftGrad;
      ctx.beginPath();
      ctx.moveTo(w * 0.2, 0);
      ctx.lineTo(w * 0.8, h);
      ctx.lineTo(w * 0.95, h);
      ctx.lineTo(w * 0.35, 0);
      ctx.closePath();
      ctx.fill();

      // Bubbles & turbulent particles
      particles.forEach((p) => {
        p.y -= p.vy;
        p.x += Math.sin(time + p.seed) * 2;
        if (p.y < -10) {
          p.y = h + 10;
          p.x = Math.random() * w;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 245, 255, ${p.alpha * intensity})`;
        ctx.fill();
      });

      // Emergency red pulse vignette
      const pulse = Math.sin(time * 5) * 0.5 + 0.5;
      if (intensity > 0.3) {
        const emGrad = ctx.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, w * 0.7);
        emGrad.addColorStop(0, 'rgba(230, 57, 70, 0)');
        emGrad.addColorStop(1, `rgba(230, 57, 70, ${0.45 * intensity * pulse})`);
        ctx.fillStyle = emGrad;
        ctx.fillRect(0, 0, w, h);
      }

      animId = requestAnimationFrame(renderFallback);
    };

    animId = requestAnimationFrame(renderFallback);
    return () => cancelAnimationFrame(animId);
  }, [useFallback, intensity]);

  if (!active && intensity <= 0.001) return null;

  return (
    <div
      id="water-emergency-shader-overlay"
      className="absolute inset-0 z-25 pointer-events-none transition-opacity duration-700 overflow-hidden"
      style={{
        opacity: Math.min(1, Math.max(0, intensity)),
      }}
    >
      {/* Primary WebGL Raymarching Shader by greenbird10 */}
      {!useFallback ? (
        <canvas
          ref={canvasRef}
          className="w-full h-full object-cover mix-blend-screen scale-105 filter contrast-125 brightness-110 pointer-events-none"
        />
      ) : (
        /* Fallback 2D Water Simulation */
        <canvas
          ref={fallbackCanvasRef}
          className="w-full h-full object-cover mix-blend-screen scale-105 filter contrast-125 brightness-110 pointer-events-none"
        />
      )}

      {/* Emergency Deep Flood Wave Aura / Turbulent Caustic Overlay */}
      <div 
        className="absolute inset-0 bg-gradient-to-t from-[#051c2e]/70 via-transparent to-[#051c2e]/60 pointer-events-none"
      />
    </div>
  );
};

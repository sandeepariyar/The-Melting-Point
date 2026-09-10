class AudioService {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private muted: boolean = false;
  private started: boolean = false;
  private layers: {
    wind?: GainNode;
    windPanner?: StereoPannerNode;
    drone?: GainNode;
    bowlDrone?: GainNode;
    water?: GainNode;
    waterPanner?: StereoPannerNode;
    rain?: GainNode;
    rainPanner?: StereoPannerNode;
  } = {};
  private creakTimer: ReturnType<typeof setTimeout> | null = null;
  private windPanOsc: OscillatorNode | null = null;
  private tunnelNodes: {
    osc1: OscillatorNode;
    osc2: OscillatorNode;
    filter: BiquadFilterNode;
    gain: GainNode;
    lfo: OscillatorNode;
    lfoGain: GainNode;
  } | null = null;

  constructor() {
    try {
      this.muted = localStorage.getItem('kiosk_muted') === '1';
    } catch {
      this.muted = false;
    }
  }

  public init() {
    if (this.started) return;
    this.started = true;

    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    this.ctx = new AudioContextClass();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.65;
    this.master.connect(this.ctx.destination);

    // Create realistic noise buffer
    const bufferSize = 4 * this.ctx.sampleRate;
    const noiseBuf = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);
    const leftData = noiseBuf.getChannelData(0);
    const rightData = noiseBuf.getChannelData(1);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const whiteL = Math.random() * 2 - 1;
      const whiteR = Math.random() * 2 - 1;

      b0 = 0.99886 * b0 + whiteL * 0.0555179;
      b1 = 0.99332 * b1 + whiteL * 0.0750759;
      b2 = 0.96900 * b2 + whiteL * 0.153852;
      b3 = 0.86650 * b3 + whiteL * 0.3104856;
      b4 = 0.55000 * b4 + whiteL * 0.5329522;
      b5 = -0.7616 * b5 - whiteL * 0.016898;
      leftData[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + whiteL * 0.5362) * 0.1;
      rightData[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + whiteR * 0.5362) * 0.1;
      b6 = whiteL * 0.115926;
    }

    // 1. Alpine Mountain Wind with Spatial Stereo Movement
    const windSource = this.ctx.createBufferSource();
    windSource.buffer = noiseBuf;
    windSource.loop = true;

    const windFilter = this.ctx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.value = 360;
    windFilter.Q.value = 1.2;

    const windGain = this.ctx.createGain();
    windGain.gain.value = 0.38;

    let windPanner: StereoPannerNode | undefined;
    if (this.ctx.createStereoPanner) {
      windPanner = this.ctx.createStereoPanner();
      windPanner.pan.value = -0.15;
      windSource.connect(windFilter).connect(windGain).connect(windPanner).connect(this.master);
    } else {
      windSource.connect(windFilter).connect(windGain).connect(this.master);
    }
    windSource.start();

    // Slow organic LFO modulating wind filter & stereo pan
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.06;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 220;
    lfo.connect(lfoGain).connect(windFilter.frequency);

    if (windPanner) {
      const panLfo = this.ctx.createOscillator();
      panLfo.frequency.value = 0.035;
      const panLfoGain = this.ctx.createGain();
      panLfoGain.gain.value = 0.45;
      panLfo.connect(panLfoGain).connect(windPanner.pan);
      panLfo.start();
      this.windPanOsc = panLfo;
    }
    lfo.start();

    this.layers.wind = windGain;
    this.layers.windPanner = windPanner;

    // 2. Sub Drone (deep tectonic 30/45/60 Hz resonance)
    const droneGain = this.ctx.createGain();
    droneGain.gain.value = 0.16;
    droneGain.connect(this.master);
    [30, 45, 60, 90].forEach((f, idx) => {
      if (!this.ctx) return;
      const o = this.ctx.createOscillator();
      o.type = idx % 2 === 0 ? 'sine' : 'triangle';
      o.frequency.value = f;
      const og = this.ctx.createGain();
      og.gain.value = 0.25 / (idx + 1);
      o.connect(og).connect(droneGain);
      o.start();
    });
    this.layers.drone = droneGain;

    // 3. Tibetan Singing Bowl / Memorial Bell Harmonic Layer (432Hz harmonic stack)
    const bowlGain = this.ctx.createGain();
    bowlGain.gain.value = 0.12;
    bowlGain.connect(this.master);

    const bowlFrequencies = [216, 432, 864, 1296];
    bowlFrequencies.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const subGain = this.ctx.createGain();
      subGain.gain.value = 0.15 / (idx + 1);

      // Subtle vibrato
      const vibrato = this.ctx.createOscillator();
      vibrato.frequency.value = 0.25 + idx * 0.1;
      const vibratoGain = this.ctx.createGain();
      vibratoGain.gain.value = 1.5;
      vibrato.connect(vibratoGain).connect(osc.frequency);

      osc.connect(subGain).connect(bowlGain);
      vibrato.start();
      osc.start();
    });
    this.layers.bowlDrone = bowlGain;

    // 4. Glacial Stream & Flood Water Rush with Stereo Spatial Separation
    const waterGain = this.ctx.createGain();
    waterGain.gain.value = 0;

    let waterPanner: StereoPannerNode | undefined;
    if (this.ctx.createStereoPanner) {
      waterPanner = this.ctx.createStereoPanner();
      waterPanner.pan.value = 0.25;
      waterGain.connect(waterPanner).connect(this.master);
    } else {
      waterGain.connect(this.master);
    }

    const waterSource = this.ctx.createBufferSource();
    waterSource.buffer = noiseBuf;
    waterSource.loop = true;
    const waterFilter = this.ctx.createBiquadFilter();
    waterFilter.type = 'lowpass';
    waterFilter.frequency.value = 1200;
    waterFilter.Q.value = 1.8;

    waterSource.connect(waterFilter).connect(waterGain);
    waterSource.start();
    this.layers.water = waterGain;
    this.layers.waterPanner = waterPanner;

    // 5. High-Altitude Rain with spatial spreading
    const rainGain = this.ctx.createGain();
    rainGain.gain.value = 0;

    let rainPanner: StereoPannerNode | undefined;
    if (this.ctx.createStereoPanner) {
      rainPanner = this.ctx.createStereoPanner();
      rainPanner.pan.value = -0.2;
      rainGain.connect(rainPanner).connect(this.master);
    } else {
      rainGain.connect(this.master);
    }

    const rainSource = this.ctx.createBufferSource();
    rainSource.buffer = noiseBuf;
    rainSource.loop = true;
    const rainFilter = this.ctx.createBiquadFilter();
    rainFilter.type = 'highpass';
    rainFilter.frequency.value = 2200;

    rainSource.connect(rainFilter).connect(rainGain);
    rainSource.start();
    this.layers.rain = rainGain;
    this.layers.rainPanner = rainPanner;

    this.scheduleCreak();
  }

  private scheduleCreak() {
    const delay = 7000 + Math.random() * 12000;
    this.creakTimer = setTimeout(() => {
      if (!this.ctx || this.muted) {
        this.scheduleCreak();
        return;
      }
      try {
        const o = this.ctx.createOscillator();
        o.type = 'sawtooth';
        o.frequency.value = 55 + Math.random() * 35;

        const g = this.ctx.createGain();
        g.gain.setValueAtTime(0, this.ctx.currentTime);
        g.gain.linearRampToValueAtTime(0.14, this.ctx.currentTime + 0.08);
        g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 2.2);
        o.frequency.exponentialRampToValueAtTime(26, this.ctx.currentTime + 2.2);

        const f = this.ctx.createBiquadFilter();
        f.type = 'lowpass';
        f.frequency.value = 450;

        // Randomized spatial panning for creaks (sounds like ice shifting in distance)
        if (this.ctx.createStereoPanner) {
          const panner = this.ctx.createStereoPanner();
          panner.pan.value = (Math.random() - 0.5) * 1.8;
          o.connect(f).connect(g).connect(panner).connect(this.master!);
        } else {
          o.connect(f).connect(g).connect(this.master!);
        }

        o.start();
        o.stop(this.ctx.currentTime + 2.4);
      } catch {
        // ignore
      }
      this.scheduleCreak();
    }, delay);
  }

  public fade(
    layerName: 'wind' | 'drone' | 'water' | 'rain' | 'bowlDrone',
    target: number,
    duration: number = 1.5
  ) {
    const layer = this.layers[layerName];
    if (!layer || !this.ctx) return;
    layer.gain.cancelScheduledValues(this.ctx.currentTime);
    layer.gain.setValueAtTime(layer.gain.value, this.ctx.currentTime);
    layer.gain.linearRampToValueAtTime(target, this.ctx.currentTime + duration);
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    try {
      localStorage.setItem('kiosk_muted', this.muted ? '1' : '0');
    } catch {
      // ignore
    }
    if (this.master && this.ctx) {
      this.master.gain.linearRampToValueAtTime(this.muted ? 0 : 0.65, this.ctx.currentTime + 0.3);
    }
    return this.muted;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  // Deep Sub-bass Impact Hit on Glacial Flood Arrival
  public impact() {
    if (!this.ctx || this.muted || !this.master) return;
    const o = this.ctx.createOscillator();
    o.type = 'sine';
    o.frequency.value = 60;

    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, this.ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.95, this.ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 3.8);
    o.frequency.exponentialRampToValueAtTime(18, this.ctx.currentTime + 3.8);

    // Rumble harmonic
    const rumble = this.ctx.createOscillator();
    rumble.type = 'triangle';
    rumble.frequency.value = 38;
    const rumbleGain = this.ctx.createGain();
    rumbleGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    rumbleGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 3.2);

    o.connect(g).connect(this.master);
    rumble.connect(rumbleGain).connect(this.master);

    o.start();
    rumble.start();
    o.stop(this.ctx.currentTime + 4);
    rumble.stop(this.ctx.currentTime + 3.5);
  }

  // Interactive 3D Spatial Touch Tone (X = Pan Left to Right, Y = Frequency / Altitude)
  public touchTone(normX: number, normY: number) {
    if (!this.ctx || this.muted || !this.master) return;
    try {
      const osc = this.ctx.createOscillator();
      // Tibetan bell pentatonic scale tuning
      const baseFreqs = [216, 256, 288, 324, 384, 432, 512, 576, 648, 768];
      const noteIdx = Math.min(baseFreqs.length - 1, Math.floor(normY * baseFreqs.length));
      osc.type = 'sine';
      osc.frequency.value = baseFreqs[noteIdx] || 432;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0005, this.ctx.currentTime + 0.9);

      // Stereo Spatial Panner Node (maps screen X directly to soundstage -1..1)
      if (this.ctx.createStereoPanner) {
        const panner = this.ctx.createStereoPanner();
        const clampedPan = Math.max(-0.95, Math.min(0.95, normX * 2 - 1));
        panner.pan.value = clampedPan;
        osc.connect(gain).connect(panner).connect(this.master);
      } else {
        osc.connect(gain).connect(this.master);
      }

      osc.start();
      osc.stop(this.ctx.currentTime + 1.0);
    } catch {
      // ignore
    }
  }

  // Subtle tactile UI click/tick sound for buttons and cards
  public tick() {
    if (!this.ctx || this.muted || !this.master) return;
    try {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.04);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.04);

      osc.connect(gain).connect(this.master);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch {
      // ignore
    }
  }

  // Earth Heating Tunnel Sound Engine (starts tense low drone, escalates to alarming warning)
  public startHeatingTunnel() {
    if (!this.ctx || this.muted || !this.master) return;
    if (this.tunnelNodes) return;

    try {
      const osc1 = this.ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(55, this.ctx.currentTime);

      const osc2 = this.ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(54.4, this.ctx.currentTime); // Slight beating detune

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(180, this.ctx.currentTime);
      filter.Q.setValueAtTime(3.5, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.22, this.ctx.currentTime + 1.2);

      const lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.6, this.ctx.currentTime);
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(25, this.ctx.currentTime);

      lfo.connect(lfoGain).connect(filter.frequency);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain).connect(this.master);

      osc1.start();
      osc2.start();
      lfo.start();

      this.tunnelNodes = { osc1, osc2, filter, gain, lfo, lfoGain };
    } catch {
      // ignore
    }
  }

  public updateHeatingTunnel(progress: number, anomaly: number) {
    if (!this.ctx || !this.tunnelNodes || this.muted) return;
    const clampedProgress = Math.max(0, Math.min(1, progress));
    const now = this.ctx.currentTime;

    try {
      // Scale fundamental pitch upward as warming progresses (55Hz -> 140Hz)
      const baseFreq = 55 + clampedProgress * 85;
      this.tunnelNodes.osc1.frequency.setTargetAtTime(baseFreq, now, 0.1);
      this.tunnelNodes.osc2.frequency.setTargetAtTime(baseFreq * 0.992, now, 0.1);

      // Open filter dramatically as temperature enters high red zone
      const filterFreq = 180 + Math.pow(clampedProgress, 1.8) * 1200;
      this.tunnelNodes.filter.frequency.setTargetAtTime(filterFreq, now, 0.1);
      this.tunnelNodes.filter.Q.setTargetAtTime(3.0 + clampedProgress * 5.0, now, 0.1);

      // Accelerate urgency LFO pulse from 0.6Hz to 4.8Hz
      const lfoSpeed = 0.6 + Math.pow(clampedProgress, 2.2) * 4.2;
      this.tunnelNodes.lfo.frequency.setTargetAtTime(lfoSpeed, now, 0.1);
      this.tunnelNodes.lfoGain.gain.setTargetAtTime(25 + clampedProgress * 90, now, 0.1);

      // Overall gain swell
      const targetGain = 0.2 + clampedProgress * 0.18;
      this.tunnelNodes.gain.gain.setTargetAtTime(targetGain, now, 0.1);
    } catch {
      // ignore
    }
  }

  // Visceral, Alarming Emergency Climax Warning Sound when breaching +1.5°C threshold
  public triggerClimaxAlarm() {
    if (!this.ctx || this.muted || !this.master) return;
    try {
      const now = this.ctx.currentTime;

      // 1. Dual Siren Tones (Tritone Dissonance: 830Hz & 587Hz alternating warning)
      const sirenOsc1 = this.ctx.createOscillator();
      sirenOsc1.type = 'sawtooth';
      sirenOsc1.frequency.setValueAtTime(830, now);
      sirenOsc1.frequency.linearRampToValueAtTime(740, now + 0.3);
      sirenOsc1.frequency.linearRampToValueAtTime(830, now + 0.6);
      sirenOsc1.frequency.linearRampToValueAtTime(740, now + 0.9);
      sirenOsc1.frequency.linearRampToValueAtTime(600, now + 2.5);

      const sirenGain1 = this.ctx.createGain();
      sirenGain1.gain.setValueAtTime(0, now);
      sirenGain1.gain.linearRampToValueAtTime(0.18, now + 0.05);
      sirenGain1.gain.exponentialRampToValueAtTime(0.001, now + 3.2);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, now);
      filter.Q.setValueAtTime(2.0, now);

      sirenOsc1.connect(filter).connect(sirenGain1).connect(this.master);
      sirenOsc1.start(now);
      sirenOsc1.stop(now + 3.4);

      // 2. Urgent Sub-Bass Warning Thud
      const sub = this.ctx.createOscillator();
      sub.type = 'triangle';
      sub.frequency.setValueAtTime(48, now);
      sub.frequency.exponentialRampToValueAtTime(24, now + 2.8);

      const subGain = this.ctx.createGain();
      subGain.gain.setValueAtTime(0, now);
      subGain.gain.linearRampToValueAtTime(0.55, now + 0.02);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 3.5);

      sub.connect(subGain).connect(this.master);
      sub.start(now);
      sub.stop(now + 3.6);

      // 3. High Warning Bell Harmonic Stack
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        if (!this.ctx) return;
        const bell = this.ctx.createOscillator();
        bell.type = 'sine';
        bell.frequency.setValueAtTime(freq, now + idx * 0.04);

        const bellGain = this.ctx.createGain();
        bellGain.gain.setValueAtTime(0, now);
        bellGain.gain.linearRampToValueAtTime(0.08 / (idx + 1), now + 0.04);
        bellGain.gain.exponentialRampToValueAtTime(0.0005, now + 2.5);

        bell.connect(bellGain).connect(this.master!);
        bell.start(now);
        bell.stop(now + 2.6);
      });
    } catch {
      // ignore
    }
  }

  public stopHeatingTunnel() {
    if (!this.ctx || !this.tunnelNodes) return;
    try {
      const now = this.ctx.currentTime;
      this.tunnelNodes.gain.gain.cancelScheduledValues(now);
      this.tunnelNodes.gain.gain.setValueAtTime(this.tunnelNodes.gain.gain.value, now);
      this.tunnelNodes.gain.gain.linearRampToValueAtTime(0, now + 0.6);

      const nodes = this.tunnelNodes;
      this.tunnelNodes = null;

      setTimeout(() => {
        try {
          nodes.osc1.stop();
          nodes.osc2.stop();
          nodes.lfo.stop();
          nodes.gain.disconnect();
        } catch {
          // ignore
        }
      }, 700);
    } catch {
      this.tunnelNodes = null;
    }
  }

  public destroy() {
    this.stopHeatingTunnel();
    if (this.creakTimer) clearTimeout(this.creakTimer);
    if (this.windPanOsc) this.windPanOsc.stop();
    if (this.ctx && this.ctx.state !== 'closed') {
      this.ctx.close();
    }
  }
}

export const audioService = new AudioService();


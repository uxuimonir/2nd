"use client";
import type { AmbientId } from "@/types/content";

/**
 * Generative ambient soundscapes built with the Web Audio API — no audio files to download.
 * Muted by default; the AudioContext is only created after an explicit user gesture.
 */
type Scene = { out: GainNode; stop: () => void };

export class AmbientEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private scene: { id: AmbientId; s: Scene } | null = null;
  private buffers = new Map<string, AudioBuffer>();
  private volume = 0.55;

  get running() {
    return this.ctx?.state === "running";
  }

  private ensure() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0;
      const comp = this.ctx.createDynamicsCompressor();
      this.master.connect(comp).connect(this.ctx.destination);
    }
    return this.ctx;
  }

  async start() {
    const ctx = this.ensure();
    if (ctx.state === "suspended") await ctx.resume();
    this.fadeMaster(this.volume, 1.5);
  }

  mute() {
    this.fadeMaster(0, 0.8);
  }

  private fadeMaster(v: number, t: number) {
    if (!this.ctx || !this.master) return;
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(v, now + t);
  }

  setScene(id: AmbientId) {
    if (!this.ctx || !this.master || this.scene?.id === id) return;
    const prev = this.scene;
    const s = this.build(id);
    const now = this.ctx.currentTime;
    s.out.gain.setValueAtTime(0, now);
    s.out.gain.linearRampToValueAtTime(1, now + 2.5);
    s.out.connect(this.master);
    this.scene = { id, s };
    if (prev) {
      prev.s.out.gain.cancelScheduledValues(now);
      prev.s.out.gain.setValueAtTime(prev.s.out.gain.value, now);
      prev.s.out.gain.linearRampToValueAtTime(0, now + 2.5);
      setTimeout(() => prev.s.stop(), 2800);
    }
  }

  dispose() {
    this.scene?.s.stop();
    this.scene = null;
    this.ctx?.close();
    this.ctx = null;
  }

  // ——— building blocks ———
  private noise(kind: "white" | "pink" | "brown"): AudioBuffer {
    const ctx = this.ctx!;
    const hit = this.buffers.get(kind);
    if (hit) return hit;
    const len = ctx.sampleRate * 4;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      if (kind === "white") d[i] = w * 0.5;
      else if (kind === "pink") {
        b0 = 0.99765 * b0 + w * 0.099046;
        b1 = 0.963 * b1 + w * 0.2965164;
        b2 = 0.57 * b2 + w * 1.0526913;
        d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.12;
      } else {
        last = (last + 0.02 * w) / 1.02;
        d[i] = last * 3.2;
      }
    }
    this.buffers.set(kind, buf);
    return buf;
  }

  private bed(kind: "white" | "pink" | "brown", filter: BiquadFilterType, freq: number, gain: number, q = 0.7) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise(kind);
    src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = filter;
    f.frequency.value = freq;
    f.Q.value = q;
    const g = ctx.createGain();
    g.gain.value = gain;
    src.connect(f).connect(g);
    src.start();
    return { src, f, g };
  }

  private lfo(target: AudioParam, rate: number, depth: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.frequency.value = rate;
    const g = ctx.createGain();
    g.gain.value = depth;
    o.connect(g).connect(target);
    o.start();
    return o;
  }

  private every(minMs: number, maxMs: number, fn: () => void) {
    let alive = true;
    let t: ReturnType<typeof setTimeout>;
    const loop = () => {
      if (!alive) return;
      fn();
      t = setTimeout(loop, minMs + Math.random() * (maxMs - minMs));
    };
    t = setTimeout(loop, minMs * Math.random());
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }

  private chirp(out: AudioNode) {
    const ctx = this.ctx!;
    const now = ctx.currentTime;
    const base = 2200 + Math.random() * 2200;
    const notes = 2 + Math.floor(Math.random() * 4);
    for (let i = 0; i < notes; i++) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      const t = now + i * (0.09 + Math.random() * 0.05);
      o.type = "sine";
      o.frequency.setValueAtTime(base, t);
      o.frequency.exponentialRampToValueAtTime(base * (1.2 + Math.random() * 0.5), t + 0.07);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.035, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
      o.connect(g).connect(out);
      o.start(t);
      o.stop(t + 0.12);
    }
  }

  /** A rickshaw bell: two inharmonic partials with a quick metallic decay. */
  private bell(out: AudioNode, level = 0.03) {
    const ctx = this.ctx!;
    const now = ctx.currentTime;
    const f = 1900 + Math.random() * 500;
    for (const [mul, amp] of [[1, 1], [1.51, 0.6], [2.33, 0.3]] as const) {
      for (let r = 0; r < 2; r++) {
        const t = now + r * 0.11;
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.frequency.value = f * mul;
        g.gain.setValueAtTime(level * amp, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
        o.connect(g).connect(out);
        o.start(t);
        o.stop(t + 0.5);
      }
    }
  }

  private drop(out: AudioNode) {
    const ctx = this.ctx!;
    const now = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.noise("white");
    const f = ctx.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = 2500 + Math.random() * 4000;
    f.Q.value = 6;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.05 + Math.random() * 0.06, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);
    src.connect(f).connect(g).connect(out);
    src.start(now, Math.random() * 3, 0.04);
  }

  private build(id: AmbientId): Scene {
    const ctx = this.ctx!;
    const out = ctx.createGain();
    const nodes: { stop?: (t?: number) => void; disconnect: () => void }[] = [];
    const timers: (() => void)[] = [];
    const add = (b: ReturnType<AmbientEngine["bed"]>) => {
      b.g.connect(out);
      nodes.push(b.src, b.f, b.g);
      return b;
    };

    switch (id) {
      case "river": {
        const a = add(this.bed("brown", "lowpass", 520, 0.55));
        nodes.push(this.lfo(a.f.frequency, 0.07, 180));
        const b = add(this.bed("pink", "bandpass", 1400, 0.08, 0.9));
        nodes.push(this.lfo(b.g.gain, 0.21, 0.04));
        timers.push(this.every(3500, 9000, () => this.chirp(out)));
        break;
      }
      case "rain": {
        add(this.bed("white", "highpass", 1800, 0.14));
        add(this.bed("pink", "lowpass", 500, 0.35));
        timers.push(this.every(25, 140, () => this.drop(out)));
        break;
      }
      case "forest": {
        const w = add(this.bed("pink", "lowpass", 900, 0.22));
        nodes.push(this.lfo(w.g.gain, 0.05, 0.12));
        const insects = ctx.createOscillator();
        insects.type = "triangle";
        insects.frequency.value = 4600;
        const ig = ctx.createGain();
        ig.gain.value = 0.004;
        insects.connect(ig).connect(out);
        insects.start();
        nodes.push(insects, ig, this.lfo(ig.gain, 7, 0.004));
        timers.push(this.every(1200, 4200, () => this.chirp(out)));
        break;
      }
      case "sea": {
        const s = add(this.bed("brown", "lowpass", 700, 0.45));
        nodes.push(this.lfo(s.f.frequency, 0.09, 450), this.lfo(s.g.gain, 0.09, 0.3));
        add(this.bed("white", "highpass", 3000, 0.03));
        break;
      }
      case "city": {
        add(this.bed("brown", "lowpass", 260, 0.6));
        add(this.bed("pink", "bandpass", 900, 0.05, 1.2));
        timers.push(this.every(1800, 5200, () => this.bell(out)));
        break;
      }
      case "market": {
        const m = add(this.bed("pink", "bandpass", 700, 0.28, 1.4));
        nodes.push(this.lfo(m.f.frequency, 0.35, 220), this.lfo(m.g.gain, 0.6, 0.08));
        add(this.bed("brown", "lowpass", 300, 0.3));
        timers.push(this.every(2600, 7000, () => this.bell(out, 0.02)));
        break;
      }
    }

    return {
      out,
      stop: () => {
        timers.forEach((t) => t());
        nodes.forEach((n) => {
          try {
            n.stop?.();
          } catch {}
          n.disconnect();
        });
        out.disconnect();
      },
    };
  }

  /** A single plucked ektara note (used by the culture chapter). */
  pluck(freq = 196) {
    // A direct user gesture: plays even when the ambience is muted.
    const ctx = this.ensure();
    if (ctx.state === "suspended") void ctx.resume();
    const now = ctx.currentTime;
    const len = Math.round(ctx.sampleRate / freq);
    // Karplus–Strong string
    const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    for (let i = len; i < d.length; i++) d[i] = 0.498 * (d[i - len] + d[i - len + 1]);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.5, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 1.9);
    src.connect(g).connect(ctx.destination);
    src.start(now);
  }
}

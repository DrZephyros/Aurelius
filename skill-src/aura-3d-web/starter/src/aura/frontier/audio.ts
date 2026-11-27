/* ─────────────────────────────────────────────────────────────
   AURA · frontier/audio.ts — a procedural, scroll-scored SOUNDTRACK. Zero audio files.

   · a pad (2 detuned saws per chord tone → low-pass → algorithmic reverb) whose chord follows the chapter, whose filter opens with the playhead
   · a sub that swells on the hold, an "air" noise band that rises with scroll velocity (the whoosh of the dolly), `hit()` for UI ticks
   · `level()` (0..1 RMS) is there so VISUALS can react to sound: scale a bloom, a ripple, a particle burst
   · OFF by default and only started from a user gesture (autoplay policy) — pair it with <AudioToggle> in AuraExperience (`score` prop).
     The choice is remembered. Ducks to silence when the tab is hidden. Never autoplays, never loops a file, never ships a licence problem.
   ───────────────────────────────────────────────────────────── */

export interface ScoreOptions {
  /** root note in Hz (55 = A1) */
  root?: number;
  /** one chord per chapter, as semitone offsets from the root; the active chord = chords[chapterAt(p)] */
  chords?: number[][];
  /** playhead positions where chapters start, ascending, first = 0. Default: evenly spaced over chords */
  at?: number[];
  volume?: number;
  /** storage key for the remembered on/off choice */
  key?: string;
}

export interface AuraScore {
  enable(): Promise<void>;
  disable(): void;
  toggle(): Promise<boolean>;
  readonly on: boolean;
  /** call from onFrame: (p, velocity) */
  update(p: number, velocity: number): void;
  hit(freq?: number): void;
  level(): number;
  /** the user previously chose sound on (the shell may offer to resume it on first gesture) */
  remembered(): boolean;
  dispose(): void;
}

export function createScore(o: ScoreOptions = {}): AuraScore {
  const chords = o.chords ?? [[0, 7, 12, 16], [0, 7, 12, 15], [-2, 5, 10, 14], [0, 5, 12, 17], [0, 7, 12, 16]];
  const at = o.at ?? chords.map((_, i) => i / chords.length);
  const root = o.root ?? 55, vol = o.volume ?? 0.5, key = o.key ?? "aura-sound";
  let ctx: AudioContext | null = null, master: GainNode, lp: BiquadFilterNode, air: GainNode, sub: GainNode, an: AnalyserNode, buf: Uint8Array<ArrayBuffer>;
  let voices: OscillatorNode[][] = [], on = false, chord = -1, lastP = 0;
  const hz = (semi: number) => root * 2 ** (semi / 12);
  const store = (v: boolean) => { try { localStorage.setItem(key, v ? "1" : "0"); } catch { /* private mode */ } };

  function build() {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -20; comp.ratio.value = 6;
    an = ctx.createAnalyser(); an.fftSize = 256; buf = new Uint8Array(an.frequencyBinCount);
    master.connect(comp); comp.connect(an); an.connect(ctx.destination);
    // reverb: 3 s of decaying stereo noise
    const len = ctx.sampleRate * 3, ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3; }
    const verb = ctx.createConvolver(); verb.buffer = ir;
    const wet = ctx.createGain(); wet.gain.value = 0.55; verb.connect(wet); wet.connect(master);
    lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 380; lp.Q.value = 0.7;
    const dry = ctx.createGain(); dry.gain.value = 0.5;
    lp.connect(dry); dry.connect(master); lp.connect(verb);
    const n = Math.max(...chords.map((c) => c.length));
    for (let i = 0; i < n; i++) {
      const g = ctx.createGain(); g.gain.value = 0.11 / Math.sqrt(n); g.connect(lp);
      voices.push([-7, 7].map((cents) => { const osc = ctx!.createOscillator(); osc.type = "sawtooth"; osc.detune.value = cents; osc.frequency.value = hz(chords[0][i % chords[0].length]) * 2; osc.connect(g); osc.start(); return osc; }));
    }
    sub = ctx.createGain(); sub.gain.value = 0.12; const so = ctx.createOscillator(); so.type = "sine"; so.frequency.value = root; so.connect(sub); sub.connect(master); so.start();
    // air: looped noise → band-pass, gain follows scroll velocity
    const nb = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate), nd = nb.getChannelData(0); let b0 = 0;
    for (let i = 0; i < nd.length; i++) { b0 = 0.97 * b0 + 0.03 * (Math.random() * 2 - 1); nd[i] = b0 * 6; }
    const ns = ctx.createBufferSource(); ns.buffer = nb; ns.loop = true;
    const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 900; bp.Q.value = 0.6;
    air = ctx.createGain(); air.gain.value = 0; ns.connect(bp); bp.connect(air); air.connect(verb); air.connect(master); ns.start();
    document.addEventListener("visibilitychange", () => { if (!ctx) return; if (document.hidden) ctx.suspend(); else if (on) ctx.resume(); });
  }

  return {
    async enable() {
      if (!ctx) build();
      await ctx!.resume(); on = true; store(true);
      master.gain.cancelScheduledValues(ctx!.currentTime); master.gain.setTargetAtTime(vol, ctx!.currentTime, 0.8);
    },
    disable() { if (!ctx) return; on = false; store(false); master.gain.setTargetAtTime(0, ctx.currentTime, 0.25); setTimeout(() => { if (!on) ctx?.suspend(); }, 900); },
    async toggle() { if (on) this.disable(); else await this.enable(); return on; },
    get on() { return on; },
    update(p, velocity) {
      if (!ctx || !on) return;
      const t = ctx.currentTime;
      let c = 0; for (let i = 0; i < at.length; i++) if (p >= at[i]) c = i;
      c = Math.min(c, chords.length - 1);
      if (c !== chord) {
        chord = c;
        voices.forEach((pair, i) => pair.forEach((osc) => osc.frequency.setTargetAtTime(hz(chords[c][i % chords[c].length]) * (i === 0 ? 1 : 2), t, 0.9)));
      }
      lp.frequency.setTargetAtTime(260 + 2600 * p * p + velocity * 9000, t, 0.25);
      air.gain.setTargetAtTime(Math.min(0.5, velocity * 7), t, 0.18);
      sub.gain.setTargetAtTime(0.1 + 0.1 * Math.max(0, 1 - Math.abs(p - lastP) * 200), t, 0.5);
      lastP = p;
    },
    hit(freq = 880) {
      if (!ctx || !on) return;
      const t = ctx.currentTime, osc = ctx.createOscillator(), g = ctx.createGain();
      osc.type = "sine"; osc.frequency.setValueAtTime(freq, t); osc.frequency.exponentialRampToValueAtTime(freq * 0.5, t + 0.25);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.18, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
      osc.connect(g); g.connect(master); osc.start(t); osc.stop(t + 0.4);
    },
    level() { if (!ctx || !on) return 0; an.getByteTimeDomainData(buf); let s = 0; for (let i = 0; i < buf.length; i++) { const v = (buf[i] - 128) / 128; s += v * v; } return Math.min(1, Math.sqrt(s / buf.length) * 4); },
    remembered() { try { return localStorage.getItem(key) === "1"; } catch { return false; } },
    dispose() { on = false; ctx?.close(); ctx = null; voices = []; },
  };
}

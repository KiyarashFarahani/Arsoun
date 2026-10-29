const SEMITONES: Record<string, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};

const NOTE_RE = /^([A-G])(#|b)?(-?\d+)$/;

export function noteToMidi(note: string): number | null {
  const match = NOTE_RE.exec(note.trim());
  if (!match) return null;

  const semitone =
    SEMITONES[match[1]] +
    (match[2] === "#" ? 1 : match[2] === "b" ? -1 : 0);

  return (Number(match[3]) + 1) * 12 + semitone;
}

export function noteToFrequency(note: string): number | null {
  const midi = noteToMidi(note);
  if (midi === null) return null;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

interface Voice {
  gain: GainNode;
  oscillators: OscillatorNode[];
}

/**
 * Small additive synthesizer used by the demo. Real instruments will load
 * per-note recordings, but this keeps the player playable with no assets.
 */
export class PanSynth {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private voices = new Map<string, Voice[]>();
  private enabled = true;

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled) this.dampAll();
  }

  get isEnabled() {
    return this.enabled;
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === "undefined") return null;

    if (!this.context) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) return null;

      this.context = new Ctor();
      this.master = this.context.createGain();
      this.master.gain.value = 0.3;

      const compressor = this.context.createDynamicsCompressor();
      compressor.threshold.value = -18;
      compressor.ratio.value = 4;

      this.master.connect(compressor);
      compressor.connect(this.context.destination);
    }

    if (this.context.state === "suspended") {
      void this.context.resume();
    }

    return this.context;
  }

  private noiseBurst(context: AudioContext, duration: number): AudioBufferSourceNode {
    const length = Math.max(1, Math.floor(context.sampleRate * duration));
    const buffer = context.createBuffer(1, length, context.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3);
    }

    const source = context.createBufferSource();
    source.buffer = buffer;
    return source;
  }

  strike(note: string, velocity = 1) {
    if (!this.enabled) return;

    const frequency = noteToFrequency(note);
    const context = this.ensureContext();
    if (!frequency || !context || !this.master) return;

    const now = context.currentTime;
    const out = context.createGain();
    const filter = context.createBiquadFilter();

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(Math.min(14000, frequency * 7), now);
    filter.Q.value = 0.4;

    out.gain.setValueAtTime(0.0001, now);
    out.gain.linearRampToValueAtTime(0.9 * velocity, now + 0.006);
    out.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);

    out.connect(filter);
    filter.connect(this.master);

    const partials = [
      { ratio: 1, gain: 0.55, decay: 2.2, type: "sine" as OscillatorType },
      { ratio: 2.01, gain: 0.22, decay: 1.4, type: "sine" as OscillatorType },
      { ratio: 3.02, gain: 0.11, decay: 0.95, type: "sine" as OscillatorType },
      { ratio: 4.42, gain: 0.05, decay: 0.6, type: "triangle" as OscillatorType },
    ];

    const oscillators: OscillatorNode[] = [];

    partials.forEach((partial) => {
      const osc = context.createOscillator();
      const gain = context.createGain();

      osc.type = partial.type;
      osc.frequency.setValueAtTime(frequency * partial.ratio, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(partial.gain * velocity, now + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + partial.decay);

      osc.connect(gain);
      gain.connect(out);
      osc.start(now);
      osc.stop(now + partial.decay + 0.05);
      oscillators.push(osc);
    });

    const tick = this.noiseBurst(context, 0.025);
    const tickFilter = context.createBiquadFilter();
    const tickGain = context.createGain();

    tickFilter.type = "bandpass";
    tickFilter.frequency.value = Math.min(9000, frequency * 4);
    tickFilter.Q.value = 1.1;
    tickGain.gain.setValueAtTime(0.18 * velocity, now);
    tickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

    tick.connect(tickFilter);
    tickFilter.connect(tickGain);
    tickGain.connect(out);
    tick.start(now);
    tick.stop(now + 0.06);

    const voice: Voice = { gain: out, oscillators };
    const list = this.voices.get(note) ?? [];
    list.push(voice);
    this.voices.set(note, list);

    window.setTimeout(() => {
      const current = this.voices.get(note);
      if (!current) return;
      const next = current.filter((item) => item !== voice);
      if (next.length === 0) this.voices.delete(note);
      else this.voices.set(note, next);
    }, 2600);
  }

  damp(note: string, seconds = 0.09) {
    const context = this.context;
    if (!context) return;

    const list = this.voices.get(note);
    if (!list) return;

    const now = context.currentTime;
    list.forEach(({ gain, oscillators }) => {
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(Math.max(gain.gain.value, 0.0001), now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + seconds);
      oscillators.forEach((osc) => osc.stop(now + seconds + 0.03));
    });

    this.voices.delete(note);
  }

  dampAll() {
    if (!this.context) return;
    Array.from(this.voices.keys()).forEach((note) => this.damp(note, 0.05));
  }

  dispose() {
    this.dampAll();
    void this.context?.close();
    this.context = null;
    this.master = null;
    this.voices.clear();
  }
}

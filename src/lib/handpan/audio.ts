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
  source: AudioBufferSourceNode;
}

const AUDIO_NOTE_NAMES = [
  "C",
  "Csharp",
  "D",
  "Dsharp",
  "E",
  "F",
  "Fsharp",
  "G",
  "Gsharp",
  "A",
  "Bb",
  "B",
];

function noteSampleUrl(note: string) {
  const midi = noteToMidi(note);
  if (midi === null) return null;
  const octave = Math.floor(midi / 12) - 1;
  return `/audio/handpan/${AUDIO_NOTE_NAMES[midi % 12]}${octave}.mp3`;
}

const sampleDataPromises = new Map<string, Promise<ArrayBuffer | null>>();

function loadSampleData(url: string) {
  const cached = sampleDataPromises.get(url);
  if (cached) return cached;

  const promise = (async () => {
    try {
      const cache = typeof caches === "undefined"
        ? null
        : await caches.open("arsoun-handpan-samples-v1");
      const cachedResponse = await cache?.match(url);
      if (cachedResponse) return cachedResponse.arrayBuffer();

      const response = await fetch(url, { cache: "force-cache" });
      if (!response.ok) return null;

      if (cache) {
        await cache.put(url, response.clone());
      }
      return response.arrayBuffer();
    } catch {
      return null;
    }
  })();

  sampleDataPromises.set(url, promise);
  return promise;
}

export class PanSynth {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private voices = new Map<string, Voice[]>();
  private buffers = new Map<string, Promise<AudioBuffer | null>>();
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

  private loadBuffer(note: string, context: AudioContext) {
    const url = noteSampleUrl(note);
    if (!url) return Promise.resolve(null);

    const cached = this.buffers.get(note);
    if (cached) return cached;

    const buffer = loadSampleData(url)
      .then((data) => (data ? context.decodeAudioData(data.slice(0)) : null))
      .catch(() => null);
    this.buffers.set(note, buffer);
    return buffer;
  }

  async preload(notes: string[]) {
    const context = this.ensureContext();
    if (!context) return;

    await Promise.all(
      Array.from(new Set(notes.filter(Boolean))).map((note) =>
        this.loadBuffer(note, context),
      ),
    );
  }

  strike(note: string, velocity = 1) {
    if (!this.enabled) return;

    const context = this.ensureContext();
    if (!context || !this.master) return;

    void this.loadBuffer(note, context).then((buffer) => {
      if (!buffer || !this.enabled || !this.context || !this.master) return;

      const source = this.context.createBufferSource();
      const gain = this.context.createGain();
      const now = this.context.currentTime;

      source.buffer = buffer;
      gain.gain.setValueAtTime(Math.max(0.0001, velocity), now);
      source.connect(gain);
      gain.connect(this.master);
      source.start(now);

      const voice: Voice = { gain, source };
      const list = this.voices.get(note) ?? [];
      list.push(voice);
      this.voices.set(note, list);
      source.addEventListener("ended", () => {
        const current = this.voices.get(note);
        if (!current) return;
        const next = current.filter((item) => item !== voice);
        if (next.length === 0) this.voices.delete(note);
        else this.voices.set(note, next);
      }, { once: true });
    });
  }

  damp(note: string, seconds = 0.09) {
    const context = this.context;
    if (!context) return;

    const list = this.voices.get(note);
    if (!list) return;

    const now = context.currentTime;
    list.forEach(({ gain, source }) => {
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(Math.max(gain.gain.value, 0.0001), now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + seconds);
      source.stop(now + seconds + 0.03);
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
    this.buffers.clear();
  }
}

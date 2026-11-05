import { noteToMidi } from "./audio";

/**
 * Proportional tone-field ellipse sizes, in the same drawing units as the
 * measured model outlines. The D Kurd 13 values are taken from its measured
 * boundaries; the remaining notes extend that pitch-size progression for the
 * custom layout picker.
 */
export interface NoteEllipseSize {
  radial: number;
  tangential: number;
}

export const NOTE_ELLIPSE_SIZES: Record<string, NoteEllipseSize> = {
  "D3": { radial: 75.8, tangential: 88.0 },
  "E3": { radial: 62.4, tangential: 83.0 },
  "F3": { radial: 55.6, tangential: 80.5 },
  "G3": { radial: 50.9, tangential: 75.5 },
  "A3": { radial: 48.0, tangential: 71.8 },
  "Bb3": { radial: 54.1, tangential: 61.3 },
  "C4": { radial: 50.9, tangential: 57.6 },
  "D4": { radial: 43.1, tangential: 59.6 },
  "E4": { radial: 42.7, tangential: 54.3 },
  "F4": { radial: 40.2, tangential: 54.6 },
  "G4": { radial: 37.6, tangential: 51.8 },
  "A4": { radial: 36.3, tangential: 48.7 },
  "Bb4": { radial: 35.3, tangential: 47.3 },
  "C5": { radial: 33.2, tangential: 44.4 },
  "D5": { radial: 32.3, tangential: 47.1 },
  "E5": { radial: 31.3, tangential: 44.8 },
  "F5": { radial: 30.9, tangential: 43.6 },
  "G5": { radial: 29.9, tangential: 42.4 },
  "A5": { radial: 29.0, tangential: 41.2 },
  "Bb5": { radial: 28.5, tangential: 40.6 },
  "C6": { radial: 27.6, tangential: 39.4 },
  "D6": { radial: 26.6, tangential: 38.2 },
  "E6": { radial: 25.7, tangential: 37.0 },
  "F6": { radial: 25.2, tangential: 36.4 },
  "G6": { radial: 24.3, tangential: 35.2 },
  "A6": { radial: 23.3, tangential: 34.0 },
  "Bb6": { radial: 22.9, tangential: 33.4 },
  "C7": { radial: 21.9, tangential: 32.2 },
  "D7": { radial: 21.0, tangential: 31.0 },
  "E7": { radial: 20.1, tangential: 29.8 },
  "F7": { radial: 19.6, tangential: 29.2 },
  "G7": { radial: 18.6, tangential: 28.0 },
  "A7": { radial: 18.0, tangential: 27.4 },
};

export const DEFAULT_NOTE_ELLIPSE_SIZE: NoteEllipseSize = {
  radial: 32.3,
  tangential: 47.1,
};

const NOTE_SIZE_POINTS = Object.entries(NOTE_ELLIPSE_SIZES)
  .map(([note, size]) => ({ note, midi: noteToMidi(note), size }))
  .filter(
    (point): point is { note: string; midi: number; size: NoteEllipseSize } =>
      point.midi !== null,
  )
  .sort((a, b) => a.midi - b.midi);

/**
 * Return a measured size when available, otherwise interpolate between the
 * nearest measured pitches. This keeps chromatic custom notes proportional
 * instead of falling back to the much larger default field.
 */
export function noteEllipseSize(note: string): NoteEllipseSize {
  const measured = NOTE_ELLIPSE_SIZES[note];
  if (measured) return measured;

  const midi = noteToMidi(note);
  if (midi === null || NOTE_SIZE_POINTS.length === 0) {
    return DEFAULT_NOTE_ELLIPSE_SIZE;
  }

  const upperIndex = NOTE_SIZE_POINTS.findIndex((point) => point.midi >= midi);
  if (upperIndex <= 0) return NOTE_SIZE_POINTS[0].size;
  if (upperIndex === -1) return NOTE_SIZE_POINTS[NOTE_SIZE_POINTS.length - 1].size;

  const lower = NOTE_SIZE_POINTS[upperIndex - 1];
  const upper = NOTE_SIZE_POINTS[upperIndex];
  const progress = (midi - lower.midi) / (upper.midi - lower.midi);

  return {
    radial: lower.size.radial + (upper.size.radial - lower.size.radial) * progress,
    tangential:
      lower.size.tangential +
      (upper.size.tangential - lower.size.tangential) * progress,
  };
}

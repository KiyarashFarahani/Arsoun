import { noteToMidi } from "./audio";
import type { PanDefinition } from "./types";

const SHARP_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

const FLAT_NAMES = [
  "C",
  "Db",
  "D",
  "Eb",
  "E",
  "F",
  "Gb",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
];

export function transposeNote(note: string, semitones: number): string {
  if (!semitones) return note;

  const midi = noteToMidi(note);
  if (midi === null) return note;

  const shifted = midi + semitones;
  const pitch = ((shifted % 12) + 12) % 12;
  const octave = Math.floor(shifted / 12) - 1;
  const names = note.includes("b") ? FLAT_NAMES : SHARP_NAMES;

  return `${names[pitch]}${octave}`;
}

/**
 * Returns a copy of the definition with every note shifted by `semitones`.
 * Geometry is untouched, so a single measured layout can cover every key.
 */
export function transposeDefinition(
  definition: PanDefinition,
  semitones: number,
): PanDefinition {
  if (!semitones) return definition;

  const shift = (note: string) => transposeNote(note, semitones);

  return {
    ...definition,
    notes: definition.notes
      ? {
          ding: definition.notes.ding
            ? shift(definition.notes.ding)
            : undefined,
          top: definition.notes.top?.map(shift),
          bottom: definition.notes.bottom?.map(shift),
        }
      : undefined,
    fields: definition.fields.map((field) => ({
      ...field,
      note: shift(field.note),
    })),
  };
}

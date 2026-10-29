import type { PanConfig } from "./types";

/**
 * Demo note layouts. These are hand-authored configurations, not measured
 * instruments — they exist to prove that the player can render any number of
 * rings, note counts and bottom-side fields.
 */
export const PAN_CONFIGS: PanConfig[] = [
  {
    id: "d-kurd-14",
    model: "D Kurd 14",
    scale: "D minor",
    description:
      "The classic handpan layout: a D3 ding with a full D minor ring and three upper octave notes, plus two underside fields.",
    rimRadius: 265,
    ding: { note: "D3", radius: 40 },
    rings: [
      {
        radius: 108,
        fieldRadius: 26,
        notes: ["A3", "Bb3", "C4", "D4", "E4", "F4", "G4", "A4"],
      },
      {
        radius: 192,
        fieldRadius: 23,
        notes: ["C5", "D5", "E5"],
        startAngle: 112.5,
      },
    ],
    bottom: [
      {
        radius: 165,
        fieldRadius: 20,
        notes: ["F3", "G3"],
        type: "dimple",
      },
    ],
  },
  {
    id: "fsharp-low-pygmy-12",
    model: "F# Low Pygmy 12",
    scale: "F# minor pentatonic",
    description:
      "A low, warm pentatonic instrument. Six notes on the inner ring and five on the outer ring around an F#3 ding.",
    rimRadius: 260,
    ding: { note: "F#3", radius: 38 },
    rings: [
      {
        radius: 106,
        fieldRadius: 27,
        notes: ["G#3", "A3", "C#4", "E4", "F#4", "G#4"],
      },
      {
        radius: 192,
        fieldRadius: 23,
        notes: ["A4", "C#5", "E5", "F#5", "G#5"],
        startAngle: 120,
      },
    ],
  },
  {
    id: "e-amara-20",
    model: "E Amara 20",
    scale: "E major / Amara",
    description:
      "A denser 20-note configuration with seven outer notes and four underside fields, exercising satellites and stacked rings.",
    rimRadius: 270,
    ding: { note: "E3", radius: 40 },
    rings: [
      {
        radius: 108,
        fieldRadius: 25,
        notes: ["B3", "D4", "E4", "F#4", "G4", "A4", "B4", "D5"],
      },
      {
        radius: 196,
        fieldRadius: 21,
        notes: ["E5", "F#5", "G5", "A5", "B5", "D6", "E6"],
        startAngle: 115,
      },
    ],
    bottom: [
      {
        radius: 160,
        fieldRadius: 19,
        notes: ["C3", "D3", "F#3", "G3"],
        type: "dimple",
      },
    ],
  },
  {
    id: "custom-celtic-9",
    model: "Custom Celtic 9",
    scale: "D Celtic",
    description:
      "A sparse nine-note custom layout. Switch to it to show that the renderer adapts to a single wide ring.",
    rimRadius: 255,
    ding: { note: "D3", radius: 42 },
    rings: [
      {
        radius: 128,
        fieldRadius: 31,
        notes: ["A3", "C4", "D4", "E4", "F4", "G4", "A4", "C5"],
        tangentialScale: 1.2,
      },
    ],
  },
];

import type { PanDefinition, PanField, Vec2 } from "./types";

import b2Aavartan17 from "./models/b2-aavartan-17.model.json";
import b3Pygmy20 from "./models/b3-pygmy-20.model.json";
import cAshakiran17 from "./models/c-ashakiran-17.model.json";
import dAegean18 from "./models/d-aegean-18.model.json";
import dAshakiran19 from "./models/d-ashakiran-19.model.json";
import dKurd13 from "./models/d-kurd-13.model.json";
import dKurd19 from "./models/d-kurd-19.model.json";
import eAmara20 from "./models/e-amara-20.model.json";
import fisKurd22 from "./models/fis-kurd-22.model.json";
import fisLowPygmy21 from "./models/fis-low-pygmy-21.model.json";
import fis2Nordlys16 from "./models/fis2-nordlys-16.model.json";

interface AyasaModel {
  meta: {
    id: string;
    model: string;
    rimRadius: number;
    axis?: Vec2;
    group?: string;
  };
  notes: {
    ding: string;
    top: string[];
    bottom: string[];
  };
  fields: PanField[];
}

function fromAyasaModel(raw: AyasaModel): PanDefinition {
  return {
    meta: {
      id: raw.meta.id,
      model: raw.meta.model,
      rimRadius: raw.meta.rimRadius,
      axis: raw.meta.axis ?? [0, 0],
    },
    notes: raw.notes,
    fields: raw.fields.map((field) => ({
      note: field.note,
      side: field.side,
      type: field.type,
      centre: field.centre,
      boundary: field.boundary,
      inner: field.inner,
    })),
  };
}

export interface PanRender {
  top: string;
  bottom: string;
  radius: number;
  spin: number;
  bottomRadius?: number;
  bottomSpin?: number;
}

export interface PanModelEntry {
  id: string;
  model: string;
  scale: string;
  description: string;
  definition: PanDefinition;
  render: PanRender;
}

function renderFor(
  id: string,
  options: Partial<Omit<PanRender, "top" | "bottom">> = {},
): PanRender {
  return {
    top: `/handpan/models/${id}.top.webp`,
    bottom: `/handpan/models/${id}.bottom.webp`,
    radius: 272.5,
    spin: -90,
    ...options,
  };
}

/**
 * Measured handpan definitions. Each field boundary is the real tone-field
 * outline, so the layout is irregular the way a hammered instrument is.
 */
export const PAN_MODELS: PanModelEntry[] = [
  {
    id: "d-kurd-13",
    model: "D Kurd 13",
    scale: "D minor",
    description:
      "The classic D minor layout: a D3 ding, an eight-note inner ring, two upper-octave notes and two underside fields.",
    definition: fromAyasaModel(dKurd13 as unknown as AyasaModel),
    render: renderFor("d-kurd-13"),
  },
  {
    id: "fis2-nordlys-16",
    model: "F#2 Nordlys 16",
    scale: "F# Lydian hexatonic",
    description:
      "A deep F#2 ding with eight top notes and seven underside fields, tuned to a bright Lydian hexatonic colour.",
    definition: fromAyasaModel(fis2Nordlys16 as unknown as AyasaModel),
    render: renderFor("fis2-nordlys-16", {
      radius: 271.83,
      bottomRadius: 272.5,
    }),
  },
  {
    id: "b2-aavartan-17",
    model: "B2 Aavartan 17",
    scale: "B major",
    description:
      "A low B2 ding with eight top notes and eight underside fields — an almost even split between the two sides.",
    definition: fromAyasaModel(b2Aavartan17 as unknown as AyasaModel),
    render: renderFor("b2-aavartan-17"),
  },
  {
    id: "c-ashakiran-17",
    model: "C Ashakiran 17",
    scale: "C extended major",
    description:
      "An extended C major layout with eight top notes and eight underside fields, giving the underside a full second voice.",
    definition: fromAyasaModel(cAshakiran17 as unknown as AyasaModel),
    render: renderFor("c-ashakiran-17"),
  },
  {
    id: "d-aegean-18",
    model: "D Aegean 18",
    scale: "D Lydian",
    description:
      "Ten top notes plus the D3 ding, and seven underside fields, with the wider spacing of the Aegean layout.",
    definition: fromAyasaModel(dAegean18 as unknown as AyasaModel),
    render: renderFor("d-aegean-18"),
  },
  {
    id: "d-ashakiran-19",
    model: "D Ashakiran 19",
    scale: "D extended major",
    description:
      "An extended D major layout with ten top notes, the D3 ding and eight underside fields.",
    definition: fromAyasaModel(dAshakiran19 as unknown as AyasaModel),
    render: renderFor("d-ashakiran-19"),
  },
  {
    id: "d-kurd-19",
    model: "D Kurd 19",
    scale: "D minor",
    description:
      "The D Kurd scale extended to 19 notes: twelve top notes plus the D3 ding and six underside fields.",
    definition: fromAyasaModel(dKurd19 as unknown as AyasaModel),
    render: renderFor("d-kurd-19"),
  },
  {
    id: "b3-pygmy-20",
    model: "B3 Pygmy 20",
    scale: "B minor pentatonic",
    description:
      "A B minor pygmy layout with twelve top notes plus the B3 ding and seven underside fields.",
    definition: fromAyasaModel(b3Pygmy20 as unknown as AyasaModel),
    render: renderFor("b3-pygmy-20"),
  },
  {
    id: "e-amara-20",
    model: "E Amara 20",
    scale: "E minor",
    description:
      "Twelve top notes plus the E3 ding and seven underside fields, filling the surface more densely.",
    definition: fromAyasaModel(eAmara20 as unknown as AyasaModel),
    render: renderFor("e-amara-20"),
  },
  {
    id: "fis-low-pygmy-21",
    model: "F# Low Pygmy 21",
    scale: "F# minor pentatonic",
    description:
      "Eleven top notes plus the low F#3 ding and nine underside fields, giving it one of the widest note ranges.",
    definition: fromAyasaModel(fisLowPygmy21 as unknown as AyasaModel),
    render: renderFor("fis-low-pygmy-21"),
  },
  {
    id: "fis-kurd-22",
    model: "F# Kurd 22",
    scale: "F# minor",
    description:
      "The densest layout here: fifteen top notes plus the F#3 ding and six underside fields, spanning F#3 to C#6.",
    definition: fromAyasaModel(fisKurd22 as unknown as AyasaModel),
    render: renderFor("fis-kurd-22"),
  },
];

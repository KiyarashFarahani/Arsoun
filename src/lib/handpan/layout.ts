import type {
  PanConfig,
  PanDefinition,
  PanField,
  RingConfig,
  Vec2,
} from "./types";
import { noteEllipseSize } from "./note-sizes";

const TWO_PI = Math.PI * 2;

/**
 * Build an elliptical tone-field outline. `radius` is the base size, `radial`
 * scales the axis pointing away from the instrument centre and `tangential`
 * scales the perpendicular axis (handpan fields are usually a little wider
 * around the ring than along it).
 */
export function ellipseBoundary(
  centre: Vec2,
  radius: number,
  angle: number,
  radial = 1,
  tangential = 1.15,
  segments = 36,
): Vec2[] {
  const [cx, cy] = centre;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const a = radius * radial;
  const b = radius * tangential;
  const points: Vec2[] = [];

  for (let i = 0; i < segments; i++) {
    const t = (i / segments) * TWO_PI;
    const u = Math.cos(t) * a;
    const v = Math.sin(t) * b;
    points.push([cx + u * cos - v * sin, cy + u * sin + v * cos]);
  }

  return points;
}

export function scalePolygon(
  points: Vec2[],
  factor: number,
  origin: Vec2 = [0, 0],
): Vec2[] {
  const [ox, oy] = origin;
  return points.map(([x, y]) => [ox + (x - ox) * factor, oy + (y - oy) * factor]);
}

/** Turn a note layout config into the flat definition the renderer consumes. */
export function buildDefinition(config: PanConfig): PanDefinition {
  const fields: PanField[] = [];

  if (config.ding) {
    const boundary = ellipseBoundary(
      [0, 0],
      config.ding.radius,
      0,
      1,
      1,
      40,
    );
    fields.push({
      note: config.ding.note,
      side: "top",
      type: "dome",
      centre: [0, 0],
      boundary,
      inner: scalePolygon(boundary, 0.5),
    });
  }

  const addRing = (ring: RingConfig, side: "top" | "bottom") => {
    const count = ring.notes.length;
    if (count === 0) return;

    const start = ((ring.startAngle ?? 90) * Math.PI) / 180;
    const step = TWO_PI / count;

    ring.notes.forEach((note, index) => {
      const angle = start + step * index;
      const centre: Vec2 = [
        Math.cos(angle) * ring.radius,
        Math.sin(angle) * ring.radius,
      ];
      const boundary = ellipseBoundary(
        centre,
        ring.fieldRadius,
        angle,
        ring.radialScale ?? 1,
        ring.tangentialScale ?? 1.15,
      );

      fields.push({
        note,
        side,
        type: ring.type ?? (side === "bottom" ? "dimple" : "dome"),
        centre,
        boundary,
        inner: scalePolygon(boundary, ring.innerScale ?? 0.52, centre),
      });
    });
  };

  config.rings.forEach((ring) => addRing(ring, "top"));
  (config.bottom ?? []).forEach((ring) => addRing(ring, "bottom"));

  return {
    meta: {
      id: config.id,
      model: config.model,
      rimRadius: config.rimRadius,
      axis: [0, 0],
    },
    notes: {
      ding: config.ding?.note,
      top: fields
        .filter(
          (field) =>
            field.side !== "bottom" && field.note !== config.ding?.note,
        )
        .map((field) => field.note),
      bottom: fields
        .filter((field) => field.side === "bottom")
        .map((field) => field.note),
    },
    fields,
  };
}

export function pathFrom(points: Vec2[]): string {
  return (
    points
      .map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`)
      .join("") + "Z"
  );
}

/** Centre and outer radius of a field, used for labels and satellite placement. */
export function fieldStats(field: PanField): { x: number; y: number; r: number } {
  let x = 0;
  let y = 0;

  if (field.centre) {
    [x, y] = field.centre;
  } else if (field.boundary.length > 0) {
    field.boundary.forEach(([px, py]) => {
      x += px;
      y += py;
    });
    x /= field.boundary.length;
    y /= field.boundary.length;
  }

  let r = 0;
  field.boundary.forEach(([px, py]) => {
    r = Math.max(r, Math.hypot(px - x, py - y));
  });

  return { x, y, r };
}

function resizeCustomFields(fields: PanField[]): PanField[] {
  const sizes = fields.map((field) => {
    const size = noteEllipseSize(field.note);
    return { field, size };
  });

  // Keep the measured proportions, but scale the complete layout to the
  // largest common size that leaves a small clearance between every field.
  let scale = 1;
  for (let left = 0; left < sizes.length; left += 1) {
    for (let right = left + 1; right < sizes.length; right += 1) {
      if (sizes[left].field.side !== sizes[right].field.side) continue;
      const [x1, y1] = sizes[left].field.centre;
      const [x2, y2] = sizes[right].field.centre;
      const distance = Math.hypot(x2 - x1, y2 - y1);
      const leftReach = Math.max(
        sizes[left].size.radial,
        sizes[left].size.tangential,
      );
      const rightReach = Math.max(
        sizes[right].size.radial,
        sizes[right].size.tangential,
      );
      scale = Math.min(scale, (distance * 0.94) / (leftReach + rightReach));
    }
  }

  return sizes.map(({ field, size }) => {
    const angle = Math.atan2(field.centre[1], field.centre[0]);
    const boundary = ellipseBoundary(
      field.centre,
      1,
      angle,
      size.radial * scale,
      size.tangential * scale,
    );
    return {
      ...field,
      boundary,
      inner: scalePolygon(boundary, 0.52, field.centre),
    };
  });
}

function symmetrizeTopPair(fields: PanField[], leftIndex: number, rightIndex: number) {
  const left = fields[leftIndex];
  const right = fields[rightIndex];
  if (!left || !right) return;

  const radius =
    (Math.abs(left.centre[1]) + Math.abs(right.centre[1])) / 2;
  const x = (left.centre[0] + right.centre[0]) / 2;
  const leftIsScreenLeft = left.centre[1] < right.centre[1];
  const leftY = leftIsScreenLeft ? -radius : radius;
  const rightY = leftIsScreenLeft ? radius : -radius;
  left.centre = [x, leftY];
  right.centre = [x, rightY];
}

function tidyTwelveTopFields(fields: PanField[]) {
  // The measured 12-note source is close to symmetric, but its mirrored
  // pairs land a few millimetres apart. Keep the measured layout and average
  // only those small left/right differences.
  [
    [2, 3],
    [4, 5],
    [6, 7],
    [8, 10],
    [9, 11],
  ].forEach(([leftIndex, rightIndex]) => {
    symmetrizeTopPair(fields, leftIndex, rightIndex);
  });
}

/** Project a y-up coordinate into SVG space, matching the root transform. */
export function projectPoint(
  x: number,
  y: number,
  rotate: number,
): Vec2 {
  const a = (rotate * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  return [x * cos + y * sin, x * sin - y * cos];
}

/** Build a clean, editable schematic for a custom instrument. The ring is
 * deliberately parameterised by count so every note gets equal clearance. */
export function buildCustomDefinition(topNotes: string[], bottomNotes: string[], ding = "D3"): PanDefinition {
  const top = topNotes.filter(Boolean).slice(0, 24);
  const bottom = bottomNotes.filter(Boolean).slice(0, 12);
  // Real instruments keep most tone fields on the outer shoulder, then add
  // smaller high notes in an inner arc near the ding as the layout grows.
  const outer = top.slice(0, Math.min(12, top.length));
  const inner = top.slice(outer.length);
  const rings: RingConfig[] = [];
  if (outer.length) rings.push({
    notes: outer, radius: outer.length > 10 ? 214 : 205,
    fieldRadius: outer.length > 10 ? 28 : 34,
    radialScale: 0.76, tangentialScale: 1.12, startAngle: 90,
  });
  if (inner.length) rings.push({
    notes: inner, radius: inner.length > 6 ? 130 : 124,
    fieldRadius: inner.length > 8 ? 22 : 26,
    radialScale: 0.72, tangentialScale: 1.08,
    startAngle: inner.length % 2 ? 72 : 90, type: "dome",
  });
  return buildDefinition({
    id: `custom-${top.length + 1}-${bottom.length}`,
    model: `Custom ${top.length + 1}/${bottom.length}`,
    rimRadius: 300,
    ding: { note: ding, radius: 62 }, rings,
    bottom: bottom.length ? [{ notes: bottom, radius: 205,
      fieldRadius: bottom.length > 8 ? 27 : 34, radialScale: 0.78,
      tangentialScale: 1.1, type: "dimple", startAngle: 90 }] : [],
  });
}

/** Reuse measured Ayasa field silhouettes for a custom scale with the same
 * top/bottom counts. This keeps the asymmetric inner notes and spacing. */
export function retuneDefinition(template: PanDefinition, topNotes: string[], bottomNotes: string[], ding = "D3"): PanDefinition {
  const top = topNotes.filter(Boolean);
  const bottom = bottomNotes.filter(Boolean);
  const fields = template.fields.map((field) => ({ ...field, centre: [...field.centre] as Vec2, boundary: field.boundary.map(([x,y]) => [x,y] as Vec2), inner: field.inner?.map(([x,y]) => [x,y] as Vec2) }));
  let ti = 0, bi = 0;
  fields.forEach((field) => {
    if (field.side === "bottom") field.note = bottom[bi++] ?? field.note;
    else if (field.note === template.notes?.ding) field.note = ding;
    else field.note = top[ti++] ?? field.note;
  });
  return { ...template, meta: { ...template.meta, id: `custom-${top.length + 1}-${bottom.length}`, model: `Custom ${top.length + 1}/${bottom.length}` }, fields,
    notes: { ding, top: fields.filter(f => f.side !== "bottom" && f.note !== ding).map(f => f.note), bottom: fields.filter(f => f.side === "bottom").map(f => f.note) } };
}

/** Compose independently measured top and bottom shells for custom layouts. */
export function retuneSides(topTemplate: PanDefinition, bottomTemplate: PanDefinition, topNotes: string[], bottomNotes: string[], ding = "D3"): PanDefinition {
  topNotes = topNotes.slice(0, 12);
  bottomNotes = bottomNotes.slice(0, 6);
  const clone = (field: PanField) => ({ ...field, centre: [...field.centre] as Vec2, boundary: field.boundary.map(([x, y]) => [x, y] as Vec2), inner: field.inner?.map(([x, y]) => [x, y] as Vec2) });
  const topSource = topTemplate.fields.filter((field) => field.side !== "bottom");
  const topDing = topSource.find((field) => field.note === topTemplate.notes?.ding) ?? topSource[0];
  const topFields = [topDing, ...topSource.filter((field) => field !== topDing).slice(0, topNotes.length)].filter(Boolean).map(clone);
  const bottomFields = bottomTemplate.fields.filter((field) => field.side === "bottom").slice(0, bottomNotes.length).map(clone);
  // Extend measured templates when a requested count exceeds their sample.
  const topNeeded = Math.max(0, topNotes.length - topFields.filter(f => f.note !== topTemplate.notes?.ding).length);
  for (let i = 0; i < topNeeded; i++) {
    const angle = Math.PI / 2 + (i / Math.max(1, topNeeded)) * Math.PI * 2;
    const centre: Vec2 = [Math.cos(angle) * 132, Math.sin(angle) * 132];
    const boundary = ellipseBoundary(centre, topNeeded > 8 ? 21 : 25, angle, 0.72, 1.08);
    topFields.push({ note: "", side: "top", type: "dome", centre, boundary, inner: scalePolygon(boundary, 0.52, centre) });
  }
  const bottomNeeded = Math.max(0, bottomNotes.length - bottomFields.length);
  for (let i = 0; i < bottomNeeded; i++) {
    const angle = Math.PI / 2 + (i / Math.max(1, bottomNeeded)) * Math.PI * 2;
    const centre: Vec2 = [Math.cos(angle) * 205, Math.sin(angle) * 205];
    const boundary = ellipseBoundary(centre, bottomNeeded > 8 ? 27 : 34, angle, 0.78, 1.1);
    bottomFields.push({ note: "", side: "bottom", type: "dimple", centre, boundary, inner: scalePolygon(boundary, 0.52, centre) });
  }
  let ti = 0; topFields.forEach(f => { f.note = f.note === topTemplate.notes?.ding ? ding : (topNotes[ti++] ?? f.note); });
  let bi = 0; bottomFields.forEach(f => { f.note = bottomNotes[bi++] ?? f.note; });
  if (topNotes.length + 1 === 10 && topFields[0]) {
    topFields[0].centre = [0, 0];
  }
  if (topNotes.length + 1 === 12) tidyTwelveTopFields(topFields);
  const fields = resizeCustomFields([...topFields, ...bottomFields]);
  return { ...topTemplate, meta: { ...topTemplate.meta, id: `custom-${topNotes.length + 1}-${bottomNotes.length}`, model: `Custom ${topNotes.length + 1}/${bottomNotes.length}` }, fields, notes: { ding, top: topFields.filter(f => f.note !== ding).map(f => f.note), bottom: bottomFields.map(f => f.note) } };
}

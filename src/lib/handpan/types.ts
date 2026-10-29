export type Vec2 = [number, number];

export type PanSide = "top" | "bottom";

export type FieldType = "dome" | "dimple";

/**
 * A single tone field on the instrument. Coordinates are millimetres in a
 * y-up space centred on the instrument, matching the shell profile.
 */
export interface PanField {
  note: string;
  side?: PanSide;
  type?: FieldType;
  centre: Vec2;
  boundary: Vec2[];
  inner?: Vec2[];
}

export interface PanDefinition {
  meta: {
    id?: string;
    model: string;
    rimRadius: number;
    axis?: Vec2;
  };
  notes?: {
    ding?: string;
    top?: string[];
    bottom?: string[];
  };
  fields: PanField[];
}

export interface RingConfig {
  /** Distance of each field centre from the instrument centre, in mm. */
  radius: number;
  /** Nominal field radius, in mm. */
  fieldRadius: number;
  notes: string[];
  type?: FieldType;
  /** Degrees. `90` places the first note at the top. */
  startAngle?: number;
  /** Scale of the field along the radial axis. */
  radialScale?: number;
  /** Scale of the field along the tangential axis. */
  tangentialScale?: number;
  /** Inner dome/dimple scale relative to the boundary. */
  innerScale?: number;
}

export interface PanConfig {
  id: string;
  model: string;
  description?: string;
  scale?: string;
  rimRadius: number;
  ding?: {
    note: string;
    radius: number;
  };
  rings: RingConfig[];
  bottom?: RingConfig[];
}

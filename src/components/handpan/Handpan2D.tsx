"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

import {
  fieldStats,
  pathFrom,
  projectPoint,
} from "@/lib/handpan/layout";
import { PAN_THEMES, type PanThemeName } from "@/lib/handpan/themes";
import type { PanDefinition, PanField, Vec2 } from "@/lib/handpan/types";

export interface Handpan2DHandle {
  strike: (note: string) => void;
  notes: string[];
}

export interface Handpan2DProps {
  definition: PanDefinition;
  view?: "top" | "bottom";
  rotate?: number;
  showLabels?: boolean;
  theme?: PanThemeName;
  textSize?: number;
  satelliteGap?: number;
  padding?: number;
  className?: string;
  /** Optional photo/render of the surface, drawn beneath the note map. */
  renderSrc?: string | null;
  renderRadius?: number;
  renderSpin?: number;
  onNote?: (note: string) => void;
  onDamp?: (note: string) => void;
}

const TWO_PI = Math.PI * 2;

function escapeNote(note: string) {
  return note.replace(/["\\]/g, "\\$&");
}

function flipField(field: PanField): PanField {
  const flipPoints = (points: Vec2[]): Vec2[] =>
    points.map(([x, y]) => [x, -y]);

  return {
    ...field,
    centre: [field.centre[0], -field.centre[1]],
    boundary: flipPoints(field.boundary),
    inner: field.inner ? flipPoints(field.inner) : undefined,
  };
}

const Handpan2D = forwardRef<Handpan2DHandle, Handpan2DProps>(
  function Handpan2D(
    {
      definition,
      view = "top",
      rotate = 0,
      showLabels = true,
      theme: themeName = "current",
      textSize = 1,
      satelliteGap = 22,
      padding = 28,
      className,
      renderSrc = null,
      renderRadius,
      renderSpin = 0,
      onNote,
      onDamp,
    },
    ref,
  ) {
    const svgRef = useRef<SVGSVGElement>(null);
    const pointer = useRef<{
      note: string;
      x: number;
      y: number;
      damped: boolean;
    } | null>(null);
    const lastStrike = useRef<Record<string, number>>({});
    const timers = useRef<Record<string, number>>({});

    const theme = PAN_THEMES[themeName];
    const rimRadius = definition.meta.rimRadius;
    const flipY = view === "bottom";

    const fields = useMemo(
      () => definition.fields.filter((field) => field.boundary.length > 0),
      [definition],
    );

    const mainFields = useMemo(() => {
      const side = flipY ? "bottom" : "top";
      return fields
        .filter((field) => (field.side ?? "top") === side)
        .map((field) => (flipY ? flipField(field) : field));
    }, [fields, flipY]);

    const satellites = useMemo(() => {
      if (flipY) return [];

      return fields
        .filter((field) => field.side === "bottom")
        .map((field) => {
          const stats = fieldStats(field);
          const angle = Math.atan2(stats.y, stats.x);
          const ux = Math.cos(angle);
          const uy = Math.sin(angle);

          let inwardReach = 0;
          field.boundary.forEach(([px, py]) => {
            const reach = -((px - stats.x) * ux + (py - stats.y) * uy);
            if (reach > inwardReach) inwardReach = reach;
          });

          const targetRadius = rimRadius + satelliteGap + inwardReach;
          return {
            field,
            dx: ux * targetRadius - stats.x,
            dy: uy * targetRadius - stats.y,
          };
        });
    }, [fields, flipY, rimRadius, satelliteGap]);

    const { viewBox, shellCentre } = useMemo(() => {
      const probe: Vec2[] = [];

      for (let index = 0; index < 64; index++) {
        const angle = (index / 64) * TWO_PI;
        probe.push([Math.cos(angle) * rimRadius, Math.sin(angle) * rimRadius]);
      }

      mainFields.forEach((field) => {
        field.boundary.forEach((point) => probe.push(point));
      });

      satellites.forEach(({ field, dx, dy }) => {
        field.boundary.forEach(([x, y]) => probe.push([x + dx, y + dy]));
      });

      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;

      probe.forEach(([x, y]) => {
        const [sx, sy] = projectPoint(x, y, rotate);
        minX = Math.min(minX, sx);
        maxX = Math.max(maxX, sx);
        minY = Math.min(minY, sy);
        maxY = Math.max(maxY, sy);
      });

      minX -= padding;
      maxX += padding;
      minY -= padding;
      maxY += padding;

      return {
        viewBox: `${minX.toFixed(1)} ${minY.toFixed(1)} ${(maxX - minX).toFixed(
          1,
        )} ${(maxY - minY).toFixed(1)}`,
        shellCentre: projectPoint(
          definition.meta.axis?.[0] ?? 0,
          definition.meta.axis?.[1] ?? 0,
          rotate,
        ).map((value) => (Math.abs(value) < 1e-9 ? 0 : value)) as Vec2,
      };
    }, [mainFields, satellites, rimRadius, padding, rotate, definition]);

    const labels = useMemo(() => {
      const items: {
        note: string;
        x: number;
        y: number;
        size: number;
      }[] = [];

      const push = (field: PanField, dx = 0, dy = 0) => {
        if (!field.note) return;
        const stats = fieldStats(field);
        const [x, y] = projectPoint(stats.x + dx, stats.y + dy, rotate);
        const size = Math.max(13, Math.min(28, stats.r * 0.55)) * textSize;
        items.push({
          note: field.note,
          x: Math.round(x * 10) / 10,
          y: Math.round(y * 10) / 10,
          size: Math.round(size * 10) / 10,
        });
      };

      mainFields.forEach((field) => push(field));
      satellites.forEach(({ field, dx, dy }) => push(field, dx, dy));

      return items;
    }, [mainFields, satellites, rotate, textSize]);

    const strike = useCallback((note: string) => {
      const svg = svgRef.current;
      if (!svg || !note) return;

      const escaped = escapeNote(note);
      const fieldNodes = svg.querySelectorAll<SVGGElement>(
        `[data-pan-note="${escaped}"]`,
      );
      const labelNodes = svg.querySelectorAll<SVGTextElement>(
        `[data-pan-label="${escaped}"]`,
      );

      fieldNodes.forEach((node) => {
        node.classList.remove("is-playing");
        void node.getBoundingClientRect();
        node.classList.add("is-playing");
      });

      labelNodes.forEach((node) => {
        node.classList.remove("is-flashing");
        void node.getBoundingClientRect();
        node.classList.add("is-flashing");
      });

      window.clearTimeout(timers.current[note]);
      timers.current[note] = window.setTimeout(() => {
        fieldNodes.forEach((node) => node.classList.remove("is-playing"));
        labelNodes.forEach((node) => node.classList.remove("is-flashing"));
      }, 620);
    }, []);

    const noteNames = useMemo(
      () =>
        Array.from(
          new Set(fields.map((field) => field.note).filter(Boolean)),
        ),
      [fields],
    );

    useImperativeHandle(
      ref,
      () => ({ strike, notes: noteNames }),
      [strike, noteNames],
    );

    useEffect(() => {
      const currentTimers = timers.current;
      return () => {
        Object.values(currentTimers).forEach((id) => window.clearTimeout(id));
      };
    }, []);

    const play = (note: string) => {
      strike(note);
      onNote?.(note);
    };

    const handlePointerDown =
      (note: string) => (event: ReactPointerEvent<SVGGElement>) => {
        if (!note) return;
        pointer.current = {
          note,
          x: event.clientX,
          y: event.clientY,
          damped: false,
        };
        lastStrike.current[note] = performance.now();
        play(note);
      };

    const handlePointerMove =
      (note: string) => (event: ReactPointerEvent<SVGGElement>) => {
        const current = pointer.current;
        if (!current || current.note !== note || current.damped) return;

        if (
          Math.hypot(event.clientX - current.x, event.clientY - current.y) > 9
        ) {
          current.damped = true;
          onDamp?.(note);
        }
      };

    const handlePointerUp = () => {
      pointer.current = null;
    };

    const handlePointerCancel = (note: string) => () => {
      const current = pointer.current;
      if (current && current.note === note && !current.damped) {
        onDamp?.(note);
      }
      pointer.current = null;
    };

    const handleClick = (note: string) => () => {
      if (performance.now() - (lastStrike.current[note] ?? 0) < 700) return;
      play(note);
    };

    const handleKeyDown =
      (note: string) => (event: KeyboardEvent<SVGGElement>) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        play(note);
      };

    const asPhoto = Boolean(renderSrc);
    const imageRadius = renderRadius || rimRadius;
    const rawImageCentre = projectPoint(
      definition.meta.axis?.[0] ?? 0,
      flipY
        ? -(definition.meta.axis?.[1] ?? 0)
        : (definition.meta.axis?.[1] ?? 0),
      rotate,
    );
    const imageCentre: Vec2 = [
      Math.round(rawImageCentre[0] * 100) / 100,
      Math.round(rawImageCentre[1] * 100) / 100,
    ];

    const vars = {
      "--pan-shell": theme.shell,
      "--pan-shell-stroke": theme.shellStroke,
      "--pan-rim": theme.rim,
      "--pan-field": theme.field,
      "--pan-field-stroke": theme.fieldStroke,
      "--pan-satellite": theme.satellite,
      "--pan-satellite-stroke": theme.satelliteStroke,
      "--pan-dome": theme.dome,
      "--pan-dome-stroke": theme.domeStroke,
      "--pan-dimple": theme.dimple,
      "--pan-dimple-stroke": theme.dimpleStroke,
      "--pan-label": theme.label,
      "--pan-glow": theme.glow,
    } as CSSProperties;

    return (
      <svg
        ref={svgRef}
        className={`pan2d ${className ?? ""}`}
        viewBox={viewBox}
        role="group"
        aria-label={`${definition.meta.model} note layout, ${view} view`}
        style={vars}
      >
        {renderSrc ? (
          <image
            x={imageCentre[0] - imageRadius}
            y={imageCentre[1] - imageRadius}
            width={imageRadius * 2}
            height={imageRadius * 2}
            href={renderSrc}
            preserveAspectRatio="xMidYMid meet"
            transform={
              renderSpin
                ? `rotate(${renderSpin} ${imageCentre[0]} ${imageCentre[1]})`
                : undefined
            }
          />
        ) : null}

        <g transform={`rotate(${rotate}) scale(1,-1)`}>
          {!renderSrc ? (
            <>
              <circle
                className="pan-shell"
                cx={shellCentre[0]}
                cy={shellCentre[1]}
                r={rimRadius}
              />
              <circle
                className="pan-rim"
                cx={shellCentre[0]}
                cy={shellCentre[1]}
                r={rimRadius * 0.955}
              />
            </>
          ) : null}

          {satellites.map(({ field, dx, dy }, index) => (
            <g
              key={`satellite-${field.note}-${index}`}
              className="pan-field is-satellite"
              data-pan-note={field.note}
              transform={`translate(${dx.toFixed(1)} ${dy.toFixed(1)})`}
              tabIndex={0}
              role="button"
              aria-label={`Play ${field.note}`}
              onPointerDown={handlePointerDown(field.note)}
              onPointerMove={handlePointerMove(field.note)}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel(field.note)}
              onClick={handleClick(field.note)}
              onKeyDown={handleKeyDown(field.note)}
            >
              <path
                className={asPhoto ? "pan-hit" : "pan-field-shape"}
                d={pathFrom(field.boundary)}
              />
              <path className="pan-glow" d={pathFrom(field.boundary)} />
              {!asPhoto && field.inner ? (
                <path
                  className={field.type === "dimple" ? "pan-dimple" : "pan-dome"}
                  d={pathFrom(field.inner)}
                />
              ) : null}
            </g>
          ))}

          {mainFields.map((field, index) => (
            <g
              key={`field-${field.note}-${index}`}
              className="pan-field"
              data-pan-note={field.note}
              tabIndex={0}
              role="button"
              aria-label={`Play ${field.note}`}
              onPointerDown={handlePointerDown(field.note)}
              onPointerMove={handlePointerMove(field.note)}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel(field.note)}
              onClick={handleClick(field.note)}
              onKeyDown={handleKeyDown(field.note)}
            >
              <path
                className={asPhoto ? "pan-hit" : "pan-field-shape"}
                d={pathFrom(field.boundary)}
              />
              <path className="pan-glow" d={pathFrom(field.boundary)} />
              {!asPhoto && field.inner ? (
                <path
                  className={field.type === "dimple" ? "pan-dimple" : "pan-dome"}
                  d={pathFrom(field.inner)}
                />
              ) : null}
            </g>
          ))}
        </g>

        <g className={`pan-labels ${showLabels ? "" : "is-hidden"}`}>
          {labels.map(({ note, x, y, size }, index) => (
            <text
              key={`label-${note}-${index}`}
              className="pan-label"
              data-pan-label={note}
              x={x}
              y={y}
              fontSize={size}
            >
              {note}
            </text>
          ))}
        </g>
      </svg>
    );
  },
);

export default Handpan2D;

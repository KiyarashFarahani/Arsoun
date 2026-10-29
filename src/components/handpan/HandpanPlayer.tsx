"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import Handpan2D, { type Handpan2DHandle } from "./Handpan2D";
import { noteToMidi, PanSynth } from "@/lib/handpan/audio";
import { PAN_MODELS } from "@/lib/handpan/models";
import { transposeDefinition } from "@/lib/handpan/transpose";
import { retuneSides } from "@/lib/handpan/layout";
import {
  PAN_THEME_LABELS,
  PAN_THEMES,
  type PanThemeName,
} from "@/lib/handpan/themes";

const THEME_NAMES = Object.keys(PAN_THEMES) as PanThemeName[];
const CUSTOM_NOTES = ["D3", "E3", "F3", "G3", "A3", "Bb3", "C4", "D4", "E4", "F4", "G4", "A4", "Bb4", "C5", "D5", "E5", "F5", "G5", "A5", "Bb5", "C6", "D6", "E6", "F6", "G6", "A6", "Bb6", "C7", "D7", "E7", "F7", "G7", "A7", "Bb7"];

function sortByPitch(notes: string[]) {
  return [...notes].sort(
    (a, b) => (noteToMidi(a) ?? 0) - (noteToMidi(b) ?? 0),
  );
}

export default function HandpanPlayer() {
  const [modelId, setModelId] = useState(PAN_MODELS[0].id);
  const [customTopCount, setCustomTopCount] = useState(9);
  const [customBottomCount, setCustomBottomCount] = useState(0);
  const [view, setView] = useState<"top" | "bottom">("top");
  const [surface, setSurface] = useState<"render" | "schematic">("render");
  const [theme, setTheme] = useState<PanThemeName>("ember");
  const [showLabels, setShowLabels] = useState(true);
  const [sound, setSound] = useState(true);
  const [transpose, setTranspose] = useState(0);
  const [activeNote, setActiveNote] = useState<string | null>(null);

  const panRef = useRef<Handpan2DHandle>(null);
  const synthRef = useRef<PanSynth | null>(null);
  const timersRef = useRef<number[]>([]);

  const isCustom = modelId === "custom";
  const customDefinition = useMemo(() => {
    const top = CUSTOM_NOTES.slice(1, customTopCount);
    const bottom = CUSTOM_NOTES.slice(0, customBottomCount);
    const preferred = ["c-ashakiran-17", "d-kurd-19", "fis-kurd-22", "e-amara-20", "b3-pygmy-20", "d-aegean-18", "d-kurd-13"];
    const byCount = (side: "top" | "bottom", count: number) => PAN_MODELS
      .filter((m) => (m.definition.notes?.[side]?.length ?? 0) > 0)
      .sort((a, b) => {
        const distance = Math.abs((a.definition.notes?.[side]?.length ?? 0) - count) - Math.abs((b.definition.notes?.[side]?.length ?? 0) - count);
        return distance || preferred.indexOf(a.id) - preferred.indexOf(b.id);
      })[0].definition;
    const topTemplate = byCount("top", top.length);
    const bottomTemplate = byCount("bottom", bottom.length) ?? topTemplate;
    return retuneSides(topTemplate, bottomTemplate, top, bottom);
  }, [customTopCount, customBottomCount]);
  const model = PAN_MODELS.find((item) => item.id === modelId) ?? PAN_MODELS[0];
  const definition = useMemo(
    () => isCustom ? customDefinition : transposeDefinition(model.definition, transpose),
    [model, transpose, isCustom, customDefinition],
  );
  const bottomNotes = definition.notes?.bottom ?? [];
  const hasBottom = bottomNotes.length > 0;
  const render =
    view === "bottom"
      ? {
          src: model.render.bottom,
          radius: model.render.bottomRadius ?? model.render.radius,
          spin: model.render.bottomSpin ?? model.render.spin,
        }
      : {
          src: model.render.top,
          radius: model.render.radius,
          spin: model.render.spin,
        };
  const originalDing = model.definition.notes?.ding;
  const shiftedDing = definition.notes?.ding;
  const shiftLabel = `${transpose > 0 ? "+" : ""}${transpose}`;

  const getSynth = useCallback(() => {
    if (!synthRef.current) synthRef.current = new PanSynth();
    return synthRef.current;
  }, []);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  useEffect(() => {
    return () => {
      clearTimers();
      synthRef.current?.dispose();
      synthRef.current = null;
    };
  }, [clearTimers]);

  useEffect(() => {
    clearTimers();
    synthRef.current?.dampAll();
    setActiveNote(null);
    if (!hasBottom) setView("top");
  }, [modelId, hasBottom, clearTimers]);

  useEffect(() => {
    clearTimers();
    synthRef.current?.dampAll();
    setActiveNote(null);
  }, [transpose, clearTimers]);

  const handleNote = (note: string) => {
    setActiveNote(note);
    if (sound) getSynth().strike(note);
  };

  const handleDamp = (note: string) => {
    if (sound) getSynth().damp(note);
  };

  const playScale = () => {
    clearTimers();
    synthRef.current?.dampAll();

    const ding = definition.notes?.ding;
    const top = sortByPitch(definition.notes?.top ?? []).filter(
      (note) => note !== ding,
    );
    const sequence = ding ? [ding, ...top] : top;

    if (sound && sequence[0]) {
      getSynth().strike(sequence[0]);
      panRef.current?.strike(sequence[0]);
      setActiveNote(sequence[0]);
    }
    sequence.forEach((note, index) => {
      if (index === 0) return;
      const id = window.setTimeout(() => {
        panRef.current?.strike(note);
        setActiveNote(note);
        if (sound) getSynth().strike(note);
      }, index * 300);
      timersRef.current.push(id);
    });
  };

  const toggleSound = () => {
    setSound((current) => {
      const next = !current;
      const synth = getSynth();
      synth.setEnabled(next);
      if (!next) synth.dampAll();
      return next;
    });
  };

  return (
    <div className="handpan-player mx-auto w-full max-w-6xl">
      <div className="mb-10 max-w-2xl">
        <p className="mb-3 font-body text-xs uppercase tracking-[0.35em] text-[#d6a86b]">
          Arsoun · interactive studio
        </p>
        <h1 className="font-heading text-3xl font-light tracking-wide text-white sm:text-4xl">
          Find your sound
        </h1>
        <p className="mt-4 font-body text-sm leading-relaxed text-white/55">
          Click or tap a tone field to strike it, drag across the surface to
          mute, and switch between measured layouts. Use the key shift to play
          any layout in any key. Sound is a synthesized preview; each handmade instrument has its own voice.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className="relative self-start lg:sticky lg:top-28 overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_50%_35%,rgba(214,168,107,0.12),rgba(255,255,255,0.02)_45%,rgba(255,255,255,0)_75%)] p-4 sm:p-8">
          <Handpan2D
            ref={panRef}
            definition={definition}
            view={view}
            rotate={90}
            renderSrc={surface === "render" ? render.src : null}
            renderRadius={render.radius}
            renderSpin={render.spin}
            theme={theme}
            showLabels={showLabels}
            onNote={handleNote}
            onDamp={handleDamp}
          />

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 font-body text-[11px] uppercase tracking-[0.2em] text-white/35">
            <span>
              {view === "top" ? "Top view" : "Bottom view"} ·{" "}
              {definition.fields.length} fields
              {transpose !== 0 ? ` · ${shiftLabel} st` : ""}
            </span>
            <span className="flex items-center gap-2">
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full ${
                  activeNote ? "bg-[#d6a86b]" : "bg-white/20"
                }`}
              />
              {activeNote ?? "Ready"}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
            <h2 className="font-body text-[11px] uppercase tracking-[0.25em] text-white/40">
              Configuration
            </h2>

            <label className="mt-4 block font-body text-xs text-white/45">
              Model
              <select
                value={modelId}
                onChange={(event) => setModelId(event.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-[#111] px-3 py-2.5 font-body text-sm text-white outline-none transition focus:border-[#d6a86b]/60"
              >
                {[{ id: "custom", model: "Custom layout" }, ...PAN_MODELS].map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.model}
                  </option>
                ))}
              </select>
            </label>

            {isCustom ? (
              <div className="mt-4 space-y-4">
                <div><span className="font-body text-xs text-white/45">Top notes (including ding)</span><div className="mt-2 flex flex-wrap gap-2">{Array.from({length:17},(_,i)=>i+9).map(count => { const ok=true; return <button type="button" key={count} disabled={!ok} aria-pressed={customTopCount===count} onClick={()=>setCustomTopCount(count)} className={`rounded-full border px-3 py-2 text-xs ${customTopCount===count ? "border-[#d6a86b] bg-[#d6a86b] text-black" : ok ? "border-white/15 text-white/65" : "border-white/5 text-white/20"}`}>{count}</button>})}</div></div>
                <div><span className="font-body text-xs text-white/45">Bottom notes</span><div className="mt-2 flex flex-wrap gap-2">{Array.from({length:13},(_,i)=>i).map(count => { const ok=true; return <button type="button" key={count} disabled={!ok} aria-pressed={customBottomCount===count} onClick={()=>setCustomBottomCount(count)} className={`rounded-full border px-3 py-2 text-xs ${customBottomCount===count ? "border-[#d6a86b] bg-[#d6a86b] text-black" : ok ? "border-white/15 text-white/65" : "border-white/5 text-white/20"}`}>{count}</button>})}</div></div>
              </div>
            ) : null}

            <p className="mt-3 font-body text-sm leading-relaxed text-white/55">
              {model.description}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                <span className="block font-body text-[10px] uppercase tracking-[0.2em] text-white/35">
                  Scale
                </span>
                <span className="mt-1 block font-body text-sm text-white/80">
                  {model.scale}
                </span>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                <span className="block font-body text-[10px] uppercase tracking-[0.2em] text-white/35">
                  Notes
                </span>
                <span className="mt-1 block font-body text-sm text-white/80">
                  {definition.fields.length}
                </span>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-body text-[10px] uppercase tracking-[0.2em] text-white/35">
                  Key shift
                </span>
                <span className="font-body text-xs text-[#e3bb86]">
                  {transpose === 0 ? "Concert pitch" : `${shiftLabel} st`}
                </span>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setTranspose((current) => Math.max(-12, current - 1))
                  }
                  disabled={transpose <= -12}
                  aria-label="Transpose down one semitone"
                  className="h-11 w-11 shrink-0 rounded-lg border border-white/10 text-white/60 transition hover:border-[#d6a86b]/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  −
                </button>
                <input
                  type="range"
                  min={-12}
                  max={12}
                  step={1}
                  value={transpose}
                  onChange={(event) =>
                    setTranspose(Number(event.target.value))
                  }
                  aria-label="Transpose in semitones"
                  className="h-1 w-full cursor-pointer accent-[#d6a86b]"
                />
                <button
                  type="button"
                  onClick={() =>
                    setTranspose((current) => Math.min(12, current + 1))
                  }
                  disabled={transpose >= 12}
                  aria-label="Transpose up one semitone"
                  className="h-11 w-11 shrink-0 rounded-lg border border-white/10 text-white/60 transition hover:border-[#d6a86b]/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  +
                </button>
              </div>

              <div className="mt-2 flex items-center justify-between gap-2">
                <p className="font-body text-[11px] leading-relaxed text-white/30">
                  {originalDing && shiftedDing
                    ? `${originalDing} → ${shiftedDing} · same layout`
                    : "Same layout, new pitch"}
                </p>
                {transpose !== 0 ? (
                  <button
                    type="button"
                    onClick={() => setTranspose(0)}
                    className="shrink-0 font-body text-[11px] text-white/40 underline-offset-2 transition hover:text-white/80 hover:underline"
                  >
                    Reset
                  </button>
                ) : null}
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
            <h2 className="font-body text-[11px] uppercase tracking-[0.25em] text-white/40">
              Display
            </h2>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <span className="mb-2 block font-body text-xs text-white/45">
                  View
                </span>
                <div className="flex rounded-xl border border-white/10 bg-black/20 p-1">
                  <button
                    type="button"
                    aria-pressed={view === "top"}
                    onClick={() => setView("top")}
                    className={`flex-1 rounded-lg px-2 py-1.5 font-body text-xs transition ${
                      view === "top"
                        ? "bg-[#d6a86b] text-black"
                        : "text-white/55 hover:text-white"
                    }`}
                  >
                    Top
                  </button>
                  <button
                    type="button"
                    aria-pressed={view === "bottom"}
                    onClick={() => setView("bottom")}
                    disabled={!hasBottom}
                    className={`flex-1 rounded-lg px-2 py-1.5 font-body text-xs transition disabled:cursor-not-allowed disabled:opacity-30 ${
                      view === "bottom"
                        ? "bg-[#d6a86b] text-black"
                        : "text-white/55 hover:text-white"
                    }`}
                  >
                    Bottom
                  </button>
                </div>
              </div>

              <label className="block font-body text-xs text-white/45">
                Style
                <select
                  value={theme}
                  onChange={(event) =>
                    setTheme(event.target.value as PanThemeName)
                  }
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#111] px-3 py-2.5 font-body text-sm text-white outline-none transition focus:border-[#d6a86b]/60"
                >
                  {THEME_NAMES.map((name) => (
                    <option key={name} value={name}>
                      {PAN_THEME_LABELS[name]}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-5">
              <span className="mb-2 block font-body text-xs text-white/45">
                Surface
              </span>
              <div className="flex rounded-xl border border-white/10 bg-black/20 p-1">
                <button
                  type="button"
                  aria-pressed={surface === "render"}
                  onClick={() => setSurface("render")}
                  className={`flex-1 rounded-lg px-2 py-1.5 font-body text-xs transition ${
                    surface === "render"
                      ? "bg-[#d6a86b] text-black"
                      : "text-white/55 hover:text-white"
                  }`}
                >
                  Photo render
                </button>
                <button
                  type="button"
                  aria-pressed={surface === "schematic"}
                  onClick={() => {
                    setSurface("schematic");
                    setTheme((current) =>
                      current === "ember" ? "blueprint" : current,
                    );
                  }}
                  className={`flex-1 rounded-lg px-2 py-1.5 font-body text-xs transition ${
                    surface === "schematic"
                      ? "bg-[#d6a86b] text-black"
                      : "text-white/55 hover:text-white"
                  }`}
                >
                  Schematic
                </button>
              </div>
              <p className="mt-2 font-body text-[11px] leading-relaxed text-white/30">
                Schematic draws the shell and tone-field geometry; the Style
                select changes its look.
              </p>
            </div>

            <div className="mt-5 flex flex-col gap-3">
              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3 font-body text-sm text-white/70">
                Show note names
                <input
                  type="checkbox"
                  checked={showLabels}
                  onChange={(event) => setShowLabels(event.target.checked)}
                  className="h-4 w-4 accent-[#d6a86b]"
                />
              </label>

              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3 font-body text-sm text-white/70">
                Sound
                <input
                  type="checkbox"
                  checked={sound}
                  onChange={toggleSound}
                  className="h-4 w-4 accent-[#d6a86b]"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={playScale}
              className="mt-5 w-full rounded-xl bg-[#d6a86b] px-4 py-3 font-body text-xs font-medium uppercase tracking-[0.2em] text-black transition hover:bg-[#e3bb86]"
            >
              Play the scale
            </button>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
            <h2 className="font-body text-[11px] uppercase tracking-[0.25em] text-white/40">
              Notes
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {[definition.notes?.ding, ...(definition.notes?.top ?? [])]
                .filter(Boolean)
                .map((note) => (
                  <button
                    type="button"
                    onClick={() => { panRef.current?.strike(note!); handleNote(note!); }}
                    key={note}
                    className="rounded-lg border border-white/10 bg-black/20 px-2.5 py-1 font-body text-xs text-white/65"
                  >
                    {note}
                  </button>
                ))}
            </div>

            {hasBottom ? (
              <>
                <h3 className="mt-5 font-body text-[10px] uppercase tracking-[0.2em] text-white/30">
                  Underside
                </h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {bottomNotes.map((note) => (
                    <span
                      key={note}
                      className="rounded-lg border border-[#d6a86b]/25 bg-[#d6a86b]/10 px-2.5 py-1 font-body text-xs text-[#e3bb86]"
                    >
                      {note}
                    </span>
                  ))}
                </div>
              </>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}

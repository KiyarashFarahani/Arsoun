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
const NOTE_NAMES = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "G#", "A", "Bb", "B"];
const CUSTOM_NOTE_OPTIONS = Array.from({ length: 5 }, (_, index) => index + 3).flatMap(
  (octave) => NOTE_NAMES.map((name) => `${name}${octave}`),
).filter((note) => {
  const midi = noteToMidi(note);
  return midi !== null && midi >= (noteToMidi("D3") ?? 0) && midi <= (noteToMidi("Bb7") ?? 127);
});
const MAX_CUSTOM_TOP = 13;
const MAX_CUSTOM_BOTTOM = 6;
const CUSTOM_TOP_FIELD_ORDERS: Record<number, number[]> = {
  11: [0, 1, 2, 4, 3, 7, 5, 6, 8, 9, 10],
  12: [0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 9, 11],
  13: [0, 1, 2, 4, 5, 6, 3, 7, 8, 9, 10, 12, 11],
};

type CustomNoteSide = "top" | "bottom";

function resizeNotes(notes: string[], count: number) {
  return Array.from({ length: count }, (_, index) => notes[index] ?? "");
}

function customTopSlotOrder(count: number) {
  return (
    CUSTOM_TOP_FIELD_ORDERS[count] ??
    Array.from({ length: count }, (_, index) => index)
  );
}

function sortByPitch(notes: string[]) {
  return [...notes].sort(
    (a, b) => (noteToMidi(a) ?? 0) - (noteToMidi(b) ?? 0),
  );
}

interface CustomNoteModalProps {
  label: string;
  note: string;
  onClose: () => void;
  onClear: () => void;
  onSelect: (note: string) => void;
}

function CustomNoteModal({
  label,
  note,
  onClose,
  onClear,
  onSelect,
}: CustomNoteModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="custom-note-picker-title"
    >
      <button
        type="button"
        aria-label="Close note picker"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-white/15 bg-[#111] p-5 shadow-2xl shadow-black/60 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-body text-[10px] uppercase tracking-[0.2em] text-[#d6a86b]">
              Custom note sequence
            </p>
            <h2
              id="custom-note-picker-title"
              className="mt-2 font-heading text-2xl font-light text-white"
            >
              Choose note · {label}
            </h2>
            <p className="mt-2 font-body text-xs text-white/40">
              Select a pitch for this tone field.
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close note picker"
            className="min-h-11 min-w-11 rounded-xl border border-white/10 text-xl text-white/45 transition hover:border-white/30 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#d6a86b]/70"
          >
            ×
          </button>
        </div>

        <div className="mt-5 grid max-h-[min(55vh,26rem)] grid-cols-4 gap-2 overflow-y-auto pr-1 sm:grid-cols-6">
          {CUSTOM_NOTE_OPTIONS.map((option) => (
            <button
              type="button"
              key={option}
              aria-pressed={note === option}
              onClick={() => onSelect(option)}
              className={`min-h-11 rounded-xl border px-2 font-body text-xs transition focus:outline-none focus:ring-2 focus:ring-[#d6a86b]/70 ${
                note === option
                  ? "border-[#d6a86b] bg-[#d6a86b] text-black"
                  : "border-white/10 bg-black/20 text-white/65 hover:border-white/30 hover:text-white"
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onClear}
          className="mt-4 min-h-11 w-full rounded-xl border border-white/10 font-body text-xs text-white/45 transition hover:border-white/30 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#d6a86b]/70"
        >
          Clear slot
        </button>
      </div>
    </div>
  );
}

export default function HandpanPlayer() {
  const [modelId, setModelId] = useState(PAN_MODELS[0].id);
  const [customTopCount, setCustomTopCount] = useState(9);
  const [customBottomCount, setCustomBottomCount] = useState(0);
  const [customTopNotes, setCustomTopNotes] = useState(() => resizeNotes([], 9));
  const [customBottomNotes, setCustomBottomNotes] = useState<string[]>([]);
  const [openPicker, setOpenPicker] = useState<{
    side: CustomNoteSide;
    index: number;
  } | null>(null);
  const [view, setView] = useState<"top" | "bottom">("top");
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
    const top = customTopSlotOrder(customTopCount)
      .slice(1)
      .map((slotIndex) => customTopNotes[slotIndex] ?? "");
    const bottom = customBottomNotes.slice(0, customBottomCount);
    const preferred = ["c-ashakiran-17", "d-kurd-19", "fis-kurd-22", "e-amara-20", "b3-pygmy-20", "d-aegean-18", "d-kurd-13"];
    const byCount = (side: "top" | "bottom", count: number) => PAN_MODELS
      .filter((m) => (m.definition.notes?.[side]?.length ?? 0) > 0)
      .sort((a, b) => {
        const distance = Math.abs((a.definition.notes?.[side]?.length ?? 0) - count) - Math.abs((b.definition.notes?.[side]?.length ?? 0) - count);
        return distance || preferred.indexOf(a.id) - preferred.indexOf(b.id);
      })[0].definition;
    const topTemplate = byCount("top", top.length);
    const bottomTemplate = byCount("bottom", bottom.length) ?? topTemplate;
    return retuneSides(
      topTemplate,
      bottomTemplate,
      top,
      bottom,
      customTopNotes[0] ?? "",
    );
  }, [customTopCount, customBottomCount, customTopNotes, customBottomNotes]);
  const model = PAN_MODELS.find((item) => item.id === modelId) ?? PAN_MODELS[0];
  const definition = useMemo(
    () => isCustom ? customDefinition : transposeDefinition(model.definition, transpose),
    [model, transpose, isCustom, customDefinition],
  );
  const bottomNotes = definition.notes?.bottom ?? [];
  const hasBottom = bottomNotes.length > 0;
  const originalDing = model.definition.notes?.ding;
  const shiftedDing = definition.notes?.ding;
  const shiftLabel = `${transpose > 0 ? "+" : ""}${transpose}`;
  const topSequence = isCustom
    ? customTopNotes.map((note, slotIndex) => ({
        note,
        slotIndex,
      }))
    : [definition.notes?.ding, ...(definition.notes?.top ?? [])]
        .filter((note): note is string => Boolean(note))
        .map((note, slotIndex) => ({ note, slotIndex }));
  const bottomSequence = isCustom
    ? customBottomNotes
    : definition.notes?.bottom ?? [];
  const displayDescription = isCustom
    ? "Build a custom layout by assigning a pitch to each tone field."
    : model.description;
  const displayScale = isCustom ? "Manual selection" : model.scale;
  const customAssignedCount = [...customTopNotes, ...customBottomNotes].filter(Boolean).length;
  const customSlotCount = customTopCount + customBottomCount;
  const customTopComplete =
    customTopNotes.length === customTopCount && customTopNotes.every(Boolean);
  const pickerNotes =
    openPicker?.side === "top" ? customTopNotes : customBottomNotes;
  const pickerNote = openPicker ? pickerNotes[openPicker.index] ?? "" : "";
  const pickerLabel = openPicker
    ? openPicker.side === "top"
      ? openPicker.index === 0
        ? "DING"
        : `TOP ${String(openPicker.index).padStart(2, "0")}`
      : `UNDERSIDE ${String(openPicker.index + 1).padStart(2, "0")}`
    : "";

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
    setOpenPicker(null);
    if (!hasBottom) setView("top");
  }, [modelId, hasBottom, clearTimers]);

  useEffect(() => {
    clearTimers();
    synthRef.current?.dampAll();
    setActiveNote(null);
  }, [transpose, clearTimers]);

  useEffect(() => {
    if (!openPicker) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenPicker(null);
    };
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openPicker]);

  const handleNote = (note: string) => {
    setActiveNote(note);
    if (sound) getSynth().strike(note);
  };

  const handleDamp = (note: string) => {
    if (sound) getSynth().damp(note);
  };

  const updateCustomNote = (
    side: CustomNoteSide,
    index: number,
    note: string,
  ) => {
    if (side === "top") {
      setCustomTopNotes((current) => {
        const next = resizeNotes(current, customTopCount);
        next[index] = note;
        return next;
      });
    } else {
      setCustomBottomNotes((current) => {
        const next = resizeNotes(current, customBottomCount);
        next[index] = note;
        return next;
      });
    }
    setOpenPicker(null);
  };

  const clearCustomNote = (side: CustomNoteSide, index: number) => {
    updateCustomNote(side, index, "");
  };

  const setTopSlotCount = (count: number) => {
    setCustomTopCount(count);
    setCustomTopNotes((current) => resizeNotes(current, count));
    setOpenPicker(null);
  };

  const setBottomSlotCount = (count: number) => {
    setCustomBottomCount(count);
    setCustomBottomNotes((current) => resizeNotes(current, count));
    setOpenPicker(null);
  };

  const clearCustomLayout = () => {
    setCustomTopNotes(resizeNotes([], customTopCount));
    setCustomBottomNotes(resizeNotes([], customBottomCount));
    setOpenPicker(null);
  };

  const playScale = () => {
    clearTimers();
    synthRef.current?.dampAll();

    const ding = definition.notes?.ding;
    const top = isCustom
      ? customTopNotes.slice(1).filter(Boolean)
      : sortByPitch(definition.notes?.top ?? []).filter(
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
          mute, and switch between measured layouts. Use the key shift with
          measured layouts, or choose every pitch yourself in Custom mode.
          Sound is a synthesized preview; each handmade instrument has its own voice.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className="relative self-start lg:sticky lg:top-28 overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_50%_35%,rgba(214,168,107,0.12),rgba(255,255,255,0.02)_45%,rgba(255,255,255,0)_75%)] p-4 sm:p-8">
          <Handpan2D
            ref={panRef}
             definition={definition}
             view={view}
             rotate={90}
             theme={theme}
            showLabels={showLabels}
            onNote={handleNote}
            onDamp={handleDamp}
          />

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 font-body text-[11px] uppercase tracking-[0.2em] text-white/35">
            <span>
              {view === "top" ? "Top view" : "Bottom view"} ·{" "}
              {definition.fields.length} fields
              {!isCustom && transpose !== 0 ? ` · ${shiftLabel} st` : ""}
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
                id="handpan-model"
                name="handpan-model"
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
                 <div>
                   <div className="flex items-center justify-between gap-3">
                     <span className="font-body text-xs text-white/45">
                       Top slots, including ding
                     </span>
                     <button
                       type="button"
                       onClick={clearCustomLayout}
                       className="font-body text-[11px] text-white/40 underline-offset-2 transition hover:text-white/80 hover:underline"
                     >
                       Clear all
                     </button>
                   </div>
                   <div className="mt-2 flex flex-wrap gap-2">
                     {Array.from({ length: MAX_CUSTOM_TOP - 8 }, (_, i) => i + 9).map(
                       (count) => (
                         <button
                           type="button"
                           key={count}
                           aria-pressed={customTopCount === count}
                           onClick={() => setTopSlotCount(count)}
                           className={`min-h-11 min-w-11 rounded-full border px-3 py-2 font-body text-xs transition ${
                             customTopCount === count
                               ? "border-[#d6a86b] bg-[#d6a86b] text-black"
                               : "border-white/15 text-white/65 hover:border-white/35 hover:text-white"
                           }`}
                         >
                           {count}
                         </button>
                       ),
                     )}
                   </div>
                 </div>

                 <div>
                   <span className="font-body text-xs text-white/45">
                     Underside slots
                   </span>
                   <div className="mt-2 flex flex-wrap gap-2">
                     {Array.from({ length: MAX_CUSTOM_BOTTOM + 1 }, (_, count) => (
                       <button
                         type="button"
                         key={count}
                         aria-pressed={customBottomCount === count}
                         onClick={() => setBottomSlotCount(count)}
                         className={`min-h-11 min-w-11 rounded-full border px-3 py-2 font-body text-xs transition ${
                           customBottomCount === count
                             ? "border-[#d6a86b] bg-[#d6a86b] text-black"
                             : "border-white/15 text-white/65 hover:border-white/35 hover:text-white"
                         }`}
                       >
                         {count}
                       </button>
                     ))}
                   </div>
                 </div>
               </div>
             ) : null}

            <p className="mt-3 font-body text-sm leading-relaxed text-white/55">
               {displayDescription}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                <span className="block font-body text-[10px] uppercase tracking-[0.2em] text-white/35">
                  Scale
                </span>
                <span className="mt-1 block font-body text-sm text-white/80">
                   {displayScale}
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

             {!isCustom ? (
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
             ) : null}
           </section>

           <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
             <div className="flex items-start justify-between gap-4">
               <div>
                 <h2 className="font-body text-[11px] uppercase tracking-[0.25em] text-white/40">
                   {isCustom ? "Custom note sequence" : "Current notes"}
                 </h2>
                 <p className="mt-2 font-body text-xs leading-relaxed text-white/35">
                   {isCustom
                     ? "Choose a pitch for each tone field. Slots stay in physical order."
                     : "Notes shown in the instrument’s playing order."}
                 </p>
               </div>
               {isCustom ? (
                 <span className="shrink-0 font-body text-[11px] tabular-nums text-[#e3bb86]">
                   {customAssignedCount}/{customSlotCount} assigned
                 </span>
               ) : null}
             </div>

             <div className="mt-5">
               <span className="font-body text-[10px] uppercase tracking-[0.2em] text-white/30">
                 Top · playing order
               </span>
               <div className="mt-2 flex flex-wrap gap-2">
                  {topSequence.map(({ note, slotIndex }) => {
                    const isPickerOpen =
                      isCustom &&
                      openPicker?.side === "top" &&
                      openPicker.index === slotIndex;
                    const label =
                      slotIndex === 0
                        ? "DING"
                        : String(slotIndex).padStart(2, "0");

                    return (
                      <div key={`top-${slotIndex}`} className="relative">
                        <button
                          type="button"
                          aria-label={
                            isCustom
                              ? `Choose note for ${slotIndex === 0 ? "ding" : `top slot ${slotIndex}`}`
                              : `Play ${note}`
                          }
                          aria-expanded={isCustom ? isPickerOpen : undefined}
                          onClick={() => {
                            if (isCustom) {
                              setOpenPicker(
                                isPickerOpen
                                  ? null
                                  : { side: "top", index: slotIndex },
                              );
                            } else if (note) {
                              panRef.current?.strike(note);
                              handleNote(note);
                            }
                          }}
                          className={`min-h-12 rounded-xl border px-3 py-2 text-left transition focus:outline-none focus:ring-2 focus:ring-[#d6a86b]/70 ${
                            slotIndex === 0
                             ? "border-[#d6a86b]/60 bg-[#d6a86b]/10"
                             : note
                               ? "border-white/10 bg-black/20 hover:border-white/30"
                               : "border-dashed border-white/20 bg-black/10 hover:border-[#d6a86b]/60"
                         }`}
                       >
                         <span className="block font-body text-[9px] uppercase tracking-[0.16em] text-white/35">
                           {label}
                         </span>
                         <span
                           className={`mt-0.5 block min-w-7 font-body text-xs ${
                             note ? "text-white/80" : "text-white/30"
                           }`}
                         >
                           {note || "—"}
                         </span>
                       </button>

                      </div>
                   );
                 })}
               </div>
             </div>

             {bottomSequence.length > 0 ? (
               <div className="mt-5">
                 <span className="font-body text-[10px] uppercase tracking-[0.2em] text-white/30">
                   Underside · playing order
                 </span>
                 <div className="mt-2 flex flex-wrap gap-2">
                   {bottomSequence.map((note, index) => {
                     const isPickerOpen =
                       isCustom &&
                       openPicker?.side === "bottom" &&
                       openPicker.index === index;

                     return (
                       <div key={`bottom-${index}`} className="relative">
                         <button
                           type="button"
                           aria-label={
                             isCustom
                               ? `Choose note for underside slot ${index + 1}`
                               : `Play ${note}`
                           }
                           aria-expanded={isCustom ? isPickerOpen : undefined}
                           onClick={() => {
                             if (isCustom) {
                               setOpenPicker(
                                 isPickerOpen ? null : { side: "bottom", index },
                               );
                             } else if (note) {
                               panRef.current?.strike(note);
                               handleNote(note);
                             }
                           }}
                           className={`min-h-12 rounded-xl border px-3 py-2 text-left transition focus:outline-none focus:ring-2 focus:ring-[#d6a86b]/70 ${
                             note
                               ? "border-[#d6a86b]/25 bg-[#d6a86b]/10"
                               : "border-dashed border-white/20 bg-black/10 hover:border-[#d6a86b]/60"
                           }`}
                         >
                           <span className="block font-body text-[9px] uppercase tracking-[0.16em] text-white/35">
                             {String(index + 1).padStart(2, "0")}
                           </span>
                           <span
                             className={`mt-0.5 block min-w-7 font-body text-xs ${
                               note ? "text-[#e3bb86]" : "text-white/30"
                             }`}
                           >
                             {note || "—"}
                           </span>
                         </button>

                        </div>
                     );
                   })}
                 </div>
               </div>
             ) : null}
           </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
             <div className="flex items-center justify-between gap-3">
               <h2 className="font-body text-[11px] uppercase tracking-[0.25em] text-white/40">
                 Display
               </h2>
               <span className="font-body text-[10px] uppercase tracking-[0.2em] text-[#d6a86b]/70">
                 Schematic mode
               </span>
             </div>

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
                   id="handpan-style"
                   name="handpan-style"
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
               disabled={isCustom && !customTopComplete}
               className="mt-5 w-full rounded-xl bg-[#d6a86b] px-4 py-3 font-body text-xs font-medium uppercase tracking-[0.2em] text-black transition hover:bg-[#e3bb86] disabled:cursor-not-allowed disabled:opacity-35"
             >
               Play the scale
             </button>
           </section>
        </div>
      </div>

      {openPicker && isCustom ? (
        <CustomNoteModal
          label={pickerLabel}
          note={pickerNote}
          onClose={() => setOpenPicker(null)}
          onClear={() => clearCustomNote(openPicker.side, openPicker.index)}
          onSelect={(note) =>
            updateCustomNote(openPicker.side, openPicker.index, note)
          }
        />
      ) : null}
    </div>
  );
}

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
const KEYBOARD_KEYS = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "q",
  "w",
  "e",
  "r",
  "t",
  "y",
  "u",
  "i",
  "o",
];
const NOTE_NAMES = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "G#", "A", "Bb", "B"];
const CUSTOM_NOTE_OPTIONS = Array.from({ length: 5 }, (_, index) => index + 2).flatMap(
  (octave) => NOTE_NAMES.map((name) => `${name}${octave}`),
).filter((note) => {
  const midi = noteToMidi(note);
  return midi !== null && midi >= (noteToMidi("F2") ?? 0) && midi <= (noteToMidi("A6") ?? 127);
});
const MAX_CUSTOM_TOP = 13;
const MAX_CUSTOM_BOTTOM = 6;
const CUSTOM_TOP_FIELD_ORDERS: Record<number, number[]> = {
  10: [0, 1, 2, 4, 3, 7, 5, 6, 8, 9],
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
  const [theme, setTheme] = useState<PanThemeName>("ember");
  const [transpose, setTranspose] = useState(0);
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState(true);

  const panRef = useRef<Handpan2DHandle>(null);
  const synthRef = useRef<PanSynth | null>(null);
  const timersRef = useRef<number[]>([]);
  const pressedKeyboardNotesRef = useRef(new Map<string, string>());

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
    const topTemplate = byCount(
      "top",
      customTopCount === 10 ? 10 : top.length,
    );
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
  const shiftLabel = `${transpose > 0 ? "+" : ""}${transpose}`;
  const transposeBounds = useMemo(() => {
    const midiNotes = model.definition.fields
      .map((field) => noteToMidi(field.note))
      .filter((midi): midi is number => midi !== null);
    const minMidi = noteToMidi("F2") ?? 41;
    const maxMidi = noteToMidi("A6") ?? 93;

    return {
      min: midiNotes.length ? minMidi - Math.min(...midiNotes) : -12,
      max: midiNotes.length ? maxMidi - Math.max(...midiNotes) : 12,
    };
  }, [model]);
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
  const keyboardNotes = useMemo(() => {
    const ding = definition.notes?.ding;
    const notes = Array.from(
      new Set(definition.fields.map((field) => field.note).filter(Boolean)),
    ).filter((note) => note !== ding);
    return [ding, ...sortByPitch(notes)].filter(
      (note): note is string => Boolean(note),
    );
  }, [definition]);
  const audioNotes = useMemo(
    () => Array.from(
      new Set(definition.fields.map((field) => field.note).filter(Boolean)),
    ),
    [definition],
  );
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

  useEffect(() => {
    let cancelled = false;
    setIsAudioLoading(true);

    void getSynth().preload(audioNotes).finally(() => {
      if (!cancelled) setIsAudioLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [audioNotes, getSynth]);

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
  }, [modelId, clearTimers]);

  useEffect(() => {
    setTranspose((current) =>
      Math.min(transposeBounds.max, Math.max(transposeBounds.min, current)),
    );
  }, [transposeBounds]);

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

  const handleNote = useCallback((note: string) => {
    setActiveNote(note);
    getSynth().strike(note);
  }, [getSynth]);

  const handleDamp = useCallback((note: string) => {
    getSynth().damp(note);
  }, [getSynth]);

  useEffect(() => {
    const releasePressedNotes = () => {
      pressedKeyboardNotesRef.current.clear();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName) ||
          target.isContentEditable)
      ) {
        return;
      }

      const key = event.key.toLowerCase();
      const noteIndex = KEYBOARD_KEYS.indexOf(key);
      const note = keyboardNotes[noteIndex];
      if (noteIndex < 0 || !note || pressedKeyboardNotesRef.current.has(key)) {
        return;
      }

      event.preventDefault();
      pressedKeyboardNotesRef.current.set(key, note);
      panRef.current?.strike(note);
      handleNote(note);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const note = pressedKeyboardNotesRef.current.get(key);
      if (!note) return;
      pressedKeyboardNotesRef.current.delete(key);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", releasePressedNotes);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", releasePressedNotes);
      releasePressedNotes();
    };
  }, [handleNote, keyboardNotes]);

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

  const openCustomField = (side: CustomNoteSide, fieldIndex: number) => {
    if (!isCustom) return;
    const index = side === "top"
      ? customTopSlotOrder(customTopCount)[fieldIndex]
      : fieldIndex;
    if (index !== undefined) setOpenPicker({ side, index });
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

  const removeCustomNote = (side: CustomNoteSide, index: number) => {
    if (side === "top") {
      if (customTopCount <= 9 || index === 0) return;
      setCustomTopCount((current) => Math.max(9, current - 1));
      setCustomTopNotes((current) => current.filter((_, noteIndex) => noteIndex !== index));
    } else {
      setCustomBottomCount((current) => Math.max(0, current - 1));
      setCustomBottomNotes((current) => current.filter((_, noteIndex) => noteIndex !== index));
    }
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

    if (sequence[0]) {
      getSynth().strike(sequence[0]);
      panRef.current?.strike(sequence[0]);
      setActiveNote(sequence[0]);
    }
    sequence.forEach((note, index) => {
      if (index === 0) return;
      const id = window.setTimeout(() => {
        panRef.current?.strike(note);
        setActiveNote(note);
        getSynth().strike(note);
      }, index * 300);
      timersRef.current.push(id);
    });
  };

  return (
    <div className="handpan-player mx-auto w-full max-w-7xl">
      <div className="mx-auto mb-8 max-w-2xl text-center">
        <p className="mb-3 font-body text-xs uppercase tracking-[0.35em] text-[#d6a86b]">
          Arsoun · interactive studio
        </p>
        <h1 className="font-heading text-3xl font-light tracking-wide text-white sm:text-4xl">
          Find your sound
        </h1>
      </div>

      <div className="flex flex-col gap-8 xl:grid xl:grid-cols-[minmax(0,1.4fr)_minmax(360px,0.8fr)] xl:items-start xl:gap-10">
         <div
           className="relative mx-auto w-full max-w-4xl xl:sticky xl:top-28"
           aria-busy={isAudioLoading}
         >
           {isAudioLoading ? (
             <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#0a0a0a]/75 backdrop-blur-sm">
               <div className="flex items-center gap-3 rounded-full border border-white/10 bg-black/40 px-4 py-2.5 font-body text-xs text-white/70 shadow-xl">
                 <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#d6a86b]/30 border-t-[#d6a86b]" />
                 <span role="status" aria-live="polite">Loading sounds…</span>
               </div>
             </div>
           ) : null}
            <Handpan2D
             ref={panRef}
              definition={definition}
              rotate={90}
              theme={theme}
             onNote={handleNote}
             onDamp={handleDamp}
             onUnassigned={openCustomField}
           />

          <div className="mt-3 flex flex-wrap items-center justify-center gap-3 font-body text-[11px] uppercase tracking-[0.2em] text-white/35">
             <span>
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

        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 xl:max-w-none">
          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
            <h2 className="font-body text-[11px] uppercase tracking-[0.25em] text-white/40">
              Configuration
            </h2>

            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end">
              <label className="block flex-1 font-body text-xs text-white/45">
                Model
                <div className="relative mt-2">
                  <select
                    id="handpan-model"
                    name="handpan-model"
                    value={modelId}
                    onChange={(event) => setModelId(event.target.value)}
                    className="w-full appearance-none rounded-xl border border-white/10 bg-[#111] px-3 py-2.5 pr-10 font-body text-sm text-white outline-none transition focus:border-[#d6a86b]/60"
                  >
                    {[{ id: "custom", model: "Custom layout" }, ...PAN_MODELS].map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.model}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 border-b border-r border-white/45" aria-hidden="true" />
                </div>
              </label>

              {!isCustom ? (
                <div className="flex shrink-0 items-center gap-2 sm:pb-0.5">
                  <span className="sr-only">Key shift</span>
                <button
                  type="button"
                  onClick={() =>
                     setTranspose((current) => Math.max(transposeBounds.min, current - 1))
                   }
                   disabled={transpose <= transposeBounds.min}
                  aria-label="Transpose down one semitone"
                  className="h-11 w-11 shrink-0 rounded-lg border border-white/10 text-white/60 transition hover:border-[#d6a86b]/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  −
                </button>
                <button
                  type="button"
                  onClick={() => setTranspose(0)}
                  disabled={transpose === 0}
                  aria-label="Reset transpose"
                  className="h-11 w-11 shrink-0 rounded-lg border border-white/10 text-white/60 transition hover:border-[#d6a86b]/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  ↺
                </button>
                <button
                  type="button"
                  onClick={() =>
                     setTranspose((current) => Math.min(transposeBounds.max, current + 1))
                   }
                   disabled={transpose >= transposeBounds.max}
                  aria-label="Transpose up one semitone"
                  className="h-11 w-11 shrink-0 rounded-lg border border-white/10 text-white/60 transition hover:border-[#d6a86b]/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  +
                </button>
              </div>
              ) : null}
            </div>

            <label className="mt-4 block font-body text-xs text-white/45">
              Style
              <div className="relative mt-2">
                <select
                  id="handpan-style"
                  name="handpan-style"
                  value={theme}
                  onChange={(event) =>
                    setTheme(event.target.value as PanThemeName)
                  }
                  className="w-full appearance-none rounded-xl border border-white/10 bg-[#111] px-3 py-2.5 pr-10 font-body text-sm text-white outline-none transition focus:border-[#d6a86b]/60"
                >
                  {THEME_NAMES.map((name) => (
                    <option key={name} value={name}>
                      {PAN_THEME_LABELS[name]}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 border-b border-r border-white/45" aria-hidden="true" />
              </div>
            </label>

            <div className="mt-8 border-t border-white/10 pt-6">
              <div className="flex items-start justify-end gap-4">
                {isCustom ? (
                  <div className="flex shrink-0 items-center gap-3">
                    <button
                      type="button"
                      onClick={clearCustomLayout}
                      className="font-body text-[11px] text-white/40 underline-offset-2 transition hover:text-white/80 hover:underline"
                    >
                      Clear all
                    </button>
                    <span className="font-body text-[11px] tabular-nums text-[#e3bb86]">
                      {customAssignedCount}/{customSlotCount} assigned
                    </span>
                  </div>
                ) : null}
             </div>

             <div className="mt-5">
               <span className="font-body text-[10px] uppercase tracking-[0.2em] text-white/30">
                 Top · playing order
               </span>
                <div className="mt-2 flex flex-wrap items-center gap-2">
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
                       <div key={`top-${slotIndex}`} className="group relative">
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
                        {isCustom && customTopCount > 9 && slotIndex > 0 ? (
                          <button
                            type="button"
                            aria-label={`Remove top slot ${slotIndex}`}
                            onClick={(event) => {
                              event.stopPropagation();
                              removeCustomNote("top", slotIndex);
                            }}
                            className="absolute right-0 top-0 z-10 flex !h-5 !min-h-0 !min-w-0 w-5 shrink-0 -translate-y-1/4 translate-x-1/4 aspect-square items-center justify-center rounded-full border border-white/20 bg-[#171717] p-0 text-xs leading-none text-white/60 opacity-100 shadow-lg transition hover:border-[#d6a86b] hover:text-[#e3bb86] focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-[#d6a86b]/70 sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100"
                          >
                            −
                          </button>
                        ) : null}
                       </div>
                   );
                  })}
                  {isCustom ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setTopSlotCount(customTopCount + 1)}
                        disabled={customTopCount >= MAX_CUSTOM_TOP}
                        aria-label="Add top note"
                        className="min-h-12 min-w-12 rounded-xl border border-dashed border-[#d6a86b]/50 text-xl text-[#e3bb86] transition hover:border-[#d6a86b] disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        +
                      </button>
                     </div>
                  ) : null}
                </div>
              </div>

              {isCustom || bottomSequence.length > 0 ? (
                <div className="mt-5">
                 <span className="font-body text-[10px] uppercase tracking-[0.2em] text-white/30">
                   Underside · playing order
                 </span>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                   {bottomSequence.map((note, index) => {
                     const isPickerOpen =
                       isCustom &&
                       openPicker?.side === "bottom" &&
                       openPicker.index === index;

                     return (
                        <div key={`bottom-${index}`} className="group relative">
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
                          {isCustom ? (
                            <button
                              type="button"
                              aria-label={`Remove underside slot ${index + 1}`}
                              onClick={(event) => {
                                event.stopPropagation();
                                removeCustomNote("bottom", index);
                              }}
                              className="absolute right-0 top-0 z-10 flex !h-5 !min-h-0 !min-w-0 w-5 shrink-0 -translate-y-1/4 translate-x-1/4 aspect-square items-center justify-center rounded-full border border-white/20 bg-[#171717] p-0 text-xs leading-none text-white/60 opacity-100 shadow-lg transition hover:border-[#d6a86b] hover:text-[#e3bb86] focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-[#d6a86b]/70 sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100"
                            >
                              −
                            </button>
                          ) : null}
                         </div>
                     );
                   })}
                    {isCustom ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setBottomSlotCount(customBottomCount + 1)}
                          disabled={customBottomCount >= MAX_CUSTOM_BOTTOM}
                          aria-label="Add underside note"
                          className="min-h-12 min-w-12 rounded-xl border border-dashed border-[#d6a86b]/50 text-xl text-[#e3bb86] transition hover:border-[#d6a86b] disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>

              <div className="mt-8 border-t border-white/10 pt-6">
              <button
               type="button"
               onClick={playScale}
               disabled={isCustom && !customTopComplete}
               className="mt-5 w-full rounded-xl bg-[#d6a86b] px-4 py-3 font-body text-xs font-medium uppercase tracking-[0.2em] text-black transition hover:bg-[#e3bb86] disabled:cursor-not-allowed disabled:opacity-35"
              >
                Play the scale
              </button>
              </div>
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

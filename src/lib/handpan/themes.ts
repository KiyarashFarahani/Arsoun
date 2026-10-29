export type PanThemeName = "current" | "blueprint" | "ember" | "flat";

export interface PanTheme {
  shell: string;
  shellStroke: string;
  rim: string;
  field: string;
  fieldStroke: string;
  satellite: string;
  satelliteStroke: string;
  dome: string;
  domeStroke: string;
  dimple: string;
  dimpleStroke: string;
  label: string;
  glow: string;
}

export const PAN_THEMES: Record<PanThemeName, PanTheme> = {
  current: {
    shell: "#191d24",
    shellStroke: "rgba(139, 152, 184, 0.45)",
    rim: "rgba(139, 152, 184, 0.16)",
    field: "#1f232b",
    fieldStroke: "rgba(139, 152, 184, 0.55)",
    satellite: "#191c22",
    satelliteStroke: "rgba(101, 117, 153, 0.5)",
    dome: "#d6a86b",
    domeStroke: "rgba(214, 168, 107, 0.8)",
    dimple: "#0f1115",
    dimpleStroke: "rgba(214, 168, 107, 0.55)",
    label: "#ece9e2",
    glow: "#d6a86b",
  },
  blueprint: {
    shell: "#0c1017",
    shellStroke: "#5b6f9e",
    rim: "#33415f",
    field: "none",
    fieldStroke: "#7f93bd",
    satellite: "none",
    satelliteStroke: "#5b6f9e",
    dome: "none",
    domeStroke: "#9fb4dd",
    dimple: "none",
    dimpleStroke: "#7f93bd",
    label: "#9fb4dd",
    glow: "#cfe0ff",
  },
  ember: {
    shell: "#2a1c11",
    shellStroke: "#6b543c",
    rim: "rgba(255, 220, 168, 0.1)",
    field: "rgba(255, 224, 180, 0.05)",
    fieldStroke: "rgba(255, 214, 160, 0.26)",
    satellite: "rgba(255, 224, 180, 0.04)",
    satelliteStroke: "rgba(255, 214, 160, 0.22)",
    dome: "#c98f4e",
    domeStroke: "rgba(255, 232, 196, 0.45)",
    dimple: "#100b07",
    dimpleStroke: "rgba(154, 109, 62, 0.9)",
    label: "#f8e9d2",
    glow: "#ffd9a0",
  },
  flat: {
    shell: "#232833",
    shellStroke: "transparent",
    rim: "transparent",
    field: "#39414f",
    fieldStroke: "transparent",
    satellite: "#2c3340",
    satelliteStroke: "transparent",
    dome: "#e0a95f",
    domeStroke: "transparent",
    dimple: "#141821",
    dimpleStroke: "transparent",
    label: "#ffffff",
    glow: "#ffffff",
  },
};

export const PAN_THEME_LABELS: Record<PanThemeName, string> = {
  current: "Current",
  blueprint: "Blueprint",
  ember: "Ember Relief",
  flat: "Flat Signal",
};

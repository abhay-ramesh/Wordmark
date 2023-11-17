import { Layouts } from "@/components/custom/SelectableLayoutCard";
import { LucideIconType } from "@/components/icons";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { FontItem } from "./fonts";
import { IColor } from "react-color-palette";
import { Units } from "./constants";

// export const logoNameAtom = atomWithStorage<string>("logoName", "Wordmark.");
export const logoNameAtom = atom("Wordmark.");
// export const iconAtom = atomWithStorage<LucideIconType>("icon", "boxes");
// export const iconAtom = atom("boxes");

// export const layoutAtom = atomWithStorage<Layouts>("layout", "ltr");
export const layoutAtom = atom("ltr");

export const fontAtom = atom<string | undefined>(undefined);

export const textAtom = atom<{
  text: string;
  color: IColor;
  size: number;
  font: Partial<FontItem>;
}>({
  text: "Wordmark.",
  color: {
    hex: "#000000",
    rgb: {
      r: 0,
      g: 0,
      b: 0,
      a: 1,
    },
    hsv: {
      h: 0,
      s: 0,
      v: 0,
      a: 1,
    },
  },
  size: 24,
  font: {
    family: "Inter",
    variants: ["regular"],
    subsets: ["latin"],
    version: "3.19",
    lastModified: "2021-04-27",
    files: {
      regular: "http://fonts.gstatic.com/s/inter/v3/3qjtzSFDUh2N3qznfJw.ttf",
    },
    category: "sans-serif",
    kind: "webfonts#webfont",
    menu: "serif",
  },
});

export const iconAtom = atom<{
  icon: LucideIconType;
  color: IColor;
  size: number;
}>({
  icon: "boxes",
  color: {
    hex: "#000000",
    rgb: {
      r: 0,
      g: 0,
      b: 0,
      a: 1,
    },
    hsv: {
      h: 0,
      s: 0,
      v: 0,
      a: 1,
    },
  },
  size: 32,
});

type UnitType = (typeof Units)[number];

export const cardAtom = atom<{
  color: IColor;
  width: {
    value: number;
    unit: UnitType;
  };
  height: {
    value: number;
    unit: UnitType;
  };
}>({
  color: {
    hex: "#ffffff",
    rgb: {
      r: 255,
      g: 255,
      b: 255,
      a: 1,
    },
    hsv: {
      h: 0,
      s: 0,
      v: 1,
      a: 1,
    },
  },
  width: {
    value: 400,
    unit: "px",
  },
  height: {
    value: 225,
    unit: "px",
  },
});

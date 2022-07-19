export enum Color {
  VIOLET = "#9E25FC",
  DARK_VIOLET = "#250341",
  SEAFOAM = "#0BD3D3",
  BLACKSEAFOAM = "043b3b",
  LIGHT_GRAY = "#F5F5FA",
  WHITE = "#FFF",
  MEDIUM_GRAY = "#e1e1eb",
  DARK_GRAY = "#878799",
  CYAN = "#99f2f2",
  YELLOW = "#f7f28d",
  MAGENTA = "#eb94eb",
  PASTEL_PURPLE = "#CCCCFF",
  PALE_CYAN = "#bbfafa",
  PALE_YELLOW = "#fcfcc0",
  PALE_MAGENTA = "#ffbaff",
  PALE_PASTEL_PURPLE = "#e1e1fc",
  PEACH = "#F29999",
  GREENISH = "#94EB94",
  PINKRED = "#FE6B8B",
  ORANGE = "#FF8E53",
  PURPLEY = "#564787",
  //new pallette stuff
  FLICKR = "#F72585",
  BYZ = "#B5179E",
  PURP1 = "#7209B7",
  PURP2 = "#560BAD",
  TRYPAN = "#480CA8",
  TRYPAN2 = "#3A0CA3",
  Persian = "#3F37C9",
  ULTRA = "#4361EE",
  DODGER = "#4895EF",
  VIVID = "#4CC9F0",
}

export interface ColorTheme {
  "--primary": Color;
  "--black-primary": Color;
  "--tabs": Color;
  "--secondary": Color;
  "--background": Color;
  "--white": Color;
  "--dark-gray": Color;
  "--medium-gray": Color;
  "--light-gray": Color;
  "--gene": Color;
  "--gene-light": Color;
  "--transcript": Color;
  "--transcript-light": Color;
  "--linker": Color;
  "--linker-light": Color;
  "--region": Color;
  "--region-light": Color;
  "--any-gene": Color;
  "--unknown-gene": Color;
  // '--any-gene-light': Color;
  "--gradient-1": Color;
  "--gradient-2": Color;
  "--gradient-3": Color;
}

export type ColorThemeType = "two" | "light" | "dark";

export const COLORTHEMES: Record<ColorThemeType, ColorTheme> = {
  light: {
    "--primary": Color.SEAFOAM,
    "--black-primary": Color.BLACKSEAFOAM,
    "--secondary": Color.DARK_VIOLET,
    "--tabs": Color.WHITE,
    "--background": Color.LIGHT_GRAY,
    "--white": Color.WHITE,
    "--dark-gray": Color.DARK_GRAY,
    "--medium-gray": Color.MEDIUM_GRAY,
    "--light-gray": Color.LIGHT_GRAY,
    "--gene": Color.CYAN,
    "--gene-light": Color.PALE_CYAN,
    "--transcript": Color.YELLOW,
    "--transcript-light": Color.PALE_YELLOW,
    "--linker": Color.MAGENTA,
    "--linker-light": Color.PALE_MAGENTA,
    "--any-gene": Color.PEACH,
    "--unknown-gene": Color.GREENISH,
    "--region": Color.PASTEL_PURPLE,
    "--region-light": Color.PALE_PASTEL_PURPLE,
    "--gradient-1": Color.PINKRED,
    "--gradient-2": Color.ORANGE,
    "--gradient-3": Color.PURPLEY,
  },
  dark: {
    "--primary": Color.SEAFOAM,
    "--black-primary": Color.BLACKSEAFOAM,
    "--secondary": Color.DARK_VIOLET,
    "--tabs": Color.WHITE,
    "--background": Color.LIGHT_GRAY,
    "--white": Color.WHITE,
    "--dark-gray": Color.DARK_GRAY,
    "--medium-gray": Color.MEDIUM_GRAY,
    "--light-gray": Color.LIGHT_GRAY,
    "--gene": Color.CYAN,
    "--gene-light": Color.PALE_CYAN,
    "--transcript": Color.YELLOW,
    "--transcript-light": Color.PALE_YELLOW,
    "--linker": Color.MAGENTA,
    "--linker-light": Color.PALE_MAGENTA,
    "--any-gene": Color.PEACH,
    "--unknown-gene": Color.GREENISH,
    "--region": Color.PASTEL_PURPLE,
    "--region-light": Color.PALE_PASTEL_PURPLE,
    "--gradient-1": Color.PINKRED,
    "--gradient-2": Color.ORANGE,
    "--gradient-3": Color.PURPLEY,
  },
  two: {
    "--primary": Color.DODGER,
    "--black-primary": Color.BLACKSEAFOAM,
    "--secondary": Color.DARK_VIOLET,
    "--tabs": Color.WHITE,
    "--background": Color.LIGHT_GRAY,
    "--white": Color.WHITE,
    "--dark-gray": Color.DARK_GRAY,
    "--medium-gray": Color.MEDIUM_GRAY,
    "--light-gray": Color.LIGHT_GRAY,
    "--gene": Color.VIVID,
    "--gene-light": Color.VIVID,
    "--transcript": Color.PURP1,
    "--transcript-light": Color.PURP1,
    "--linker": Color.FLICKR,
    "--linker-light": Color.FLICKR,
    "--any-gene": Color.PEACH, // TODO ?
    "--unknown-gene": Color.GREENISH, // TODO ?
    "--region": Color.ULTRA,
    "--region-light": Color.ULTRA,
    "--gradient-1": Color.PURP1,
    "--gradient-2": Color.ULTRA,
    "--gradient-3": Color.PURPLEY,
  },
};

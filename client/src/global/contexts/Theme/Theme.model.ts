export enum Color {
  VIOLET = '#9E25FC',
  DARK_VIOLET = '#250341',
  SEAFOAM = '#0BD3D3',
  LIGHT_GRAY = '#F5F5F5',
  WHITE = '#FFF',
  MEDIUM_GRAY = '#878791',
}

export interface ColorTheme {
  '--primary': Color;
  '--tabs': Color;
  '--secondary': Color;
  '--background': Color;
  '--white': Color;
  '--medium-gray': Color;
  '--light-gray': Color;
}

export type ColorThemeType = 'dark' | 'light';

export const COLORTHEMES: Record<ColorThemeType, ColorTheme> = {
  light: {
    '--primary': Color.SEAFOAM,
    '--secondary': Color.DARK_VIOLET,
    '--tabs': Color.WHITE,
    '--background': Color.LIGHT_GRAY,
    '--white': Color.WHITE,
    '--medium-gray': Color.MEDIUM_GRAY,
    '--light-gray': Color.LIGHT_GRAY
  },
  dark: {
    '--primary': Color.SEAFOAM,
    '--secondary': Color.WHITE,
    '--tabs': Color.WHITE,
    '--background': Color.DARK_VIOLET,
    '--white': Color.WHITE,
    '--medium-gray': Color.MEDIUM_GRAY,
    '--light-gray': Color.LIGHT_GRAY
  }
};
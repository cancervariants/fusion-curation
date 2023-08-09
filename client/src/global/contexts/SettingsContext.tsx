import { createContext } from "react";

export type SettingsType = {
  enableToolTips: boolean;
};

export const defaultSettings = {
  enableToolTips: false,
};

export const SettingsContext = createContext<SettingsType>(defaultSettings);

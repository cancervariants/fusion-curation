import { createContext } from "react";

export type SettingsType = {
  enableToolTips: boolean;
};

export const defaultSettings = {
  enableToolTips: false,
};

export const initialSettings =
  sessionStorage.getItem("fusion-builder-settings") !== null
    ? JSON.parse(sessionStorage.getItem("fusion-builder-settings") as string)
    : defaultSettings;

export const SettingsContext = createContext<SettingsType>(defaultSettings);

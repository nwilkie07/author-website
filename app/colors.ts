// Centralized color tokens extracted from the project styles and Tailwind defaults.
// This file provides a simple, type-safe map for use in TS/JS code.
export const COLORS = {
  bg: "#fffdfb",
  bgSecondary: "#fef7ed",
  bgTertiary: "#fffbf5",
  text: "#521000",
  textSecondary: "#521000b3",
  border: "#ebd5c1",
  primary: "#ff4801",
  primaryHover: "#ff7038",
  danger: "#fb2c36",
  dangerHover: "#dc2626",
  success: "#16a34a",
  black: "#000",
  white: "#fff",
} as const;

export type ColorToken = keyof typeof COLORS;
export type ColorMap = typeof COLORS;

export default COLORS;

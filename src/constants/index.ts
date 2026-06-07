export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Zyntra";
export const APP_NAME_SECOND =
  process.env.NEXT_PUBLIC_APP_NAME_SECOND || "Shop";
export const APP_DESCRIPTION =
  process.env.NEXT_PUBLIC_APP_DESCRIPTION ||
  "Zyntra Shop - Your One-Stop Online Store";

export const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

export const LATEST_PRODUCTS_LIMIT = 10;
export const MAX_PRODUCTS_LIMIT = 100;

export const SIDEBAR_WIDTH = "16rem";
export const SIDEBAR_WIDTH_MOBILE = "18rem";

// src/lib/sizes.ts
export const DEFAULT_UNITS = {
  international: ["eu", "us", "uk"] as const,
  length: ["cm", "m", "mm"] as const,
  weight: ["kg", "g", "mg"] as const,
  volume: ["l", "ml"] as const,
  count: ["pcs", "Stk."] as const,
} satisfies Record<string, readonly string[]>;

export type UnitType = keyof typeof DEFAULT_UNITS;
export type UnitValue = (typeof DEFAULT_UNITS)[UnitType][number];

export interface Option {
  id: string;
  // Frontend form fields: prefer explicit enum-backed baseColor and optional displayColor
  baseColor?: string;
  displayColor?: string;
  sellPrice: number;
  entryPrice: number;
  taxPercentage: number;
  quantity: number;
  image: string[];
  weight: number;
  // stockLevel removed — no longer stored in DB
  // optionale Felder für Backend/DB, aber nicht für das Formular
  variantId?: string;
  taxPrice?: number;
  sku?: string;
}

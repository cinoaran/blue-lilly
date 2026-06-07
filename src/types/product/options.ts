export interface Option {
  id: string;
  color: string;
  sellPrice: number;
  entryPrice: number;
  taxPercentage: number;
  quantity: number;
  image: string[];
  weight: number;
  stockLevel: number;
  // optionale Felder für Backend/DB, aber nicht für das Formular
  variantId?: string;
  taxPrice?: number;
  sku?: string;
}

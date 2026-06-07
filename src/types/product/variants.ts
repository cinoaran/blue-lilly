import {Option} from "./options";

// Die zentrale Variant-Definition für Produktvarianten
export interface Variant {
  id: string;
  size: string;
  units: string;
  options: Option[];
  // optionale Felder für Backend/DB, aber nicht für das Formular
  productId?: string;
}

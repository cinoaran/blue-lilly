import {Decimal} from "@prisma/client/runtime/client.js";

// Convert any Prisma Decimal-like values to plain numbers recursively.
// Generic return type preserves the input shape so callers don't need to cast.
export function convertDecimalToNumber<T>(obj: T): T {
  // Use any internally for mutation, but ensure we return the original generic type.
  // Handle arrays first
  if (Array.isArray(obj)) {
    return (obj as unknown[]).map((v) =>
      convertDecimalToNumber(v),
    ) as unknown as T;
  }

  if (obj && typeof obj === "object") {
    const newObj: Record<string, unknown> = {};
    for (const key in obj as Record<string, unknown>) {
      const value = (obj as Record<string, unknown>)[key];
      type DecimalLike = {
        toNumber?: () => number | string;
        toString?: () => string;
      };

      if (value === null) {
        newObj[key] = undefined;
      } else if (value && typeof value === "object") {
        const maybe = value as DecimalLike;
        if (typeof maybe.toNumber === "function") {
          try {
            const n = maybe.toNumber();
            newObj[key] = typeof n === "number" ? n : Number(n);
          } catch {
            try {
              newObj[key] = String(maybe.toString?.());
            } catch {
              newObj[key] = undefined;
            }
          }
        } else if (value instanceof Decimal) {
          newObj[key] = value.toNumber();
        } else if (typeof value === "object") {
          newObj[key] = convertDecimalToNumber(value);
        } else {
          newObj[key] = value;
        }
      } else {
        newObj[key] = value;
      }
    }
    return newObj as unknown as T;
  }
  return obj;
}

export async function generateSku({
  brand,
  name,
  size,
  color,
}: {
  brand: string;
  name: string;
  size: string;
  color: string;
}): Promise<string> {
  const raw = `${brand}-${name}-${size}-${color}`;
  const normalized = raw
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-")
    .toUpperCase();
  return normalized;
}

export function normalizeSku(input: string | undefined | null): string {
  if (!input) return "";
  const raw = String(input);
  return raw
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9-]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-")
    .toUpperCase();
}

// Additional helper re-exports can be added here when desired.

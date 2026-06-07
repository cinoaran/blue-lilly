import prisma from "@/lib/prisma";
import {Decimal} from "@prisma/client/runtime/client.js"; // ggf. anpassen

export function convertDecimalToNumber(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(convertDecimalToNumber);
  }
  if (obj && typeof obj === "object") {
    const newObj: Record<string, unknown> = {};
    for (const key in obj as Record<string, unknown>) {
      const value = (obj as Record<string, unknown>)[key];
      if (value instanceof Decimal) {
        newObj[key] = value.toNumber();
      } else if (typeof value === "object" && value !== null) {
        newObj[key] = convertDecimalToNumber(value);
      } else {
        newObj[key] = value;
      }
    }
    return newObj;
  }
  return obj;
}

export async function getCategories() {
  return prisma.category.findMany({
    orderBy: {name: "asc"},
  });
}

export async function getMerchants() {
  return prisma.merchant.findMany({
    orderBy: {name: "asc"},
  });
}

export async function getProductById(id: string) {
  if (id === "add") return null;
  return prisma.product.findUnique({
    where: {id},
    include: {
      variants: {
        include: {
          options: true,
        },
      },
      category: true,
    },
  });
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
  // Normalize: remove diacritics, non-alnum -> '-', collapse dashes, uppercase
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

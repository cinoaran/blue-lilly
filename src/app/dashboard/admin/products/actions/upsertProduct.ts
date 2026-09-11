"use server";

import prisma from "@/lib/prisma";
import {requireServerPermission} from "@/acl/server";
import {ProductSchema} from "@/zod-schemas/products/ProductShema";
import {ProductFormData} from "@/types/product/productFormData";
import {generateSku, convertDecimalToNumber, normalizeSku} from "@/helpers";
import {UTApi} from "uploadthing/server";
import {Variant} from "@/types/product/variants";
import {Option} from "@/types/product/options";
import {BaseColor} from "@/generated/prisma/enums";
import {revalidatePath} from "next/cache";
import {Prisma} from "@/generated/prisma";

// Helper: random suffix and ensure unique SKU
function randomSuffix(len = 4) {
  return Math.random()
    .toString(36)
    .slice(2, 2 + len)
    .toUpperCase();
}

async function ensureUniqueSku(baseSku: string) {
  const normalized = normalizeSku(baseSku);
  const MAX = 20;
  for (let i = 0; i < MAX; i++) {
    const prefix = randomSuffix(4);
    const candidate = `${prefix}//${normalized}`;
    const found = await prisma.option.findUnique({where: {sku: candidate}});
    if (!found) return candidate;
  }
  const fallback = `${randomSuffix(6)}//${normalized}`;
  const existsFallback = await prisma.option.findUnique({
    where: {sku: fallback},
  });
  if (!existsFallback) return fallback;
  throw new Error("Unable to generate unique SKU after several attempts.");
}

// Helper: FileKey aus UploadThing URL extrahieren
const extractFileKey = (url: string): string => {
  try {
    const parts = url.split("/");
    const filename = parts[parts.length - 1];
    return filename.split("?")[0];
  } catch {
    return "";
  }
};

type ProductInputWithSku = Partial<ProductFormData> & {
  sku?: string;
  variants?: Array<
    Partial<Variant> & {
      options?: Array<Partial<Option>>;
    }
  >;
};

const updateProduct = async (data: ProductFormData) => {
  try {
    const result = ProductSchema.safeParse(data);
    if (!result.success) {
      return {
        success: false,
        error: JSON.stringify(result.error.issues, null, 2),
      };
    }
    const validData = result.data;

    const currentProduct = (await prisma.product.findUnique({
      where: {id: validData.id},
      include: {
        variants: {
          include: {options: true},
        },
      },
    })) as Prisma.ProductGetPayload<{
      include: {variants: {include: {options: true}}};
    }> | null;

    const oldImageKeys: string[] = [];

    if (currentProduct?.variants) {
      currentProduct.variants.forEach((variant) => {
        variant.options.forEach((option) => {
          option.image.forEach((oldImgUrl) => {
            const stillExists = validData.variants?.some((newV) =>
              newV.options?.some((newO) => newO.image?.includes(oldImgUrl)),
            );

            if (!stillExists && oldImgUrl) {
              const key = extractFileKey(oldImgUrl);
              if (key) oldImageKeys.push(key);
            }
          });
        });
      });
    }

    if (oldImageKeys.length > 0) {
      const utapi = new UTApi();
      await utapi.deleteFiles(oldImageKeys);
      console.log(`✅ Gelöscht: ${oldImageKeys.length} alte Images`);
    }

    const trimmedDataUnchecked: Prisma.ProductUncheckedUpdateInput = {
      name: validData.name?.trim() || undefined,
      smallDesc: validData.smallDesc?.trim() || undefined,
      longDesc: validData.longDesc?.trim() || undefined,
      brand: validData.brand?.trim() || undefined,
      slug: validData.slug?.trim() || undefined,
      categoryId: validData.categoryId || undefined,
      subcategory: validData.subcategory
        ? validData.subcategory.trim()
        : undefined,
      merchantId: validData.merchantId || undefined,
      isActive: validData.isActive ?? undefined,
      isFeatured: validData.isFeatured ?? undefined,
    };

    const trimmedDataUpdate: Prisma.ProductUpdateInput = {
      name:
        trimmedDataUnchecked.name === undefined
          ? undefined
          : {set: trimmedDataUnchecked.name as string},
      smallDesc:
        trimmedDataUnchecked.smallDesc === undefined
          ? undefined
          : {set: trimmedDataUnchecked.smallDesc as string},
      longDesc:
        trimmedDataUnchecked.longDesc === undefined
          ? undefined
          : {set: trimmedDataUnchecked.longDesc as string},
      brand:
        trimmedDataUnchecked.brand === undefined
          ? undefined
          : {set: trimmedDataUnchecked.brand as string},
      slug:
        trimmedDataUnchecked.slug === undefined
          ? undefined
          : {set: trimmedDataUnchecked.slug as string},
      category:
        trimmedDataUnchecked.categoryId === undefined
          ? undefined
          : {connect: {id: trimmedDataUnchecked.categoryId as string}},
      subcategory:
        trimmedDataUnchecked.subcategory === undefined
          ? undefined
          : {set: trimmedDataUnchecked.subcategory as string},
      merchant:
        trimmedDataUnchecked.merchantId === undefined
          ? undefined
          : {connect: {id: trimmedDataUnchecked.merchantId as string}},
      isActive:
        trimmedDataUnchecked.isActive === undefined
          ? undefined
          : {set: trimmedDataUnchecked.isActive as boolean},
      isFeatured:
        trimmedDataUnchecked.isFeatured === undefined
          ? undefined
          : {set: trimmedDataUnchecked.isFeatured as boolean},
    };

    const incomingSkus: string[] = [];
    if (validData.variants && validData.variants.length > 0) {
      for (const variant of validData.variants) {
        for (const option of variant.options ?? []) {
          const optSku =
            (option as Partial<Option>).sku &&
            String((option as Partial<Option>).sku).trim();
          const baseSku =
            optSku && optSku.length > 0
              ? normalizeSku(optSku)
              : await generateSku({
                  brand: validData.brand ?? "",
                  name: validData.name ?? "",
                  size: variant.size ?? "",
                  color:
                    (option as Partial<Option>).displayColor ??
                    (option as Partial<Option>).baseColor ??
                    "",
                });
          const finalSku = await ensureUniqueSku(baseSku);
          if (finalSku) {
            incomingSkus.push(finalSku);
            if (
              !(option as Partial<Option>).sku ||
              (option as Partial<Option>).sku !== finalSku
            )
              (option as Partial<Option>).sku = finalSku;
          }
        }
      }
    }

    // Prevent deleting variants/options that are still referenced by cart items.
    const cartItemsCount = await prisma.cartItem.count({
      where: {option: {variant: {productId: validData.id}}},
    });

    if (cartItemsCount > 0) {
      return {
        success: false,
        error:
          "Update abgebrochen: Es existieren Warenkorb-Einträge, die Optionen dieses Produkts referenzieren. Entferne oder leere die betroffenen Warenkörbe, bevor du Varianten entfernst.",
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.variant.deleteMany({
        where: {productId: validData.id},
      });

      if (validData.variants && validData.variants.length > 0) {
        await tx.product.update({
          where: {id: validData.id},
          data: {
            ...trimmedDataUpdate,
            variants: {
              create:
                validData.variants.map((variant) => ({
                  size: variant.size || "",
                  units: variant.units ?? undefined,
                  options: {
                    create:
                      variant.options?.map((option) => {
                        const baseColorValue =
                          option.baseColor &&
                          (Object.values(BaseColor) as string[]).includes(
                            option.baseColor,
                          )
                            ? (option.baseColor as unknown as (typeof BaseColor)[keyof typeof BaseColor])
                            : undefined;

                        return {
                          ...(option.id ? {id: option.id} : {}),
                          baseColor: baseColorValue,
                          displayColor: option.displayColor ?? undefined,
                          entryPrice: option.entryPrice ?? 0,
                          sellPrice: option.sellPrice ?? 0,
                          taxPercentage: option.taxPercentage ?? 0,
                          quantity: option.quantity ?? 0,
                          image: Array.isArray(option.image)
                            ? option.image
                            : [],
                          weight: option.weight ?? 0,
                          sku: (option as Partial<Option>).sku ?? "",
                        };
                      }) ?? [],
                  },
                })) || [],
            },
          },
        });
      } else {
        await tx.product.update({
          where: {id: validData.id},
          data: trimmedDataUnchecked,
        });
      }
    });

    revalidatePath("/admin/products");

    const updated = await prisma.product.findUnique({
      where: {id: validData.id},
      include: {variants: {include: {options: true}}},
    });

    return {
      success: true,
      message: "Produkt + Varianten erfolgreich aktualisiert!",
      product: convertDecimalToNumber(updated),
    };
  } catch (error: unknown) {
    console.error("Update Error:", error);
    const e = error as {code?: string; meta?: {target?: string[] | string}};
    if (e && e.code === "P2002") {
      const metaTarget = e.meta?.target;
      const target = Array.isArray(metaTarget)
        ? metaTarget.join(", ")
        : (metaTarget ?? "unknown");
      return {
        success: false,
        error: `Unique constraint failed on the field(s): ${target}`,
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unbekannter Fehler",
    };
  }
};

// Add Product //
const addProduct = async (data: ProductInputWithSku) => {
  try {
    const result = ProductSchema.safeParse(data);

    if (!result.success) {
      return {
        success: false,
        error: JSON.stringify(result.error.issues, null, 2),
      };
    }
    const validData = result.data;
    const existing = await prisma.product.findUnique({
      where: {slug: validData.slug.trim()},
    });

    if (existing) {
      return {
        success: false,
        error: "Ein Produkt mit diesem Slug existiert bereits.",
      };
    }

    const enrichedVariants = await Promise.all(
      validData.variants.map(async (variant) => {
        const options = await Promise.all(
          (variant.options ?? []).map(async (option) => {
            const baseColorValue =
              option.baseColor &&
              (Object.values(BaseColor) as string[]).includes(option.baseColor)
                ? (option.baseColor as unknown as (typeof BaseColor)[keyof typeof BaseColor])
                : undefined;

            const sku = await (async () => {
              const provided = (option as Partial<Option>).sku;
              const base =
                provided && String(provided).trim().length > 0
                  ? normalizeSku(String(provided))
                  : await generateSku({
                      brand: validData.brand!,
                      name: validData.name!,
                      size: variant.size ?? "",
                      color: option.displayColor ?? option.baseColor ?? "",
                    });
              return await ensureUniqueSku(base);
            })();

            return {
              id: option.id ?? "",
              baseColor: baseColorValue,
              displayColor: option.displayColor ?? undefined,
              sellPrice: option.sellPrice ?? 0,
              entryPrice: option.entryPrice ?? 0,
              taxPercentage: option.taxPercentage ?? 0,
              quantity: option.quantity ?? 0,
              image: Array.isArray(option.image)
                ? option.image.filter((img) => typeof img === "string")
                : [],
              weight: option.weight ?? 0,
              sku,
            };
          }),
        );

        return {
          id: variant.id ?? "",
          size: variant.size ?? "",
          units: variant.units ?? undefined,
          options,
        };
      }),
    );

    const createdProduct = await prisma.product.create({
      data: {
        name: validData.name!.trim(),
        smallDesc: validData.smallDesc?.trim() ?? "",
        longDesc: validData.longDesc?.trim() ?? "",
        brand: validData.brand?.trim() ?? "",
        slug: validData.slug!.trim(),
        isActive: validData.isActive ?? false,
        isFeatured: validData.isFeatured ?? false,
        merchant: {connect: {id: validData.merchantId!.trim()}},
        category: {connect: {id: validData.categoryId!.trim()}},
        subcategory: validData.subcategory
          ? validData.subcategory.trim()
          : undefined,
        variants: {
          create: (enrichedVariants ?? []).map(({size, units, options}) => ({
            size: size ?? "",
            units: units ?? undefined,
            options: {
              create: (options ?? []).map(({id, ...optData}) => ({
                ...(id ? {id} : {}),
                entryPrice: optData.entryPrice ?? 0,
                sellPrice: optData.sellPrice ?? 0,
                taxPercentage: optData.taxPercentage ?? 0,
                quantity: optData.quantity ?? 0,
                image: Array.isArray(optData.image)
                  ? optData.image
                  : optData.image
                    ? [optData.image]
                    : [],
                baseColor:
                  optData.baseColor &&
                  (Object.values(BaseColor) as string[]).includes(
                    optData.baseColor,
                  )
                    ? (optData.baseColor as unknown as (typeof BaseColor)[keyof typeof BaseColor])
                    : undefined,
                displayColor: optData.displayColor ?? undefined,
                weight: optData.weight ?? 0,
                sku: optData.sku ?? "",
              })),
            },
          })),
        },
      },
      include: {variants: {include: {options: true}}},
    });

    console.log("Created", createdProduct);

    return {
      success: true,
      message: "Produkt erfolgreich angelegt.",
      product: convertDecimalToNumber(createdProduct),
    };
  } catch (error: unknown) {
    console.log(error);
    const e = error as {code?: string; meta?: {target?: string[] | string}};
    if (e && e.code === "P2002") {
      const metaTarget = e.meta?.target;
      const target = Array.isArray(metaTarget)
        ? metaTarget.join(", ")
        : (metaTarget ?? "unknown");
      return {
        success: false,
        error: `Unique constraint failed on the field(s): ${target}`,
      };
    }
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};

export async function upsertProduct(
  data: ProductFormData,
  mode: "add" | "edit",
) {
  if (mode === "add") {
    await requireServerPermission("product:create");
    const result = await addProduct(data);
    if (result.success) {
      revalidatePath("/admin/products");
    }
    return result;
  } else if (mode === "edit") {
    await requireServerPermission("product:update");
    const result = await updateProduct(data);
    if (result.success) {
      revalidatePath("/admin/products");
    }
    return result;
  } else {
    return {
      success: false,
      error: "Invalid mode. Use 'add' or 'edit'.",
    };
  }
}

export default upsertProduct;

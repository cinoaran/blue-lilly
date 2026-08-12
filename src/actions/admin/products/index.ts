"use server";
import prisma from "@/lib/prisma";
import {requireServerPermission} from "@/acl/server";
import {ProductSchema} from "@/zod-schemas/products/ProductShema";
import {ProductFormData} from "@/types/product/productFormData";
import {generateSku, convertDecimalToNumber, normalizeSku} from "@/helpers";
import {utapi} from "@/uploadthing/server";
import {Variant} from "@/types/product/variants";
import {Option} from "@/types/product/options";
import {BaseColor} from "@/generated/prisma/enums";
import {revalidatePath} from "next/cache";
import {UTApi} from "uploadthing/server";
import {Prisma} from "@/generated/prisma/browser";

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
  // fallback: append random suffix at end
  const fallback = `${randomSuffix(6)}//${normalized}`;
  const existsFallback = await prisma.option.findUnique({
    where: {sku: fallback},
  });
  if (!existsFallback) return fallback;
  throw new Error("Unable to generate unique SKU after several attempts.");
}

export async function getProductById(productId: string) {
  await requireServerPermission("product:update");
  try {
    const product = await prisma.product.findUnique({
      where: {id: productId},
      include: {
        variants: {
          include: {options: true},
        },
      },
    });
    return product;
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    return null;
  }
}

// Produkt löschen inkl. Medien bei UploadThing
export async function deleteProduct(productId: string) {
  await requireServerPermission("product:delete");
  try {
    // Hole Produkt mit Varianten und Optionen
    const product = await prisma.product.findUnique({
      where: {id: productId},
      include: {
        variants: {
          include: {options: true},
        },
      },
    });
    if (!product) return {success: false, error: "Produkt nicht gefunden."};

    // Sammle alle zu löschenden UploadThing-URLs
    const fileKeys: string[] = [];
    for (const variant of product.variants) {
      for (const option of variant.options) {
        // Prüfe, ob gesetzt ist (dann nicht löschen)
        if (option.image && Array.isArray(option.image)) {
          for (const img of option.image) {
            if (img && typeof img === "string") {
              // Extrahiere fileKey aus URL
              const key = img.substring(img.lastIndexOf("/") + 1);
              fileKeys.push(key);
            }
          }
        }
        /* Analog für Videos:
          if (option.video && Array.isArray(option.video)) {
            for (const vid of option.video) {
              if (vid && typeof vid === "string") {
                const key = vid.substring(vid.lastIndexOf("/") + 1);
                fileKeys.push(key);
              }
            }
          }
        */
      }
    }

    // Lösche alle Files bei UploadThing (nur wenn fileKeys vorhanden)
    if (fileKeys.length > 0) {
      try {
        await utapi.deleteFiles(fileKeys);
      } catch (err) {
        console.error("Fehler beim Löschen der Medien bei UploadThing:", err);
        // Nicht blockierend, fahre fort
      }
    }

    // Lösche Produkt (inkl. Cascade für Varianten/Optionen)
    await prisma.product.delete({where: {id: productId}});
    return {success: true};
  } catch (error) {
    console.error("Fehler beim Löschen des Produkts:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unbekannter Fehler",
    };
  }
}

type ProductInputWithSku = Partial<ProductFormData> & {
  sku?: string;
  variants?: Array<
    Partial<Variant> & {
      // ← Jetzt passt es!
      options?: Array<Partial<Option>>;
    }
  >;
};

// Helper: FileKey aus UploadThing URL extrahieren
const extractFileKey = (url: string): string => {
  try {
    const parts = url.split("/");
    const filename = parts[parts.length - 1];
    return filename.split("?")[0]; // z.B. "abc123.webp"
  } catch {
    return "";
  }
};

const updateProduct = async (data: ProductFormData) => {
  try {
    // Validate payload with the same Zod schema as addProduct
    const result = ProductSchema.safeParse(data);
    if (!result.success) {
      return {
        success: false,
        error: JSON.stringify(result.error.issues, null, 2),
      };
    }
    const validData = result.data;

    // 1. Aktuelles Product laden (für alteImages)
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

    // 2. Alte Images finden, die nicht mehr in neuen data.image sind
    if (currentProduct?.variants) {
      currentProduct.variants.forEach((variant) => {
        variant.options.forEach((option) => {
          option.image.forEach((oldImgUrl) => {
            // Wenn alte URL nicht mehr in neuen Daten → löschen
            // In updateProduct: Vergleiche per URL-Hash, nicht ID
            const stillExists = validData.variants?.some((newV) =>
              newV.options?.some(
                (newO) => newO.image?.includes(oldImgUrl), // ← URL-basiert!
              ),
            );

            if (!stillExists && oldImgUrl) {
              const key = extractFileKey(oldImgUrl);
              if (key) oldImageKeys.push(key);
            }
          });
        });
      });
    }

    // 3. UploadThing: Alte Images löschen
    if (oldImageKeys.length > 0) {
      const utapi = new UTApi();
      await utapi.deleteFiles(oldImageKeys);
      console.log(`✅ Gelöscht: ${oldImageKeys.length} alte Images`);
    }

    // 4. Trimmed Product-Daten (wie vorher)
    const trimmedData: Prisma.ProductUncheckedUpdateInput = {
      // Temporär 'any' für Flexibilität
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
      // KEINE variants hier!
    };

    // Preflight: collect SKUs from incoming data (generate where missing) and check duplicates
    const incomingSkus: string[] = [];
    if (validData.variants && validData.variants.length > 0) {
      for (const variant of validData.variants) {
        for (const option of variant.options ?? []) {
          const optSku =
            (option as Partial<Option>).sku &&
            String((option as Partial<Option>).sku).trim();
          // generate a base SKU or use provided, then ensure uniqueness by appending random suffix if needed
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
            // persist normalized/generated sku back to the payload so transaction uses it
            if (
              !(option as Partial<Option>).sku ||
              (option as Partial<Option>).sku !== finalSku
            )
              (option as Partial<Option>).sku = finalSku;
          }
        }
      }
    }
    // incomingSkus are now unique (ensureUniqueSku), no preflight duplicate error required

    // 5. Nested Update: ALLE alten Variants/Options löschen + neu erstellen
    await prisma.$transaction(async (tx) => {
      // Alte Variants komplett löschen
      await tx.variant.deleteMany({
        where: {productId: validData.id},
      });

      // Neue Variants + Options erstellen (wie bei addProduct)
      if (validData.variants && validData.variants.length > 0) {
        await tx.product.update({
          where: {id: validData.id},
          data: {
            ...trimmedData,
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
        // Ohne Variants nur Product updaten
        await tx.product.update({
          where: {id: validData.id},
          data: trimmedData,
        });
      }
    });

    revalidatePath("/admin/products");

    // fetch updated product to return to client (so UI can display generated SKUs)
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
    // Prisma unique constraint
    const e = error as {code?: string; meta?: {target?: string[] | string}};
    if (e && e.code === "P2002") {
      // try to extract target field
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
    // Prüfe, ob der Slug bereits existiert
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

    // SKUs have been ensured unique by ensureUniqueSku

    // Produkt samt Varianten und Optionen anlegen
    const createdProduct = await prisma.product.create({
      data: {
        name: validData.name!.trim(),
        smallDesc: validData.smallDesc?.trim() ?? "",
        longDesc: validData.longDesc?.trim() ?? "",
        brand: validData.brand?.trim() ?? "",
        slug: validData.slug!.trim(),
        isActive: validData.isActive ?? false,
        isFeatured: validData.isFeatured ?? false,
        merchant: {connect: {id: validData.merchantId!.trim()}}, // ensure present via validation
        category: {connect: {id: validData.categoryId!.trim()}}, // ensure present via validation
        subcategory: validData.subcategory
          ? validData.subcategory.trim()
          : undefined,
        variants: {
          create: (enrichedVariants ?? []).map(({size, units, options}) => ({
            size: size ?? "",
            units: units ?? undefined, // use FK field instead of relation connect
            options: {
              create: (options ?? []).map(({id, ...optData}) => ({
                ...(id ? {id} : {}), // include id only when provided
                // id we skip/pass conditionally to let DB generate
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

export async function getAllProducts() {
  await requireServerPermission("product:update");
  try {
    const products = await prisma.product.findMany({
      include: {
        variants: {
          include: {options: true},
        },
      },
    });
    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

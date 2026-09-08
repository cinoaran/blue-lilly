"use server";

import prisma from "@/lib/prisma";
import {requireServerPermission} from "@/acl/server";
import {utapi} from "@/uploadthing/server";

export async function deleteProduct(productId: string) {
  await requireServerPermission("product:delete");
  try {
    const product = await prisma.product.findUnique({
      where: {id: productId},
      include: {
        variants: {
          include: {options: true},
        },
      },
    });
    if (!product) return {success: false, error: "Produkt nicht gefunden."};

    const fileKeys: string[] = [];
    for (const variant of product.variants) {
      for (const option of variant.options) {
        if (option.image && Array.isArray(option.image)) {
          for (const img of option.image) {
            if (img && typeof img === "string") {
              const key = img.substring(img.lastIndexOf("/") + 1);
              fileKeys.push(key);
            }
          }
        }
      }
    }

    if (fileKeys.length > 0) {
      try {
        await utapi.deleteFiles(fileKeys);
      } catch (err) {
        console.error("Fehler beim Löschen der Medien bei UploadThing:", err);
      }
    }

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

export default deleteProduct;

"use server";

import prisma from "@/lib/prisma";
import {requireServerPermission} from "@/acl/server";

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

export default getProductById;

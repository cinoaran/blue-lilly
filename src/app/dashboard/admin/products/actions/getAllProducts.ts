"use server";

import prisma from "@/lib/prisma";
import {requireServerPermission} from "@/acl/server";

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

export default getAllProducts;

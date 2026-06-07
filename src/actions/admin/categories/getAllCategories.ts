import {ensureAndRequire} from "@/acl/acl";
import prisma from "@/lib/prisma";

export async function getAllCategories(
  categoryId?: string,
  opts: Parameters<typeof ensureAndRequire>[0] = {},
) {
  try {
    await ensureAndRequire(opts, "admin:read");
  } catch {
    // Authorization failed — return null so callers can handle gracefully
    return null;
  }

  try {
    const select = {
      id: true,
      name: true,
      slug: true,
      // include counts for related models (products)
      _count: {
        select: {products: true},
      },
    } as const;

    const categories = await prisma.category.findMany({select});
    return categories;
  } catch (error: unknown) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

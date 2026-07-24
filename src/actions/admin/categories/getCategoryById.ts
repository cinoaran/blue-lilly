import {ensureAndRequire} from "@/acl/acl";
import prisma from "@/lib/prisma";

export async function getCategoryById(
  id: string,
  opts: Parameters<typeof ensureAndRequire>[0] = {},
) {
  try {
    await ensureAndRequire(opts, "admin:read");
  } catch {
    return null;
  }

  return prisma.category.findUnique({
    where: {id},
    select: {
      id: true,
      name: true,
      slug: true,
      parentId: true,
      parent: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      _count: {
        select: {
          children: true,
          products: true,
        },
      },
    },
  });
}

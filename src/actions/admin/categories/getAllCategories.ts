import {ensureAndRequire} from "@/acl/acl";
import prisma from "@/lib/prisma";

export async function getAllCategories(
  categoryId?: string,
  opts: Parameters<typeof ensureAndRequire>[0] = {},
  groupByParent = false,
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
      parentId: true,
      // include counts for related models (products)
      _count: {
        select: {products: true},
      },
    } as const;

    // order so root categories (parentId === null) come first, then children,
    // and within those groups order by name
    const categories = await prisma.category.findMany({
      select,
      orderBy: [{parentId: "asc"}, {name: "asc"}],
    });

    if (!groupByParent) return categories;

    // Build tree: roots with nested children array
    type CatNode = (typeof categories)[number] & {children: Array<unknown>};
    const map = new Map<string, CatNode>();
    const roots: CatNode[] = [];

    for (const c of categories) {
      map.set(c.id, {...c, children: []});
    }

    for (const c of categories) {
      const node = map.get(c.id)!;
      if (c.parentId) {
        const parent = map.get(c.parentId);
        if (parent) parent.children.push(node);
        else roots.push(node); // orphaned — treat as root
      } else {
        roots.push(node);
      }
    }

    return roots;
  } catch (error: unknown) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

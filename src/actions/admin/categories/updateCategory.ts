import {ensureAndRequire} from "@/acl/acl";
import prisma from "@/lib/prisma";
import {revalidatePath} from "next/cache";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-_\s]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function ensureNoParentCycle(categoryId: string, parentId: string) {
  let cursor: string | null = parentId;
  while (cursor) {
    if (cursor === categoryId) {
      throw new Error("Ungueltige Parent-Category: Zyklus erkannt.");
    }

    const parent: {parentId: string | null} | null =
      await prisma.category.findUnique({
        where: {id: cursor},
        select: {parentId: true},
      });
    if (!parent) break;
    cursor = parent.parentId;
  }
}

export async function updateCategory(
  id: string,
  payload: {name: string; slug?: string; parentId?: string | null},
  opts: Parameters<typeof ensureAndRequire>[0] = {},
) {
  await ensureAndRequire(opts, "admin:update");

  const nextName = payload.name.trim();
  const nextSlug =
    payload.slug && payload.slug.trim().length > 0
      ? payload.slug.trim()
      : slugify(payload.name);

  // Defensive normalization: if a path-like slug was sent (e.g. "pflege/creme"),
  // keep only the last segment so DB slugs remain flat.
  const sanitizedBase = String(nextSlug).split("/").filter(Boolean).pop() || "";

  async function generateAvailableSlugForUpdate(
    categoryId: string,
    parent: string | null,
    candidate: string,
  ) {
    const normalized = candidate.toLowerCase();
    // If no conflicting category (other than self) exists, keep it
    const conflict = await prisma.category.findFirst({
      where: {parentId: parent, slug: normalized, NOT: {id: categoryId}},
      select: {id: true},
    });
    if (!conflict) return normalized;

    const siblings = await prisma.category.findMany({
      where: {parentId: parent, slug: {startsWith: normalized}},
      select: {slug: true},
    });

    const suffixes = new Set<number>();
    for (const s of siblings) {
      const m = s.slug.match(new RegExp(`^${normalized}-(\\d+)$`));
      if (m) suffixes.add(Number(m[1]));
      else if (s.slug === normalized) suffixes.add(1);
    }

    let i = 2;
    while (suffixes.has(i)) i++;
    return `${normalized}-${i}`;
  }

  const requestedParentId = payload.parentId?.trim() || null;
  if (requestedParentId === id) {
    throw new Error("Eine Kategorie kann nicht ihr eigener Parent sein.");
  }

  if (requestedParentId) {
    const parentExists = await prisma.category.findUnique({
      where: {id: requestedParentId},
      select: {id: true},
    });
    if (!parentExists) {
      throw new Error("Die gewaehlte Parent-Category existiert nicht.");
    }

    await ensureNoParentCycle(id, requestedParentId);
  }

  const finalSlug = await generateAvailableSlugForUpdate(
    id,
    requestedParentId,
    sanitizedBase,
  );

  const updated = await prisma.category.update({
    where: {id},
    data: {
      name: nextName,
      slug: finalSlug,
      parentId: requestedParentId,
    },
  });

  revalidatePath("/dashboard/admin/categories");

  return updated;
}

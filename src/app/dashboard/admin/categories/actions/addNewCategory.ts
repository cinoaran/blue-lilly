"use server";

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

export async function addNewCategory(
  name: string,
  slug?: string,
  parentId?: string,
  opts: Parameters<typeof ensureAndRequire>[0] = {},
) {
  try {
    await ensureAndRequire(opts, "admin:create");
  } catch {
    return null;
  }

  const baseSlug = slug && slug.trim().length > 0 ? slug.trim() : slugify(name);
  const sanitizedBase = String(baseSlug).split("/").filter(Boolean).pop() || "";

  async function generateAvailableSlug(
    parent: string | null,
    candidate: string,
  ) {
    const normalized = candidate.toLowerCase();
    const exists = await prisma.category.findFirst({
      where: {parentId: parent, slug: normalized},
      select: {id: true},
    });
    if (!exists) return normalized;

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

  const parentKey = parentId?.trim() || null;
  const finalSlug = await generateAvailableSlug(parentKey, sanitizedBase);

  const category = await prisma.category.create({
    data: {name: name.trim(), slug: finalSlug, parentId: parentKey},
  });

  revalidatePath("/dashboard/admin/categories");

  return category;
}

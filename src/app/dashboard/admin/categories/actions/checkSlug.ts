"use server";

import {prisma} from "@/lib/prisma";
import type {Prisma} from "@/generated/prisma";

export async function checkSlug(payload: {
  slug: string;
  parentId?: string | null;
  excludeId?: string | undefined;
}) {
  const {slug, parentId, excludeId} = payload;
  if (!slug || typeof slug !== "string") {
    return {available: false};
  }

  const normalized = String(slug).trim().toLowerCase();
  const parent =
    parentId === null || parentId === undefined ? null : String(parentId);

  if (excludeId) {
    const existing = await prisma.category.findFirst({
      where: {parentId: parent, slug: normalized, NOT: {id: excludeId}},
      select: {id: true},
    });
    return {available: !Boolean(existing)};
  }

  const existing = await prisma.category.findFirst({
    where: {parentId: parent, slug: normalized},
    select: {id: true},
  });

  return {available: !Boolean(existing)};
}

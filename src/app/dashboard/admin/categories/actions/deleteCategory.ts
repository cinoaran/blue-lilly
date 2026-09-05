"use server";

import {ensureAndRequire} from "@/acl/acl";
import prisma from "@/lib/prisma";
import {revalidatePath} from "next/cache";

export async function deleteCategory(
  id: string,
  opts: Parameters<typeof ensureAndRequire>[0] = {},
) {
  await ensureAndRequire(opts, "admin:delete");

  const category = await prisma.category.findUnique({
    where: {id},
    select: {
      id: true,
      _count: {select: {children: true, products: true}},
    },
  });

  if (!category) {
    return {success: false, error: "Kategorie nicht gefunden."};
  }

  if (category._count.children > 0) {
    return {
      success: false,
      error:
        "Kategorie hat Unterkategorien. Bitte zuerst Unterkategorien verschieben oder loeschen.",
    };
  }

  if (category._count.products > 0) {
    return {
      success: false,
      error:
        "Kategorie enthaelt Produkte. Bitte zuerst Produkte umhaengen oder loeschen.",
    };
  }

  await prisma.category.delete({where: {id}});

  revalidatePath("/dashboard/admin/categories");

  return {success: true};
}

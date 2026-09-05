"use server";

import prisma from "@/lib/prisma";

export async function checkDelete(id: string) {
  if (!id) return {error: "id required"};

  const category = await prisma.category.findUnique({
    where: {id},
    select: {
      id: true,
      _count: {select: {children: true, products: true}},
    },
  });

  if (!category) return {error: "not found"};

  return {counts: category._count};
}

"use server";

import prisma from "@/lib/prisma";
import {requireServerPermission} from "@/acl/server";

export async function getAllCarousel() {
  // admin-only listing
  await requireServerPermission("carousel:manage");

  const items = await prisma.carousel.findMany({orderBy: {position: "asc"}});
  return items;
}

export default getAllCarousel;

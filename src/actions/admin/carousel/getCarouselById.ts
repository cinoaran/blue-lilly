"use server";

import prisma from "@/lib/prisma";
import {requireServerPermission} from "@/acl/server";

export async function getCarouselById(id: string) {
  await requireServerPermission("carousel:manage");
  return prisma.carousel.findUnique({where: {id}});
}

export default getCarouselById;

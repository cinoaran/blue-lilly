"use server";

import prisma from "@/lib/prisma";
import {requireServerPermission} from "@/acl/server";

export async function deleteCarousel(id: string) {
  await requireServerPermission("carousel:manage");
  await prisma.carousel.delete({where: {id}});
  return {success: true};
}

export default deleteCarousel;

import prisma from "@/lib/prisma";

export async function getPublicCarousel() {
  const items = await prisma.carousel.findMany({
    where: {isActive: true},
    orderBy: {position: "asc"},
  });
  return items;
}

export default getPublicCarousel;

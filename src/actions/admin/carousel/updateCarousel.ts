"use server";

import prisma from "@/lib/prisma";
import {requireServerPermission} from "@/acl/server";
import type {CarouselInput} from "./createCarousel";

export async function updateCarousel(id: string, data: CarouselInput) {
  await requireServerPermission("carousel:manage");

  const updated = await prisma.carousel.update({
    where: {id},
    data: {
      kicker: data.kicker,
      title: data.title,
      teaser: data.teaser,
      cta: data.cta,
      href: data.href,
      image: data.image,
      alt: data.alt,
      theme: data.theme,
      goal: data.goal,
      audience: data.audience,
      angle: data.angle,
      trackEvent: data.trackEvent,
      position: data.position,
      isActive: data.isActive,
    },
  });

  return updated;
}

export default updateCarousel;

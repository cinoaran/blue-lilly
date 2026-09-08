"use server";

import prisma from "@/lib/prisma";
import {requireServerPermission} from "@/acl/server";

export type CarouselInput = {
  kicker?: string;
  title: string;
  teaser?: string;
  cta?: string;
  href?: string;
  image: string;
  alt?: string;
  theme?: string;
  goal?: string;
  audience?: string;
  angle?: string;
  trackEvent?: string;
  position?: number;
  isActive?: boolean;
};

export async function createCarousel(data: CarouselInput) {
  await requireServerPermission("carousel:manage");

  const created = await prisma.carousel.create({
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
      position: data.position ?? 0,
      isActive: data.isActive ?? true,
    },
  });

  return created;
}

export default createCarousel;

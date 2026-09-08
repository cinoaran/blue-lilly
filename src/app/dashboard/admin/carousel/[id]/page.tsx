import React, {Suspense} from "react";
import getCarouselById from "../actions/getCarouselById";
import CarouselFormClient from "../_components/CarouselFormClient";
import CarouselFormSkeleton from "../_components/CarouselFormSkeleton";

export default async function EditCarouselPage(props: unknown) {
  const {params} = props as {params: {id: string}};
  const {id} = params;
  const item = await getCarouselById(id);

  if (!item) {
    return <div className="p-6">Slide nicht gefunden.</div>;
  }

  // Normalize DB nullable fields (null -> undefined) so they match CarouselInitial
  const initial = {
    ...item,
    kicker: item.kicker ?? undefined,
    teaser: item.teaser ?? undefined,
    cta: item.cta ?? undefined,
    href: item.href ?? undefined,
    alt: item.alt ?? undefined,
    theme: item.theme ?? undefined,
    goal: item.goal ?? undefined,
    audience: item.audience ?? undefined,
    angle: item.angle ?? undefined,
    trackEvent: item.trackEvent ?? undefined,
  };

  // Render client form with initial data
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-4">Edit Carousel Slide</h1>
      <Suspense fallback={<CarouselFormSkeleton />}>
        <CarouselFormClient mode="edit" initial={initial} />
      </Suspense>
    </div>
  );
}

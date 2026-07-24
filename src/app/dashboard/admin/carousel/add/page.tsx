import React, {Suspense} from "react";
import CarouselFormClient from "../_components/CarouselFormClient";
import CarouselFormSkeleton from "../_components/CarouselFormSkeleton";

export default function AddCarouselPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-4">Add Carousel Slide</h1>
      <Suspense fallback={<CarouselFormSkeleton />}>
        <CarouselFormClient mode="add" />
      </Suspense>
    </div>
  );
}

import React from "react";
import { ProductsCardSkeleton } from "@/app/skeletons/ProductsCardSkeleton";

export default function Loading() {
  return (
    <main className="container mx-auto my-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-5">
        {Array.from({ length: 12 }).map((_, i) => (
          <ProductsCardSkeleton key={i} />
        ))}
      </div>
    </main>
  );
}

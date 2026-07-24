import React from "react";
import {ProductsCardSkeleton} from "./ProductsCardSkeleton";

type Props = {
  limit?: number;
};

const ProductsSkeleton = ({limit = 8}: Props) => {
  // Ensure at least one placeholder
  const count = Math.max(1, Math.floor(limit));
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
      {Array.from({length: count}).map((_, index) => (
        <ProductsCardSkeleton key={index} />
      ))}
    </div>
  );
};

export default ProductsSkeleton;

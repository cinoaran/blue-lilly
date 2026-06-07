import React from "react";
import {ProductsCardSkeleton} from "./ProductsCardSkeleton";

const ProductsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-5">
      {Array.from({length: 5}).map((_, index) => (
        <ProductsCardSkeleton key={index} />
      ))}
    </div>
  );
};

export default ProductsSkeleton;

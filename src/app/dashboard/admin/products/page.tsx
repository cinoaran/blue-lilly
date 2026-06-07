import React from "react";
import {DataTable} from "@/app/dashboard/_components/DataTable";
import {columns} from "./_components/Columns";
import prisma from "@/lib/prisma";

const ProductsPage = async () => {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      brand: true,
      slug: true,
      isActive: true,
      rating: true,
      // include variants -> options to get image/url from options
      variants: {
        select: {options: {select: {image: true, quantity: true}}},
      },
      category: {select: {name: true}},
    },
  });

  const data = products.map((p) => ({
    id: p.id,
    name: p.name,
    brand: p.brand,
    slug: p.slug,
    isActive: p.isActive,
    rating:
      p.rating != null
        ? typeof p.rating === "object" &&
          typeof (p.rating as {toNumber?: () => number}).toNumber === "function"
          ? (p.rating as {toNumber: () => number}).toNumber()
          : Number(p.rating)
        : undefined,
    // build full image URL from option.url (base) + option.image[0]
    firstOptionImage: (() => {
      if (!p.variants || p.variants.length === 0) return null;
      for (const v of p.variants) {
        const opt = v?.options?.[0];
        if (!opt) continue;
        const imgPath = opt.image && opt.image.length > 0 ? opt.image[0] : null; // expected like '/d480...png?'

        // if imgPath is an absolute URL already, use it
        if (imgPath && /^https?:\/\//i.test(imgPath)) return imgPath;

        // fallback: just return imgPath if present
        if (imgPath) return imgPath;
      }
      return null;
    })(),
    // collect quantities per variant and compute total
    variantQuantities: (() => {
      if (!p.variants || p.variants.length === 0) return [] as number[][];
      type Option = {image?: string[]; quantity?: number | string | null};
      return p.variants.map((v) =>
        (v.options || []).map((opt: Option) =>
          opt.quantity != null ? Number(opt.quantity) : 0,
        ),
      );
    })(),
    // minimum quantity per variant
    variantMins: (() => {
      if (!p.variants || p.variants.length === 0) return [] as number[];
      return p.variants.map((v) => {
        const nums = (v.options || []).map(
          (opt: {quantity?: number | string | null}) =>
            opt.quantity != null ? Number(opt.quantity) : Infinity,
        );
        if (nums.length === 0) return 0;
        return Math.min(...nums.filter((n) => Number.isFinite(n)));
      });
    })(),
    // minimum across all variants
    minAcrossVariants: (() => {
      const mins = (p.variants || []).map((v) => {
        const nums = (v.options || []).map(
          (opt: {quantity?: number | string | null}) =>
            opt.quantity != null ? Number(opt.quantity) : Infinity,
        );
        if (nums.length === 0) return Infinity;
        return Math.min(...nums.filter((n) => Number.isFinite(n)));
      });
      const finite = mins.filter((n) => Number.isFinite(n));
      return finite.length === 0 ? null : Math.min(...finite);
    })(),
    category: p.category ? {name: p.category.name} : null,
  }));

  return (
    <div className="container bg-secondary text-foreground border-[0.3px] border-foreground/10 rounded-lg backdrop-blur-md shadow-md shadow-foreground/10 mx-auto my-12">
      <DataTable columns={columns} data={data} />
    </div>
  );
};

export default ProductsPage;

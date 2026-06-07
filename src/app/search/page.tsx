import ProductCard from "@/components/Product/ProductCard";
import Breadcrumbs from "@/components/shared/beardcrumbs/Breadcrumbs";
import {PaginationProducts} from "@/components/shared/pagination";
import {convertDecimalToNumber} from "@/helpers/products";
import {getSearchProducts} from "@/actions/shared";
import {ProductWithVariants} from "@/types/product/product";
import React from "react";

type Props = {
  searchParams?: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
};

const SearchPage = async (props: Props) => {
  const params = (await props.searchParams) ?? {};

  const rawQuery = params.query ?? "";
  const queryStr = Array.isArray(rawQuery) ? (rawQuery[0] ?? "") : rawQuery;
  const query = (queryStr as string).trim();

  const rawPage = params.page ?? "1";
  const page = Math.max(
    Number(Array.isArray(rawPage) ? (rawPage[0] ?? "1") : rawPage),
    1,
  );

  const limit = 2;

  const {
    products: finalProducts,
    total: finalTotal,
    usedFallback,
  } = await getSearchProducts({query, page, limit});

  const safeProducts = (finalProducts ?? []).map(
    (p) => convertDecimalToNumber(p) as unknown,
  ) as ProductWithVariants[];

  const breadcrumbs = [
    {label: "Products", href: "/"},
    {
      label: `Results for "${query || "All"}"`,
      href: `/search?query=${encodeURIComponent(query)}`,
    },
  ];

  return (
    <main className="w-3/4 mx-auto my-10">
      <Breadcrumbs items={breadcrumbs} />

      {usedFallback && (
        <div className="mb-4 p-4 rounded-md bg-primary text-primary-foreground text-center text-sm">
          No results found for &quot;{query}&quot; — showing popular products
          instead.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
        {safeProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* simple pagination info */}
      <div className="mt-6 text-center text-sm text-gray-500">
        Showing {safeProducts.length} of {finalTotal} results
        {finalTotal >= 1 && (
          <PaginationProducts
            totalPages={Math.ceil(finalTotal / limit)}
            currentPage={page}
            query={query}
          />
        )}
      </div>
    </main>
  );
};

export default SearchPage;

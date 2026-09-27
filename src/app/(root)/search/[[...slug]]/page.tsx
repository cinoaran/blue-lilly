import ProductCard from "@/components/Product/ProductCard";
import Breadcrumbs from "@/components/shared/beardcrumbs/Breadcrumbs";
import {PaginationProducts} from "@/components/shared/pagination";
import {convertDecimalToNumber} from "@/helpers";
import {getAllCategoryTree} from "@/actions/categories";
import {getSearchProducts} from "@/actions/products";
import {ProductWithVariants} from "@/types/product/product";
import {Suspense} from "react";
import SortSelect from "@/components/shared/SortSelect";
import ProductsSkeleton from "@/app/(root)/skeletons/ProductsSkeleton";
import SearchInput from "@/components/shared/searchBar";

const normalizeCategorySlug = (value: string) =>
  decodeURIComponent(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");

type Props = {
  params?: Promise<{
    slug?: string[];
  }>;
  searchParams?: Promise<{
    sort?: string;
    query?: string | string[];
    page?: string | string[];
  }>;
};

const CategoryPage = async ({params, searchParams}: Props) => {
  const {slug = []} = (await params) ?? {};
  const queryParams = (await searchParams) ?? {};

  function getFirstValue(value: string | string[] | undefined, fallback = "") {
    return Array.isArray(value) ? (value[0] ?? fallback) : (value ?? fallback);
  }

  const rawSort = getFirstValue(queryParams.sort);
  const rawQuery = getFirstValue(queryParams.query);
  const rawPage = getFirstValue(queryParams.page, "1");

  const query = rawQuery.trim();
  const decodedQuery = decodeURIComponent(query.replace(/\+/g, " "));

  const categorySegments = Array.isArray(slug) ? slug : [];

  const category = normalizeCategorySlug(categorySegments.at(-1) ?? "");

  const categoryPathNormalized = categorySegments.length
    ? categorySegments.map(normalizeCategorySlug).join("/")
    : "";

  const categoryLabel = categorySegments.length
    ? categorySegments
        .map((segment) =>
          decodeURIComponent(segment)
            .split("-")
            .filter(Boolean)
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(" "),
        )
        .join(" / ")
    : "All Products";

  const page = Math.max(Number(rawPage) || 1, 1);
  const limit = 8;

  const categoryOptions = await getAllCategoryTree();

  const searchCategory = categoryPathNormalized || undefined;

  const {products, total} = await getSearchProducts({
    query,
    page,
    limit,
    category: searchCategory,
    sort: rawSort || undefined,
  });

  const safeProducts = (products ?? [])
    .map((product) => convertDecimalToNumber(product) as unknown)
    .filter(Boolean) as ProductWithVariants[];

  const breadcrumbs = [
    {label: "Products", href: "/"},
    ...(categoryPathNormalized
      ? [{label: categoryLabel, href: `/search/${categoryPathNormalized}`}]
      : [{label: categoryLabel, href: "/search"}]),
    ...(query ? [{label: `Search: "${decodedQuery}"`, href: "#"}] : []),
  ];

  return (
    <main className="container relative mx-auto max-w-[85vw]">
      <div className="flex items-center justify-start mb-10">
        <Breadcrumbs items={breadcrumbs} />
      </div>
      <div className="flex flex-col items-center justify-center gap-4 mb-4 bg-background/10 p-4 rounded-md">
        <Suspense
          fallback={
            <div className="flex items-start justify-start gap-4 mb-4">
              <span className="animate-pulse w-32 h-6 bg-gray-300 rounded-md"></span>
              <span className="animate-pulse w-32 h-6 bg-gray-300 rounded-md"></span>
            </div>
          }
        >
          <h3 className="w-full text-left font-thin text-4xl p-6 text-foreground">
            Ihre Suche {categoryLabel && `in ${categoryLabel}`}
          </h3>
          <div className="flex flex-col sm:flex-row items-center md:justify-between mx-auto gap-10 mb-10 w-[65vw] z-40">
            <div className="flex items-center justify-center gap-4 flex-1">
              <SearchInput
                defaultQuery={query}
                defaultCategory={category}
                defaultCategoryPath={categoryPathNormalized}
                categoryOptions={categoryOptions}
              />
            </div>
            <div className="w-54">
              <SortSelect defaultValue={rawSort} />
            </div>
          </div>
        </Suspense>

        <Suspense fallback={<ProductsSkeleton limit={limit} />}>
          {safeProducts.length === 0 ? (
            <div className="space-y-6">
              <div className="rounded-md border border-border bg-muted/30 p-6 text-sm text-foreground/80">
                {query
                  ? `No results found for "${decodedQuery}" in ${categoryLabel}.`
                  : `No products found in ${categoryLabel}.`}
              </div>
            </div>
          ) : (
            <div className="container grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-9 w-[85vw] mx-auto">
              {safeProducts.map((product, idx) => (
                <ProductCard
                  key={product.id ?? `prod-${idx}`}
                  product={product}
                />
              ))}
            </div>
          )}

          <div className="my-12 text-center text-sm text-foreground/70">
            Showing {safeProducts.length} of {total} results
            {total >= 1 && (
              <PaginationProducts
                totalPages={Math.ceil(total / limit)}
                currentPage={page}
                query={query}
                sort={rawSort}
              />
            )}
          </div>
        </Suspense>
      </div>
    </main>
  );
};

export default CategoryPage;

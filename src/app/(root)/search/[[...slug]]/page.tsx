import ProductCard from "@/components/Product/ProductCard";
import Breadcrumbs from "@/components/shared/beardcrumbs/Breadcrumbs";
import {PaginationProducts} from "@/components/shared/pagination";
import {convertDecimalToNumber} from "@/helpers";
import {getAllCategoryTree} from "@/actions/categories";
import {getSearchProducts} from "@/actions/products";
import {ProductWithVariants} from "@/types/product/product";
import {Suspense} from "react";
// redirect not used for wishlist when unauthenticated; keep import removed
import {ensureSession} from "@/acl/acl";
import prisma from "@/lib/prisma";
// import {sleep} from "@/lib/utils";
import SortSelect from "@/components/shared/SortSelect";
import ProductsSkeleton from "@/app/(root)/skeletons/ProductsSkeleton";
import SearchInput from "@/components/shared/searchBar";
import WishlistGridClient from "@/components/wishlist/WishlistGridClient";

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
  const {slug} = (await params) ?? {};
  const {
    sort: rawSortParam,
    query: rawQueryParam,
    page: rawPageParam,
  } = (await searchParams) ?? {};

  const rawSort = Array.isArray(rawSortParam)
    ? (rawSortParam[0] ?? "")
    : (rawSortParam ?? "");
  const rawQuery = Array.isArray(rawQueryParam)
    ? (rawQueryParam[0] ?? "")
    : (rawQueryParam ?? "");
  const query = (rawQuery as string).trim();
  const decodedQuery = decodeURIComponent(query.replace(/\+/g, " "));

  const categorySegments = Array.isArray(slug) ? slug : [];

  const category = categorySegments.length
    ? normalizeCategorySlug(categorySegments[categorySegments.length - 1] ?? "")
    : "";

  const categoryPathNormalized = categorySegments.length
    ? categorySegments.map((s) => normalizeCategorySlug(s)).join("/")
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

  const rawPageValue = rawPageParam ?? "1";
  const page = Math.max(
    Number(
      Array.isArray(rawPageValue) ? (rawPageValue[0] ?? "1") : rawPageValue,
    ),
    1,
  );

  const limit = 8;
  const categoryOptions = await getAllCategoryTree();

  async function Products({
    query,
    page,
    limit,
    rawSort,
  }: {
    query: string;
    page: number;
    limit: number;
    rawSort: string;
  }) {
    // When viewing the wishlist route we must NOT pass the literal
    // "wishlist" category slug to the search backend — that would
    // filter for products in a category named "wishlist" and return
    // no results. Instead, run the search across all products (no
    // category filter) and then restrict results server-side to the
    // user's wishlist IDs below.
    const searchCategory =
      category === "wishlist" ? undefined : categoryPathNormalized || undefined;

    const {products: finalProducts, total: finalTotal} =
      await getSearchProducts({
        query,
        page,
        limit,
        category: searchCategory,
        sort: rawSort || undefined,
      });

    const shouldShowBrowseFallback =
      finalProducts.length === 0 && Boolean(query);
    const {products: browseProducts} = shouldShowBrowseFallback
      ? await getSearchProducts({
          page: 1,
          limit,
          category,
          sort: rawSort || undefined,
        })
      : {products: []};

    let safeProducts = (finalProducts ?? []).map(
      (p) => convertDecimalToNumber(p) as unknown,
    ) as ProductWithVariants[];
    let safeBrowseProducts = (browseProducts ?? []).map(
      (p) => convertDecimalToNumber(p) as unknown,
    ) as ProductWithVariants[];

    // If the user is viewing the wishlist route, filter the server-side search
    // results to only include products that appear in the user's wishlist. This
    // allows existing search filters (query, sort) to be applied before
    // restricting to wishlist items.
    if (category === "wishlist") {
      let session = null;
      try {
        session = await ensureSession();
      } catch {
        session = null;
      }

      if (session && session.user && session.user.id) {
        const wishlist = await prisma.wishlist.findUnique({
          where: {userId: session.user.id},
          include: {items: {select: {productId: true}}},
        });

        const wishSet = new Set(
          (wishlist?.items ?? []).map((i) => i.productId),
        );
        safeProducts = safeProducts.filter((p) => p && wishSet.has(p.id));
        safeBrowseProducts = safeBrowseProducts.filter(
          (p) => p && wishSet.has(p.id),
        );
      } else {
        // No session: leave safeProducts untouched. Client-side `WishlistGridClient`
        // will render guest wishlist items from localStorage when available.
      }
    }

    // No client-side wishlist handling here — server handles /search/wishlist

    // Simulate server delay so route-level Skeleton is visible on navigation
    // await sleep(4000);

    return (
      <>
        {safeProducts.length === 0 ? (
          <div className="space-y-6">
            <div className="rounded-md border border-border bg-muted/30 p-6 text-sm text-foreground/80">
              {query
                ? `No results found for "${decodedQuery}" in ${categoryLabel}.`
                : `No products found in ${categoryLabel}.`}
            </div>

            {safeBrowseProducts.length > 0 && (
              <section className="space-y-4">
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    {category
                      ? `Browse all products in ${categoryLabel}`
                      : "Browse all products"}
                  </h3>
                  <p className="text-sm text-foreground/70">
                    {category
                      ? "Your search returned no matches, but these products are available in the current category."
                      : "Your search returned no matches, but you can continue browsing the full catalog."}
                  </p>
                </div>

                <div className="container grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-9 w-[85vw] mx-auto">
                  {safeBrowseProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : // For the wishlist route always render the client-managed grid so
        // client-side events can update the visible list immediately. For
        // guests `initialProducts` will be empty and `allowedIds` will be
        // used to intersect with `localStorage.guest_wishlist`.
        category === "wishlist" ? (
          <WishlistGridClient
            initialProducts={safeProducts}
            allowedIds={safeProducts.map((p) => p.id)}
          />
        ) : (
          <div className="container grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-9 w-[85vw] md:w-[95vw]">
            {safeProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="my-12 text-center text-sm text-foreground/70">
          Showing {safeProducts.length} of {finalTotal} results
          {finalTotal >= 1 && (
            <PaginationProducts
              totalPages={Math.ceil(finalTotal / limit)}
              currentPage={page}
              query={query}
              sort={rawSort}
            />
          )}
        </div>
      </>
    );
  }

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
            Filter Products {categoryLabel && `in ${categoryLabel}`}
          </h3>
          <div className="flex flex-col sm:flex-row items-center md:justify-between mx-auto gap-10 mb-10 w-[65vw]">
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
          <Products query={query} page={page} limit={limit} rawSort={rawSort} />
        </Suspense>
      </div>
    </main>
  );
};

export default CategoryPage;

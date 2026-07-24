import {Prisma, Product} from "@/generated/prisma/client";
import {
  buildCategoryTree,
  getCategoryDescendantIds,
} from "@/helpers/category/categoryTree";
import {mapCategoryTreeToSearchOptions} from "@/helpers/category/searchOptions";
import prisma from "@/lib/prisma";

export async function getAllProducts(skips: {skip: number; limit: number}) {
  try {
    // Try full query with relations first (best case).
    // If the database schema was reset and relations/columns are missing,
    // fall back to a safer query without `include` to avoid runtime errors.
    let products;
    let total;
    try {
      [products, total] = await Promise.all([
        prisma.product.findMany({
          skip: skips.skip,
          take: skips.limit,
          include: {category: true, variants: {include: {options: true}}},
        }),
        // use the same `where` if you filter products
        prisma.product.count({}),
      ]);
    } catch (innerErr) {
      console.warn(
        "getAllProducts: fallback to simple query due to schema mismatch",
        innerErr,
      );
      [products, total] = await Promise.all([
        prisma.product.findMany({
          skip: skips.skip,
          take: skips.limit,
        }),
        prisma.product.count({}),
      ] as const);
    }

    return {products, total};
  } catch (error) {
    console.error("Error fetching products:", error);
    return {products: [], total: 0};
  }
}

export async function getProductsBySlug(slug: string): Promise<Product | null> {
  const decoded = decodeURIComponent(slug);
  const normalized = decoded.trim().toLowerCase();
  if (!slug) return null;
  try {
    const product = await prisma.product.findFirst({
      where: {slug: {equals: normalized, mode: "insensitive"}},
      include: {category: true, variants: {include: {options: true}}},
      // add relations here only if they exist in your schema (e.g. merchant: true)
    });
    return product;
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    // rethrow if you want upstream error handling:
    // throw error;
    return null;
  }
}

type SearchSortField = "createdAt" | "name" | "price" | "sellPrice";
type SearchSortDir = "asc" | "desc";

type SearchProductsOptions = {
  query?: string;
  page?: number;
  limit?: number;
  category?: string;
  sort?: string; // e.g. "createdAt.desc", "price.asc", "price-desc"
};

function clampInt(value: unknown, fallback: number, min: number, max: number) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(Math.trunc(n), min), max);
}

function parseSort(sort?: string): {
  field: SearchSortField;
  dir: SearchSortDir;
} {
  const fallback = {field: "createdAt" as const, dir: "desc" as const};
  if (!sort?.trim()) return fallback;

  const normalized = sort.trim().replace(/-/g, ".");
  const [rawField, rawDir] = normalized.split(".");

  const field =
    rawField === "name" ||
    rawField === "createdAt" ||
    rawField === "price" ||
    rawField === "sellPrice"
      ? rawField
      : fallback.field;

  const dir = rawDir === "asc" ? "asc" : "desc";
  return {field, dir};
}

function buildProductWhere(query: string): Prisma.ProductWhereInput {
  return query
    ? {
        OR: [
          {name: {contains: query, mode: "insensitive"}},
          {brand: {contains: query, mode: "insensitive"}},
          {smallDesc: {contains: query, mode: "insensitive"}},
        ],
      }
    : {};
}

function getMinSellPrice(product: {
  variants?: Array<{
    options?: Array<{
      sellPrice: unknown;
    }>;
  }>;
}) {
  const prices =
    product.variants?.flatMap((variant) =>
      (variant.options ?? [])
        .map((opt) => Number(opt.sellPrice))
        .filter((n) => Number.isFinite(n)),
    ) ?? [];

  return prices.length ? Math.min(...prices) : null;
}

export async function getSearchProducts(opts: SearchProductsOptions) {
  const query = (opts.query ?? "").trim();
  const category = (opts.category ?? "").trim();
  const {field, dir} = parseSort(opts.sort);

  const page = clampInt(opts.page, 1, 1, 1_000_000);
  const limit = clampInt(opts.limit, 8, 1, 100);
  const skip = (page - 1) * limit;

  let where: Prisma.ProductWhereInput = buildProductWhere(query);

  try {
    if (category) {
      const decodedCat = decodeURIComponent(category).trim();

      if (decodedCat) {
        const normalizedCat = decodedCat
          .split("/")
          .filter(Boolean)
          .map((s) => s.replace(/\s+/g, "-").toLowerCase())
          .join("/");

        const isCategoryOnly =
          !query || query === category || query === decodedCat;

        let categories;
        try {
          categories = await prisma.category.findMany({
            select: {
              id: true,
              name: true,
              slug: true,
              parentId: true,
            },
          });
        } catch (catErr) {
          console.warn(
            "getSearchProducts: category select parentId missing, falling back",
            catErr,
          );
          const flat = await prisma.category.findMany({
            select: {id: true, name: true, slug: true},
          });
          categories = flat.map((c) => ({...c, parentId: null}));
        }

        const descendantIds = normalizedCat
          ? getCategoryDescendantIds(categories, normalizedCat)
          : [];

        const categoryFilter: Prisma.ProductWhereInput = descendantIds.length
          ? {categoryId: {in: descendantIds}}
          : {categoryId: "__missing_category__"};

        where = isCategoryOnly
          ? categoryFilter
          : {AND: [where, categoryFilter]};
      }
    }

    if (field === "price" || field === "sellPrice") {
      try {
        const allForSort = await prisma.product.findMany({
          where,
          select: {
            id: true,
            variants: {
              select: {
                options: {
                  select: {
                    sellPrice: true,
                  },
                },
              },
            },
          },
        });

        const sorted = allForSort
          .map((p) => ({
            id: p.id,
            min: getMinSellPrice(p),
          }))
          .sort((a, b) => {
            const va = a.min === null ? Infinity : a.min;
            const vb = b.min === null ? Infinity : b.min;
            return dir === "asc" ? va - vb : vb - va;
          });

        const total = sorted.length;
        const pagedIds = sorted.slice(skip, skip + limit).map((p) => p.id);

        const fetched = await prisma.product.findMany({
          where: {id: {in: pagedIds}},
          include: {
            category: true,
            variants: {include: {options: true}},
          },
        });

        const byId = new Map(fetched.map((p) => [p.id, p]));
        const products = pagedIds.map((id) => byId.get(id)).filter(Boolean);

        console.log("All Products", products);

        return {
          products,
          total,
          usedFallback: false,
        };
      } catch (priceErr) {
        console.warn(
          "getSearchProducts: price sorting fallback due to schema mismatch",
          priceErr,
        );
        // Fall through to general query below (without special price handling)
      }
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      field === "name" || field === "createdAt"
        ? {[field]: dir}
        : {createdAt: "desc"};

    let products;
    let total;
    try {
      [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          skip,
          take: limit,
          include: {
            category: true,
            variants: {include: {options: true}},
          },
          orderBy,
        }),
        prisma.product.count({where}),
      ] as const);
    } catch (listErr) {
      console.warn(
        "getSearchProducts: fallback to simple list due to schema mismatch",
        listErr,
      );
      [products, total] = await Promise.all([
        prisma.product.findMany({where, skip, take: limit, orderBy}),
        prisma.product.count({where}),
      ] as const);
    }

    return {
      products,
      total,
      usedFallback: false,
    };
  } catch (error) {
    console.error("Error fetching search products:", error);
    return {
      products: [],
      total: 0,
      usedFallback: false,
    };
  }
}

export async function getAllCategories() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {name: "asc"},
    });
    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export async function getAllCategoryTree() {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        parentId: true,
      },
    });

    const categoryTree = buildCategoryTree(categories);
    const searchOptions = mapCategoryTreeToSearchOptions(categoryTree);
    return searchOptions;
  } catch (error) {
    // Fallback for stale Prisma clients that do not yet expose `parentId`.
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    const flatCategories = categories.map((category) => ({
      ...category,
      parentId: null,
    }));

    const categoryTree = buildCategoryTree(flatCategories);
    const searchOptions = mapCategoryTreeToSearchOptions(categoryTree);
    console.warn(
      "getAllCategoryTree fallback activated: Prisma client missing parentId.",
      error,
    );
    return searchOptions;
  }
}

export async function getProductsByCategorySlug(
  slug: string,
  page = 1,
  limit = 4,
) {
  const decoded = decodeURIComponent(slug ?? "");
  const normalized = decoded.trim().replace(/\s+/g, "-").toLowerCase();
  const skip = Math.max(Number(page ?? 1), 1) - 1;
  const offset = skip * Number(limit ?? 4);

  try {
    const where = {
      category: {
        slug: {
          equals: normalized,
          mode: "insensitive",
        } as unknown as Prisma.StringFilter,
      },
    } as Prisma.ProductWhereInput;

    let products;
    let total;
    try {
      [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          skip: offset,
          take: limit,
          include: {category: true, variants: {include: {options: true}}},
          orderBy: {createdAt: "desc"},
        }),
        prisma.product.count({where}),
      ] as const);
    } catch (catListErr) {
      console.warn(
        "getProductsByCategorySlug: fallback to simple query due to schema mismatch",
        catListErr,
      );
      [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          skip: offset,
          take: limit,
          orderBy: {createdAt: "desc"},
        }),
        prisma.product.count({where}),
      ] as const);
    }

    return {products, total};
  } catch (error) {
    console.error("Error fetching products by category slug:", error);
    return {products: [], total: 0};
  }
}

import prisma from "@/lib/prisma";

export async function getAllProducts(skips: {skip: number; limit: number}) {
  try {
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        skip: skips.skip,
        take: skips.limit,
        include: {variants: {include: {options: true}}},
      }),
      // use the same `where` if you filter products
      prisma.product.count({}),
    ]);

    return {products, total};
  } catch (error) {
    console.error("Error fetching products:", error);
    return {products: [], total: 0};
  }
}

export async function getProductBySlug(slug: string) {
  try {
    const product = await prisma.product.findUnique({
      where: {slug},
      include: {category: true, variants: {include: {options: true}}},
    });
    return product;
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    return null;
  }
}

export async function getSearchProducts(opts: {
  query?: string;
  page?: number;
  limit?: number;
}) {
  const query = (opts.query ?? "").trim();
  const page = Math.max(Number(opts.page ?? 1), 1);
  const limit = Number(opts.limit ?? 8);
  const skip = (page - 1) * limit;

  const where = query
    ? {
        OR: [
          {name: {contains: query, mode: "insensitive" as const}},
          {brand: {contains: query, mode: "insensitive" as const}},
          {category: {name: {contains: query, mode: "insensitive" as const}}},
        ],
      }
    : {};

  try {
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {category: true, variants: {include: {options: true}}},
        orderBy: {createdAt: "desc"},
      }),
      prisma.product.count({where}),
    ]);

    let finalProducts = products;
    let finalTotal = total;

    if ((products?.length ?? 0) === 0 && query) {
      const [fallbackProducts, fallbackTotal] = await Promise.all([
        prisma.product.findMany({
          skip: 0,
          take: limit,
          include: {category: true, variants: {include: {options: true}}},
          orderBy: {createdAt: "desc"},
        }),
        prisma.product.count(),
      ]);
      finalProducts = fallbackProducts;
      finalTotal = fallbackTotal;
    }

    const usedFallback = (products?.length ?? 0) === 0 && Boolean(query);

    return {products: finalProducts, total: finalTotal, usedFallback};
  } catch (error) {
    console.error("Error fetching search products:", error);
    return {products: [], total: 0, usedFallback: false};
  }
}

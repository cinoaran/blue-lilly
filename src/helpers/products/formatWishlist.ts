// formatWishlist: normalize wishlist payloads for API responses
type ProductForWishlist = {
  id: string;
  name: string;
  slug: string;
  variants?: Array<{
    options?: Array<{
      image?: string[];
      sellPrice?: unknown;
      entryPrice?: unknown;
      quantity?: number | null;
    }>;
  }>;
};

export function formatWishlist(wishlist: {
  id: string;
  name: string | null;
  items: Array<{
    id: string;
    productId: string;
    createdAt: Date;
    product: ProductForWishlist | null;
  }>;
}) {
  return {
    wishlist: {
      id: wishlist.id,
      name: wishlist.name,
      items: wishlist.items.map((item) => {
        const product = item.product;
        let image: string | null = null;
        let price: unknown = null;
        let available = false;

        if (product?.variants) {
          for (const v of product.variants) {
            if (v?.options) {
              for (const o of v.options) {
                if (!image && o?.image && o.image.length > 0) {
                  image = o.image[0];
                }
                if (!price && (o?.sellPrice ?? o?.entryPrice) != null) {
                  price = o.sellPrice ?? o.entryPrice;
                }
                // determine availability from option quantity when available
                if ((o?.quantity ?? 0) > 0) {
                  available = true;
                }
                if (image && price && available) break;
              }
            }
            if (image && price && available) break;
          }
        }

        return {
          id: item.id,
          productId: item.productId,
          createdAt: item.createdAt,
          product: {
            id: product?.id ?? "",
            name: product?.name ?? "",
            slug: product?.slug ?? "",
            price,
            currency: "EUR",
            image,
            available: available,
          },
        };
      }),
    },
  };
}

export default formatWishlist;

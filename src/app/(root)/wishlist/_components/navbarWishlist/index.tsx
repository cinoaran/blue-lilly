import {headers} from "next/headers";
import {ensureSession} from "@/acl/acl";
import prisma from "@/lib/prisma";
import {NavbarWishlistClient} from "./NavbarWishlistClient";
import {Variant} from "@/generated/prisma/client";

// Narrow variant shape for server-side mapping to avoid `any`
type VariantWithOptions = {
  options?: Array<{image?: string[]}>;
};

type WishlistItemForClient = {
  id: string | null;
  productId: string;
  createdAt?: string | Date;
  product?: {
    id: string;
    name?: string | null;
    slug?: string | null;
    mainImage?: string | null;
    variants?: Array<{options?: Array<{image?: string[]}>}>;
  } | null;
};

type WishlistForClient = {
  id: string | null;
  name: string | null;
  items: WishlistItemForClient[];
};

export async function NavbarWishlist() {
  const session = await ensureSession({headers: await headers()});
  let wishlist = null;
  const isAuthenticated = Boolean(session?.user?.id);
  if (isAuthenticated) {
    const db = await prisma.wishlist.findUnique({
      where: {userId: session?.user?.id},
      include: {
        items: {
          include: {
            product: {
              include: {
                variants: {include: {options: true}},
              },
            },
          },
        },
      },
    });

    if (db) {
      wishlist = {
        id: db.id,
        name: db.name ?? null,
        items: db.items.map((it) => ({
          id: it.id,
          productId: it.productId,
          createdAt: it.createdAt,
          product: it.product
            ? {
                id: it.product.id,
                name: it.product.name,
                slug: it.product.slug,
                // compute a mainImage from the first available variant option image
                mainImage: (() => {
                  const vars =
                    (it.product.variants as VariantWithOptions[]) ?? [];
                  for (const v of vars) {
                    const opts = v?.options ?? [];
                    for (const o of opts) {
                      const imgs = o?.image ?? [];
                      if (
                        Array.isArray(imgs) &&
                        imgs.length > 0 &&
                        typeof imgs[0] === "string"
                      ) {
                        return imgs[0] as string;
                      }
                    }
                  }
                  return null;
                })(),
                variants: (it.product.variants as Variant[]) ?? [],
              }
            : undefined,
        })),
      } as WishlistForClient;
    }
  }

  const serializable = wishlist ? JSON.parse(JSON.stringify(wishlist)) : null;

  return (
    <NavbarWishlistClient
      initialWishlist={serializable}
      isAuthenticated={isAuthenticated}
    />
  );
}

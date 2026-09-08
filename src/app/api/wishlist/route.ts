import {headers} from "next/headers";
// imported helpers removed
import {ensureSession} from "@/acl/acl";
import {NextResponse} from "next/server";
import prisma from "../../../lib/prisma";
import {convertDecimalToNumber} from "@/helpers";
import formatWishlist from "@/helpers/products/formatWishlist";
// Prisma types not needed here

export async function GET() {
  const hdrs = await headers();
  const session = await ensureSession({headers: hdrs});

  console.debug("/api/wishlist GET headers cookie:", hdrs.get("cookie")?.slice(0, 200));
  console.debug("/api/wishlist GET session userId:", session?.user?.id ?? null);

  // Ensure session is valid
  if (!session || !session.user || !session.user.id)
    return NextResponse.json({error: "Unauthorized"}, {status: 401});
  // Ensure user role is correct
  if (session.user.role !== "user")
    return NextResponse.json({error: "Forbidden"}, {status: 403});
  // At this point, the session is valid and the user role is correct

  const wishlist = await prisma.wishlist.findUnique({
    where: {userId: session.user.id},
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              variants: {
                include: {
                  options: {
                    select: {
                      image: true,
                      sellPrice: true,
                      entryPrice: true,
                      quantity: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {createdAt: "desc"},
      },
    },
  });

  if (!wishlist) {
    console.debug("/api/wishlist GET: no wishlist for user", session.user.id);
    return NextResponse.json({
      wishlist: {id: null, name: null, items: []},
    });
  }

  const mapped = formatWishlist(wishlist);
  console.debug("/api/wishlist GET: returning items", mapped.wishlist?.items?.length ?? 0);

  return NextResponse.json(convertDecimalToNumber(mapped));
}

export async function POST(req: Request) {
  const hdrs = await headers();
  let session: Awaited<ReturnType<typeof ensureSession>> | null = null;
  try {
    session = await ensureSession({headers: hdrs});

    console.debug("/api/wishlist POST session userId:", session?.user?.id ?? null);

    // Ensure session is valid
    if (!session || !session.user || !session.user.id)
      return NextResponse.json({error: "Unauthorized"}, {status: 401});
    // Ensure user role is correct
    if (session.user.role !== "user")
      return NextResponse.json({error: "Forbidden"}, {status: 403});

    const body = await req.json();
    const {productId} = body ?? {};
    if (!productId)
      return NextResponse.json({error: "productId required"}, {status: 400});

    // Ensure wishlist exists (one per user in this schema)
    let wishlist = await prisma.wishlist.findUnique({
      where: {userId: session.user.id},
    });
    if (!wishlist) {
      try {
        wishlist = await prisma.wishlist.create({
          data: {userId: session.user.id},
        });
      } catch (err: unknown) {
        const code = (err as {code?: string})?.code;
        // Handle concurrent creation race: if another request created the
        // wishlist just before us, re-load it instead of failing.
        if (code === "P2002") {
          wishlist = await prisma.wishlist.findUnique({
            where: {userId: session.user.id},
          });
        } else {
          throw err;
        }
      }
      if (!wishlist) {
        return NextResponse.json(
          {error: "Failed to create wishlist"},
          {status: 500},
        );
      }
    }

    try {
      await prisma.wishlistItem.create({
        data: {wishlistId: wishlist.id, productId},
      });
    } catch (err: unknown) {
      // Unique constraint on (wishlistId, productId)
      const code = (err as {code?: string})?.code;
      if (code === "P2002") {
        const existing = await prisma.wishlist.findUnique({
          where: {userId: session.user.id},
          include: {
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    variants: {
                      include: {
                        options: {
                          select: {
                            image: true,
                            sellPrice: true,
                            entryPrice: true,
                            quantity: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
              orderBy: {createdAt: "desc"},
            },
          },
        });
        const mappedExisting = existing
          ? formatWishlist(existing)
          : {id: null, name: null, items: []};
        return NextResponse.json(convertDecimalToNumber(mappedExisting));
      }
      throw err;
    }
  } catch (e) {
    console.error("/api/wishlist POST error", e);
    return NextResponse.json({error: "Server error"}, {status: 500});
  }

  const updated = await prisma.wishlist.findUnique({
    where: {userId: session.user.id},
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              variants: {
                include: {
                  options: {
                    select: {
                      image: true,
                      sellPrice: true,
                      entryPrice: true,
                      quantity: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {createdAt: "desc"},
      },
    },
  });

  if (!updated)
    return NextResponse.json({error: "Wishlist not found"}, {status: 404});

  const mapped = formatWishlist(updated);
  console.debug("/api/wishlist POST: returning items", mapped.wishlist?.items?.length ?? 0);

  return NextResponse.json(convertDecimalToNumber(mapped), {status: 201});
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const productId = url.searchParams.get("productId");
  const wishlistItemId =
    url.searchParams.get("id") ?? url.searchParams.get("wishlistItemId");

  const hdrs = await headers();
  const session = await ensureSession({headers: hdrs});
  console.debug("/api/wishlist DELETE session userId:", session?.user?.id ?? null);
  if (!session || !session.user || !session.user.id)
    return NextResponse.json({error: "Unauthorized"}, {status: 401});

  if (!productId && !wishlistItemId)
    return NextResponse.json(
      {error: "productId or wishlist item id required"},
      {status: 400},
    );

  const wishlist = await prisma.wishlist.findUnique({
    where: {userId: session.user.id},
  });
  if (!wishlist)
    return NextResponse.json({error: "Wishlist not found"}, {status: 404});

  if (wishlistItemId) {
    await prisma.wishlistItem.deleteMany({
      where: {wishlistId: wishlist.id, id: wishlistItemId},
    });
  } else {
    await prisma.wishlistItem.deleteMany({
      where: {wishlistId: wishlist.id, productId: productId!},
    });
  }

  const updated = await prisma.wishlist.findUnique({
    where: {userId: session.user.id},
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              variants: {
                include: {
                  options: {
                    select: {
                      image: true,
                      sellPrice: true,
                      entryPrice: true,
                      quantity: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {createdAt: "desc"},
      },
    },
  });

  if (!updated)
    return NextResponse.json({wishlist: {id: null, name: null, items: []}});
  const mapped = formatWishlist(updated);
  console.debug("/api/wishlist DELETE: returning items", mapped.wishlist?.items?.length ?? 0);
  return NextResponse.json(convertDecimalToNumber(mapped));
}

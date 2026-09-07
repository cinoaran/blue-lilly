import {headers} from "next/headers";
import {notFound} from "next/navigation";
import {ensureSession} from "@/acl/acl";
import {NextResponse} from "next/server";
import prisma from "../../../lib/prisma";
import {convertDecimalToNumber} from "@/helpers";
import formatWishlist from "@/helpers/products/formatWishlist";
import {Prisma} from "@/generated/prisma";

export async function GET() {
  const hdrs = await headers();
  const session = await ensureSession({headers: hdrs});

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
    return NextResponse.json({
      wishlist: {id: null, name: null, items: []},
    });
  }

  const mapped = formatWishlist(wishlist);

  return NextResponse.json(convertDecimalToNumber(mapped));
}

export async function POST(req: Request) {
  const hdrs = await headers();
  const session = await ensureSession({headers: hdrs});

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
    wishlist = await prisma.wishlist.create({data: {userId: session.user.id}});
  }

  try {
    await prisma.wishlistItem.create({
      data: {wishlistId: wishlist.id, productId},
    });
  } catch (err: unknown) {
    // Unique constraint on (wishlistId, productId)
    // Some Prisma client builds may not make `instanceof` checks reliable across bundles,
    // so check the error code string instead.
    const code = (err as {code?: string})?.code;
    if (code === "P2002") {
      // Item already exists — return the current wishlist so clients can reconcile
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

  return NextResponse.json(convertDecimalToNumber(mapped), {status: 201});
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const productId = url.searchParams.get("productId");

  const hdrs = await headers();
  const session = await ensureSession({headers: hdrs});
  if (!session || !session.user || !session.user.id)
    return NextResponse.json({error: "Unauthorized"}, {status: 401});

  if (!productId)
    return NextResponse.json({error: "productId required"}, {status: 400});

  const wishlist = await prisma.wishlist.findUnique({
    where: {userId: session.user.id},
  });
  if (!wishlist)
    return NextResponse.json({error: "Wishlist not found"}, {status: 404});

  await prisma.wishlistItem.deleteMany({
    where: {wishlistId: wishlist.id, productId},
  });

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
  return NextResponse.json(convertDecimalToNumber(mapped));
}

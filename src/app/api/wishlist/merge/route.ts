import {headers} from "next/headers";
import {NextResponse} from "next/server";
import {ensureSession} from "@/acl/acl";
import prisma from "../../../../lib/prisma";
import formatWishlist from "@/helpers/products/formatWishlist";
import {convertDecimalToNumber} from "@/helpers";

export async function POST(req: Request) {
  const hdrs = await headers();
  const session = await ensureSession({headers: hdrs});
  if (!session || !session.user || !session.user.id)
    return NextResponse.json({error: "Unauthorized"}, {status: 401});
  if (session.user.role !== "user")
    return NextResponse.json({error: "Forbidden"}, {status: 403});

  const body = await req.json();
  const {productIds} = body ?? {};
  if (!Array.isArray(productIds) || productIds.length === 0)
    return NextResponse.json({error: "productIds required"}, {status: 400});

  // Ensure wishlist exists
  let wishlist = await prisma.wishlist.findUnique({
    where: {userId: session.user.id},
  });
  if (!wishlist)
    wishlist = await prisma.wishlist.create({data: {userId: session.user.id}});

  // Use createMany with skipDuplicates to avoid unique constraint errors
  const data = productIds.map((p: string) => ({
    wishlistId: wishlist!.id,
    productId: p,
  }));
  try {
    await prisma.wishlistItem.createMany({data, skipDuplicates: true});
  } catch (err) {
    // ignore — skipDuplicates should handle duplicates, but fallthrough
    console.warn("wishlist merge createMany failed", err);
  }

  // Return the updated wishlist (same shape as GET)
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
                    select: {image: true, sellPrice: true, entryPrice: true},
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

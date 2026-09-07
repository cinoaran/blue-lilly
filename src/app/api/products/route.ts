import {NextResponse} from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const idsParam = url.searchParams.get("ids") ?? "";
  const ids = idsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (ids.length === 0) return NextResponse.json({products: []});

  const products = await prisma.product.findMany({
    where: {id: {in: ids}},
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
  });

  return NextResponse.json({products});
}

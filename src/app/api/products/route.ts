import {NextResponse} from "next/server";
import prisma from "@/lib/prisma";
import {convertDecimalToNumber} from "@/helpers";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const idsParam = url.searchParams.get("ids") ?? "";
    const ids = idsParam
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (!ids.length) {
      return NextResponse.json({products: []});
    }

    const products = await prisma.product.findMany({
      where: {id: {in: ids}},
      include: {category: true, variants: {include: {options: true}}},
    });

    return NextResponse.json(convertDecimalToNumber(products));
  } catch (e) {
    console.error("/api/products GET error", e);
    return NextResponse.json({error: "Server error"}, {status: 500});
  }
}

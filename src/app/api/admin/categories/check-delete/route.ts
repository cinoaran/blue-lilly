import prisma from "@/lib/prisma";
import {NextResponse} from "next/server";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({error: "id required"}, {status: 400});

    const category = await prisma.category.findUnique({
      where: {id},
      select: {
        id: true,
        _count: {select: {children: true, products: true}},
      },
    });

    if (!category)
      return NextResponse.json({error: "not found"}, {status: 404});

    return NextResponse.json({counts: category._count});
  } catch (err) {
    console.error("check-delete error:", err);
    return NextResponse.json({error: "server error"}, {status: 500});
  }
}

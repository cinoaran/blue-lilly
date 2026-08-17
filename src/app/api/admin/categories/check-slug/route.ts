import {prisma} from "@/lib/prisma";
import type {Prisma} from "@/generated/prisma";
import {NextResponse} from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {slug, parentId, excludeId} = body as {
      slug: string;
      parentId?: string | null;
      excludeId?: string | undefined;
    };

    if (!slug || typeof slug !== "string") {
      return NextResponse.json({available: false}, {status: 400});
    }

    const normalized = String(slug).trim().toLowerCase();
    const parent =
      parentId === null || parentId === undefined ? null : String(parentId);

    const where: Prisma.CategoryWhereInput = {
      parentId: parent,
      slug: normalized,
    };
    if (excludeId) {
      // exclude a specific id (useful for update)
      const existing = await prisma.category.findFirst({
        where: {parentId: parent, slug: normalized, NOT: {id: excludeId}},
        select: {id: true},
      });
      return NextResponse.json({available: !Boolean(existing)});
    }

    const existing = await prisma.category.findFirst({
      where: where,
      select: {id: true},
    });

    return NextResponse.json({available: !Boolean(existing)});
  } catch (err) {
    console.error("check-slug error:", err);
    return NextResponse.json({available: false}, {status: 500});
  }
}

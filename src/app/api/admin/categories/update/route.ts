import {NextResponse} from "next/server";
import {updateCategory} from "@/actions/admin/categories/updateCategory";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {id, name, slug, parentId} = body as {
      id: string;
      name: string;
      slug?: string;
      parentId?: string | null;
    };

    if (!id || !name)
      return NextResponse.json({error: "Missing fields"}, {status: 400});

    const updated = await updateCategory(id, {name, slug, parentId});
    return NextResponse.json({updated});
  } catch (err: unknown) {
    console.error("api update category error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({error: message}, {status: 500});
  }
}

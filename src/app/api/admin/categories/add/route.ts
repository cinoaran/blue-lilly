import {NextResponse} from "next/server";
import {addNewCategory} from "@/actions/admin/categories/addNewCategory";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {name, slug, parentId} = body as {
      name: string;
      slug?: string;
      parentId?: string | null;
    };

    if (!name)
      return NextResponse.json({error: "Name required"}, {status: 400});

    const created = await addNewCategory(name, slug, parentId || undefined);
    return NextResponse.json({created});
  } catch (err: unknown) {
    console.error("api add category error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({error: message}, {status: 500});
  }
}

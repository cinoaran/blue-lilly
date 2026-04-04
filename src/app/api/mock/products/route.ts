import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

function readJson(fileName: string) {
  const p = path.join(process.cwd(), 'data', fileName);
  const raw = fs.readFileSync(p, 'utf8');
  return JSON.parse(raw);
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const products = readJson('products.json');
    const categories = readJson('categories.json');
    const slug = url.searchParams.get('slug');
    const category = url.searchParams.get('category');

    if (slug) {
      const found = products.find((p: any) => p.slug === slug);
      return NextResponse.json(found || null);
    }

    if (category) {
      const filtered = products.filter((p: any) => p.categoryId === category);
      return NextResponse.json(filtered);
    }

    return NextResponse.json({ products, categories });
  } catch (err) {
    return NextResponse.json({ error: 'failed to read mock data', detail: String(err) }, { status: 500 });
  }
}

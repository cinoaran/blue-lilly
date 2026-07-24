// src/components/shared/Categories.tsx
import React from "react";
import Link from "next/link";
import {Category} from "@/types/category/category";
// import sleep from "@/helpers/products/sleep";

export default async function Categories({
  categories,
}: {
  categories: Category[];
}) {
  if (!categories) {
    return (
      <div className="flex items-center justify-center gap-4 flex-wrap">
        <h3>No category found</h3>
      </div>
    );
  }

  // build a map for parent traversal
  const map = new Map<string, Category>();
  for (const c of categories) map.set(c.id, c);

  function buildPath(cat: Category) {
    const segments: string[] = [];
    let cur: Category | undefined | null = cat;
    // walk up parents and collect slugs (stop if parent missing to avoid infinite loop)
    while (cur) {
      // defensive: if slug contains path segments, take only the last part
      const own = String(cur.slug ?? "")
        .split("/")
        .filter(Boolean)
        .pop();
      if (own) segments.push(own);
      if (!cur.parentId) break;
      cur = map.get(cur.parentId) ?? null;
    }
    return segments.reverse().join("/");
  }

  // await sleep(4000); // Simulate loading delay
  // Only show top-level (root) categories on the homepage
  const rootCategories = categories.filter((c) => !c.parentId);

  return (
    <div className="flex items-center justify-center gap-4 flex-wrap">
      <ul className="flex items-center gap-6">
        {rootCategories.map((category) => {
          const path = buildPath(category);
          return (
            <li key={category.id} className="text-sm text-foreground/70">
              <Link href={`/search/${path}`}>{category.name}</Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

import {ensureAndRequire} from "@/acl/acl";
import prisma from "@/lib/prisma";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-_\s]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function addNewCategory(
  name: string,
  slug?: string,
  opts: Parameters<typeof ensureAndRequire>[0] = {},
) {
  try {
    await ensureAndRequire(opts, "admin:create");
  } catch {
    // Authorization failed — return null so callers can handle gracefully
    return null;
  }

  // ensure slug is always a string (Prisma types require `slug: string`)
  const finalSlug =
    slug && slug.trim().length > 0 ? slug.trim() : slugify(name);

  const category = await prisma.category.create({
    data: {
      name,
      slug: finalSlug,
    },
  });

  return category;
}

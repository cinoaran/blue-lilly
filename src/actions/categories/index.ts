import prisma from "@/lib/prisma";
import {
  buildCategoryTree,
  mapCategoryTreeToSearchOptions,
} from "@/lib/category/categoryTree";

export async function getAllCategories() {
  try {
    const categories = await prisma.category.findMany({orderBy: {name: "asc"}});
    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export async function getAllCategoryTree() {
  try {
    const categories = await prisma.category.findMany({
      select: {id: true, name: true, slug: true, parentId: true},
    });

    const categoryTree = buildCategoryTree(categories);
    const searchOptions = mapCategoryTreeToSearchOptions(categoryTree);
    return searchOptions;
  } catch (error) {
    const categories = await prisma.category.findMany({
      select: {id: true, name: true, slug: true},
    });

    const flatCategories = categories.map((category) => ({
      ...category,
      parentId: null,
    }));

    const categoryTree = buildCategoryTree(flatCategories);
    const searchOptions = mapCategoryTreeToSearchOptions(categoryTree);
    console.warn(
      "getAllCategoryTree fallback activated: Prisma client missing parentId.",
      error,
    );
    return searchOptions;
  }
}

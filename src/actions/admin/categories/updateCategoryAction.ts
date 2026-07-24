"use server";

import {updateCategory} from "./updateCategory";

export async function updateCategoryAction(payload: {
  id: string;
  name: string;
  slug?: string;
  parentId?: string | null;
}) {
  const {id, name, slug, parentId} = payload;
  return updateCategory(id, {name, slug, parentId});
}

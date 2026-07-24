"use server";

import {addNewCategory} from "./addNewCategory";

export async function addNewCategoryAction(payload: {
  name: string;
  slug?: string;
  parentId?: string;
}) {
  const {name, slug, parentId} = payload;
  // delegate to existing action which enforces auth and creates the category
  return await addNewCategory(name, slug, parentId);
}

"use server";

import {deleteCategory} from "./deleteCategory";

export async function deleteCategoryAction(id: string) {
  return deleteCategory(id);
}

import {addNewCategory} from "./addNewCategory";

export async function addNewCategoryAction(payload: {
  name: string;
  slug?: string;
}) {
  "use server";
  const {name, slug} = payload;
  // delegate to existing action which enforces auth and creates the category
  return await addNewCategory(name, slug);
}

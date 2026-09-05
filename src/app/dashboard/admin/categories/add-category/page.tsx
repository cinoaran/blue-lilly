import {addNewCategory} from "@/app/dashboard/admin/categories/actions/addNewCategory";
import {getAllCategories} from "@/app/dashboard/admin/categories/actions/getAllCategories";
import CategoryForm from "@/app/dashboard/admin/categories/_components/CategoryForm";
import {Category} from "@/types/category/category";

type AddCategoryPageProps = {
  searchParams: Promise<{parentId?: string}>;
};

const AddCategory = async ({searchParams}: AddCategoryPageProps) => {
  const {parentId} = await searchParams;
  const categories = (await getAllCategories()) as Category[] | null;

  async function submitHandler(values: {
    name: string;
    slug?: string;
    parentId?: string;
  }) {
    "use server";
    await addNewCategory(values.name, values.slug, values.parentId);
  }

  return (
    <div className="container ...">
      <h1 className="text-2xl font-bold mb-6">Add New Category</h1>
      {parentId ? (
        <p className="mb-4 text-sm text-muted-foreground">
          Diese Kategorie wird als Unterkategorie angelegt.
        </p>
      ) : null}
      <CategoryForm
        onSubmit={submitHandler}
        categories={(categories ?? []) as Category[]}
        initialValues={{parentId}}
      />
    </div>
  );
};

export default AddCategory;

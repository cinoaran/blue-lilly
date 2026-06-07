import {addNewCategoryAction} from "@/actions/admin/categories/addNewCategoryAction";
import CategoryForm from "@/app/dashboard/admin/categories/_components/CategoryForm";

async function submitHandler(values: {name: string; slug?: string}) {
  "use server";
  try {
    await addNewCategoryAction(values);
  } catch (err) {
    console.error(err);
  }
}

const AddCategory = async () => {
  return (
    <div className="container ...">
      <h1 className="text-2xl font-bold mb-6">Add New Category</h1>
      <CategoryForm onSubmit={submitHandler} />
    </div>
  );
};

export default AddCategory;

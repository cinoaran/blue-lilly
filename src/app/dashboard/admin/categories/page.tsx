import {columns} from "./_components/Columns";
import {DataTable} from "../../_components/DataTable";
import {getAllCategories} from "@/actions/admin/categories/getAllCategories";
import {Category} from "@/types/category/category";

const CategoriesPage = async () => {
  const data = await getAllCategories();

  if (!data) {
    return (
      <div className="container  bg-secondary text-foreground border-[0.3px] border-foreground/10 rounded-lg backdrop-blur-md shadow-md shadow-foreground/10 mx-auto my-12">
        No categories found
      </div>
    );
  }

  return (
    <div className="container  bg-secondary text-foreground border-[0.3px] border-foreground/10 rounded-lg backdrop-blur-md shadow-md shadow-foreground/10 mx-auto my-12">
      <DataTable columns={columns} data={data as Category[]} />
    </div>
  );
};

export default CategoriesPage;

import {getAllCategories} from "@/actions/admin/categories/getAllCategories";
import {getAllMerchants} from "@/actions/admin/merchant/getAllMerchants";
import ProductForm from "../_components/ProductForm";
import {Category, Merchant} from "@/generated/prisma/client";

const ProductAddPage = async () => {
  const [flatCategories, merchants] = await Promise.all([
    getAllCategories(),
    getAllMerchants(),
  ]);

  return (
    <div className="container mx-auto py-8 gap-8">
      <ProductForm
        categories={flatCategories as Category[]}
        merchants={merchants as Merchant[]}
        mode="add"
      />     
    </div>
  );
};

export default ProductAddPage;

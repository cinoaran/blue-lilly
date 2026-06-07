import {getAllMerchants} from "@/actions/admin/merchant/getAllMerchants";

import ProductForm from "../_components/ProductForm";
import {
  Category,
  Merchant,
  ProductFormData,
} from "@/types/product/productFormData";
import {getProductById} from "@/actions/admin/products";
import {convertDecimalToNumber} from "@/helpers/products/index";
import {getAllCategories} from "@/actions/admin/categories/getAllCategories";

export default async function EditProductPage(props: unknown) {
  const {params} = props as {params: {id: string}};
  const {id} = await params;
  const [flatCategories, merchants, product] = await Promise.all([
    getAllCategories(),
    getAllMerchants(),
    getProductById(id),
  ]);

  const normalizedProduct = product
    ? (convertDecimalToNumber(product) as ProductFormData)
    : undefined;

  return (
    <div className="container mx-auto py-8 gap-8 w-full">
      <ProductForm
        categories={flatCategories as Category[]}
        merchants={merchants as Merchant[]}
        product={normalizedProduct}
        mode="edit"
      />
    </div>
  );
}

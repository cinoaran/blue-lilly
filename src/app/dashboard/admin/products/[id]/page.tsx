import {getAllMerchants} from "@/actions/admin/merchant/getAllMerchants";
import {headers} from "next/headers";

import ProductForm from "../_components/ProductForm";
import {
  Category,
  Merchant,
  ProductFormData,
} from "@/types/product/productFormData";
import {getProductById} from "@/actions/admin/products";
import {convertDecimalToNumber} from "@/helpers";
import {getAllCategories} from "@/app/dashboard/admin/categories/actions/getAllCategories";

export default async function EditProductPage(props: unknown) {
  const {params} = props as {params: {id: string}};
  const {id} = await params;
  const hdrs = await headers();

  const [flatCategories, merchants, product] = await Promise.all([
    getAllCategories(undefined, {headers: hdrs}),
    getAllMerchants({headers: hdrs}),
    getProductById(id),
  ]);

  const normalizedProduct = product
    ? (convertDecimalToNumber(product) as unknown as ProductFormData)
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

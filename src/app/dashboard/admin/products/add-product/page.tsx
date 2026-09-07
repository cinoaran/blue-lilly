import {getAllCategories} from "@/app/dashboard/admin/categories/actions/getAllCategories";
import {getAllMerchants} from "../../merchant/actions/getAllMerchants";
import {headers} from "next/headers";
import {ensureAndRequire} from "@/acl/acl";
import {notFound} from "next/navigation";
import {Category, Merchant} from "@/generated/prisma";

const ProductAddPage = async () => {
  const hdrs = await headers();

  // Early guard: ensure caller has admin access before importing UI or touching DB
  try {
    await ensureAndRequire({headers: hdrs}, "admin:access");
  } catch {
    notFound();
  }

  // Dynamic import of heavy UI after guard
  const {default: ProductForm} = await import("../_components/ProductForm");

  const [flatCategories, merchants] = await Promise.all([
    getAllCategories(undefined, {headers: hdrs}),
    getAllMerchants({headers: hdrs}),
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

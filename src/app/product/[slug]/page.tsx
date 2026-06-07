import {notFound} from "next/navigation";
import {getProductBySlug} from "@/actions/shared";
import {convertDecimalToNumber} from "@/helpers/products";
import {ProductWithCategoryAndVariants} from "@/types/product/product";
import ProductDetail from "@/components/Product/ProductDetail";
import Breadcrumbs from "@/components/shared/beardcrumbs/Breadcrumbs";
import sleep from "@/helpers/products/sleep";

const ProductPage = async ({params}: {params: Promise<{slug: string}>}) => {
  const {slug} = await params;
  const product = await getProductBySlug(slug);
  const safeProduct = product
    ? (convertDecimalToNumber(product) as ProductWithCategoryAndVariants)
    : null;

  if (!safeProduct) {
    notFound();
  }

  const breadcrumbsItems = [
    {label: "Products", href: "/"},
    {
      label: safeProduct.category.name,
      href: `/category/${safeProduct.category?.slug}`,
    },
    {
      label: safeProduct.name,
      href: `/product/${safeProduct.slug}`,
      active: true,
    },
  ];
  await sleep(4000); // Simulate loading delay

  return (
    <main className="container mx-auto min-h-screen px-5 md:p-0">
      <Breadcrumbs items={breadcrumbsItems} />
      <ProductDetail product={safeProduct} />
    </main>
  );
};

export default ProductPage;

import {notFound} from "next/navigation";
import {getProductsBySlug} from "@/actions/products";
import {getAllCategories} from "@/actions/categories";
import {convertDecimalToNumber} from "@/helpers";
import {ProductWithCategoryAndVariants} from "@/types/product/product";
import {Category} from "@/types/category/category";
import ProductDetail from "@/components/Product/ProductDetail";
import Breadcrumbs from "@/components/shared/beardcrumbs/Breadcrumbs";
// import sleep from "@/helpers/products/sleep";

const ProductPage = async ({params}: {params: Promise<{slug: string}>}) => {
  const {slug} = await params;
  const product = await getProductsBySlug(slug);
  const safeProduct = product
    ? (convertDecimalToNumber(product) as ProductWithCategoryAndVariants)
    : null;

  if (!safeProduct) {
    notFound();
  }

  // Build full category path by walking parentId chain so breadcrumbs link
  // to /search/parent/.../child instead of only the child slug.
  const allCategories = await getAllCategories();
  const map = new Map<string, Category>();
  for (const c of allCategories) map.set(c.id, c);

  function buildPath(cat: Category | undefined | null) {
    if (!cat) return "";
    const segments: string[] = [];
    let cur: Category | null | undefined = cat;
    while (cur) {
      if (cur.slug) segments.push(cur.slug);
      if (!cur.parentId) break;
      cur = map.get(cur.parentId) ?? null;
    }
    return segments.reverse().join("/");
  }

  const categoryPath = buildPath(map.get(safeProduct.category.id) ?? null);

  const breadcrumbsItems = [
    {label: "Products", href: "/"},
    {label: safeProduct.category.name, href: `/search/${categoryPath}`},
    {
      label: safeProduct.name,
      href: `/product/${safeProduct.slug}`,
      active: true,
    },
  ];
  // await sleep(4000); // Simulate loading delay

  // Don't fetch cart on the server here to keep this page static.
  // The client component will fetch the cart via `/api/cart` when needed.
  const serializableCart = null;

  return (
    <div className="mx-auto max-w-[95vw] p-5">
      <Breadcrumbs items={breadcrumbsItems} />
      <ProductDetail product={safeProduct} initialCart={serializableCart} />
    </div>
  );
};

export default ProductPage;

import {notFound} from "next/navigation";
import {getProductsBySlug} from "@/actions/products";
import {getAllCategories} from "@/actions/categories";
import {convertDecimalToNumber} from "@/helpers";
import {getCart} from "@/app/(root)/cart/actions/getCarts";
import {ProductWithCategoryAndVariants} from "@/types/product/product";
import {Category} from "@/types/category/category";
import ProductDetail from "@/components/Product/ProductDetail";
import prisma from "@/lib/prisma";
import {ensureSession} from "@/acl/acl";
import Breadcrumbs from "@/components/shared/beardcrumbs/Breadcrumbs";
// import sleep from "@/helpers/products/sleep";

const ProductPage = async ({params}: {params: Promise<{slug: string}>}) => {
  const {slug} = await params;
  const product = await getProductsBySlug(slug);
  const safeProduct = product
    ? (convertDecimalToNumber(
        product,
      ) as unknown as ProductWithCategoryAndVariants)
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

  // Load cart server-side and pass as initial prop to the client component.
  const cart = await getCart();
  const serializableCart = cart ? convertDecimalToNumber(cart) : null;

  // Determine whether this product is already in the user's wishlist so the
  // client component can render the initial state without an extra request.
  let initialInWishlist: boolean | undefined = undefined;
  try {
    const session = await ensureSession();
    const userId = session?.user?.id;
    if (userId) {
      const wishlist = await prisma.wishlist.findUnique({
        where: {userId},
        include: {items: {select: {productId: true}}},
      });
      initialInWishlist = Boolean(
        wishlist?.items?.some(
          (it: {productId: string}) => it.productId === safeProduct.id,
        ),
      );
    }
  } catch {
    // ignore and leave undefined so client may fallback to fetching if needed
    initialInWishlist = undefined;
  }

  return (
    <div className="mx-auto max-w-[95vw] p-5">
      <Breadcrumbs items={breadcrumbsItems} />
      <ProductDetail
        product={safeProduct}
        initialCart={serializableCart}
        initialInWishlist={initialInWishlist}
      />
    </div>
  );
};

export default ProductPage;

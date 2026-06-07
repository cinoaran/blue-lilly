import Breadcrumbs from "@/components/shared/beardcrumbs/Breadcrumbs";
import ProductDetailSkeleton from "../skeletons/ProductDetailSkeleton";

export default function Loading() {
  return (
    <main className="container mx-auto min-h-screen px-5 md:p-0">
      <Breadcrumbs items={[{label: "Products", href: "/"}]} />
      <ProductDetailSkeleton />
    </main>
  );
}

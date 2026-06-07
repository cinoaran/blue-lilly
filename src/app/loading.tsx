import Breadcrumbs from "@/components/shared/beardcrumbs/Breadcrumbs";
import ProductsSkeleton from "./skeletons/ProductsSkeleton";

export default function Loading() {
  return (
    <main className="container mx-auto min-w-3/4 min-h-screen px-5 md:p-0">
      <Breadcrumbs items={[{label: "Home", href: "/"}]} />
      <ProductsSkeleton />
    </main>
  );
}

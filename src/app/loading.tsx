import Breadcrumbs from "@/components/shared/beardcrumbs/Breadcrumbs";
import ProductsSkeleton from "@/app/skeletons/ProductsSkeleton";

export default function Loading() {
  return (
    <main className="container w-[95vw] md:max-w-[80vw] mx-auto px-5 py-5">
      <Breadcrumbs items={[{label: "Home", href: "/"}]} />
      <ProductsSkeleton limit={4} />
    </main>
  );
}

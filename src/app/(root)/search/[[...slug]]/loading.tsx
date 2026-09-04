import ProductsSkeleton from "@/app/(root)/skeletons/ProductsSkeleton";

export default function Loading() {
  return (
    <main className="container w-[95vw] md:max-w-[80vw] mx-auto mt-32 p-5">
      <ProductsSkeleton limit={8} />
    </main>
  );
}

import {getAllProducts} from "@/actions/shared";
import ProductCard from "@/components/Product/ProductCard";
import {PaginationProducts} from "@/components/shared/pagination";
import {convertDecimalToNumber} from "@/helpers/products";
import prisma from "@/lib/prisma";
import {ProductWithVariants} from "@/types/product/product";
import {Suspense} from "react";
import ProductsSkeleton from "./skeletons/ProductsSkeleton";
import Breadcrumbs from "@/components/shared/beardcrumbs/Breadcrumbs";

type SearchParams = Promise<{
  [key: string]: string | string[] | undefined;
}>;

export default async function Home(props: {searchParams: SearchParams}) {
  const searchParams = await props.searchParams;

  const limit = Number(searchParams.limit) || 8;

  async function Products({page}: {page: number}) {
    const skip = (page - 1) * limit;

    const result = await getAllProducts({skip, limit});

    await new Promise((resolve) => setTimeout(resolve, 3000)); // Simulate loading delay

    // convert Prisma Decimal objects to plain numbers/values before passing to client
    const safeProducts = result.products.map(
      (p) => convertDecimalToNumber(p) as unknown,
    );
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
        {(safeProducts as ProductWithVariants[]).map((product) => (
          <ProductCard
            key={(product as ProductWithVariants).id}
            product={product as unknown as ProductWithVariants}
          />
        ))}
      </div>
    );
  }
  const page = Number(searchParams.page) || 1;
  const total =
    Number(await prisma.product.count()) / (Number(searchParams.limit) || 1);
  const totalPages = Math.ceil(total / limit); // Math.ceil(total / limit);

  return (
    <div className="mx-10 p-5">
      <Breadcrumbs items={[{label: "Home", href: "/"}]} />

      <Suspense key={page} fallback={<ProductsSkeleton />}>
        <Products page={page} />
      </Suspense>
      {totalPages >= 1 && (
        <PaginationProducts
          totalPages={totalPages}
          currentPage={page}
          query={searchParams.query as string}
        />
      )}
    </div>
  );
}

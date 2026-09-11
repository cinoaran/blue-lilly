import {getAllProducts} from "@/actions/products";
import {getAllCategoryTree} from "@/actions/categories";
import HeaderCarousel from "@/components/Carousel/HorizontalSlider";
import ProductCard from "@/components/Product/ProductCard";
import {PaginationProducts} from "@/components/shared/pagination";
import {convertDecimalToNumber} from "@/helpers";
import prisma from "@/lib/prisma";
import {ProductWithVariants} from "@/types/product/product";
import {Suspense} from "react";
import NewsletterForm from "@/components/resend-newsletter/NewsletterForm";
import ProductsSkeleton from "./(root)/skeletons/ProductsSkeleton";
// import {sleep} from "@/lib/utils";
import Breadcrumbs from "@/components/shared/beardcrumbs/Breadcrumbs";
import SearchInput from "@/components/shared/searchBar";
import Image from "next/image";
import Link from "next/link";

type SearchParams = Promise<{
  [key: string]: string | string[] | undefined;
}>;

export default async function Home(props: {searchParams: SearchParams}) {
  const searchParams = await props.searchParams;

  const limit = Number(searchParams.limit) || 5;
  // fetch hierarchical category options suitable for the shared SearchInput
  const categoryOptions = await getAllCategoryTree();

  const rawQueryParam = searchParams.query;
  const defaultQuery = Array.isArray(rawQueryParam)
    ? (rawQueryParam[0] ?? "")
    : (rawQueryParam ?? "");
  const category = "";
  const categoryPathNormalized = "";

  async function Products({page}: {page: number}) {
    const skip = (page - 1) * limit;

    const result = await getAllProducts({skip, limit});

    //await sleep(4000); // Simulate loading delay so skeleton is visible

    // convert Prisma Decimal objects to plain numbers/values before passing to client
    const safeProducts = result.products.map(
      (p) => convertDecimalToNumber(p) as unknown,
    );
    return ((safeProducts as ProductWithVariants[]) || []).length === 0 ? (
      <div className="max-w-[85vw] mx-auto flex items-center justify-center py-4">
        <div className="text-center bg-secondary/50 border border-foreground/10 rounded-md p-6">
          <h3 className="text-lg font-medium">
            Aktuell befinden sich keine Produkte zur Auswahl
          </h3>
          <p className="text-sm text-foreground/60 mt-2">
            Bitte schaue später nochmal vorbei.
          </p>
        </div>
      </div>
    ) : (
      <div className="container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-12 mx-auto max-w-[85vw]">
        {(safeProducts as ProductWithVariants[]).map((product, idx) => (
          <ProductCard
            key={`prod-${(product as ProductWithVariants).id ?? (product as ProductWithVariants).slug ?? idx}`}
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
    <main className="container relative mx-auto max-w-[85vw]">
      <Breadcrumbs items={[{label: "Home", href: "/"}]} />
      <div className="my-10">
        <Suspense
          fallback={
            <div className="w-full h-137.5 bg-foreground/30 animate-pulse rounded-md" />
          }
        >
          <HeaderCarousel />
        </Suspense>
      </div>
      <hr className="border-foreground/10 mt-12 mb-2" />
      <div className="flex flex-col items-center justify-center gap-12 py-8">
        <h2 className="text-4xl font-semibold text-left w-full px-12">
          Philosopie & Partnerschaften
        </h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <Link href="/blog">
              <Image
                src="/shop/Medaillen/metzgerei.png"
                alt="Description"
                width={140}
                height={140}
                className="rounded-md hover:scale-105 transition-transform duration-300"
              />
            </Link>
            <h4 className="text-center max-w-42 italic">
              Fachverbandstagung 2025
            </h4>
          </div>
          <div className="flex flex-col items-center justify-center gap-4">
            <Link href="/blog">
              <Image
                src="/shop/Medaillen/umweltkon.png"
                alt="Description"
                width={140}
                height={140}
                className="rounded-md hover:scale-105 transition-transform duration-300"
              />
            </Link>
            <h4 className="text-center max-w-42 italic">
              Umweltkonzepte UmwKon 2026
            </h4>
          </div>
          <div className="flex flex-col items-center justify-center gap-4">
            <Link href="/blog">
              <Image
                src="/shop/Medaillen/tierwohl.png"
                alt="Description"
                width={140}
                height={140}
                className="rounded-md hover:scale-105 transition-transform duration-300"
              />
            </Link>
            <h4 className="text-center max-w-42 italic">
              Berliner Tierschutz 2024
            </h4>
          </div>
        </div>
      </div>
      <hr className="border-foreground/10 mt-12 mb-2" />
      <div className="flex flex-col items-center justify-center gap-4 mb-4 p-4 rounded-md">
        <Suspense
          fallback={
            <div className="flex items-start justify-start gap-4 mb-4">
              <span className="animate-pulse w-32 h-6 bg-gray-300 rounded-md"></span>
              <span className="animate-pulse w-32 h-6 bg-gray-300 rounded-md"></span>
            </div>
          }
        >
          <h2 className="text-4xl font-semibold text-left w-full px-12">
            Das passende Produkt finden
          </h2>
          <div className="flex flex-col sm:flex-row items-start justify-between gap-10 p-5 my-10 z-40">
            <div className="flex items-center justify-center gap-4 flex-1">
              <SearchInput
                defaultQuery={defaultQuery}
                defaultCategory={category}
                defaultCategoryPath={categoryPathNormalized}
                categoryOptions={categoryOptions}
              />
            </div>
          </div>
        </Suspense>

        <Suspense key={page} fallback={<ProductsSkeleton limit={limit} />}>
          <Products page={page} />
        </Suspense>
        {totalPages >= 1 && (
          <PaginationProducts
            totalPages={totalPages}
            currentPage={page}
            query={searchParams.query as string}
          />
        )}
        <hr className="border-foreground/10 mt-12 mb-2" />
        <div className="w-full flex items-center justify-center py-6">
          <NewsletterForm />
        </div>
      </div>
    </main>
  );
}

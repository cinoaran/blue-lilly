"use client";

import React, {useEffect, useMemo, useState} from "react";
import Image from "next/image";
import Link from "next/link";
import {useSearchParams} from "next/navigation";

import {ProductWithCategoryAndVariants} from "@/types/product/product";
import formatPrice from "@/helpers/products/formatPrice";

import {Variant} from "@/types/product/variants";
import {Option} from "@/types/product/options";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {Card, CardContent} from "../ui/card";
import {Badge} from "@/components/ui/badge";
import {Separator} from "@/components/ui/separator";
import {CirclePile} from "lucide-react";
import {Tooltip, TooltipContent, TooltipTrigger} from "../ui/tooltip";

const ProductDetail = ({
  product,
}: {
  product: ProductWithCategoryAndVariants;
}) => {
  const searchParams = useSearchParams();

  const paramsSize = searchParams.get("size");
  const paramsOptionId = searchParams.get("optionId");

  const [selectedSize, setSelectedSize] = useState<string | null>(
    paramsSize ?? null,
  );
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(
    paramsOptionId ?? null,
  );

  useEffect(() => {
    setSelectedSize(paramsSize ?? null);
    setSelectedOptionId(paramsOptionId ?? null);
  }, [paramsSize, paramsOptionId]);

  const updateUrlParams = (size: string | null, optionId: string | null) => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (size != null) url.searchParams.set("size", String(size));
    if (optionId != null) url.searchParams.set("optionId", String(optionId));
    window.history.replaceState({}, "", url.toString());
  };

  const activeVariant = useMemo(() => {
    const variants = product.variants ?? [];
    if (!variants.length) return null;

    return (
      variants.find((variant) => String(variant.size) === String(paramsSize)) ??
      variants[0]
    );
  }, [product.variants, paramsSize]);

  const displayVariant = useMemo(() => {
    const variants = product.variants ?? [];
    if (!variants.length) return null;
    if (selectedSize) {
      return (
        variants.find(
          (variant) => String(variant.size) === String(selectedSize),
        ) ?? variants[0]
      );
    }
    return activeVariant ?? variants[0];
  }, [product.variants, selectedSize, activeVariant]);

  const activeOption = useMemo(() => {
    if (!activeVariant?.options?.length) return null;

    return (
      activeVariant.options.find((opt) => opt.id === paramsOptionId) ??
      activeVariant.options[0]
    );
  }, [activeVariant, paramsOptionId]);

  const displayOption = useMemo(() => {
    const options = displayVariant?.options ?? [];
    if (!options.length) return null;
    if (selectedOptionId) {
      return options.find((o) => o.id === selectedOptionId) ?? options[0];
    }
    return options.find((o) => o.id === paramsOptionId) ?? options[0];
  }, [displayVariant, selectedOptionId, paramsOptionId]);

  // Stock helpers
  const optionInStock = (opt?: Option) => Number(opt?.quantity ?? 0) > 0;

  const [activeImages, setActiveImages] = useState<string[]>(() =>
    activeOption?.image && activeOption.image.length
      ? activeOption.image
      : ["/product/shirt.svg"],
  );

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [displayedImage, setDisplayedImage] = useState<string>(
    () => activeImages[0] ?? "/product/shirt.svg",
  );
  const [isFading, setIsFading] = useState(false);
  const [displayedOptions, setDisplayedOptions] = useState<Option[]>(
    () => displayVariant?.options ?? [],
  );
  const [isThumbsFading, setIsThumbsFading] = useState(false);

  useEffect(() => {
    setActiveImages(
      displayOption?.image && displayOption.image.length
        ? displayOption.image
        : ["/product/shirt.svg"],
    );
    setActiveImageIndex(0);
  }, [displayOption, paramsSize, paramsOptionId]);

  // Thumbnail updates are driven directly from the size button onClick handlers
  // to keep the interaction simple and deterministic.

  return (
    <main className="container mx-auto my-10">
      <Card className="mx-auto my-10 border-none outline-none box-shadow-[0_2px_15px_rgba(0,0,0,0.9)]">
        <CardContent>
          <div className="flex flex-col lg:flex-row items-start justify-center w-full">
            <div className="flex-1 flex flex-col gap-10  w-full lg:border-r-[0.2px] border-gray-50 p-10">
              <div
                className={`relative aspect-7/8 overflow-hidden rounded-md transition-opacity duration-200 ${
                  isFading ? "opacity-0" : "opacity-100"
                }`}
              >
                <Image
                  src={displayedImage}
                  alt={product.name}
                  fill
                  sizes="(min-width: 768px) 70vw, 50vw"
                  className="object-cover transition-transform duration-300 hover:scale-105"
                  priority
                />
              </div>

              {activeImages.length > 1 && (
                <div className="grid grid-cols-5 gap-3">
                  {activeImages.map((img, index) => {
                    const isActive = index === activeImageIndex;

                    return (
                      <button
                        key={`${img}-${index}`}
                        type="button"
                        onClick={() => {
                          const next =
                            activeImages[index] ?? "/product/shirt.svg";
                          setIsFading(true);
                          setTimeout(() => {
                            setActiveImageIndex(index);
                            setDisplayedImage(next);
                            setIsFading(false);
                          }, 180);
                        }}
                        className={`relative aspect-square overflow-hidden rounded-md border ${
                          isActive ? "ring-1 ring-primary" : ""
                        }`}
                      >
                        <Image
                          src={img}
                          alt={`${product.name} ${index + 1}`}
                          fill
                          sizes="(min-width: 768px) 50vw, 70vw"
                          className="object-cover border-[0.5px] border-accent rounded-md transition-transform duration-200 hover:scale-105"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="flex-1 flex flex-col gap-1 my-8 w-full lg:px-5">
              <div className="flex- flex-col items-center justify-center gap-2 border-b-[0.5px] border-gray-300 pb-10">
                <h1 className="font-bold flex items-center gap-2">
                  {product.brand} {product.name}
                </h1>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className=" text-xs bg-accent px-3 text-white font-bold"
                  >
                    {product.category.name}
                  </Badge>
                  <Badge
                    variant="outline"
                    className=" text-xs bg-accent px-3 text-white font-bold"
                  >
                    {product.slug}
                  </Badge>
                </div>
              </div>
              {/* Size pills selector (replaces carousel navigation) */}
              <div className="flex flex-col gap-4 border-b-[0.5px] border-gray-300 py-5">
                <div className="flex flex-wrap gap-2">
                  {(product.variants ?? []).map((v: Variant) => {
                    const isActive =
                      String(displayVariant?.id) === String(v.id);
                    return (
                      <button
                        key={v.id}
                        type="button"
                        className={`px-3 py-1 rounded-md border text-sm font-medium transition ${
                          isActive
                            ? "bg-primary text-white"
                            : "bg-accent/10 text-gray-300"
                        }`}
                        onClick={() => {
                          setSelectedSize(String(v.size));
                          const opt = v.options?.[0];
                          setSelectedOptionId(opt?.id ?? null);

                          // fade thumbnails and update displayedOptions on click
                          const nextOpts = v.options ?? [];
                          setIsThumbsFading(true);
                          setTimeout(() => {
                            setDisplayedOptions(nextOpts);
                            setIsThumbsFading(false);
                          }, 160);

                          const nextImgs =
                            opt?.image && opt.image.length
                              ? opt.image
                              : ["/product/shirt.svg"];
                          setIsFading(true);
                          setTimeout(() => {
                            setActiveImages(nextImgs);
                            setActiveImageIndex(0);
                            setDisplayedImage(nextImgs[0]);
                            setIsFading(false);
                          }, 180);
                          updateUrlParams(String(v.size), opt?.id ?? null);
                        }}
                      >
                        {v.size} {v.units ? ` ${v.units}` : ""}
                      </button>
                    );
                  })}
                </div>

                {/* Option thumbnails for selected size */}
                <div
                  className={`grid grid-cols-5 gap-5 transition-opacity duration-150 py-2 ${
                    isThumbsFading ? "opacity-0" : "opacity-100"
                  }`}
                >
                  {displayedOptions.map((opt: Option) => {
                    const src = opt.image?.[0] ?? "/product/shirt.svg";

                    const isActive =
                      String(displayOption?.id) === String(opt.id);
                    const optAvailable = optionInStock(opt);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        className={`relative aspect-7/8 rounded-md border bg-accent transition-all duration-200 ${
                          isActive ? "ring-1 ring-primary" : ""
                        } ${!optAvailable ? "opacity-60" : ""}`}
                        onClick={() => {
                          // Always allow selecting an option even if out of stock
                          setSelectedSize(String(displayVariant?.size ?? ""));
                          setSelectedOptionId(opt.id);
                          const nextImgs =
                            opt.image && opt.image.length
                              ? opt.image
                              : ["/product/shirt.svg"];
                          setIsFading(true);
                          setTimeout(() => {
                            setActiveImages(nextImgs);
                            setActiveImageIndex(0);
                            setDisplayedImage(nextImgs[0]);
                            setIsFading(false);
                          }, 180);
                          updateUrlParams(
                            String(displayVariant?.size ?? ""),
                            opt.id,
                          );
                        }}
                      >
                        <Image
                          src={src}
                          alt={`${product.name} ${displayVariant?.size} ${opt.id}`}
                          fill
                          sizes="(min-width: 768px) 50vw, 75vw"
                          className="object-cover border-[0.5px] border-accent rounded-md transition-transform duration-200 hover:scale-105"
                        />

                        <div className="max-w-14 absolute -bottom-3 -right-3 z-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p className="flex items-center justify-evenly bg-primary rounded-md gap-1 px-2 text-white">
                                <CirclePile size={14} />
                                <span className="flex items-center pl-2 py-2 border-l border-black text-white">
                                  {optAvailable && opt.quantity! > 0
                                    ? `${opt.quantity}`
                                    : 0}
                                </span>
                              </p>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                              <span>
                                {optAvailable && opt.quantity! > 0
                                  ? `${opt.quantity} items in stock`
                                  : "You can add this item to your wishlist"}
                              </span>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center justify-center my-5">
                {/* Disable the button if there's no price or if quantity is 0 or less */}
                {/** compute add-to-cart availability */}
                {(() => {
                  // Route to wishlist when quantity < 1, otherwise checkout
                  const qty = Number(displayOption?.quantity ?? 0);
                  const canAddToCart = qty > 0;
                  const href = canAddToCart
                    ? `/checkout?productId=${product.id}&variantId=${displayVariant?.id}&optionId=${displayOption?.id}`
                    : `/wishlist?productId=${product.id}&variantId=${displayVariant?.id}&optionId=${displayOption?.id}`;
                  return (
                    <Link
                      className={`w-full md:w-3/4 text-center bg-primary text-white px-4 py-1 rounded-md text-lg font-semibold uppercase hover:bg-primary/90 transition`}
                      href={href}
                    >
                      {canAddToCart ? (
                        <div className="flex items-center justify-center gap-5">
                          <h4>ADD TO CART</h4>
                          <span className="flex items-center justify-center text-lg pl-7 py-2 border-l border-black text-white">
                            FOR{" "}
                            {displayOption?.sellPrice &&
                              `${formatPrice(displayOption.sellPrice)}`}
                          </span>
                        </div>
                      ) : (
                        "ADD TO WISHLIST"
                      )}
                    </Link>
                  );
                })()}
              </div>
              <div className="flex flex-col gap-3 items-start justify-center my-2">
                <h3 className="text-2xl font-bold border-b-[0.5px] border-gray-300 w-full pb-2">
                  Product Details
                </h3>
                <p className="text-lg bg-transparent text-foreground w-full text-left">
                  {product.smallDesc}
                </p>
                <Accordion type="multiple" className="w-full">
                  <AccordionItem value="description">
                    <AccordionTrigger className="text-lg font-bold bg-transparent text-foreground w-full text-left ">
                      Detailed description
                    </AccordionTrigger>
                    <AccordionContent>
                      <Separator className="my-2 bg-foreground" />
                      <div
                        className="product-content"
                        dangerouslySetInnerHTML={{__html: product.longDesc}}
                      />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default ProductDetail;

"use client";
import formatPrice from "@/helpers/products/formatPrice";
import {ProductWithVariants} from "@/types/product/product";
import {Variant} from "@/types/product/variants";
import {Option} from "@/types/product/options";
import {Card, CardContent, CardFooter} from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

import React, {useMemo, useRef, useState, useEffect} from "react";
import {ChevronLeft, ChevronRight} from "lucide-react";
import {Button} from "../ui/button";
import WishlistButton from "../wishlist/WishlistButton";
// inject small CSS to hide webkit scrollbar for pill containers

type SelectedVariant = {
  variantId: string;
  optionId: string;
  size: string;
  units?: string;
  image?: string;
  sellPrice?: number | null;
};

const ProductCard = ({product}: {product: ProductWithVariants}) => {
  const variants = product.variants ?? [];
  const firstVariant = variants[0];
  const firstOption = firstVariant?.options?.[0];

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [active, setActive] = useState<SelectedVariant | null>(() => {
    if (!firstVariant) return null;
    const initOpt = firstVariant?.options?.[0];
    return {
      variantId: firstVariant.id ?? `${product.id}-v-0`,
      optionId: initOpt?.id ?? "",
      size: (firstVariant.size as string) ?? "",
      units: firstVariant.units ?? undefined,
      image: initOpt?.image?.[0] ?? undefined,
      sellPrice:
        initOpt && initOpt.sellPrice != null
          ? Number(initOpt.sellPrice)
          : undefined,
    };
  });

  const [displayedImage, setDisplayedImage] = useState<string>(
    (active?.image as string) ??
      (firstOption?.image?.[0] as string) ??
      "/product/shirt.svg",
  );
  const [isFading, setIsFading] = useState(false);
  const [displayedOptions, setDisplayedOptions] = useState<Option[]>(
    firstVariant?.options ?? [],
  );
  const [isThumbsFading, setIsThumbsFading] = useState(false);

  const chosenSize =
    (active?.size as string) ?? (firstVariant?.size as string) ?? "";
  const chosenUnits = active?.units ?? firstVariant?.units ?? undefined;

  // price fallback: active -> chosen option -> undefined
  const optionIdForPrice = active?.optionId ?? firstOption?.id;
  let activePrice: unknown = undefined;
  if (active?.sellPrice != null) {
    activePrice = active.sellPrice;
  } else {
    const found = variants.find((v: Variant) => v.size === chosenSize);
    activePrice =
      found?.options?.find((o: Option) => o.id === optionIdForPrice)
        ?.sellPrice ??
      firstOption?.sellPrice ??
      0;
  }
  const activePriceNum = Number(activePrice ?? 0);

  const label = chosenSize
    ? `${chosenSize}${chosenUnits ? ` ${chosenUnits}` : ""}`
    : "Select variant";

  const altText =
    (product.name && String(product.name).trim()) ||
    (product.slug && String(product.slug).trim()) ||
    "Produktbild";

  const href = useMemo(() => {
    const params = new URLSearchParams();
    if (chosenSize) params.set("size", String(chosenSize));
    const optId = active?.optionId ?? firstOption?.id;
    if (optId) params.set("optionId", String(optId));
    const qs = params.toString();
    return qs ? `/product/${product.slug}?${qs}` : `/product/${product.slug}`;
  }, [product.slug, chosenSize, active?.optionId, firstOption?.id]);

  const isLongDesc = (product.smallDesc ?? "").length > 180;

  const pillRef = useRef<HTMLDivElement | null>(null);

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [showChevrons, setShowChevrons] = useState(false);

  const scrollAmount = () => {
    const el = pillRef.current;
    if (!el) return 72; // fallback if ref missing

    const first = el.children[0] as HTMLElement | undefined;
    if (!first) {
      return Math.max(120, Math.floor(el.clientWidth * 0.6));
    }

    const firstRect = first.getBoundingClientRect();

    // calculate gap between first and second child (if exists) to include spacing
    let gap = 0; // sensible default (tailwind gap-2 => 8px)
    if (el.children.length > 1) {
      const secondRect = (
        el.children[1] as HTMLElement
      ).getBoundingClientRect();
      const measuredGap = Math.round(secondRect.left - firstRect.right);
      if (!Number.isNaN(measuredGap) && measuredGap >= 0) gap = measuredGap;
    }

    return Math.round(firstRect.width + gap);
  };

  const updateScrollButtons = () => {
    const el = pillRef.current;
    if (!el) {
      setCanScrollPrev(false);
      setCanScrollNext(false);
      setShowChevrons(false);
      return;
    }
    const {scrollLeft, scrollWidth, clientWidth} = el;
    const maxScrollLeft = scrollWidth - clientWidth;
    const epsilon = 2; // tolerance
    setShowChevrons(scrollWidth > clientWidth + epsilon);
    setCanScrollPrev(scrollLeft > epsilon);
    setCanScrollNext(scrollLeft < maxScrollLeft - epsilon);
  };

  const onPillScroll = () => {
    updateScrollButtons();
  };

  useEffect(() => {
    updateScrollButtons();
    const onResize = () => updateScrollButtons();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [variants.length]);

  const selectVariant = (v: Variant) => {
    const opt = v.options?.[0];
    const nextImgs =
      opt?.image && opt.image.length ? opt.image : ["/product/shirt.svg"];
    setIsThumbsFading(true);
    setIsFading(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setDisplayedOptions(v.options ?? []);
      setDisplayedImage(nextImgs[0]);
      setActive(
        opt
          ? {
              variantId: v.id,
              optionId: opt.id,
              size: v.size,
              units: v.units,
              image: opt.image?.[0],
              sellPrice:
                opt.sellPrice != null ? Number(opt.sellPrice) : undefined,
            }
          : {
              variantId: v.id,
              optionId: "",
              size: v.size,
              units: v.units,
            },
      );
      setIsThumbsFading(false);
      setIsFading(false);
    }, 180);
  };

  return (
    <Card className="flex flex-col items-center justify-center rounded-md hover:scale-101 hide-scrollbar transition-transform duration-300">
      <CardContent className="relative flex-1 border-[0.3px] border-border rounded-md">
        <div className="absolute -top-3 -right-3 overflow-none z-30">
          <WishlistButton
            productId={product.id}
            initialInWishlist={false}
            size={20}
          />
        </div>

        {/*Image & Preis*/}
        <Link href={href}>
          <div className="relative aspect-5/6 rounded-t-2xl overflow-hidden my-2">
            <Image
              src={displayedImage}
              alt={altText}
              fill
              sizes="(min-width: 768px) 70vw, 50vw"
              className={`object-contain hover:scale-105 transition-transform duration-300 ${
                isFading ? "opacity-0" : "opacity-100"
              }`}
            />

            <div className="absolute bottom-4 right-4 flex items-center gap-3 bg-primary px-3 py-1 text-white text-sm overflow-hidden rounded-md">
              <span className="rounded-l-md font-medium uppercase">
                {label}
              </span>
              <span className="rounded-r-md font-medium uppercase">
                {formatPrice(
                  Number.isFinite(activePriceNum) ? activePriceNum : 0,
                ) ?? "N/A"}
              </span>
            </div>
          </div>
          <hr className="border-t-[0.3px] border-border" />
          {/* Name & Brand: fixed area so cards align when names wrap */}
          <div className="px-3 mt-3 w-full flex-1">
            <div className="min-h-16 flex items-start">
              <h2 className="text-lg font-semibold">
                {product.brand} {product.name}
              </h2>
            </div>
            {/* smallDesc: clamp to 3 lines and reserve space so cards align */}
            <div className="overflow-hidden h-20">
              <span className="line-clamp-2 text-md font-normal leading-5">
                {product.smallDesc}
              </span>
              {isLongDesc && (
                <div className="flex items-center justify-end w-full">
                  <span className="flex items-center justify-end w-fit text-xs font-medium text-primary italic m-2 underlined">
                    Click for more Details <ChevronRight size={16} />
                  </span>
                </div>
              )}
            </div>
          </div>
        </Link>
        <hr className="border-t-[0.3px] border-border" />
        <CardFooter className="flex flex-col items-start justify-start gap-1 py-4">
          {/* Size pill selector: horizontal slider with side chevrons */}
          <div className="w-full mb-2">
            <div className="relative">
              {showChevrons && (
                <>
                  <Button
                    type="button"
                    aria-label="Previous sizes"
                    title="Previous sizes"
                    onClick={() => {
                      const el = pillRef.current;
                      if (!el) return;
                      el.scrollBy({left: -scrollAmount(), behavior: "smooth"});
                    }}
                    disabled={!canScrollPrev}
                    aria-disabled={!canScrollPrev}
                    className={`absolute -left-6 top-1/2 -translate-y-1/2 z-10 w-7 h-8 bg-primary flex items-center justify-center rounded-md hover: ${
                      !canScrollPrev
                        ? "opacity-40 pointer-events-none"
                        : "bg-primary/30"
                    }`}
                  >
                    <ChevronLeft size={16} />
                  </Button>

                  <Button
                    type="button"
                    aria-label="Next sizes"
                    title="Next sizes"
                    onClick={() => {
                      const el = pillRef.current;
                      if (!el) return;
                      el.scrollBy({left: scrollAmount(), behavior: "smooth"});
                    }}
                    disabled={!canScrollNext}
                    aria-disabled={!canScrollNext}
                    className={`absolute -right-6 top-1/2 -translate-y-1/2 w-7 h-8 bg-primary outline-none flex items-center justify-center rounded-md hover: ${
                      !canScrollNext
                        ? "opacity-10 pointer-events-none"
                        : "bg-primary"
                    }`}
                  >
                    <ChevronRight size={16} />
                  </Button>
                </>
              )}

              <div
                ref={pillRef}
                onScroll={onPillScroll}
                className="flex items-center justify-start gap-2 overflow-x-auto hide-scrollbar mx-6 snap-x snap-mandatory scroll-smooth"
                style={{WebkitOverflowScrolling: "touch"}}
              >
                {variants.map((v: Variant, vi: number) => {
                  const isActive =
                    v.size === chosenSize && v.units === chosenUnits;
                  const key = v.id ?? `${product.id}-variant-${vi}`;
                  return (
                    <Button
                      key={key}
                      type="button"
                      className={`snap-start flex items-center w-18 h-7 py-0 px-5 rounded-md font-medium transition ${
                        isActive
                          ? "bg-primary"
                          : "bg-primary/30 hover:bg-primary/20"
                      }`}
                      onClick={() => selectVariant(v)}
                    >
                      {String(v.size ?? "-")}
                      {v.units ? ` ${v.units}` : ""}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Option thumbnails for the chosen size */}
          <div
            className={`mt-2 grid grid-cols-4 gap-2 transition-opacity duration-150 ${isThumbsFading ? "opacity-0" : "opacity-100"}`}
          >
            {displayedOptions.map((opt: Option) => {
              const src = opt.image?.[0] ?? "/product/shirt.svg";
              const isOptActive =
                opt.id === (active?.optionId ?? firstOption?.id);
              return (
                <Button
                  key={opt.id}
                  type="button"
                  className={`relative aspect-5/6 size-15 rounded-md bg-transparent transition-all duration-200 ${isOptActive ? "ring-2 ring-primary" : ""}`}
                  onClick={() => {
                    setIsFading(true);
                    setTimeout(() => {
                      setActive({
                        variantId: variants.find(
                          (v: Variant) => v.size === chosenSize,
                        )!.id,
                        optionId: opt.id,
                        size: chosenSize ?? "",
                        units: chosenUnits,
                        image: src,
                        sellPrice:
                          opt.sellPrice != null
                            ? Number(opt.sellPrice)
                            : undefined,
                      });
                      setDisplayedImage(src);
                      setIsFading(false);
                    }, 180);
                  }}
                >
                  <Image
                    src={src}
                    alt={`${product.name ?? altText} ${chosenSize ?? ""} ${opt.id}`}
                    fill
                    sizes="(min-width: 768px) 25vw, 33vw"
                    className="object-cover p-1 transition-transform duration-200 hover:scale-105 rounded-md"
                  />
                </Button>
              );
            })}
          </div>
        </CardFooter>
      </CardContent>
    </Card>
  );
};

export default ProductCard;

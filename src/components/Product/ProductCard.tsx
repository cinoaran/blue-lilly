"use client";
import formatPrice from "@/helpers/products/formatPrice";
import {ProductWithVariants} from "@/types/product/product";
import {Variant} from "@/types/product/variants";
import {Option} from "@/types/product/options";
import {Card, CardContent} from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

import React, {useMemo, useRef, useState} from "react";
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
    if (!firstVariant || !firstOption) return null;
    return {
      variantId: firstVariant.id,
      optionId: firstOption.id,
      size: firstVariant.size,
      units: firstVariant.units,
      image: firstOption.image?.[0],
      sellPrice:
        firstOption.sellPrice != null
          ? Number(firstOption.sellPrice)
          : undefined,
    };
  });

  const [displayedImage, setDisplayedImage] = useState<string>(
    active?.image ?? firstOption?.image?.[0] ?? "/product/shirt.svg",
  );
  const [isFading, setIsFading] = useState(false);
  const [displayedOptions, setDisplayedOptions] = useState<Option[]>(
    firstVariant?.options ?? [],
  );
  const [isThumbsFading, setIsThumbsFading] = useState(false);

  const chosenSize = active?.size ?? firstVariant?.size;
  const chosenUnits = active?.units ?? firstVariant?.units;

  // price fallback: active -> chosen option -> undefined
  const optionIdForPrice = active?.optionId ?? firstOption?.id;
  const activePrice =
    active?.sellPrice ??
    variants
      .find((v: Variant) => v.size === chosenSize)
      ?.options?.find((o: Option) => o.id === optionIdForPrice)?.sellPrice ??
    undefined;

  const label = chosenSize
    ? `${chosenSize}${chosenUnits ? ` ${chosenUnits}` : ""}`
    : "Select variant";

  const href = useMemo(() => {
    const params = new URLSearchParams();
    if (chosenSize) params.set("size", String(chosenSize));
    const optId = active?.optionId ?? firstOption?.id;
    if (optId) params.set("optionId", String(optId));
    const qs = params.toString();
    return qs ? `/product/${product.slug}?${qs}` : `/product/${product.slug}`;
  }, [product.slug, chosenSize, active?.optionId, firstOption?.id]);

  return (
    <Card className="flex flex-col rounded-md bg-white shadow-md transition-shadow duration-300 hover:shadow-lg">
      <CardContent>
        <Link href={href} className="w-full">
          <div className="relative aspect-7/8 w-full overflow-hidden rounded-md">
            <Image
              src={displayedImage}
              alt={product.name}
              fill
              sizes="(min-width: 768px) 70vw, 50vw"
              className={`object-cover transition-opacity duration-180 ${
                isFading ? "opacity-0" : "opacity-100"
              }`}
            />

            <div className="absolute bottom-4 right-4 flex items-center gap-0 overflow-hidden rounded-md bg-black/50">
              <span className="rounded-l-md bg-accent px-3 py-2 text-sm font-medium uppercase text-foreground">
                {label}
              </span>
              <span className="rounded-r-md bg-black/30 px-3 py-2 text-md font-bold text-white">
                {formatPrice(Number(activePrice)) ?? "N/A"}
              </span>
            </div>
          </div>

          <div className="mt-2 flex flex-col gap-2 p-4">
            <h2 className="text-lg font-semibold text-black">{product.name}</h2>
            <div className="relative h-14 overflow-hidden">
              <p className="line-clamp-3 text-sm text-gray-600">
                {product.smallDesc}
              </p>
            </div>
          </div>
        </Link>

        {/* Size pill selector */}
        <div className="p-3 pt-0">
          <div className="flex flex-wrap gap-2">
            {variants.map((v: Variant) => {
              const isActive = v.size === chosenSize && v.units === chosenUnits;
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
                    const opt = v.options?.[0];
                    const nextImgs =
                      opt?.image && opt.image.length
                        ? opt.image
                        : ["/product/shirt.svg"];
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
                                opt.sellPrice != null
                                  ? Number(opt.sellPrice)
                                  : undefined,
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
                  }}
                >
                  {v.size} {v.units ? ` ${v.units}` : ""}
                </button>
              );
            })}
          </div>

          {/* Option thumbnails for the chosen size */}
          <div
            className={`mt-3 grid grid-cols-6 gap-2 transition-opacity duration-150 ${isThumbsFading ? "opacity-0" : "opacity-100"}`}
          >
            {displayedOptions.map((opt: Option) => {
              const src = opt.image?.[0] ?? "/product/shirt.svg";
              const isOptActive =
                opt.id === (active?.optionId ?? firstOption?.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  className={`relative aspect-7/8 rounded-md border bg-transparent transition-all duration-200 ${isOptActive ? "ring-2 ring-primary" : ""}`}
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
                    alt={`${product.name} ${chosenSize} ${opt.id}`}
                    fill
                    sizes="(min-width: 768px) 25vw, 33vw"
                    className="object-cover p-1 transition-transform duration-200 hover:scale-105"
                  />
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;

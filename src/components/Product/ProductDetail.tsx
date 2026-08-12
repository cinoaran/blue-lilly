"use client";

import React, {useEffect, useMemo, useState} from "react";
import Image from "next/image";
import Link from "next/link";
import {AddToCartForm} from "@/components/cart/AddToCartForm";
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

type CartItem = {
  optionId: string;
  quantity: number;
};

type Cart = {
  items?: CartItem[];
  // optional: weitere Felder falls vorhanden
  [key: string]: unknown;
};

const ProductDetail = ({
  product,
  initialCart,
}: {
  product: ProductWithCategoryAndVariants;
  initialCart?: Cart | null;
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

  // If no initialCart was provided from the server, fetch it client-side.
  const [clientCart, setClientCart] = useState<Cart | null | undefined>(
    undefined,
  );

  useEffect(() => {
    // If server provided a non-null cart, don't fetch. Otherwise fetch.
    if (initialCart != null) return; // server provided cart
    let canceled = false;
    (async () => {
      try {
        const res = await fetch("/api/cart");
        if (!res.ok) return setClientCart(null);
        const json = await res.json();
        if (canceled) return;
        setClientCart(json?.cart ?? null);
      } catch (e) {
        if (canceled) return;
        console.error("Failed to fetch cart:", e);
        setClientCart(null);
      }
    })();
    return () => {
      canceled = true;
    };
  }, [initialCart]);

  // Build a map of optionId -> quantity already in cart (server or client)
  const cartQtyMap = useMemo(() => {
    const m = new Map<string, number>();
    const activeCart = (initialCart ?? clientCart ?? null) as Cart | null;
    if (!activeCart || !activeCart.items) return m;
    for (const it of activeCart.items) {
      const optId = it.optionId ?? it.optionId;
      if (!optId) continue;
      const prev = m.get(optId) ?? 0;
      m.set(optId, prev + (Number(it.quantity) || 0));
    }
    return m;
  }, [initialCart, clientCart]);

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
  const [isZoomed, setIsZoomed] = useState(false);
  const [imgTransformOrigin, setImgTransformOrigin] =
    useState<string>("50% 50%");
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
    <Card className="container mx-auto my-10 border-none outline-none">
      <CardContent>
        <div className="flex flex-col lg:flex-row items-start justify-center">
          <div className="flex-1 flex flex-col gap-5 lg:border-r-[0.2px] border-border p-0 md:p-10 w-full h-[90vh]">
            <div
              className={`relative aspect-5/6 max-h-130 overflow-hidden rounded-md transition-opacity duration-200 ${
                isFading ? "opacity-0" : "opacity-100"
              }`}
              onMouseMove={(e) => {
                const rect = (
                  e.currentTarget as HTMLDivElement
                ).getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                setImgTransformOrigin(`${x}% ${y}%`);
                setIsZoomed(true);
              }}
              onMouseLeave={() => setIsZoomed(false)}
              onTouchStart={() => setIsZoomed(false)}
            >
              <Image
                src={displayedImage}
                alt={product.name}
                fill
                sizes="(min-width: 768px) 100vw, 70vw"
                tabIndex={0}
                className="object-contain transition-transform duration-200 focus:outline-none"
                style={
                  {
                    transformOrigin: imgTransformOrigin,
                    transform: isZoomed ? "scale(2.5)" : undefined,
                  } as React.CSSProperties
                }
                priority
                onFocus={() => setIsFading(false)}
                onBlur={() => setIsFading(false)}
              />
            </div>

            {activeImages.length > 1 && (
              <div className="grid grid-cols-3 md:grid-cols-5 gap-5 mt-3">
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
                      className={`relative aspect-square overflow-hidden rounded-md ${
                        isActive ? "ring-3 ring-primary/70" : ""
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} ${index + 1}`}
                        fill
                        sizes="(min-width: 768px) 50vw, 70vw"
                        className="object-cover border-[0.5px] border-border rounded-md transition-transform duration-200 hover:scale-105"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <div className="flex-1 flex flex-col gap-1 m-0 md:m-8 w-full lg:px-5">
            <div className="flex flex-col items-center justify-center gap-5 border-b-[0.5px] border-border py-10">
              <h2 className="font-bold flex items-center gap-2">
                {product.brand} {product.name}
              </h2>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className=" text-xs bg-accent px-3 text-foreground font-bold"
                >
                  {product.category.name}
                </Badge>
                <Badge
                  variant="outline"
                  className=" text-xs bg-accent px-3 text-foreground font-bold"
                >
                  {product.slug}
                </Badge>
              </div>
            </div>
            {/* Size pills selector (replaces carousel navigation) */}
            <div className="flex flex-col gap-4 border-b-[0.5px] border-border py-3">
              <h4 className="text-foreground text-sm font-bold">
                Wähle deine Größe aus:
              </h4>
              <hr className="border-foreground/10" />
              <div className="flex flex-wrap gap-2">
                {(product.variants ?? []).map((v: Variant) => {
                  const isActive = String(displayVariant?.id) === String(v.id);
                  return (
                    <button
                      key={v.id}
                      type="button"
                      className={`px-2 py-1 rounded-md border text-sm font-medium transition ${
                        isActive
                          ? "bg-primary text-white"
                          : "bg-accent/10 text-white hover:bg-accent/20"
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
                  const isActive = String(displayOption?.id) === String(opt.id);
                  const inCartQty = cartQtyMap.get(opt.id) ?? 0;
                  const remaining = Math.max(
                    0,
                    Number(opt.quantity ?? 0) - inCartQty,
                  );
                  const optAvailable = remaining > 0;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      className={`relative aspect-7/8 rounded-md border-border bg-primary transition-all duration-200 ${
                        isActive ? "ring-3 ring-primary/70" : ""
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
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Image
                            src={src}
                            alt={`${product.name} ${displayVariant?.size} ${opt.id}`}
                            fill
                            sizes="(min-width: 768px) 50vw, 75vw"
                            className="object-cover border-[0.5px] border-border rounded-md transition-transform duration-200 hover:scale-105"
                          />
                        </TooltipTrigger>

                        <div className="max-w-14 absolute -bottom-3 -right-3 z-2">
                          <p className="flex items-center justify-evenly bg-primary rounded-md gap-1 px-2 py-1 text-white text-xs font-medium">
                            <CirclePile size={12} />
                            <span className="flex items-center pl-2 py-0 border-l border-border text-white text-sm font-medium">
                              {optAvailable && remaining > 0
                                ? `${remaining}`
                                : 0}
                            </span>
                          </p>
                        </div>
                        <TooltipContent side="bottom">
                          <span className="text-xs bg-background/30 text-foreground">
                            {optAvailable && opt.quantity! > 0
                              ? `${opt.quantity} items in stock`
                              : "You can add this item to your wishlist"}
                          </span>
                        </TooltipContent>
                      </Tooltip>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center justify-center my-5">
              {/* Disable the button if there's no price or if quantity is 0 or less */}
              {/** compute add-to-cart availability */}
              {(() => {
                const inCartQtyForDisplay = displayOption
                  ? (cartQtyMap.get(displayOption.id) ?? 0)
                  : 0;
                const qty = Number(displayOption?.quantity ?? 0);
                const remainingForDisplay = Math.max(
                  0,
                  qty - inCartQtyForDisplay,
                );
                const canAddToCart = remainingForDisplay > 0;

                if (canAddToCart && displayOption?.id) {
                  return (
                    <div className="w-full md:w-3/4">
                      <AddToCartForm
                        optionId={displayOption.id}
                        quantity={1}
                        price={displayOption?.sellPrice}
                        available={remainingForDisplay}
                      />
                    </div>
                  );
                }

                const href = `/wishlist?productId=${product.id}&variantId=${displayVariant?.id}&optionId=${displayOption?.id}`;
                return (
                  <Link
                    className={`w-full md:w-3/4 text-center bg-red-400 px-3 py-0 rounded-md text-lg font-semibold uppercase hover:bg-primary/90 transition`}
                    href={href}
                  >
                    <div className="flex items-center justify-center gap-5 text-white">
                      <h4>ADD TO WISHLIST</h4>
                      <span className="flex items-center justify-center pl-7 py-2 border-l border-border ">
                        FOR{" "}
                        {displayOption?.sellPrice &&
                          `${formatPrice(displayOption.sellPrice)}`}
                      </span>
                    </div>
                  </Link>
                );
              })()}
            </div>
            <div className="flex flex-col gap-3 items-start justify-center my-2">
              <h3 className="text-2xl font-bold border-b-[0.5px] border-border w-full pb-2">
                Produktbeschreibung
              </h3>
              <p className="text-sm text-foreground w-full text-left">
                {product.smallDesc}
              </p>
              <Accordion type="multiple" className="w-full">
                <AccordionItem value="description">
                  <AccordionTrigger className="border-none text-[19px] font-bold text-foreground text-left w-full pb-2">
                    Detaillierte Beschreibung
                  </AccordionTrigger>
                  <AccordionContent className="w-full text-left">
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
  );
};

export default ProductDetail;

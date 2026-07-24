"use client";

import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
// import Autoplay from "embla-carousel-autoplay";
import {useCallback, useEffect, useState} from "react";
import {Button} from "@/components/ui/button";

export type Slide = {
  id: string;
  kicker?: string | null;
  title: string;
  teaser?: string | null;
  cta?: string | null;
  href?: string | null;
  image: string;
  alt?: string | null;
  theme?: string | null;
  goal?: string | null;
  audience?: string | null;
  angle?: string | null;
  trackEvent?: string | null;
};

export default function HorizontalSliderClient({slides}: {slides: Slide[]}) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {loop: false, align: "start"},
    [],
  );
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <section className="relative overflow-hidden rounded-t-[5em] bg-background/10 shadow-sm shadow-bd-primary/20">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide) => (
            <div key={slide.id} className="min-w-0 flex-[0_0_100%]">
              <div className="grid min-h-200 grid-rows-[1fr_auto] px-5 py-6 sm:px-8 md:grid-cols-2 md:grid-rows-1 md:px-10 md:py-10 lg:px-14">
                <div className="order-2 flex items-center justify-center md:order-2 md:justify-center">
                  <div className="relative w-full max-w-107.5 h-120 md:h-170">
                    <Image
                      src={slide.image}
                      alt={slide.alt ?? slide.title}
                      fill
                      sizes="(min-width: 768px) 50vw, 70vw"
                      priority={slide.id === "women-black"}
                      className="object-scale-down md:object-cover"
                    />
                  </div>
                </div>
                <div className="order-2 flex items-end md:order-2 md:items-center">
                  <div className="max-w-xl">
                    <p className="mb-4 text-[11px] uppercase tracking-[0.35em] text-foreground">
                      {slide.kicker}
                    </p>

                    <h2 className="max-w-md text-4xl text-foreground font-medium leading-[1.05] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                      {slide.title}
                    </h2>

                    <p className="mt-4 max-w-md text-sm leading-6 text-foreground sm:text-base">
                      {slide.teaser}
                    </p>

                    <div className="mt-7">
                      <Button asChild size="lg" className="rounded-full px-7">
                        <Link href={slide.href ?? "#"}>
                          {slide.cta ?? "Mehr"}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute right-6 md:inset-x-0 bottom-7 z-20 flex justify-center">
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-accent/30 px-1 py-1 backdrop-blur-md">
          {slides.map((_, index) => (
            <Button
              variant="default"
              key={index}
              onClick={() => emblaApi?.scrollTo(index)}
              aria-label={`Slide ${index + 1}`}
              className={`size-1 rounded-full transition-all w-5 h-3 ${
                selectedIndex === index
                  ? "bg-primary/60"
                  : "focus:bg-primary/30 active:bg-primary/10"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

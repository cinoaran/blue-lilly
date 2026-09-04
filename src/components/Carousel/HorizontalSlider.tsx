import getPublicCarousel from "@/actions/carousel/getPublicCarousel";
import HorizontalSliderClient from "./HorizontalSliderClient";
import Image from "next/image";

export default async function HeaderCarousel() {
  const slides = await getPublicCarousel();

  // Map Prisma model fields to the client Slide type shape (nullable handling)
  const mapped = (slides || []).map((s) => ({
    id: s.id,
    kicker: s.kicker ?? null,
    title: s.title,
    teaser: s.teaser ?? null,
    cta: s.cta ?? null,
    href: s.href ?? null,
    image: s.image,
    alt: s.alt ?? null,
    theme: s.theme ?? null,
    goal: s.goal ?? null,
    audience: s.audience ?? null,
    angle: s.angle ?? null,
    trackEvent: s.trackEvent ?? null,
  }));

  if (!mapped || mapped.length === 0) {
    return (
      <div className="container mx-auto my-5 flex flex-col items-center justify-center relative">
        <h1 className="absolute top-0 text-[2.5rem] md:text-[4rem] xl:text-[6rem] font-medium text-center text-nowrap">
          Blue Lilly`s Catworld
        </h1>
        <div className="relative text-center justify-center z-20 size-120 md:size-180">
          <Image
            src="/shop/blue-lilly-image/lilly-im-liegen.png"
            alt="Keine Slidebilder verfügbar"
            className="mx-auto object-contain"
            sizes="(max-width: 800px) 100vw, 800px"
            fill
          />
        </div>
        <div className="flex flex-col items-center justify-center w-full -mt-20 z-20">
          <ul className="flex items-start justify-center gap-5 md:gap-10 text-foreground hover:underlined">
            <li className="text-center text-lg md:text-2xl uppercase border-[0.3px] border-foreground/10 underlined hover:border-primary cursor-pointer transition px-3 py-2 w-32 md:w-42">
              Kids
            </li>
            <li className="text-center text-lg md:text-2xl uppercase border-[0.3px] border-foreground/10 underlined hover:border-primary cursor-pointer transition px-3 py-2 w-32 md:w-42">
              Teens
            </li>
            <li className="text-center text-lg md:text-2xl uppercase border-[0.3px] border-foreground/10 underlined hover:border-primary cursor-pointer transition px-3 py-2 w-32 md:w-42">
              Adults
            </li>
          </ul>
        </div>
      </div>
    );
  }

  return <HorizontalSliderClient slides={mapped} />;
}

import getPublicCarousel from "@/actions/carousel/getPublicCarousel";
import HorizontalSliderClient from "./HorizontalSliderClient";

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
      <div className="w-full h-56 my-52 flex items-center justify-center">
        <div className="text-center bg-secondary/50 border border-foreground/10 rounded-md p-6">
          <h3 className="text-lg font-medium">
            Keine Slidebilder aktuell verfügbar
          </h3>
          <p className="text-sm text-foreground/60 mt-2">
            Lege im Admin-Bereich neue Slides an, um sie hier anzuzeigen.
          </p>
        </div>
      </div>
    );
  }

  return <HorizontalSliderClient slides={mapped} />;
}

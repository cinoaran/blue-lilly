import {getAllCarousel} from "./actions/getAllCarousel";
import Link from "next/link";
import Image from "next/image";

export default async function CarouselAdminPage() {
  const items = await getAllCarousel();

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Carousel (Marketing)</h1>
        <Link href="/dashboard/admin/carousel/add">
          <button className="btn-primary">Add Slide</button>
        </Link>
      </div>

      {!items || items.length === 0 ? (
        <div className="p-6 bg-secondary/50 border border-foreground/10 rounded-md text-center">
          <div className="text-lg font-medium">Keine Slides vorhanden</div>
          <div className="text-sm text-foreground/60 mt-2">
            Lege neue Carousel-Slides an, um sie auf der Startseite anzuzeigen.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-4 border rounded-md flex gap-4 items-center"
            >
              <div className="w-40 h-24 relative bg-muted">
                <Image
                  src={item.image}
                  alt={item.alt ?? item.title}
                  fill
                  className="object-cover rounded"
                />
              </div>
              <div className="flex-1">
                <div className="font-medium">{item.title}</div>
                <div className="text-sm text-foreground/70">{item.teaser}</div>
                <div className="mt-2 text-xs text-foreground/60">
                  Theme: {item.theme ?? "-"} — Goal: {item.goal ?? "-"}
                </div>
                <div className="mt-3 flex gap-2">
                  <Link
                    href={`/dashboard/admin/carousel/${item.id}`}
                    className="underline text-primary"
                  >
                    Edit
                  </Link>
                  {/* Delete action to be implemented */}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

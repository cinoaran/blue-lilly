import {Card, CardContent} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";

export function ProductsCardSkeleton() {
  return (
    <Card className="flex flex-col items-start rounded-md shadow-md gap-4">
      <CardContent className="w-full flex-1">
        {/* Image area: same aspect ratio as ProductCard */}
        <div className="relative aspect-7/8 w-full overflow-hidden rounded-md bg-accent/50">
          <Skeleton className="w-full h-full animate-pulse" />

          {/* price/label area */}
          <div className="absolute bottom-4 right-4 flex items-center gap-0 overflow-hidden rounded-md bg-primary/40 p-1">
            <Skeleton className="w-16 h-7 animate-pulse" />
            <Skeleton className="w-16 h-7 animate-pulse" />
          </div>
        </div>

        {/* Name & short desc */}
        <div className="mt-2 w-full flex-1">
          <div className="min-h-16 flex items-start">
            <Skeleton className="h-10 w-full animate-pulse" />
          </div>
          <div className="m-1 overflow-hidden h-16">
            <Skeleton className="h-8 w-full mt-2 animate-pulse" />
            <Skeleton className="h-8 w-full mt-2 animate-pulse" />
          </div>
        </div>

        {/* Footer: size pills and thumbnails placeholder */}
        <div className="flex flex-col gap-3 my-4">
          <div className="flex items-start flex-wrap gap-2">
            <Skeleton className="h-8 w-18 rounded-md animate-pulse" />
            <Skeleton className="h-8 w-18 rounded-md animate-pulse" />
            <Skeleton className="h-8 w-18 rounded-md animate-pulse" />
          </div>

          <div className="mt-2 grid grid-cols-5 min-w-full gap-2">
            {Array.from({length: 5}).map((_, i) => (
              <Skeleton
                key={i}
                className="w-full aspect-7/8 rounded-md animate-pulse"
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

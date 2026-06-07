import {Card, CardContent} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";

export function ProductsCardSkeleton() {
  return (
    <Card className="flex flex-col rounded-md bg-accent/30 animate-pulse">
      <CardContent>
        <div className="aspect-7/8 w-full overflow-hidden rounded-md">
          <div className="relative h-[40vh] w-full  bg-accent/50">
            <Skeleton className="bg-red-500" />
            <div className="absolute bottom-4 right-4 flex items-center h-12 w-42 bg-black/30">
              <Skeleton className="bg-accent/50 w-20 h-10 px-4 py-2" />
              <Skeleton className="bg-accent/50 w-20 h-10 px-4 py-2" />
            </div>{" "}
          </div>
        </div>

        <div className="mt-2 flex flex-col gap-2 p-4">
          <Skeleton className="bg-accent/50 h-10 w-32" />
          <Skeleton className="bg-accent/50 h-5" />
          <Skeleton className="bg-accent/50 h-5" />
        </div>

        <div className="flex items-end justify-between relative h-10">
          <Skeleton className="bg-accent/50 w-14 h-5 mx-4 my-3" />
          <div className="absolute right-12 flex items-center justify-between gap-2">
            <Skeleton className="top-3.5 bg-accent/50 rounded-full size-6" />
            <Skeleton className="top-3.5 bg-accent/50 rounded-full size-6" />
          </div>
        </div>
        <div className="flex items-start gap-2 px-4 py-2">
          <Skeleton className="bg-accent/50 h-14 w-12" />
          <Skeleton className="bg-accent/50 h-14 w-12" />
        </div>
      </CardContent>
    </Card>
  );
}

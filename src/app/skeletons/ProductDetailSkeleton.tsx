"use client";
import {Card, CardContent} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";
import React from "react";

const ProductDetailSkeleton: React.FC = () => {
  return (
    <main className="container mx-auto my-10">
      <Card className="mx-auto my-10 border-none outline-none box-shadow-[0_2px_15px_rgba(0,0,0,0.9)] bg-accent/30 animate-pulse">
        <CardContent>
          <div className="flex flex-col lg:flex-row items-start justify-center w-full">
            <div className="flex-1 flex flex-col gap-6 w-full lg:border-r-[0.2px] border-foreground/30 p-10">
              <div className="aspect-7/8 w-full overflow-hidden rounded-md">
                <div className="relative h-full w-full bg-accent/50">
                  <Skeleton className="h-full w-full" />
                </div>
              </div>

              <div className="grid grid-cols-5 gap-3">
                {Array.from({length: 5}).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square w-full overflow-hidden rounded-md"
                  >
                    <Skeleton className="h-full w-full" />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-4 my-12 w-full lg:px-5">
              <div className="flex flex-col items-start gap-2 border-b-[0.5px] border-foreground/30 pb-11">
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-12 w-3/4" />
                <div className="flex items-center gap-2 mt-2">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-38" />
                </div>
              </div>

              <div className="flex flex-col gap-4 border-b-[0.5px] border-foreground/30 py-2">
                <div className="flex flex-wrap gap-2">
                  {Array.from({length: 4}).map((_, i) => (
                    <Skeleton
                      key={i}
                      className="px-12 py-3 rounded-md border-b-[0.5px] border-foreground/30 text-sm font-medium"
                    />
                  ))}
                </div>

                <div className="grid grid-cols-5 gap-5 py-2">
                  {Array.from({length: 5}).map((_, i) => (
                    <div
                      key={i}
                      className="relative aspect-7/8 rounded-md border border-foreground/30"
                    >
                      <Skeleton className="h-full w-full" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-center my-5">
                <Skeleton className="w-full md:w-3/4 h-16 rounded-md" />
              </div>

              <div className="flex flex-col gap-3 items-start justify-center my-2">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-24 w-full mt-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default ProductDetailSkeleton;

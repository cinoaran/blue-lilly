import React from "react";

export default function CarouselFormSkeleton() {
  return (
    <div className="max-w-2xl mx-auto p-6 bg-secondary/30 rounded-md animate-pulse">
      <div className="h-6 bg-muted rounded w-1/3 mb-4" />
      <div className="space-y-3">
        <div className="h-10 bg-muted rounded" />
        <div className="h-24 bg-muted rounded" />
        <div className="h-10 bg-muted rounded" />
        <div className="h-10 bg-muted rounded" />
      </div>
      <div className="mt-4 flex gap-2">
        <div className="h-10 w-24 bg-muted rounded" />
        <div className="h-10 w-24 bg-muted rounded" />
      </div>
    </div>
  );
}

"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
} from "@/components/ui/sheet";
import Link from "next/link";
import {buttonVariants} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import type {ReactNode} from "react";

type WishlistSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
};

type ExtendedWishlistSheetProps = WishlistSheetProps & {
  showFooterLink?: boolean;
};

export function WishlistSheet({
  open,
  onOpenChange,
  children,
  showFooterLink = true,
}: ExtendedWishlistSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange} data-slot="wishlist-sheet">
      <SheetContent
        side="right"
        className="flex flex-col items-center max-h-screen overflow-hidden"
      >
        <SheetHeader className="border-b border-border w-full py-4">
          <SheetTitle asChild>
            <h3 className="text-center text-md font-normal">Wunschliste</h3>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 px-0 py-2 w-full overflow-y-auto">
          {children}
        </div>

        {showFooterLink && (
          <SheetFooter className="border-t px-6 py-4">
            <Link
              href="/wishlist"
              className={cn(buttonVariants({variant: "default"}), "w-full")}
            >
              Zur Wunschliste
            </Link>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}

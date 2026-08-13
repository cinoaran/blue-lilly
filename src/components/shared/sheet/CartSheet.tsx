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

type CartSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
};

export function CartSheet({open, onOpenChange, children}: CartSheetProps) {
  return (
    <Sheet
      open={open} /*open={true}*/
      onOpenChange={onOpenChange}
      data-slot="cart-sheet"
    >
      <SheetContent
        side="right"
        className="flex flex-col items-center max-h-screen overflow-hidden"
      >
        <SheetHeader className="border-b border-border w-full py-4">
          <SheetTitle asChild>
            <h3 className="text-center text-md font-normal">Warenkorb</h3>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 px-0 py-2 w-full overflow-y-auto">
          {children}
        </div>

        <SheetFooter className="border-t px-6 py-4">
          <Link
            href="/cart"
            className={cn(buttonVariants({variant: "default"}), "w-full")}
          >
            Zur Warenkorbübersicht
          </Link>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

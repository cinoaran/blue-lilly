"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
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
    <Sheet open={open} onOpenChange={onOpenChange} data-slot="cart-sheet">
      <SheetContent
        side="right"
        className="flex w-105 flex-col p-0 sm:w-120 max-h-screen overflow-hidden"
      >
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle>Warenkorb</SheetTitle>
        </SheetHeader>

        <div className="flex-1 px-6 py-4 overflow-y-auto">{children}</div>

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

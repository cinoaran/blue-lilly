"use client";

import React, {useEffect, useState} from "react";
import {HeartIcon} from "lucide-react";
import {Button} from "../ui/button";
import {Tooltip, TooltipTrigger, TooltipContent} from "../ui/tooltip";
import {useWishlist} from "@/hooks/use-wishlist";

type Props = {
  productId: string;
  size?: number;
  className?: string;
  // optional controlled props: if provided, the button will act controlled
  isInWishlist?: boolean;
  isLoading?: boolean;
  onToggle?: () => void | Promise<void>;
};

export default function WishlistButton({
  productId,
  size = 24,
  className = "",
  isInWishlist: isInWishlistProp,
  isLoading: isLoadingProp,
  onToggle,
}: Props) {
  // If an external toggle handler is provided, treat the button as controlled
  const controlled = typeof onToggle === "function";

  const {
    isInWishlist: hookIn,
    isLoading: hookLoading,
    toggleWishlist,
  } = useWishlist(productId);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const isInWishlist = controlled ? Boolean(isInWishlistProp) : Boolean(hookIn);
  const isLoading = controlled ? Boolean(isLoadingProp) : Boolean(hookLoading);
  const handleToggle = onToggle ?? toggleWishlist;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={`inline-flex items-center justify-center bg-primary/20 hover:bg-foreground/20 p-1 rounded-full ${className}`}
          aria-disabled={mounted ? isLoading : undefined}
        >
          <Button
            variant="ghost"
            onClick={() => void handleToggle()}
            aria-pressed={isInWishlist}
            aria-label={
              isInWishlist
                ? "Aus Wunschliste entfernen"
                : "Zur Wunschliste hinzufügen"
            }
            className="inline-flex items-center justify-center"
            disabled={mounted ? isLoading : undefined}
          >
            {isInWishlist ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width={size}
                height={size}
                className="text-destructive"
                aria-hidden
              >
                <path
                  fill="currentColor"
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6.5 3.5 5 5.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5 18.5 5 20 6.5 20 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                />
              </svg>
            ) : (
              <HeartIcon size={size} className={"text-muted-foreground"} />
            )}
            <span className="sr-only">
              {isInWishlist ? "In der Wunschliste" : "Nicht in der Wunschliste"}
            </span>
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent side="bottom" align="center" sideOffset={4} zIndex={0}>
        {isInWishlist
          ? "Aus Wunschliste entfernen"
          : "Zur Wunschliste hinzufügen"}
      </TooltipContent>
    </Tooltip>
  );
}

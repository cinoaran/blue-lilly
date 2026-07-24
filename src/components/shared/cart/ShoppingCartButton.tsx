import React, {useEffect, useRef, useState} from "react";
import {Badge} from "@/components/ui/badge";
import {ShoppingBag} from "lucide-react";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";

type ShoppingCartButtonProps = {
  onClick: () => void;
  count?: number;
};

const ShoppingCartButton = ({onClick, count = 0}: ShoppingCartButtonProps) => {
  const [bouncing, setBouncing] = useState(false);
  const prevCountRef = useRef<number>(count);

  useEffect(() => {
    // trigger bounce only when count increases
    if (count > prevCountRef.current) {
      setBouncing(true);
      const t = setTimeout(() => setBouncing(false), 650);
      prevCountRef.current = count;
      return () => clearTimeout(t);
    }
    prevCountRef.current = count;
  }, [count]);

  return (
    <div
      className="flex flex-col items-center rounded-full ring-1 ring-white justify-center cursor-pointer"
      aria-label="Warenkorb öffnen"
      onClick={onClick}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative flex items-center justify-center">
            <Badge
              className={
                `absolute -top-1 -right-1 w-5 h-5 text-[10px] flex items-center justify-center rounded-full transition-all duration-200 z-11 ` +
                (count && count > 0
                  ? "bg-black text-white ring-2 ring-white"
                  : "bg-muted text-muted-foreground ring-1 ring-white") +
                (bouncing ? " badge-bounce" : "")
              }
            >
              {count && count > 99 ? "99+" : count > 0 ? String(count) : ""}
            </Badge>

            <span
              className={
                `flex items-center justify-center icon rounded-full transition-colors duration-200 ease-in-out cursor-pointer z-10 p-1` +
                (count && count > 0 ? "text-black" : "text-white")
              }
            >
              <ShoppingBag size={24} className="w-6 h-6" />
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <span className="text-muted-foreground">Cart</span>
        </TooltipContent>
      </Tooltip>
      <span className="sr-only">Cart</span>
    </div>
  );
};

export default ShoppingCartButton;

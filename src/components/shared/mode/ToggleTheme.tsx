"use client";

import * as React from "react";
import {Lightbulb} from "lucide-react";
import {useTheme} from "next-themes";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";

export function ModeToggle() {
  const {theme, setTheme} = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Ensure the component is mounted before rendering theme-dependent content
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render nothing or a placeholder during SSR
    return (
      <div className="flex flex-col items-center justify-center cursor-pointer">
        <div className="flex items-center justify-center transition-colors duration-200 ease-in-out cursor-pointer z-10">
          <Tooltip>
            <TooltipTrigger asChild>
              <Lightbulb
                size={24}
                className="aspect-square rotate-180 hover:scale-95"
              />
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-extrabold">Toggle Theme</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <span className="sr-only">Toggle Theme</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center ring-2 ring-white rounded-full text-white cursor-pointer">
      <Tooltip>
        <TooltipTrigger asChild>
          {theme === "dark" ? (
            <div
              onClick={() => setTheme("light")}
              className="flex flex-col items-center justify-center"
            >
              <span className="flex items-center justify-center icon transition-colors duration-200 ease-in-out cursor-pointer z-10">
                <Lightbulb
                  size={24}
                  className="aspect-square rotate-180 hover:scale-95"
                />
              </span>
            </div>
          ) : (
            <div
              onClick={() => setTheme("dark")}
              className="flex flex-col items-center justify-center"
            >
              <span className="flex items-center justify-center icon ring-1 transition-colors duration-200 ease-in-out cursor-pointer z-10">
                <Lightbulb
                  size={24}
                  className="aspect-square rotate-180 hover:scale-95"
                />
              </span>
            </div>
          )}
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <span>Toggle Theme</span>
        </TooltipContent>
      </Tooltip>
      <span className="sr-only">Toggle Theme</span>
    </div>
  );
}

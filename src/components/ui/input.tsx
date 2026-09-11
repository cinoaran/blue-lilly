import * as React from "react";

import {cn} from "@/lib/utils";

interface InputProps extends React.ComponentProps<"input"> {
  suffix?: React.ReactNode;
}

function Input({className, type, suffix, ...props}: InputProps) {
  // allow callers to pass a style; keep transparent background by default
  const {style, ...rest} = props as React.InputHTMLAttributes<HTMLInputElement>;
  const mergedStyle = {
    ...(style || {}),
  } as React.CSSProperties;
  if (!Object.prototype.hasOwnProperty.call(mergedStyle, "background")) {
    mergedStyle.background = "transparent";
  }

  return (
    <div className="relative w-full">
      <input
        type={type}
        data-slot="input"
        // ensure transparent background and no shadow; also target file button
        className={cn(
          "appearance-none placeholder:text-foreground selection:bg-background/90 selection:text-primary-foreground h-9 w-full min-w-0 px-3 py-1 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:appearance-none file:shadow-none file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-b-[0.3px] focus-visible:border-underlined focus-visible:ring-offset-0",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          suffix ? "pr-8" : "",
          className,
        )}
        {...rest}
        style={mergedStyle}
      />
      {suffix && (
        <span className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center cursor-pointer">
          {suffix}
        </span>
      )}
    </div>
  );
}

export {Input};

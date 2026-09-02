"use client";
import React from "react";
import {Camera, FileQuestion, HomeIcon, LucideMailbox} from "lucide-react";
import Link from "next/link";
import {usePathname} from "next/navigation";

const Main = () => {
  const pathname = usePathname();
  return (
    <div className="flex items-start justify-center mr-6">
      <ul className="flex flex-col items-start gap-6">
        <li
          className={`flex items-start justify-center gap-1 ${
            pathname === "/"
              ? "text-primary font-semibold"
              : "text-sheet-foreground"
          }`}
        >
          <Link
            href={`/`}
            className="flex items-center justify-start gap-2 w-fit h-9 underlined uppercase"
          >
            <HomeIcon
              className="size-[1.2rem]"
              strokeWidth={pathname === "/" ? 3 : 2}
            />
            <span className="text-md font-normal">Home</span>
          </Link>
        </li>
        <li
          className={`flex items-start justify-center ${
            pathname === "/blog"
              ? "text-primary font-semibold"
              : "text-sheet-foreground"
          }`}
        >
          <Link
            href={`/blog`}
            className="flex items-center justify-start gap-2 w-fit h-9 underlined uppercase"
          >
            <Camera
              className="size-[1.2rem]"
              strokeWidth={pathname === "/blog" ? 3 : 2}
            />
            <span className="text-md font-normal">Blog</span>
          </Link>
        </li>
        <li
          className={`flex items-start justify-center ${
            pathname === "/faq"
              ? "text-primary font-semibold"
              : "text-sheet-foreground"
          }`}
        >
          <Link
            href={`/faq`}
            className="flex items-center justify-start gap-2 w-fit h-9 underlined uppercase"
          >
            <FileQuestion
              className="size-[1.2rem]"
              strokeWidth={pathname === "/faq" ? 3 : 2}
            />
            <span className="text-md font-normal">FAQ</span>
          </Link>
        </li>
        <li
          className={`flex items-start justify-center ${
            pathname === "/newsletter"
              ? "text-primary font-semibold"
              : "text-sheet-foreground"
          }`}
        >
          <Link
            href={`/newsletter`}
            className="flex items-center justify-start gap-2 w-fit h-9 underlined uppercase"
          >
            <LucideMailbox
              className="size-[1.2rem]"
              strokeWidth={pathname === "/newsletter" ? 3 : 2}
            />
            <span className="text-md font-normal">Newsletter</span>
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Main;

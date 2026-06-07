import {APP_NAME, APP_NAME_SECOND} from "@/constants";
import Link from "next/link";
import React from "react";
import {SheetNavigation} from "@/components/shared/sheet";
import {ensureSession} from "@/acl/acl";

import {ModeToggle} from "@/components/shared/mode/ToggleTheme";
import SearchInput from "@/components/shared/searchInput";
import {headers} from "next/headers";
const Header = async () => {
  const rawSession = await ensureSession({headers: await headers()});

  const session = rawSession
    ? {
        ...rawSession,
        user: {
          ...rawSession.user,
          image: rawSession.user.image ?? undefined,
        },
      }
    : null;

  return (
    <header className="relative md:sticky top-0 mx-auto space-y-6 pb-5 md:space-y-0 px-8 border-b-[0.3px] border-b-foreground/10 backdrop-blur-lg z-10">
      <nav className="flex flex-col md:flex-row items-center justify-center md:justify-between md:gap-1 gap-1 h-auto">
        <Link
          href="/"
          className="flex flex-col items-center md:flex-row md:items-end justify-center my-5"
          aria-label="Logo"
        >
          <h1 className="flex items-center justify-center text-primary uppercase">
            <span className="text-foreground text-[0.7rem] font-extrabold -rotate-90">
              {APP_NAME}
            </span>
            {APP_NAME_SECOND}
          </h1>
        </Link>
        <div className="w-full md:w-1/2 my-5">
          <SearchInput />
        </div>
        <div className="flex items-center justify-center gap-4">
          <ModeToggle />
          <SheetNavigation session={session} />
        </div>
      </nav>
    </header>
  );
};

export default Header;

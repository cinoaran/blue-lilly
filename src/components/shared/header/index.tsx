import {APP_NAME, APP_NAME_SECOND} from "@/constants";
import Image from "next/image";
import Link from "next/link";
import {SheetNavigation} from "@/components/shared/sheet/SheetNavigation";
import {ensureSession} from "@/acl/acl";

import {ModeToggle} from "@/components/shared/mode/ToggleTheme";
import {headers} from "next/headers";
import {NavbarCart} from "../navbarCart";

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
    <header className="relative md:sticky top-0 mx-auto space-y-6 md:space-y-0 px-8 border-b-[0.3px] border-b-foreground/10 backdrop-blur-lg z-10">
      <nav className="flex flex-col md:flex-row items-center justify-center md:justify-between md:gap-1 gap-1 py-4">
        <Link
          href="/"
          className="flex flex-col items-center md:flex-row md:items-end justify-center my-5"
          aria-label="Logo"
        >
          <h1 className="flex items-center justify-center gap-5 uppercase">
            <Image src="/logo/lilly.png" alt="Logo" width={100} height={100} />
            <div className="flex flex-col items-center md:items-start">
              <span className="text-2xl font-bold text-center md:text-left">
                {APP_NAME}
              </span>
              <span className="text-2xl font-bold text-center md:text-left">
                {APP_NAME_SECOND}
              </span>
            </div>
          </h1>
        </Link>
        <div className="flex items-center justify-center gap-4">
          <ModeToggle />
          <NavbarCart />
          <SheetNavigation session={session} />
        </div>
      </nav>
    </header>
  );
};

export default Header;

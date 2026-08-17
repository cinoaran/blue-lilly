import Link from "next/link";
import {SheetNavigation} from "@/components/shared/sheet/SheetNavigation";
import {ensureSession} from "@/acl/acl";

import {ModeToggle} from "@/components/shared/mode/ToggleTheme";
import {headers} from "next/headers";
import {NavbarCart} from "../navbarCart";
import Logo from "../logo/Logo";

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
    <header className="relative md:sticky top-0 mx-auto space-y-6 md:space-y-0 px-8 border-b-[0.3px] border-b-foreground/10 backdrop-blur-lg z-50">
      <nav className="flex flex-col md:flex-row items-center justify-center md:justify-between md:gap-1 gap-1 py-4">
        <Link
          href="/"
          className="flex flex-col items-center md:flex-row md:items-end justify-center my-5"
          aria-label="Logo"
        >
          <Logo />
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

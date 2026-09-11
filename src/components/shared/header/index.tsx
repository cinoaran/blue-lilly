import Link from "next/link";
import {SheetNavigation} from "@/components/shared/sheet/SheetNavigation";
import {ensureSession} from "@/acl/acl";

import {ModeToggle} from "@/components/shared/mode/ToggleTheme";
import {headers} from "next/headers";
import {NavbarCart} from "@/app/(root)/cart/_components/navbarCart";
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
    <header className="relative md:sticky top-0 mx-auto space-y-2 md:space-y-0 px-8 border-b-[0.3px] border-b-foreground/10 backdrop-blur-lg z-50">
      <div className="p-3 w-full">
        <div
          className="marquee"
          aria-hidden={false}
          role="region"
          aria-label="Angebot"
        >
          <div className="marquee__inner">
            <span className="marquee__copy">
              ✓ Kostenfrei ab 100€ Bestellwert innerhalb Deutschlands. ✓
              Lieferung innerhalb von 2-3 Werktagen ✓ 3 Jahre Garantie auf
              unsere Möbelstücke ✓
            </span>
            <span className="marquee__copy">
              ✓ Kostenfrei ab 100€ Bestellwert innerhalb Deutschlands. ✓
              Lieferung innerhalb von 2-3 Werktagen ✓ 3 Jahre Garantie auf
              unsere Möbelstücke.
            </span>
            <span className="marquee__copy">
              ✓ Kostenfrei ab 100€ Bestellwert innerhalb Deutschlands. ✓
              Lieferung innerhalb von 2-3 Werktagen ✓ 3 Jahre Garantie auf
              unsere Möbelstücke.
            </span>
            <span className="marquee__copy">
              ✓ Kostenfrei ab 100€ Bestellwert innerhalb Deutschlands. ✓
              Lieferung innerhalb von 2-3 Werktagen ✓ 3 Jahre Garantie auf
              unsere Möbelstücke.
            </span>
          </div>
        </div>
      </div>
      <hr className="border-foreground/10" />
      <nav className="flex flex-col md:flex-row items-center justify-center md:justify-between md:gap-1 gap-5 py-2 mb-6">
        <Link
          href="/"
          className="flex flex-col items-center md:flex-row md:items-end justify-center my-2"
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

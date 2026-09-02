"use client";

import {APP_NAME, APP_NAME_SECOND} from "../../constants";
import {CreditCard, Scale, Truck} from "lucide-react";
import Link from "next/link";
import {usePathname} from "next/navigation";

const Footer = () => {
  const pathname = usePathname() || "/";
  const isActive = (href: string) => {
    if (!href) return false;
    return pathname === href;
  };

  return (
    <footer className="mx-auto text-foreground z-40">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 py-10 place-items-center grid-wrap gap-22 px-10 backdrop-blur-lg border-t-[0.3px] border-t-foreground/10">
        <div className="flex flex-col items-start justify-start gap-2 w-full h-full border-b-[0.3px] border-primary  hover:border-primary/20 p-4 rounded-md">
          <h4 className="flex items-start justify-start gap-5 mb-4 font-semibold uppercase w-full bg-background p-2 rounded-md">
            <Truck size={24} />
            <span>Versand</span>
          </h4>
          <div className="flex flex-col items-start justify-center gap-4 w-full">
            <p className="bg-background/90 p-2 rounded-md w-full">
              Kostenfrei ab 100€ Bestellwert innerhalb Deutschlands.
            </p>
            <p className="bg-background/90 p-2 rounded-md w-full">
              Versanddauer: 2-5 Werktage innerhalb Deutschlands, 5-10 Werktage
              international.
            </p>
            <p className="bg-background/90 p-2 rounded-md w-full">
              Rücksendungen sind innerhalb von 14 Tagen nach Erhalt der Ware
              möglich.
            </p>
            <p className="bg-background/90 p-2 rounded-md w-full">
              Versanddientleister: DHL, Hermes, UPS, DPD, GLS, Deutsche Post.
            </p>
            <p className="bg-background/90 p-2 rounded-md w-full">
              Internationale Versandkosten variieren je nach Zielland und
              Bestellwert.
            </p>
          </div>
        </div>
        <div className="flex flex-col items-start justify-star gap-2 w-full h-full border-b-[0.3px] border-primary  hover:border-primary/20 p-4 rounded-md">
          <h4 className="flex items-start justify-start gap-5 mb-4 font-semibold uppercase w-full bg-background p-2 rounded-md">
            <Scale size={24} />
            <span>Rechtliches</span>
          </h4>
          <div className="flex flex-col items-start justify-center gap-4 w-full">
            <p className="bg-background/90 p-2 rounded-md w-full">
              <Link
                href="/agb"
                className={`underlined ${isActive("/agb") ? "text-primary font-semibold" : "text-foreground"}`}
              >
                AGB
              </Link>
            </p>
            <p className="bg-background/90 p-2 rounded-md w-full">
              <Link
                href="/datenschutz"
                className={`underlined ${isActive("/datenschutz") ? "text-primary font-semibold" : "text-foreground"}`}
              >
                Datenschutzerklärung
              </Link>
            </p>
            <p className="bg-background/90 p-2 rounded-md w-full">
              <Link
                href="/impressum"
                className={`underlined ${isActive("/impressum") ? "text-primary font-semibold" : "text-foreground"}`}
              >
                Impressum
              </Link>
            </p>
            <p className="bg-background/90 p-2 rounded-md w-full">
              <Link
                href="/barrierefreiheit"
                className={`underlined ${isActive("/barrierefreiheit") ? "text-primary font-semibold" : "text-foreground"}`}
              >
                Barrierefreiheit
              </Link>
            </p>
            <p className="bg-background/90 p-2 rounded-md w-full">
              <Link
                href="/cookie-settings"
                className={`underlined ${isActive("/cookie-settings") ? "text-primary font-semibold" : "text-foreground"}`}
              >
                Cookie-Einstellungen
              </Link>
            </p>
            <p className="bg-background/90 p-2 rounded-md w-full">
              <Link
                href="/widerruf"
                className={`underlined ${isActive("/widerruf") ? "text-primary font-semibold" : "text-foreground"}`}
              >
                Widerruf
              </Link>
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-start gap-2 w-full h-full border-b-[0.3px] border-primary  hover:border-primary/20 p-4 rounded-md">
          <h4 className="flex items-start justify-start gap-5 mb-4 font-semibold uppercase w-full bg-background p-2 rounded-md">
            <CreditCard size={24} />
            <span>Zahlungsarten</span>
          </h4>
          <div className="flex flex-col items-start justify-center gap-4 w-full">
            <p className="bg-background/90 p-2 rounded-md w-full">
              Kreditkarten: Visa, Mastercard, American Express
            </p>
            <p className="bg-background/90 p-2 rounded-md w-full">
              Wallets: Apple Pay, Google Pay
            </p>
            <p className="bg-background/90 p-2 rounded-md w-full">
              Banküberweisung: PayPal, Giropay, Sofort, SEPA-Lastschrift
            </p>
            <p className="bg-background/90 p-2 rounded-md w-full">
              Weitere: SEPA-Lastschrift, Klarna und Sofortüberweisung
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-center sm:gap-2 flex-wrap font-semibold uppercase space-y-5 md:space-y-0">
        <Link
          href="/"
          className={`flex flex-col items-center md:flex-row md:items-end justify-center gap-2 ${isActive("/") ? "text-primary font-semibold" : "text-foreground"}`}
          aria-label="Logo"
        >
          <div className="flex items-center justify-center gap-3 flex-wrap text-primary font-semibold uppercase">
            <span className="text-foreground text-semibold">{APP_NAME} </span>

            <span className="text-foreground text-semibold">
              {APP_NAME_SECOND}
            </span>
            <span className="text-foreground text-semibold">
              © {new Date().getFullYear()} Alle Rechte vorbehalten.
            </span>
          </div>
        </Link>
      </div>
    </footer>
  );
};

export default Footer;

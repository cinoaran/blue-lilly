import type {Metadata} from "next";
import {Asap, DM_Sans, Comfortaa} from "next/font/google";
import {ThemeProvider} from "next-themes";
import {SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import "@/app/assets/globals.css";
import {APP_DESCRIPTION, APP_NAME, APP_NAME_SECOND} from "@/constants";
import Header from "@/components/shared/header";
import Footer from "@/components/footer";
import {TooltipProvider} from "@/components/ui/tooltip";

// NEUE Google Fonts als CSS-Variablen

const displayFont = Asap({
  subsets: ["latin"],
  variable: "--font-display-family",
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
});

const sansFont = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans-family",
  weight: ["400", "500", "600", "700"],
});

const comfortaa = Comfortaa({
  variable: "--font-comfortaa",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: `${APP_NAME} - ${APP_NAME_SECOND}`,
  description: APP_DESCRIPTION,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning={true}
      data-scroll-behavior="smooth"
    >
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/web-app-manifest-192x192.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="512x512"
          href="/web-app-manifest-512x512.png"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="description" content={APP_DESCRIPTION} />
      </head>
      <body
        className={`${displayFont.variable} ${sansFont.variable} ${comfortaa.variable} antialiased bg-background`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <main
            className={`antialiased flex flex-col mx-auto min-h-screen w-full my-0 ${displayFont.variable} ${sansFont.variable} ${comfortaa.variable}`}
          >
            <SidebarProvider defaultOpen={false}>
              <TooltipProvider>
                <div className="relative flex items-center h-20 ">
                  <SidebarTrigger className="absolute right-2 top-2 z-50" />
                </div>
                <div className="w-full">
                  <Header />
                  {children}
                </div>
              </TooltipProvider>
            </SidebarProvider>
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}

import type {Metadata} from "next";
import "../assets/globals.css";
import {ThemeProvider} from "next-themes";
import {APP_NAME, APP_DESCRIPTION} from "@/constants/index";
import {SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import {cookies, headers} from "next/headers";
import {ensureSession} from "@/acl/acl";
import {notFound} from "next/navigation";

export const metadata: Metadata = {
  title: `${APP_NAME}`,
  description: `${APP_DESCRIPTION}`,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar-state")?.value === "true";

  // Early session check: if no session, return 404 before rendering any UI
  const hdrs = await headers();
  const session = await ensureSession({headers: hdrs});
  if (!session || !session.user || !session.user.id) {
    notFound();
  }

  // Dynamically import client-side sidebar after session check to avoid
  // leaking page structure for unauthorized requests.
  const {AppSideBar} = await import("./_components/AppSideBar");

  return (
    <>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <main className={`antialiased mx-auto min-h-screen w-full`}>
          <SidebarProvider defaultOpen={defaultOpen}>
            <div className="absolute left-0 z-50 md:hidden top-1 pointer-events-auto">
              <SidebarTrigger />
            </div>
            <div className="flex flex-col md:flex-row min-h-screen w-full">
              <aside className="w-full md:w-64 shrink-0 bg-transparent">
                <div className="h-full w-full">
                  <AppSideBar />
                </div>
              </aside>

              <div className="flex-1 w-full">{children}</div>
            </div>
          </SidebarProvider>
        </main>
      </ThemeProvider>
    </>
  );
}

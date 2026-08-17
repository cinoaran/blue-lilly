"use client";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {Tooltip, TooltipTrigger, TooltipContent} from "@/components/ui/tooltip";
import {LayoutDashboardIcon, Menu, PenBoxIcon, UserPlus} from "lucide-react";
import Main from "../nav";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {usePathname} from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/shared/authComponent/LogoutButton";
import AvatarEdit from "@/components/uploadthing/AvatarEdit";
import type {Session} from "@/lib/auth";

export function SheetNavigation({session}: {session: Session | null}) {
  const user = session?.user || null;
  const pathname = usePathname();

  const userLoggedIn = user && user.name !== undefined;

  return (
    <Sheet modal={true} /*open={true}*/ data-slot="sheet-navigation">
      <Tooltip>
        <TooltipTrigger asChild>
          <SheetTrigger asChild aria-description="Navigation Trigger">
            <div
              className="flex items-center justify-center icon ring-2 transition-colors duration-200 ease-in-out cursor-pointer z-10"
              aria-label="Open Navigation"
            >
              {userLoggedIn ? (
                <Avatar
                  size="lg"
                  className="flex items-center justify-center transition-colors duration-200 ease-in-out cursor-pointer z-10"
                >
                  <AvatarImage
                    src={user?.image || "/avatar/placeholder-avatar.svg"}
                    alt="User profile image"
                    className="aspect-square object-cover hover:scale-95"
                    aria-roledescription="Avatar image"
                  />

                  <AvatarFallback>
                    <AvatarImage
                      src="/avatar/placeholder-avatar.svg"
                      alt="Placeholder Avatar"
                      className="aspect-square object-cover hover:scale-95"
                      width={40}
                      height={40}
                    />
                  </AvatarFallback>
                  <span className="sr-only">User Image</span>
                </Avatar>
              ) : (
                <Menu strokeWidth={2} className="size-5 hover:scale-95" />
              )}
            </div>
          </SheetTrigger>
        </TooltipTrigger>

        {/* Small screens: align right; from sm up: align center */}
        <TooltipContent
          side="bottom"
          align="center"
          sideOffset={1}
          className="sm:hidden"
        >
          Navigation öffnen
        </TooltipContent>
        <TooltipContent
          side="bottom"
          align="center"
          sideOffset={1}
          className="hidden sm:block"
        >
          Navigation öffnen
        </TooltipContent>
      </Tooltip>
      <SheetContent
        aria-description="Navigation Slider"
        side="right"
        className="bg-sheet backdrop-blur-xl border-sheet-border/30 shadow-md max-h-screen overflow-y-auto text-sheet-foreground"
      >
        <SheetHeader className="flex flex-col items-center justify-center gap-3 my-5 border-b border-sheet-foreground/30">
          <SheetTitle
            asChild
            className="flex items-center justify-center gap-1 uppercase text-sheet-foreground pt-10"
          >
            <h3>Navigation</h3>
          </SheetTitle>
          <SheetDescription className="text-center text-sm text-sheet-foreground/80">
            Make changes to your profile here.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col items-center justify-center h-full gap-3 my-5">
          <Main />
        </div>
        <SheetFooter className="flex flex-col items-center justify-center gap-3">
          {userLoggedIn ? (
            <>
              <SheetHeader className="flex flex-col items-center justify-center gap-3 border-b border-sheet-foreground/30">
                <div className="flex flex-col items-center justify-center gap-1">
                  {session && <AvatarEdit session={session} />}
                </div>

                <div className="flex flex-row items-start justify-center gap-5">
                  <ul className="flex flex-col items-start justify-center md:flex-row gap-1 md:gap-12">
                    <li
                      className={`flex items-start justify-center gap-1 ${
                        pathname === "/register"
                          ? "text-primary font-semibold"
                          : "text-sheet-foreground"
                      }`}
                    >
                      <Link
                        href={`/dashboard`}
                        className="flex items-center justify-start gap-1 w-fit h-8 underlined uppercase"
                      >
                        <LayoutDashboardIcon
                          className="size-[0.8rem]"
                          strokeWidth={pathname === `/dashboard` ? 3 : 2}
                        />
                        <span className="text-md font-normal">Dashboard</span>
                      </Link>
                    </li>

                    <li
                      className={`flex items-start justify-center  gap-1 ${
                        pathname === `/profile` ||
                        pathname?.endsWith(`/profile`) ||
                        pathname === `/${user.role}/profile`
                          ? "text-primary font-semibold"
                          : "text-sheet-foreground"
                      }`}
                    >
                      <Link
                        href={`/profile`}
                        className="flex items-center justify-start gap-1 w-fit h-8 underlined uppercase"
                      >
                        <UserPlus
                          className="size-[0.8rem]"
                          strokeWidth={
                            pathname === `/profile` ||
                            pathname?.endsWith(`/profile`)
                              ? 3
                              : 2
                          }
                        />
                        <span className="text-md font-normal">Profile</span>
                      </Link>
                    </li>
                  </ul>
                </div>
              </SheetHeader>
              <LogoutButton />
            </>
          ) : (
            <>
              <div className="flex flex-col items-center justify-center gap-3 h-14 border-b border-sheet-foreground/30 w-[90%]">
                <SheetTitle asChild>
                  <h4 className="uppercase text-sheet-foreground">
                    Your Account
                  </h4>
                </SheetTitle>
              </div>

              <ul className="flex flex-col items-start justify-center md:flex-row gap-1 md:gap-12">
                <li
                  className={`flex items-start justify-center gap-1 ${
                    pathname === "/login"
                      ? "text-primary font-semibold"
                      : "text-sheet-foreground"
                  }`}
                >
                  <Link
                    href={`/login`}
                    className="flex items-center justify-start gap-1 w-fit h-9 underlined uppercase"
                  >
                    <PenBoxIcon
                      className="size-[0.9rem]"
                      strokeWidth={pathname === "/login" ? 3 : 2}
                    />
                    <span className="text-md font-normal">Login</span>
                  </Link>
                </li>
                <li
                  className={`flex items-start justify-center gap-1 ${
                    pathname === "/register"
                      ? "text-primary font-semibold"
                      : "text-sheet-foreground"
                  }`}
                >
                  <Link
                    href={`/register`}
                    className="flex items-center justify-start gap-1 w-fit h-9 underlined uppercase"
                  >
                    <PenBoxIcon
                      className="size-[0.9rem]"
                      strokeWidth={pathname === "/register" ? 3 : 2}
                    />
                    <span className="text-md font-normal">Register</span>
                  </Link>
                </li>
              </ul>
            </>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
export default SheetNavigation;

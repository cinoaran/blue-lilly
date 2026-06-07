"use client";

import {
  Truck,
  ClipboardList,
  PackageSearch,
  LayoutDashboard,
  Settings,
  Users,
  StickyNote,
  GalleryThumbnails,
  LibraryBig,
  Boxes,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

import Link from "next/link";

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/dashboard/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Overview",
    url: "/dashboard/admin/overview",
    icon: ClipboardList,
  },
  {
    title: "Products",
    url: "/dashboard/admin/products",
    icon: PackageSearch,
  },
  {
    title: "Categories",
    url: "/dashboard/admin/categories",
    icon: Boxes,
  },
  {
    title: "Orders",
    url: "/dashboard/admin/orders",
    icon: Truck,
  },
  {
    title: "User",
    url: "/dashboard/admin/user",
    icon: Users,
  },
  {
    title: "Pages",
    url: "/dashboard/admin/pages",
    icon: StickyNote,
  },
  {
    title: "Carousel",
    url: "/dashboard/admin/carousel",
    icon: GalleryThumbnails,
  },
  {
    title: "Settings",
    url: "/dashboard/admin/settings",
    icon: Settings,
  },
  {
    title: "Documentations",
    url: "/dashboard/admin/documentation",
    icon: LibraryBig,
  },
  {
    title: "Merchants",
    url: "/dashboard/admin/merchant",
    icon: Truck,
  },
];

export function AppSideBar() {
  const {open} = useSidebar();

  return (
    <aside>
      <Sidebar
        className="bg-link/10 border-r-[0.2px] border-r-link/10 text-sidebar-foreground"
        collapsible="icon"
      >
        <SidebarContent className="bg-link/10 backdrop-blur-lg border-foreground/10 shadow-md z-50">
          <div className="absolute right-2 top-2 md:hidden z-50">
            <SidebarTrigger />
          </div>
          <div className="absolute right-2 top-2 hidden md:block z-50">
            <SidebarTrigger />
          </div>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu
                className={`space-y-5 ${open ? "px-10" : "px-0"} mt-20 md:mt-52`}
              >
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.url}
                        className="max-w-fit underlined hover:bg-transparent"
                      >
                        <item.icon />
                        <span className="text-md">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="bg-link/30 h-10"></SidebarFooter>
      </Sidebar>
    </aside>
  );
}

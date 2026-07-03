"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboardIcon,
  VideoIcon,
  UsersIcon,
  TagIcon,
  MessageSquareIcon,
  BarChart3Icon,
  SettingsIcon,
  ExternalLinkIcon,
  ClapperboardIcon,
} from "lucide-react";

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboardIcon,
  },
  {
    title: "Videos",
    href: "/admin/videos",
    icon: VideoIcon,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: UsersIcon,
  },
  {
    title: "Comments",
    href: "/admin/comments",
    icon: MessageSquareIcon,
  },
  {
    title: "Categories",
    href: "/admin/categories",
    icon: TagIcon,
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3Icon,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: SettingsIcon,
  },
];

const quickLinks = [
  { title: "Open Studio", href: "/studio", icon: ClapperboardIcon },
  { title: "View Site", href: "/", icon: ExternalLinkIcon },
];

export const AdminSidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white/80 backdrop-blur-xl border-r border-emerald-100/80 shadow-[8px_0_30px_-12px_rgba(16,185,129,0.15)] hidden lg:flex flex-col z-40">
      <div className="flex flex-col h-full p-4">
        <div className="space-y-1.5">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 translate-x-1"
                    : "text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 hover:translate-x-1 hover:shadow-sm"
                )}
              >
                <Icon
                  className={cn(
                    "size-5 transition-transform duration-200",
                    !isActive && "group-hover:scale-110"
                  )}
                />
                {item.title}
              </Link>
            );
          })}
        </div>

        <div className="mt-auto space-y-1.5 pt-4 border-t border-emerald-100">
          {quickLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-medium text-gray-500 hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-200"
              >
                <Icon className="size-4" />
                {item.title}
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

// Horizontal nav for < lg screens where the fixed sidebar is hidden.
export const AdminMobileNav = () => {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden mb-4 -mx-1 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex gap-2 px-1 w-max">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 border",
                isActive
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-transparent shadow-md shadow-emerald-500/30"
                  : "bg-white/80 text-gray-600 border-emerald-100 hover:text-emerald-700 hover:border-emerald-300"
              )}
            >
              <Icon className="size-3.5" />
              {item.title}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

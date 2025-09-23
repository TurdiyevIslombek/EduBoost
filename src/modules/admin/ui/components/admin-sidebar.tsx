"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboardIcon,
  VideoIcon,
  UsersIcon,
  TagIcon,
  BarChart3Icon,
  SettingsIcon,
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

export const AdminSidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white/80 backdrop-blur-md border-r border-gray-200 shadow-xl">
      <div className="flex flex-col h-full p-4">
        <div className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105"
                    : "text-gray-700 hover:bg-gray-100 hover:text-blue-600 hover:scale-105"
                )}
              >
                <Icon className="size-5" />
                {item.title}
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  Users,
  BarChart3,
  ChevronDown,
  LogOut,
  Menu,
} from "lucide-react";
import { cn } from "@/src/lib/utils";

import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/src/components/ui/sheet";
import type { TeamRole } from "@/src/lib/types";
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks";
import { logout, selectUser } from "@/src/redux/features/auth/authSlice";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "manager", "member"],
  },
  {
    href: "/projects",
    label: "Projects",
    icon: FolderKanban,
    roles: ["admin", "manager", "member"],
  },
  {
    href: "/tasks",
    label: "Tasks",
    icon: ListTodo,
    roles: ["admin", "manager", "member"],
  },
  { href: "/team", label: "Team", icon: Users, roles: ["admin", "manager"] },
  {
    href: "/reports",
    label: "Reports",
    icon: BarChart3,
    roles: ["admin", "manager"],
  },
];

const roleColors: Record<TeamRole, string> = {
  admin: "bg-red-100 text-red-700",
  manager: "bg-blue-100 text-blue-700",
  member: "bg-green-100 text-green-700",
};

function SidebarContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();

  const user = useAppSelector(selectUser);

  const filteredNavItems = navItems.filter(
    (item) => user && item.roles.includes(user.role)
  );
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    // Implement your logout logic here
    dispatch(logout());
  };
  return (
    <div className="flex  flex-col">
      <div className="flex h-16 items-center border-b border-border px-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2"
          onClick={onLinkClick}
        >
          <FolderKanban className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold">MPMS</span>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-4">
        {filteredNavItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onLinkClick}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {user && (
        <div className="border-t border-border p-4">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {user.role
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium">{user.role}</p>
                <Badge
                  variant="secondary"
                  className={cn(
                    "mt-0.5 text-xs capitalize",
                    roleColors[user.role as TeamRole]
                  )}
                >
                  {user.role}
                </Badge>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = useAppSelector(selectUser);
  const pathname = usePathname();
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (!user) {
    return (
      <>
        {/* Desktop sidebar skeleton */}
        <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-border bg-card lg:block">
          <div className="flex h-16 items-center border-b border-border px-6">
            <FolderKanban className="h-6 w-6 text-primary" />
            <span className="ml-2 text-lg font-semibold">MPMS</span>
          </div>
          <div className="p-4">
            <div className="animate-pulse space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 rounded-lg bg-muted" />
              ))}
            </div>
          </div>
        </aside>
        {/* Mobile header skeleton */}
        <header className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
          <div className="flex items-center gap-2">
            <FolderKanban className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">MPMS</span>
          </div>
        </header>
      </>
    );
  }

  return (
    <>
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-border bg-card lg:block">
        <SidebarContent />
      </aside>

      <header className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <FolderKanban className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold">MPMS</span>
        </Link>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SidebarContent onLinkClick={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
      </header>
    </>
  );
}

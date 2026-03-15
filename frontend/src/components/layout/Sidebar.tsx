import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Box,
  Send,
  PackagePlus,
  X,
  Menu
} from "lucide-react";

import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Products", href: "/products", icon: Package },
  { name: "Dispatch", href: "/dispatch", icon: Send },
  { name: "Supply", href: "/supply", icon: PackagePlus },
  { name: "Parties", href: "/party", icon: Users },
  { name: "Users", href: "/users", icon: Users },
  { name: "Reports", href: "/reports", icon: BarChart3 },
];

const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => {
  const location = useLocation();

  return (
   <>
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-sidebar-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <Box className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-lg font-semibold text-sidebar-foreground">
          Inventory
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-sidebar-foreground"
                  : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3">
        <Link
          to="/profile"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-muted transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <Users className="h-5 w-5" />
          Profile
        </Link>
        <Link
          to="/settings"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-muted transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <Settings className="h-5 w-5" />
          Settings
        </Link>
        <button 
          onClick={() => {
            localStorage.removeItem("auth_user");
            window.location.href = "/login";
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-muted transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <LogOut className="h-5 w-5" />
          Log out
        </button>
      </div>
      </>
  );
};
export const MobileMenuTrigger = () => {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  if (!isMobile) return null;
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64 p-0 bg-sidebar border-sidebar-border">
          <VisuallyHidden>
            <SheetTitle>Navigation Menu</SheetTitle>
          </VisuallyHidden>
          <div className="flex h-full flex-col">
            <SidebarContent onNavigate={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
const Sidebar = () => {
  const isMobile = useIsMobile();
  if (isMobile) return null;
  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden md:flex w-64 flex-col bg-sidebar">
      <SidebarContent />
    </aside>
  );
};

export default Sidebar;

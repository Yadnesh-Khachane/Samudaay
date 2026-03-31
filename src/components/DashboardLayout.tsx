import { ReactNode } from "react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import { useLocation, Link } from "react-router-dom";
import { Users, LogOut } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NavItem { title: string; url: string; icon: LucideIcon; }
interface DashboardLayoutProps { children: ReactNode; navItems: NavItem[]; groupLabel: string; }

function DashboardSidebar({ navItems, groupLabel }: { navItems: NavItem[]; groupLabel: string }) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border gap-2 shrink-0">
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0">
          <Users className="w-4 h-4 text-primary-foreground" />
        </div>
        {!collapsed && <span className="font-bold text-foreground text-sm">Samudaay</span>}
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{groupLabel}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === navItems[0].url}
                      className="flex items-center gap-2 hover:bg-sidebar-accent/50 rounded-lg px-2 py-1.5"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span className="text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <div className="mt-auto border-t border-sidebar-border p-3">
        <Link to="/login"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-lg hover:bg-sidebar-accent/50">
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </Link>
      </div>
    </Sidebar>
  );
}

export default function DashboardLayout({ children, navItems, groupLabel }: DashboardLayoutProps) {
  const location = useLocation();
  // Find the active nav item title
  const activeItem = [...navItems].reverse().find((item) => location.pathname.startsWith(item.url));
  const pageTitle = activeItem?.title ?? groupLabel;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar navItems={navItems} groupLabel={groupLabel} />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 flex items-center border-b border-border px-4 gap-3 bg-card shrink-0">
            <SidebarTrigger className="shrink-0" />
            <div className="w-px h-5 bg-border" />
            <h1 className="text-base font-semibold text-foreground truncate">{pageTitle}</h1>
            <div className="ml-auto">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                ← Home
              </Link>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

import { NavLink } from "@/components/NavLink";
import { useLocation, useParams } from "react-router-dom"; // أضفنا useParams
import {
  LayoutDashboard,
  FolderPlus,
  Scan,
  FileText,
  Shield,
  LogOut,
  Settings,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { projectId } = useParams(); // التقاط المعرف إذا كان موجوداً في الرابط الحالي

  // مصفوفة الروابط الأساسية
  const mainNav = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "New Project", url: "/new-project", icon: FolderPlus },
  ];

  // مصفوفة روابط التحليل (تعتمد ديناميكياً على المشروع الحالي)
  const analysisNav = projectId ? [
    { title: "Run Scan", url: `/scan/${projectId}`, icon: Scan },
    // { title: "Vulnerability Report", url: `/results/${projectId}`, icon: FileText },
    { title: "Vulnerability Report", url: `/results`, icon: FileText },

  ] : [];

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-card/50 backdrop-blur-md">
      {/* Logo Section */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-border/50 shadow-sm">
        <div className="p-1.5 bg-primary rounded-lg shadow-lg shadow-primary/20">
          <Shield className="h-5 w-5 text-primary-foreground shrink-0" />
        </div>
        {!collapsed && (
          <span className="text-lg font-black tracking-tighter text-foreground uppercase italic">
            Sentinel<span className="text-primary text-xs ml-0.5 not-italic font-bold">AI</span>
          </span>
        )}
      </div>

      <SidebarContent className="py-4">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 mb-2">
            Management
          </SidebarGroupLabel>
          <SidebarMenu className="px-2">
            {mainNav.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === item.url}
                  tooltip={item.title}
                >
                  <NavLink
                    to={item.url}
                    end
                    activeClassName="bg-primary/10 text-primary border-r-2 border-primary"
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all group"
                  >
                    <item.icon className={`h-4 w-4 transition-transform group-hover:scale-110 ${location.pathname === item.url ? 'text-primary' : ''}`} />
                    <span>{item.title}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* Analysis Section - Only shows if a project is active */}
        {projectId && (
          <SidebarGroup className="mt-4">
            <SidebarGroupLabel className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60 mb-2">
              Active Project
            </SidebarGroupLabel>
            <SidebarMenu className="px-2">
              {analysisNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname.startsWith(item.url.split('/')[1])}
                    tooltip={item.title}
                  >
                    <NavLink
                      to={item.url}
                      activeClassName="bg-primary/10 text-primary border-r-2 border-primary shadow-sm"
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* Footer with Sign Out */}
      <SidebarFooter className="border-t border-border/50 p-4 bg-accent/20">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Settings">
              <NavLink to="/settings" className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
                <Settings className="h-4 w-4" />
                {!collapsed && <span>Settings</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Sign Out">
              <NavLink
                to="/login"
                className="flex items-center gap-3 px-3 py-2 text-sm font-semibold text-destructive/80 hover:text-destructive hover:bg-destructive/5 rounded-xl transition-colors"
              >
                <LogOut className="h-4 w-4" />
                {!collapsed && <span>Sign Out</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
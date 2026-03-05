import { NavLink } from "@/components/NavLink";
import { useLocation, useParams } from "react-router-dom";
import {
  LayoutDashboard,
  FolderPlus,
  Scan,
  FileText,
  Shield,
  LogOut,
  Settings,
  History,
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
import { useEffect, useState } from "react";
import api from "@/api/axios";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { projectId } = useParams();
  const [latestScanId, setLatestScanId] = useState<string | null>(null);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  // حفظ projectId في localStorage عند تغييره
  useEffect(() => {
    if (projectId) {
      localStorage.setItem("currentProjectId", projectId);
      setCurrentProjectId(projectId);
    } else {
      // لو مفيش projectId في الـ URL، حاول تجيبه من localStorage
      const savedProjectId = localStorage.getItem("currentProjectId");
      if (savedProjectId) {
        setCurrentProjectId(savedProjectId);
      }
    }
  }, [projectId]);

  // جلب آخر فحص للمشروع
  useEffect(() => {
    const fetchLatestScan = async () => {
      const projectToUse = projectId || currentProjectId;
      
      if (!projectToUse) {
        setLatestScanId(null);
        return;
      }
      
      try {
        console.log("🔍 Fetching latest scan for project:", projectToUse);
        const res = await api.get(`/scan/project/${projectToUse}/latest`);
        console.log("📊 Latest scan response:", res.data);
        
        if (res.data?.id) {
          setLatestScanId(res.data.id);
        } else {
          setLatestScanId(null);
        }
      } catch (error) {
        console.error("Failed to fetch latest scan:", error);
        setLatestScanId(null);
      }
    };

    fetchLatestScan();
  }, [projectId, currentProjectId]);

  // مصفوفة الروابط الأساسية
  const mainNav = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "New Project", url: "/new-project", icon: FolderPlus },
  ];

  // تحديد projectId المستخدم
  const activeProjectId = projectId || currentProjectId;

  // مصفوفة روابط التحليل (تظهر فقط إذا كان فيه مشروع نشط)
  const analysisNav = activeProjectId ? [
    { title: "Run New Scan", url: `/scan/${activeProjectId}`, icon: Scan },
    { title: "Scan History", url: `/history/${activeProjectId}`, icon: History },
    ...(latestScanId ? [{ 
      title: "Latest Report", 
      url: `/results/${latestScanId}`, 
      icon: FileText 
    }] : []),
  ] : [];

  // التحقق إذا كان الرابط نشط
  const isActive = (url: string) => {
    if (url === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    // للروابط اللي فيها parameters
    if (url.includes("/scan/") || url.includes("/history/") || url.includes("/results/")) {
      return location.pathname.startsWith(url.split('/').slice(0, -1).join('/'));
    }
    return location.pathname === url;
  };

  // لو مفيش مشروع نشط، ما نظهرش قسم التحليل
  if (!activeProjectId) {
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
          {/* Management Section */}
          <SidebarGroup>
            <SidebarGroupLabel className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 mb-2">
              Management
            </SidebarGroupLabel>
            <SidebarMenu className="px-2">
              {mainNav.map((item) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.title}
                    >
                      <NavLink
                        to={item.url}
                        end={item.url === "/dashboard"}
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                          active 
                            ? "bg-primary/10 text-primary border-r-2 border-primary" 
                            : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                        }`}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        {/* Footer Settings */}
        <SidebarFooter className="border-t border-border/50 p-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Settings">
                <NavLink 
                  to="/settings" 
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${
                    location.pathname === "/settings"
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`}
                >
                  <Settings className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>Settings</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Sign Out">
                <NavLink 
                  to="/login" 
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-destructive hover:bg-destructive/5 transition-all"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>Sign Out</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    );
  }

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
        {/* Management Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 mb-2">
            Management
          </SidebarGroupLabel>
          <SidebarMenu className="px-2">
            {mainNav.map((item) => {
              const active = isActive(item.url);
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={active}
                    tooltip={item.title}
                  >
                    <NavLink
                      to={item.url}
                      end={item.url === "/dashboard"}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        active 
                          ? "bg-primary/10 text-primary border-r-2 border-primary" 
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                      }`}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        {/* Analysis Section */}
        <SidebarGroup className="mt-4 animate-in slide-in-from-left-2 duration-300">
          <SidebarGroupLabel className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60 mb-2">
            Analysis Tools
          </SidebarGroupLabel>
          <SidebarMenu className="px-2">
            {analysisNav.map((item) => {
              const active = isActive(item.url);
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={active}
                    tooltip={item.title}
                  >
                    <NavLink
                      to={item.url}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        active 
                          ? "bg-primary/10 text-primary border-r-2 border-primary shadow-sm" 
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                      }`}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1">{item.title}</span>
                          {item.title === "Latest Report" && latestScanId && (
                            <span className="text-[8px] font-bold bg-primary/20 text-primary px-1.5 py-0.5 rounded-full ml-2 animate-pulse">
                              NEW
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer Settings */}
      <SidebarFooter className="border-t border-border/50 p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Settings">
              <NavLink 
                to="/settings" 
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${
                  location.pathname === "/settings"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
              >
                <Settings className="h-4 w-4 shrink-0" />
                {!collapsed && <span>Settings</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Sign Out">
              <NavLink 
                to="/login" 
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-destructive hover:bg-destructive/5 transition-all"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                {!collapsed && <span>Sign Out</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
} 
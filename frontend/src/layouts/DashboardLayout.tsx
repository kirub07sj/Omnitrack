import { Outlet, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useAppStore } from "@/store/useAppStore";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { useEffect } from "react";

export default function DashboardLayout() {
  const { currentUser, isLoadingStatus, checkSetupStatus } = useAppStore();

  useEffect(() => {
    if (isLoadingStatus) {
      checkSetupStatus().catch(console.error);
    }
  }, [isLoadingStatus, checkSetupStatus]);

  if (isLoadingStatus) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="relative">
          <div className="w-14 h-14 border-4 border-primary/30 rounded-full"></div>
          <div className="w-14 h-14 border-4 border-primary border-t-transparent rounded-full animate-spin absolute inset-0"></div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    // Redirect to login if no user
    return <Navigate to="/" replace />;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b border-border/60 bg-background/70 backdrop-blur-xl sticky top-0 z-30">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1 text-foreground/70 hover:text-foreground transition-colors" />
            <Separator orientation="vertical" className="mr-2 h-4 bg-border/60" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-foreground/70 capitalize font-medium">{currentUser.role} Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          {/* Header right-side glow accent */}
          <div className="ml-auto pr-4 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-muted-foreground hidden sm:inline">System Online</span>
          </div>
        </header>
        <div className="flex flex-1 flex-col bg-background text-foreground relative overflow-hidden">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 omni-bg-dots pointer-events-none opacity-50" />
          {/* Ambient glow */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/3 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="relative z-10 flex-1 omni-page-enter p-6 pt-4">
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

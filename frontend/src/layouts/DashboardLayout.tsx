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
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
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
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b border-border bg-background/40 backdrop-blur-xl">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1 text-foreground hover:text-foreground/80" />
            <Separator orientation="vertical" className="mr-2 h-4 bg-border" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-foreground/80 capitalize">{currentUser.role} Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-6 pt-2 bg-[#f4f7f6] text-foreground relative overflow-hidden transition-all duration-500 ease-in-out">
           <div className="absolute top-0 left-0 w-full h-64 bg-white border-b border-border pointer-events-none -z-10 transition-all duration-500 ease-in-out" />
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both h-full">
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

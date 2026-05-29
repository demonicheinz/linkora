import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AppSidebar } from "@/components/dashboard/sidebar/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { auth } from "@/lib/auth";

// Inner component: resolves auth() inside Suspense boundary so it doesn't block navigation
async function DashboardContent({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <SidebarProvider className="h-screen overflow-hidden">
      <AppSidebar variant="inset" />
      <SidebarInset className="flex h-screen flex-col overflow-hidden">
        <SiteHeader />
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="@container/main flex flex-1 flex-col overflow-hidden">
            {children}
          </div>
          <Toaster />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

// Outer layout: non-async, wraps DashboardContent in Suspense so runtime data
// (cookies via auth()) is accessed inside the Suspense boundary
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <DashboardContent>{children}</DashboardContent>
    </Suspense>
  );
}

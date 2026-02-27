import React from "react";
import AppSidebar from "@/components/AppSidebar";
import Navbar from "@/components/Navbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

type WorkspaceLayoutProps = {
  children: React.ReactNode;
};

const WorkspaceLayout = ({ children }: WorkspaceLayoutProps) => {
  return (
    <SidebarProvider className="h-svh overflow-hidden">
      <AppSidebar />
      <SidebarInset className="bg-[#F7F8FA] min-h-0 overflow-hidden">
        <Navbar />
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default WorkspaceLayout;

import AppSidebar from "@/components/AppSidebar";
import Navbar from "@/components/Navbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import React from "react";

type WorkspaceLayoutProps = {
  children: React.ReactNode;
};

const WorkspaceLayout = ({ children }: WorkspaceLayoutProps) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-[#F7F8FA]">
        <Navbar />
        <div className="flex flex-col flex-1 overflow-hidden">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default WorkspaceLayout;

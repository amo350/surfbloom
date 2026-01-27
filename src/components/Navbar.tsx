"use client";

import { Menu } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const { toggleSidebar } = useSidebar();

  return (
    <nav className="flex items-center gap-x-4 px-6 py-2.5 border-b">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="size-8"
      >
        <Menu className="size-5" />
      </Button>
      <Separator orientation="vertical" className="h-6" />
      {/* TODO: Add breadcrumbs, search, user menu, etc. */}
    </nav>
  );
};

export default Navbar;

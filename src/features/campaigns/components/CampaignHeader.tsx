"use client";

import { BarChart3, ClipboardList, Hash, Plus, Search } from "lucide-react";
import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CampaignHeaderProps {
  basePath: string;
  search: string;
  onSearchChange: (value: string) => void;
}

export function CampaignHeader({
  basePath,
  search,
  onSearchChange,
}: CampaignHeaderProps) {
  return (
    <AppHeader>
      <div className="flex items-center gap-2">
        <Button size="sm" asChild>
          <Link href={`${basePath}/campaigns/new`}>
            <Plus className="h-4 w-4 mr-1.5" />
            New Campaign
          </Link>
        </Button>

        <Button variant="outline" size="sm" asChild>
          <Link href={`${basePath}/campaigns/reporting`}>
            <BarChart3 className="h-4 w-4 mr-1.5" />
            Reporting
          </Link>
        </Button>

        <Button variant="outline" size="sm" asChild>
          <Link href={`${basePath}/campaigns/surveys`}>
            <ClipboardList className="h-4 w-4 mr-1.5" />
            Surveys
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search campaigns..."
            className="h-8 w-52 pl-8 text-sm"
          />
        </div>

        <Button variant="outline" size="sm" asChild>
          <Link href={`${basePath}/campaigns/keywords`}>
            <Hash className="h-4 w-4 mr-1.5" />
            Keywords
          </Link>
        </Button>
      </div>
    </AppHeader>
  );
}

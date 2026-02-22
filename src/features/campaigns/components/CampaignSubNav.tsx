"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface CampaignSubNavProps {
  basePath: string;
}

const TABS = [
  { href: "", label: "All Campaigns" },
  { href: "/sequences", label: "Sequences" },
  { href: "/email-templates", label: "Email Templates" },
  { href: "/segments", label: "Segments" },
];

export function CampaignSubNav({ basePath }: CampaignSubNavProps) {
  const pathname = usePathname();
  const campaignsBase = `${basePath}/campaigns`;

  return (
    <div className="border-b px-6">
      <div className="flex gap-1">
        {TABS.map((tab) => {
          const fullHref = `${campaignsBase}${tab.href}`;
          const isActive =
            tab.href === ""
              ? pathname === campaignsBase || pathname === `${campaignsBase}/`
              : pathname.startsWith(fullHref);

          return (
            <Link
              key={tab.label}
              href={fullHref}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? "border-teal-500 text-teal-600"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

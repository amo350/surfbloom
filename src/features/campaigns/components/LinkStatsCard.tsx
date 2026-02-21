"use client";

import { useState } from "react";
import {
  Link2,
  ExternalLink,
  MousePointerClick,
  ChevronDown,
  User,
} from "lucide-react";
import { useCampaignLinks, useLinkClicks } from "../hooks/use-campaign-links";

export function LinkStatsCard({ campaignId }: { campaignId: string }) {
  const { data: links, isLoading } = useCampaignLinks(campaignId);
  const [expandedLink, setExpandedLink] = useState<string | null>(null);

  if (isLoading || !links || links.length === 0) return null;

  const totalClicks = links.reduce((sum, l) => sum + l.clickCount, 0);

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b bg-muted/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-muted-foreground" />
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Link Tracking
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <MousePointerClick className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm font-semibold">
            {totalClicks.toLocaleString()}
          </span>
          <span className="text-xs text-muted-foreground">
            total click{totalClicks !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div className="divide-y">
        {links.map((link: any) => (
          <LinkRow
            key={link.id}
            link={link}
            isExpanded={expandedLink === link.id}
            onToggle={() =>
              setExpandedLink(expandedLink === link.id ? null : link.id)
            }
          />
        ))}
      </div>
    </div>
  );
}

function LinkRow({
  link,
  isExpanded,
  onToggle,
}: {
  link: any;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/10 transition-colors text-left"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <p className="text-sm truncate text-muted-foreground">
            {link.originalUrl}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-3">
          <div className="flex items-center gap-1">
            <MousePointerClick className="h-3 w-3 text-teal-500" />
            <span className="text-sm font-semibold">{link.clickCount}</span>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {isExpanded && <LinkClickList linkId={link.id} />}
    </div>
  );
}

function LinkClickList({ linkId }: { linkId: string }) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useLinkClicks(linkId, page);

  if (isLoading) {
    return (
      <div className="px-4 py-3 border-t bg-muted/5">
        <div className="h-4 w-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!data || data.clicks.length === 0) {
    return (
      <div className="px-4 py-3 border-t bg-muted/5">
        <p className="text-xs text-muted-foreground text-center">
          No clicks recorded yet
        </p>
      </div>
    );
  }

  return (
    <div className="border-t bg-muted/5">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left text-[10px] font-medium text-muted-foreground px-4 py-1.5">
              Contact
            </th>
            <th className="text-left text-[10px] font-medium text-muted-foreground px-3 py-1.5">
              Time
            </th>
          </tr>
        </thead>
        <tbody>
          {data.clicks.map((click: any) => {
            const contact = click.recipient?.contact;
            const name = contact
              ? [contact.firstName, contact.lastName].filter(Boolean).join(" ")
              : null;

            return (
              <tr key={click.id} className="border-b last:border-0">
                <td className="px-4 py-2">
                  {name ? (
                    <div className="flex items-center gap-1.5">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs font-medium">{name}</span>
                      {contact?.phone && (
                        <span className="text-[10px] text-muted-foreground">
                          {contact.phone}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Anonymous
                    </span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(click.createdAt).toLocaleString()}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {data.total > 20 && (
        <div className="flex items-center justify-between px-4 py-2 border-t">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="text-[10px] text-muted-foreground hover:text-foreground disabled:opacity-30"
          >
            Previous
          </button>
          <span className="text-[10px] text-muted-foreground">
            Page {page} of {Math.ceil(data.total / 20)}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= Math.ceil(data.total / 20)}
            className="text-[10px] text-muted-foreground hover:text-foreground disabled:opacity-30"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

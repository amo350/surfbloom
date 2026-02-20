"use client";

import { useState } from "react";
import {
  Search,
  Loader2,
  Users,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  useContacts,
  useExportContacts,
  useStages,
} from "../hooks/use-contacts";
import { ContactRow } from "./ContactRow";
import { CSVImportDialog } from "./CSVImportDialog";
import { CreateContactDialog } from "./CreateContactDialog";
import { MergeDuplicatesDialog } from "./MergeDuplicatesDialog";
import { StageManagerDialog } from "./StageManagerDialog";
import { StageBadge } from "./StageBadge";

export function ContactsList({
  workspaceId,
  workspaces,
}: {
  workspaceId?: string;
  workspaces?: { id: string; name: string }[];
}) {
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);

  const { data, isLoading } = useContacts({
    workspaceId,
    search: search || undefined,
    stage: stage || undefined,
    page,
    pageSize: 20,
  });

  const {
    refetch: refetchExport,
  } = useExportContacts({
    workspaceId,
    stage: stage || undefined,
    enabled: false,
  });

  const { data: stages } = useStages();

  const basePath = workspaceId
    ? `/workspaces/${workspaceId}/contacts`
    : "/index/contacts";

  const handleExport = async () => {
    setExporting(true);
    try {
      const { data } = await refetchExport();

      if (!data || data.length === 0) {
        toast.error("No contacts to export");
        setExporting(false);
        return;
      }

      const headers = [
        "First Name",
        "Last Name",
        "Email",
        "Phone",
        "Stage",
        "Source",
        "Categories",
        "Location",
        "Notes",
        "Conversations",
        "Activities",
        "Last Contacted",
        "Created",
      ];

      const rows = data.map((c: any) =>
        [
          c.firstName,
          c.lastName,
          c.email,
          c.phone,
          c.stage,
          c.source,
          c.categories,
          c.location,
          c.notes,
          c.conversations,
          c.totalActivities,
          c.lastContacted,
          c.created,
        ].map((v) => {
          const str = String(v ?? "");
          return str.includes(",") || str.includes('"') || str.includes("\n")
            ? `"${str.replace(/"/g, '""')}"`
            : str;
        }),
      );

      const csv = [headers.join(","), ...rows.map((r: string[]) => r.join(","))].join(
        "\n",
      );
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `contacts-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      toast.error(err.message || "Export failed");
    }
    setExporting(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="px-6 py-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search contacts..."
                className="pl-8 h-9 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <MergeDuplicatesDialog workspaceId={workspaceId} />
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={exporting}
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
              ) : (
                <Download className="h-4 w-4 mr-1.5" />
              )}
              Export
            </Button>
            <CSVImportDialog
              workspaceId={workspaceId}
              workspaces={workspaces}
            />
            <CreateContactDialog
              workspaceId={workspaceId}
              workspaces={workspaces}
            />
          </div>
        </div>

        {/* Stage filter pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => {
              setStage(undefined);
              setPage(1);
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              !stage
                ? "bg-foreground/10 text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All Stages
          </button>

          {(stages || []).map((s: any) => (
            <button
              key={s.slug}
              type="button"
              onClick={() => {
                setStage(s.slug === stage ? undefined : s.slug);
                setPage(1);
              }}
              className={`transition-opacity ${
                stage === s.slug ? "opacity-100" : "opacity-60 hover:opacity-100"
              }`}
            >
              <StageBadge stage={s.slug} name={s.name} color={s.color} />
            </button>
          ))}

          {!workspaceId && <StageManagerDialog />}
        </div>
      </div>

      {/* Column headers */}
      <div className="flex items-center gap-4 px-4 py-2 border-b bg-muted/30 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
        <div className="w-8 shrink-0" />
        <div className="flex-1">Name</div>
        <div className="hidden sm:block shrink-0 w-[100px]">Stage</div>
        <div className="hidden md:block shrink-0 w-[150px]">Categories</div>
        <div className="hidden lg:block shrink-0 w-[120px]">Location</div>
        <div className="hidden lg:block shrink-0 w-[70px]">Source</div>
        <div className="shrink-0 w-[80px] text-right">Created</div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && (!data?.items || data.items.length === 0) && (
          <div className="flex flex-col items-center justify-center py-16">
            <Users className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No contacts found</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              {search || stage
                ? "Try adjusting your filters"
                : "Add your first contact to get started"}
            </p>
          </div>
        )}

        {data?.items?.map((contact: any) => (
          <ContactRow key={contact.id} contact={contact} basePath={basePath} />
        ))}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <p className="text-xs text-muted-foreground">
            {data.totalCount} contact{data.totalCount !== 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page <= 1}
              className="h-7 text-xs"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="text-xs text-muted-foreground">
              {page} / {data.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(p + 1, data.totalPages))}
              disabled={page >= data.totalPages}
              className="h-7 text-xs"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { Inbox, Loader2, Plus, Search, User, UserX } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { StageBadge } from "@/features/contacts/components/StageBadge";
import {
  useCategories,
  useCreateCategory,
  useStages,
} from "@/features/contacts/hooks/use-contacts";

const VIEWS = [
  { value: "all" as const, label: "All Conversations", icon: Inbox },
  { value: "mine" as const, label: "My Conversations", icon: User },
  { value: "unassigned" as const, label: "Unassigned", icon: UserX },
];

export function ConversationsFilterSidebar({
  workspaceId,
  view,
  onViewChange,
  stage,
  onStageChange,
  categoryIds,
  onCategoryChange,
  channel,
  onChannelChange,
}: {
  workspaceId?: string;
  view: "all" | "mine" | "unassigned";
  onViewChange: (v: "all" | "mine" | "unassigned") => void;
  stage: string | undefined;
  onStageChange: (s: string | undefined) => void;
  categoryIds: string[];
  onCategoryChange: (ids: string[]) => void;
  channel: "all" | "webchat" | "sms" | "feedback";
  onChannelChange: (c: "all" | "webchat" | "sms" | "feedback") => void;
}) {
  const [catSearch, setCatSearch] = useState("");
  const [creating, setCreating] = useState(false);

  const { data: categories, isLoading: catsLoading } = useCategories(
    workspaceId,
    catSearch || undefined,
  );
  const { data: stages } = useStages();
  const createCategory = useCreateCategory();

  const handleCreateCategory = () => {
    if (!catSearch.trim()) {
      toast.error("Type a category name first");
      return;
    }
    if (!workspaceId) {
      toast.error("Open a workspace conversation view to create categories");
      return;
    }
    setCreating(true);
    createCategory.mutate(
      { workspaceId, name: catSearch.trim() },
      {
        onSuccess: () => {
          setCatSearch("");
          setCreating(false);
        },
        onError: () => setCreating(false),
      },
    );
  };

  return (
    <div className="w-[220px] border-r bg-muted/20 flex flex-col h-full shrink-0">
      {/* View toggles */}
      <div className="p-3 space-y-0.5">
        {VIEWS.map((v) => {
          const Icon = v.icon;
          return (
            <button
              key={v.value}
              type="button"
              onClick={() => onViewChange(v.value)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${
                view === v.value
                  ? "bg-background font-medium text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {v.label}
            </button>
          );
        })}
      </div>

      <div className="mx-3 border-t" />

      {/* Channel filter */}
      <div className="p-3 space-y-1.5">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1">
          Channel
        </p>
        <div className="flex flex-wrap gap-1">
          {[
            { value: "all" as const, label: "All" },
            { value: "webchat" as const, label: "Chat" },
            { value: "sms" as const, label: "SMS" },
            { value: "feedback" as const, label: "Feedback" },
          ].map((ch) => (
            <button
              key={ch.value}
              type="button"
              onClick={() => onChannelChange(ch.value)}
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors ${
                channel === ch.value
                  ? "bg-foreground/10 text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {ch.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-3 border-t" />

      {/* Stages */}
      <div className="p-3 space-y-1.5">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1">
          Stages
        </p>
        <div className="space-y-0.5">
          {(stages || []).map((s: any) => (
            <button
              key={s.slug}
              type="button"
              onClick={() =>
                onStageChange(stage === s.slug ? undefined : s.slug)
              }
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                stage === s.slug
                  ? "bg-background font-medium text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              }`}
            >
              <StageBadge stage={s.slug} name={s.name} color={s.color} />
            </button>
          ))}
        </div>
      </div>

      <div className="mx-3 border-t" />

      {/* Categories */}
      <div className="p-3 flex-1 flex flex-col min-h-0">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-1.5">
          Categories
        </p>

        {/* Search + create */}
        <div className="mb-2 flex items-center gap-1.5">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input
              value={catSearch}
              onChange={(e) => setCatSearch(e.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleCreateCategory();
                }
              }}
              placeholder="Search category..."
              className="pl-7 h-7 text-xs"
            />
          </div>
          <button
            type="button"
            onClick={handleCreateCategory}
            disabled={creating}
            className="h-7 w-7 inline-flex items-center justify-center rounded-md border text-teal-600 hover:bg-teal-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Add new category"
            aria-label="Add new category"
          >
            {creating ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Plus className="h-3 w-3" />
            )}
          </button>
        </div>

        {/* Category list */}
        <div className="flex-1 overflow-y-auto space-y-0.5">
          {catsLoading && (
            <div className="flex justify-center py-3">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
            </div>
          )}

          {categories?.map((cat: any) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                const isSelected = categoryIds.includes(cat.id);
                if (isSelected) {
                  onCategoryChange(categoryIds.filter((id) => id !== cat.id));
                  return;
                }
                onCategoryChange([...categoryIds, cat.id]);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                categoryIds.includes(cat.id)
                  ? "bg-teal-50 text-teal-700 ring-1 ring-teal-200 font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              }`}
            >
              <span className="truncate">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

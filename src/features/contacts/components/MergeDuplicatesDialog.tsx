"use client";

import { useState } from "react";
import {
  GitMerge,
  Loader2,
  Check,
  Phone,
  Mail,
  MessageSquare,
  Activity,
  ChevronDown,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useDuplicates, useMergeContacts } from "../hooks/use-contacts";
import { StageBadge } from "./StageBadge";

export function MergeDuplicatesDialog({
  workspaceId,
}: {
  workspaceId?: string;
}) {
  const [open, setOpen] = useState(false);
  const { data, isLoading, refetch } = useDuplicates(workspaceId);
  const merge = useMergeContacts();
  const [expandedGroup, setExpandedGroup] = useState<number | null>(null);
  const [selectedKeep, setSelectedKeep] = useState<Record<number, string>>({});

  const groups = data?.groups || [];

  const handleMerge = (groupIndex: number) => {
    const group = groups[groupIndex];
    if (!group) return;

    const keepId = selectedKeep[groupIndex] || group.contacts[0]?.id;
    if (!keepId) return;

    const mergeIds = group.contacts
      .map((c: any) => c.id)
      .filter((id: string) => id !== keepId);

    if (mergeIds.length === 0) return;

    merge.mutate(
      { keepId, mergeIds },
      {
        onSuccess: (result) => {
          toast.success(
            `Merged ${result.mergedCount} duplicate${result.mergedCount > 1 ? "s" : ""}`,
          );
          refetch();
          setExpandedGroup(null);
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <GitMerge className="h-4 w-4 mr-1.5" />
          Duplicates
          {groups.length > 0 && (
            <span className="ml-1.5 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-semibold">
              {groups.length}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitMerge className="h-4 w-4" />
            Duplicate Contacts
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto -mx-6 px-6">
          {isLoading && (
            <div className="flex justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {!isLoading && groups.length === 0 && (
            <div className="flex flex-col items-center py-12 text-center">
              <Check className="h-8 w-8 text-teal-500 mb-2" />
              <p className="text-sm font-medium">No duplicates found</p>
              <p className="text-xs text-muted-foreground mt-1">
                All contacts have unique phone numbers and emails
              </p>
            </div>
          )}

          <div className="space-y-3 pb-4">
            {groups.map((group: any, i: number) => {
              const isExpanded = expandedGroup === i;
              const keepId = selectedKeep[i] || group.contacts[0]?.id;

              return (
                <div key={i} className="border rounded-lg overflow-hidden">
                  {/* Group header */}
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedGroup(isExpanded ? null : i)
                    }
                    className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                      <span className="text-sm font-medium">
                        {group.contacts.length} contacts
                      </span>
                      <span className="text-xs text-muted-foreground">
                        same {group.matchField}:{" "}
                        <span className="font-mono">{group.matchValue}</span>
                      </span>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-muted-foreground transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Expanded — pick which to keep */}
                  {isExpanded && (
                    <div className="border-t px-3 py-3 space-y-2 bg-muted/10">
                      <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                        Select primary contact to keep
                      </p>

                      {group.contacts.map((contact: any) => {
                        const isKeep = contact.id === keepId;
                        const name =
                          [contact.firstName, contact.lastName]
                            .filter(Boolean)
                            .join(" ") || "Unnamed";

                        return (
                          <button
                            key={contact.id}
                            type="button"
                            onClick={() =>
                              setSelectedKeep((prev) => ({
                                ...prev,
                                [i]: contact.id,
                              }))
                            }
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors text-left ${
                              isKeep
                                ? "border-teal-300 bg-teal-50/50"
                                : "border-transparent hover:bg-muted/50"
                            }`}
                          >
                            {/* Radio */}
                            <div
                              className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                isKeep
                                  ? "border-teal-500"
                                  : "border-muted-foreground/30"
                              }`}
                            >
                              {isKeep && (
                                <div className="h-2 w-2 rounded-full bg-teal-500" />
                              )}
                            </div>

                            {/* Avatar */}
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shrink-0">
                              <span className="text-[10px] font-bold text-white">
                                {[
                                  contact.firstName?.[0],
                                  contact.lastName?.[0],
                                ]
                                  .filter(Boolean)
                                  .join("")
                                  .toUpperCase() || "?"}
                              </span>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium truncate">
                                  {name}
                                </span>
                                <StageBadge stage={contact.stage} />
                              </div>
                              <div className="flex items-center gap-3 mt-0.5">
                                {contact.phone && (
                                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                    <Phone className="h-2.5 w-2.5" />
                                    {contact.phone}
                                  </span>
                                )}
                                {contact.email && (
                                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                    <Mail className="h-2.5 w-2.5" />
                                    {contact.email}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-3 text-[10px] text-muted-foreground shrink-0">
                              <span className="flex items-center gap-0.5">
                                <MessageSquare className="h-2.5 w-2.5" />
                                {contact._count?.chatRooms || 0}
                              </span>
                              <span className="flex items-center gap-0.5">
                                <Activity className="h-2.5 w-2.5" />
                                {contact._count?.activities || 0}
                              </span>
                            </div>

                            {/* Badge */}
                            {isKeep && (
                              <span className="text-[10px] font-medium text-teal-600 shrink-0">
                                Keep
                              </span>
                            )}
                          </button>
                        );
                      })}

                      <div className="flex items-center justify-between pt-2">
                        <p className="text-[11px] text-muted-foreground">
                          {group.contacts.length - 1} contact
                          {group.contacts.length - 1 > 1 ? "s" : ""} will be
                          merged into the selected one. Conversations, activities,
                          and categories will be transferred.
                        </p>
                        <Button
                          size="sm"
                          onClick={() => handleMerge(i)}
                          disabled={merge.isPending}
                        >
                          {merge.isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                          ) : (
                            <GitMerge className="h-3.5 w-3.5 mr-1" />
                          )}
                          Merge
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

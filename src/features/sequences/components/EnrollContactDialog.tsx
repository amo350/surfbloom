"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search, UserPlus, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useTRPC } from "@/trpc/client";
import { useEnrollContacts } from "../hooks/use-sequences";

interface EnrollContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sequenceId: string;
  workspaceId: string;
}

export function EnrollContactDialog({
  open,
  onOpenChange,
  sequenceId,
  workspaceId,
}: EnrollContactDialogProps) {
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const trpc = useTRPC();
  const enrollContacts = useEnrollContacts();

  const { data, isFetching } = useQuery({
    ...trpc.contacts.getContacts.queryOptions({
      workspaceId,
      search: submittedSearch || undefined,
      page: 1,
      pageSize: 20,
    } as any),
    enabled: !!workspaceId && open && submittedSearch.length > 0,
  });

  const contacts = data?.items || [];

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleEnroll = () => {
    if (selected.size === 0) {
      toast.error("Select at least one contact");
      return;
    }

    enrollContacts.mutate(
      {
        sequenceId,
        contactIds: Array.from(selected),
      },
      {
        onSuccess: (result) => {
          toast.success(
            `Enrolled ${result.enrolled} contact${result.enrolled !== 1 ? "s" : ""}${
              result.skipped > 0 ? ` (${result.skipped} skipped)` : ""
            }`,
          );
          onOpenChange(false);
          setSearch("");
          setSubmittedSearch("");
          setSelected(new Set());
        },
        onError: (err) => toast.error(err?.message || "Failed"),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Enroll Contacts
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setSubmittedSearch(search.trim());
                }}
                placeholder="Search by name, phone, email..."
                className="h-9 pl-8 text-sm"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSubmittedSearch(search.trim())}
              disabled={!search.trim()}
            >
              {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
            </Button>
          </div>

          <div className="rounded-lg border max-h-[300px] overflow-y-auto divide-y">
            {contacts.map((contact: any) => {
              const isSelected = selected.has(contact.id);
              const displayName =
                [contact.firstName, contact.lastName].filter(Boolean).join(" ") ||
                contact.phone ||
                contact.email ||
                "Unknown";

              return (
                <button
                  key={contact.id}
                  type="button"
                  onClick={() => toggleSelect(contact.id)}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between gap-2 hover:bg-muted/30 ${
                    isSelected ? "bg-teal-50/50" : ""
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {[contact.phone, contact.email, contact.stage]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-teal-600 shrink-0" />}
                </button>
              );
            })}

            {submittedSearch && !isFetching && contacts.length === 0 && (
              <div className="p-6 text-sm text-muted-foreground text-center">
                No contacts found. Try a different search.
              </div>
            )}
            {!submittedSearch && (
              <div className="p-6 text-sm text-muted-foreground text-center">
                Search for contacts to enroll in this sequence.
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{selected.size} selected</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleEnroll}
                disabled={enrollContacts.isPending || selected.size === 0}
              >
                {enrollContacts.isPending && (
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                )}
                Enroll {selected.size > 0 ? `(${selected.size})` : ""}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

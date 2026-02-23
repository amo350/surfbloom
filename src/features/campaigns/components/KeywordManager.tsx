"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Plus,
  Loader2,
  MessageSquareText,
  Trash2,
  Users,
  Power,
  PowerOff,
  Copy,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { AppHeader, AppHeaderTitle } from "@/components/AppHeader";
import {
  useKeywords,
  useUpdateKeyword,
  useDeleteKeyword,
} from "../hooks/use-keywords";
import { KeywordDialog } from "./KeywordDialog";
import { QRCodeDialog } from "./QRCodeDialog";

export function KeywordManager({
  workspaceId,
  basePath,
}: {
  workspaceId?: string;
  basePath?: string;
}) {
  const resolvedBasePath = basePath || (workspaceId ? `/workspaces/${workspaceId}` : "/index");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: keywords, isLoading } = useKeywords(workspaceId);
  const updateKeyword = useUpdateKeyword();
  const deleteKeyword = useDeleteKeyword();

  const handleToggleActive = (id: string, active: boolean) => {
    updateKeyword.mutate(
      { id, active: !active },
      {
        onSuccess: () =>
          toast.success(active ? "Keyword paused" : "Keyword activated"),
        onError: (err) => toast.error(err?.message || "Failed"),
      },
    );
  };

  const handleDelete = (id: string) => {
    deleteKeyword.mutate(
      { id },
      {
        onSuccess: () => toast.success("Keyword deleted"),
        onError: (err) => toast.error(err?.message || "Failed"),
      },
    );
  };

  const handleCopyPromo = (keyword: string, phone: string) => {
    const text = `Text ${keyword} to ${phone}`;
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="h-full flex flex-col">
      <AppHeader>
        <div className="flex items-center gap-2 flex-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link href={`${resolvedBasePath}/campaigns`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <AppHeaderTitle title="Text-to-Join Keywords" />
        </div>
      </AppHeader>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Customers text a keyword to your number to join your contact list
          </p>
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            New Keyword
          </Button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Keywords list */}
        {!isLoading && keywords && keywords.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {keywords.map((kw: any) => {
              const phone =
                kw.workspace?.twilioPhoneNumber?.phoneNumber || "No number";

              return (
                <div
                  key={kw.id}
                  className={`border rounded-lg p-4 transition-colors ${
                    kw.active ? "" : "opacity-50"
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold font-mono">
                          {kw.keyword}
                        </span>
                        {!kw.active && (
                          <span className="text-[10px] font-medium text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                            Paused
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {kw.workspace?.name}
                      </p>
                    </div>

                    <div className="flex items-center gap-0.5">
                      <QRCodeDialog keywordId={kw.id} keywordText={kw.keyword} />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleToggleActive(kw.id, kw.active)}
                      >
                        {kw.active ? (
                          <PowerOff className="h-3 w-3" />
                        ) : (
                          <Power className="h-3 w-3" />
                        )}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete keyword "{kw.keyword}"?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This won't delete contacts who already joined via
                              this keyword.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(kw.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  {/* Promo text */}
                  <div className="rounded-lg border bg-muted/10 px-3 py-2 mb-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium font-mono">
                        Text {kw.keyword} to {phone}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleCopyPromo(kw.keyword, phone)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Share on receipts, signage, and social media
                    </p>
                  </div>

                  {/* Auto-reply preview */}
                  <div className="rounded-lg bg-slate-50 border px-3 py-2 mb-3">
                    <p className="text-[10px] font-medium text-muted-foreground mb-1">
                      Auto-reply
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {kw.autoReply}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs font-medium">
                        {kw.contactCount}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        signup{kw.contactCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      Stage: {kw.stage.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty */}
        {!isLoading && (!keywords || keywords.length === 0) && (
          <div className="flex flex-col items-center py-16 text-center">
            <MessageSquareText className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">
              No keywords yet
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1 max-w-xs">
              Create a keyword so customers can text it to your number and
              automatically join your contact list
            </p>
          </div>
        )}
      </div>

      <KeywordDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        workspaceId={workspaceId}
      />
    </div>
  );
}

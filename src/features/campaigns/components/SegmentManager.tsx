"use client";

import { ArrowLeft, Bookmark, Loader2, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { AppHeader, AppHeaderTitle } from "@/components/AppHeader";
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
import { Button } from "@/components/ui/button";
import { useDeleteSegment, useSegments } from "../hooks/use-segments";

const AUDIENCE_LABELS: Record<string, string> = {
  all: "All contacts",
  stage: "By stage",
  category: "By category",
  inactive: "Inactive contacts",
};

type Segment = {
  id: string;
  name: string;
  audienceType: string;
  audienceStage: string | null;
  audienceInactiveDays: number | null;
  frequencyCapDays: number | null;
  _count?: {
    campaigns?: number;
  };
};

export function SegmentManager({ workspaceId }: { workspaceId?: string }) {
  const basePath = workspaceId ? `/workspaces/${workspaceId}` : "/index";
  const { data: segments, isLoading } = useSegments();
  const deleteSegment = useDeleteSegment();

  const handleDelete = (id: string) => {
    deleteSegment.mutate(
      { id },
      {
        onSuccess: () => toast.success("Segment deleted"),
        onError: (err) => toast.error(err?.message || "Failed"),
      },
    );
  };

  return (
    <div className="h-full flex flex-col">
      <AppHeader>
        <div className="flex items-center gap-2 flex-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link href={`${basePath}/campaigns`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <AppHeaderTitle title="Saved Segments" />
        </div>
      </AppHeader>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <p className="text-sm text-muted-foreground">
          Manage reusable campaign audiences for
          {workspaceId ? " this workspace" : " your campaigns"}.
        </p>

        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && (segments?.length ?? 0) > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(segments as Segment[]).map((segment) => (
              <div key={segment.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">{segment.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {AUDIENCE_LABELS[segment.audienceType] ||
                        segment.audienceType}
                      {segment.audienceType === "stage" && segment.audienceStage
                        ? ` · ${segment.audienceStage}`
                        : ""}
                      {segment.audienceType === "inactive" &&
                      segment.audienceInactiveDays
                        ? ` · ${segment.audienceInactiveDays}+ days`
                        : ""}
                      {segment.frequencyCapDays
                        ? ` · ${segment.frequencyCapDays}d cap`
                        : ""}
                    </p>
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Delete segment "{segment.name}"?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Campaigns already using this segment are not changed.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(segment.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  <span>
                    Used by {segment._count?.campaigns ?? 0} campaign
                    {(segment._count?.campaigns ?? 0) === 1 ? "" : "s"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && (segments?.length ?? 0) === 0 && (
          <div className="flex flex-col items-center py-16 text-center">
            <Bookmark className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">
              No saved segments yet
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1 max-w-xs">
              Save an audience from campaign builder to reuse it later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  Loader2,
  StopCircle,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
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
import { useEnrollments, useStopEnrollment } from "../hooks/use-sequences";

const STATUS_FILTERS: Array<{
  value: "active" | "completed" | "stopped" | "opted_out" | undefined;
  label: string;
}> = [
  { value: undefined, label: "All" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "stopped", label: "Stopped" },
  { value: "opted_out", label: "Opted Out" },
];

const STATUS_ICONS = {
  active: <Clock className="h-3.5 w-3.5 text-teal-600" />,
  completed: <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />,
  stopped: <StopCircle className="h-3.5 w-3.5 text-amber-600" />,
  opted_out: <XCircle className="h-3.5 w-3.5 text-red-600" />,
} as const;

interface EnrollmentTableProps {
  sequenceId: string;
  totalSteps: number;
}

export function EnrollmentTable({ sequenceId, totalSteps }: EnrollmentTableProps) {
  const [statusFilter, setStatusFilter] = useState<
    "active" | "completed" | "stopped" | "opted_out" | undefined
  >(undefined);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useEnrollments(sequenceId, statusFilter, page);
  const stopEnrollment = useStopEnrollment();

  const handleStop = (enrollmentId: string) => {
    stopEnrollment.mutate(
      { enrollmentId, reason: "manual" },
      {
        onSuccess: () => toast.success("Enrollment stopped"),
        onError: (err) => toast.error(err?.message || "Failed"),
      },
    );
  };

  const totalPages = data ? Math.ceil(data.total / data.limit) : 0;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-1">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.label}
            type="button"
            onClick={() => {
              setStatusFilter(f.value);
              setPage(1);
            }}
            className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
              statusFilter === f.value
                ? "bg-slate-900 text-white"
                : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="flex justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {!isLoading && data && data.enrollments.length > 0 && (
        <>
          <div className="rounded-lg border divide-y">
            {data.enrollments.map((enrollment: any) => {
              const contact = enrollment.contact;
              const displayName =
                [contact.firstName, contact.lastName].filter(Boolean).join(" ") ||
                contact.phone ||
                contact.email ||
                "Unknown";

              return (
                <div key={enrollment.id} className="p-3 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      {STATUS_ICONS[enrollment.status as keyof typeof STATUS_ICONS] ||
                        STATUS_ICONS.active}
                      <p className="text-sm font-medium truncate">{displayName}</p>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                      <p>
                        Step {enrollment.currentStep}/{Math.max(totalSteps, 1)}
                      </p>
                      <p>Enrolled {new Date(enrollment.enrolledAt).toLocaleDateString()}</p>
                      {enrollment.status === "active" && enrollment.nextStepAt && (
                        <p>Next: {new Date(enrollment.nextStepAt).toLocaleString()}</p>
                      )}
                      {enrollment.completedAt && (
                        <p>Completed {new Date(enrollment.completedAt).toLocaleDateString()}</p>
                      )}
                      {enrollment.stoppedAt && (
                        <p>
                          Stopped {new Date(enrollment.stoppedAt).toLocaleDateString()}
                          {enrollment.stoppedReason ? ` (${enrollment.stoppedReason})` : ""}
                        </p>
                      )}
                    </div>
                  </div>

                  {enrollment.status === "active" && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive">
                          <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
                          Stop
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Stop enrollment?</AlertDialogTitle>
                          <AlertDialogDescription>
                            {displayName} will stop receiving messages from this sequence.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleStop(enrollment.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Stop
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Prev
              </Button>
              <p className="text-xs text-muted-foreground">
                {page} / {totalPages} ({data.total} total)
              </p>
              <Button
                variant="ghost"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {!isLoading && data && data.enrollments.length === 0 && (
        <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
          {statusFilter
            ? `No ${statusFilter.replace("_", " ")} enrollments`
            : "No enrollments yet"}
        </div>
      )}
    </div>
  );
}

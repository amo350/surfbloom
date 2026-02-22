"use client";

import {
  Workflow,
  CheckCircle,
  Clock,
  StopCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; text: string; color: string }> = {
  active: {
    icon: <Clock className="h-3 w-3 text-blue-500" />,
    text: "Active",
    color: "text-blue-600",
  },
  completed: {
    icon: <CheckCircle className="h-3 w-3 text-emerald-500" />,
    text: "Completed",
    color: "text-emerald-600",
  },
  stopped: {
    icon: <StopCircle className="h-3 w-3 text-amber-500" />,
    text: "Stopped",
    color: "text-amber-600",
  },
  opted_out: {
    icon: <XCircle className="h-3 w-3 text-red-500" />,
    text: "Opted Out",
    color: "text-red-600",
  },
};

interface ContactSequenceCardProps {
  contactId: string;
}

export function ContactSequenceCard({ contactId }: ContactSequenceCardProps) {
  const trpc = useTRPC();
  const { data: enrollments, isLoading } = useQuery(
    trpc.sequences.getContactEnrollments.queryOptions({ contactId }),
  );

  if (isLoading) {
    return (
      <div className="border rounded-lg p-3 flex justify-center">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!enrollments || enrollments.length === 0) return null;

  return (
    <div className="border rounded-lg bg-white">
      <div className="px-3 py-2 border-b bg-muted/5 flex items-center gap-2">
        <Workflow className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-semibold">Drip Sequences</span>
        <span className="text-[10px] text-muted-foreground ml-auto">
          {enrollments.length}
        </span>
      </div>

      <div className="divide-y">
        {enrollments.map((enrollment: any) => {
          const config = STATUS_CONFIG[enrollment.status] || STATUS_CONFIG.active;

          return (
            <div key={enrollment.id} className="px-3 py-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium truncate">
                  {enrollment.sequence.name}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  {config.icon}
                  <span className={`text-[10px] font-medium ${config.color}`}>
                    {config.text}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px] text-muted-foreground">
                  Step {enrollment.currentStep}/{enrollment.sequence._count.steps}
                </span>

                {enrollment.status === "active" && enrollment.nextStepAt && (
                  <span className="text-[10px] text-muted-foreground">
                    Next: {new Date(enrollment.nextStepAt).toLocaleString()}
                  </span>
                )}

                <span className="text-[10px] text-muted-foreground">
                  Enrolled {new Date(enrollment.enrolledAt).toLocaleDateString()}
                </span>
              </div>

              {enrollment.stoppedReason && (
                <p className="text-[10px] text-amber-600 mt-0.5">
                  Reason: {enrollment.stoppedReason}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

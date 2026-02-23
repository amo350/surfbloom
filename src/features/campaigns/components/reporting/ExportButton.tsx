"use client";

import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useReportingExportCsv } from "@/features/campaigns/hooks/use-reporting";

export function ExportButton({
  workspaceId,
  days,
  channel,
}: {
  workspaceId?: string;
  days: number;
  channel: "all" | "sms" | "email";
}) {
  const exportCsv = useReportingExportCsv();

  const handleExport = async () => {
    try {
      const csvData = await exportCsv.mutateAsync({
        workspaceId,
        days,
        channel,
      });

      const blob = new Blob([csvData], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      try {
        a.href = url;
        a.download = `surfbloom-campaign-report-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
      } finally {
        if (a.parentNode) {
          a.parentNode.removeChild(a);
        }
        URL.revokeObjectURL(url);
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to export CSV");
    }
  };

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleExport}
      disabled={exportCsv.isPending}
    >
      {exportCsv.isPending ? (
        <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
      ) : (
        <Download className="h-3.5 w-3.5 mr-1.5" />
      )}
      Export CSV
    </Button>
  );
}

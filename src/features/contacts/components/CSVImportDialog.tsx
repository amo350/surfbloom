"use client";

import { useState, useCallback } from "react";
import {
  Upload,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  Loader2,
  FileSpreadsheet,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useBatchCreateContacts } from "../hooks/use-contacts";
import {
  parseCSV,
  autoMapColumns,
  applyMapping,
  CONTACT_FIELDS,
  type ParsedCSV,
  type ColumnMapping,
} from "@/lib/csv-parser";

const VALID_STAGES = [
  "new_lead",
  "prospecting",
  "appointment",
  "payment",
  "not_a_fit",
  "lost",
];

type Step = "upload" | "map" | "preview";

export function CSVImportDialog({
  workspaceId,
  workspaces,
}: {
  workspaceId?: string;
  workspaces?: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("upload");
  const [selectedWorkspace, setSelectedWorkspace] = useState(workspaceId || "");
  const [csv, setCsv] = useState<ParsedCSV | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [fileName, setFileName] = useState("");

  const batchCreate = useBatchCreateContacts();

  const reset = () => {
    setStep("upload");
    setCsv(null);
    setMapping({});
    setFileName("");
    setSelectedWorkspace(workspaceId || "");
  };

  const handleFile = useCallback((file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCSV(text);

      if (parsed.headers.length === 0) {
        toast.error("Could not parse CSV — no headers found");
        return;
      }

      setCsv(parsed);
      setMapping(autoMapColumns(parsed.headers));
      setStep("map");
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && (file.name.endsWith(".csv") || file.type === "text/csv")) {
        handleFile(file);
      } else {
        toast.error("Please drop a .csv file");
      }
    },
    [handleFile],
  );

  const mappedFields = Object.values(mapping).filter(Boolean);
  const hasFirstName = mappedFields.includes("firstName");

  const mappedContacts = csv
    ? applyMapping(csv.rows, csv.headers, mapping).filter((c) =>
        c.firstName?.trim(),
      )
    : [];

  const handleImport = () => {
    if (!selectedWorkspace) {
      toast.error("Select a location");
      return;
    }

    if (mappedContacts.length === 0) {
      toast.error("No valid contacts to import");
      return;
    }

    if (mappedContacts.length > 500) {
      toast.error("Maximum 500 contacts per import. Please split your CSV.");
      return;
    }

    batchCreate.mutate(
      {
        workspaceId: selectedWorkspace,
        contacts: mappedContacts.map((c) => ({
          firstName: c.firstName,
          lastName: c.lastName,
          email: c.email,
          phone: c.phone,
          stage: (VALID_STAGES.includes(c.stage?.toLowerCase?.())
            ? c.stage.toLowerCase()
            : "new_lead") as any,
          source: "csv" as any,
          notes: c.notes,
        })),
      },
      {
        onSuccess: (result) => {
          toast.success(
            `Imported ${result.created} contacts${result.skipped > 0 ? ` (${result.skipped} duplicates skipped)` : ""}`,
          );
          reset();
          setOpen(false);
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-1.5" />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {step === "upload" && "Import Contacts"}
            {step === "map" && "Map Columns"}
            {step === "preview" && "Review Import"}
          </DialogTitle>
        </DialogHeader>

        {/* Step 1: Upload */}
        {step === "upload" && (
          <div className="space-y-4 mt-2">
            {/* Location picker */}
            {!workspaceId && workspaces && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">
                  Location
                </p>
                <Select
                  value={selectedWorkspace}
                  onValueChange={setSelectedWorkspace}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {workspaces.map((ws) => (
                      <SelectItem key={ws.id} value={ws.id}>
                        {ws.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Drop zone */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center gap-3 hover:border-teal-400 hover:bg-teal-50/30 transition-colors cursor-pointer"
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = ".csv";
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) handleFile(file);
                };
                input.click();
              }}
            >
              <FileSpreadsheet className="h-10 w-10 text-muted-foreground/40" />
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  Drop a CSV file here or click to browse
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  First row should be column headers
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Column mapping */}
        {step === "map" && csv && (
          <div className="space-y-4 mt-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{fileName}</span>{" "}
                — {csv.rowCount} rows, {csv.headers.length} columns
              </p>
            </div>

            <div className="border rounded-lg divide-y max-h-[300px] overflow-y-auto">
              {csv.headers.map((header) => (
                <div
                  key={header}
                  className="flex items-center justify-between px-3 py-2.5"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm truncate max-w-[180px]">
                      {header}
                    </span>
                    <span className="text-[10px] text-muted-foreground/50 shrink-0">
                      e.g. "{csv.rows[0]?.[csv.headers.indexOf(header)] || ""}"
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/30" />
                    <Select
                      value={mapping[header] || "skip"}
                      onValueChange={(v) =>
                        setMapping((prev) => ({
                          ...prev,
                          [header]: v === "skip" ? null : v,
                        }))
                      }
                    >
                      <SelectTrigger className="h-8 w-[140px] text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          value="skip"
                          className="text-xs text-muted-foreground"
                        >
                          Skip column
                        </SelectItem>
                        {CONTACT_FIELDS.map((f) => (
                          <SelectItem
                            key={f.key}
                            value={f.key}
                            className="text-xs"
                          >
                            {f.label}
                            {f.required && " *"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>

            {!hasFirstName && (
              <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 text-amber-700 rounded-lg text-xs">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                Map at least one column to "First Name" (required)
              </div>
            )}

            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep("upload")}
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                Back
              </Button>
              <Button
                size="sm"
                onClick={() => setStep("preview")}
                disabled={!hasFirstName}
              >
                Preview
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Preview */}
        {step === "preview" && (
          <div className="space-y-4 mt-2">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
                {mappedContacts.length}
              </span>{" "}
              contacts ready to import
              {csv && mappedContacts.length < csv.rowCount && (
                <span className="text-amber-600">
                  {" "}
                  ({csv.rowCount - mappedContacts.length} rows skipped — missing
                  first name)
                </span>
              )}
            </p>

            {/* Preview table */}
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto max-h-[280px]">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      {CONTACT_FIELDS.filter((f) =>
                        mappedFields.includes(f.key),
                      ).map((f) => (
                        <th
                          key={f.key}
                          className="text-left px-3 py-2 font-medium text-muted-foreground"
                        >
                          {f.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {mappedContacts.slice(0, 10).map((contact, i) => (
                      <tr key={i} className="hover:bg-muted/20">
                        {CONTACT_FIELDS.filter((f) =>
                          mappedFields.includes(f.key),
                        ).map((f) => (
                          <td
                            key={f.key}
                            className="px-3 py-2 truncate max-w-[150px]"
                          >
                            {contact[f.key] || "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {mappedContacts.length > 10 && (
                <div className="px-3 py-1.5 bg-muted/30 text-[10px] text-muted-foreground text-center">
                  and {mappedContacts.length - 10} more...
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => setStep("map")}>
                <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                Back
              </Button>
              <Button
                size="sm"
                onClick={handleImport}
                disabled={batchCreate.isPending || mappedContacts.length === 0}
              >
                {batchCreate.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                ) : (
                  <Check className="h-3.5 w-3.5 mr-1" />
                )}
                Import {mappedContacts.length} Contacts
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

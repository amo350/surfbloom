"use client";

import { useState } from "react";
import { QrCode, Download, Loader2, Palette, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useKeywordQR } from "../hooks/use-keywords";

const COLOR_PRESETS = [
  { label: "Classic", dark: "#000000", light: "#FFFFFF" },
  { label: "Navy", dark: "#1e3a5f", light: "#FFFFFF" },
  { label: "Forest", dark: "#14532d", light: "#FFFFFF" },
  { label: "Charcoal", dark: "#374151", light: "#f9fafb" },
  { label: "Teal", dark: "#0d9488", light: "#FFFFFF" },
  { label: "Inverted", dark: "#FFFFFF", light: "#111827" },
];

export function QRCodeDialog({
  keywordId,
  keywordText,
}: {
  keywordId: string;
  keywordText: string;
}) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<"png" | "svg">("png");
  const [colorIdx, setColorIdx] = useState(0);

  const colors = COLOR_PRESETS[colorIdx];

  const { data: qr, isLoading } = useKeywordQR(open ? keywordId : null, {
    format,
    darkColor: colors.dark,
    lightColor: colors.light,
  });

  const handleDownload = () => {
    if (!qr) return;

    if (qr.format === "svg") {
      const blob = new Blob([qr.data], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${qr.keyword}-qr.svg`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const a = document.createElement("a");
      a.href = qr.data;
      a.download = `${qr.keyword}-qr.png`;
      a.click();
    }

    toast.success("QR code downloaded");
  };

  const handleCopyPromo = () => {
    if (!qr) return;
    navigator.clipboard
      .writeText(`Scan to text ${qr.keyword} to ${qr.phone}`)
      .then(() => toast.success("Copied"))
      .catch(() => toast.error("Failed to copy"));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <QrCode className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-4 w-4 text-teal-600" />
            QR Code — {keywordText}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* QR Preview */}
          <div className="flex justify-center">
            {isLoading ? (
              <div className="h-64 w-64 flex items-center justify-center border rounded-lg">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : qr?.format === "svg" ? (
              <div
                className="h-64 w-64 border rounded-lg overflow-hidden"
                dangerouslySetInnerHTML={{ __html: qr.data }}
              />
            ) : qr?.data ? (
              <img
                src={qr.data}
                alt={`QR code for ${keywordText}`}
                className="h-64 w-64 border rounded-lg"
              />
            ) : null}
          </div>

          {/* Caption */}
          {qr && (
            <div className="text-center">
              <p className="text-sm font-semibold">
                Text {qr.keyword} to {qr.phone}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {qr.businessName}
              </p>
            </div>
          )}

          {/* Color presets */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Palette className="h-3 w-3 text-muted-foreground" />
              <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                Style
              </label>
            </div>
            <div className="flex gap-1.5">
              {COLOR_PRESETS.map((preset, i) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setColorIdx(i)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-medium transition-colors ${
                    colorIdx === i
                      ? "border-teal-300 bg-teal-50/50"
                      : "border-border hover:bg-muted/30"
                  }`}
                >
                  <div
                    className="h-3 w-3 rounded-sm border"
                    style={{ backgroundColor: preset.dark }}
                  />
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Format toggle */}
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              Format
            </label>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setFormat("png")}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  format === "png"
                    ? "bg-slate-900 text-white"
                    : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                }`}
              >
                PNG
              </button>
              <button
                type="button"
                onClick={() => setFormat("svg")}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  format === "svg"
                    ? "bg-slate-900 text-white"
                    : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                }`}
              >
                SVG
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyPromo}
              disabled={!qr}
            >
              <Copy className="h-3.5 w-3.5 mr-1.5" />
              Copy Caption
            </Button>
            <Button size="sm" onClick={handleDownload} disabled={!qr}>
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Download {format.toUpperCase()}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { FileText, Search, Library, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTemplates } from "../hooks/use-templates";
import { TEMPLATE_CATEGORIES } from "../server/library-templates";
import { TemplateCategoryBadge } from "./TemplateCategoryBadge";
import { previewTemplate } from "../lib/tokens";

export function TemplatePicker({
  onSelect,
  selectedId,
}: {
  onSelect: (template: {
    id: string;
    name: string;
    body: string;
    subject?: string | null;
  }) => void;
  selectedId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState("");

  const { data: templates, isLoading } = useTemplates({
    category,
    search: search.trim() || undefined,
  });

  const handleSelect = (template: any) => {
    onSelect({
      id: template.id,
      name: template.name,
      body: template.body,
      subject: template.subject,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" type="button">
          <FileText className="h-3.5 w-3.5 mr-1.5" />
          {selectedId ? "Change Template" : "Use Template"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl max-h-[70vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Choose a Template</DialogTitle>
        </DialogHeader>

        {/* Filters */}
        <div className="flex items-center gap-2 border-b pb-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates..."
              className="h-8 pl-8 text-xs"
            />
          </div>
        </div>

        <div className="flex items-center gap-1 flex-wrap">
          <button
            type="button"
            onClick={() => setCategory(undefined)}
            className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors ${
              !category
                ? "bg-foreground/10 text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
          {TEMPLATE_CATEGORIES.filter((c) => c.value !== "custom").map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() =>
                setCategory(category === c.value ? undefined : c.value)
              }
              className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors ${
                category === c.value
                  ? "bg-foreground/10 text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Template list */}
        <div className="flex-1 overflow-y-auto -mx-6 px-6 space-y-1.5 py-2">
          {isLoading && (
            <div className="flex justify-center py-8">
              <div className="h-5 w-5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
            </div>
          )}

          {templates?.map((t: any) => {
            const isSelected = t.id === selectedId;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => handleSelect(t)}
                className={`w-full text-left px-3 py-3 rounded-lg border transition-colors ${
                  isSelected
                    ? "border-teal-300 bg-teal-50/50"
                    : "border-border hover:bg-muted/30"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <p className="text-sm font-medium truncate">{t.name}</p>
                    {t.isLibrary && (
                      <Library className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                    )}
                    <TemplateCategoryBadge category={t.category} />
                  </div>
                  {isSelected && (
                    <Check className="h-4 w-4 text-teal-600 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                  {previewTemplate(t.body)}
                </p>
              </button>
            );
          })}

          {!isLoading && (templates?.length || 0) === 0 && (
            <div className="text-center py-8 text-xs text-muted-foreground">
              No templates found
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

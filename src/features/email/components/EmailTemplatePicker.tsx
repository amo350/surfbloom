"use client";

import { useState } from "react";
import { Mail, Check, Search, Library } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useEmailTemplates,
  useEmailCategories,
} from "../hooks/use-email-templates";
import { TemplateCategoryBadge } from "@/features/campaigns/components/TemplateCategoryBadge";

export function EmailTemplatePicker({
  selectedId,
  onSelect,
}: {
  selectedId?: string;
  onSelect: (template: {
    id: string;
    name: string;
    subject: string;
    htmlBody: string;
  }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState("");

  const { data: templates } = useEmailTemplates({
    category,
    search: search.trim() || undefined,
  });
  const { data: categories } = useEmailCategories();

  const handleSelect = (t: any) => {
    onSelect({
      id: t.id,
      name: t.name,
      subject: t.subject,
      htmlBody: t.htmlBody,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" type="button">
          <Mail className="h-3.5 w-3.5 mr-1.5" />
          {selectedId ? "Change Template" : "Use Template"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[70vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Email Templates</DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="h-9 pl-8 text-sm"
          />
        </div>

        {/* Category pills */}
        <div className="flex gap-1 flex-wrap">
          <button
            type="button"
            onClick={() => setCategory(undefined)}
            className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
              !category
                ? "bg-slate-900 text-white"
                : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
            }`}
          >
            All
          </button>
          {(categories || []).map((c: any) => (
            <button
              key={c.value}
              type="button"
              onClick={() =>
                setCategory(c.value === category ? undefined : c.value)
              }
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                category === c.value
                  ? "bg-slate-900 text-white"
                  : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Templates list */}
        <div className="flex-1 overflow-y-auto space-y-1.5 py-1">
          {templates?.map((t: any) => {
            const isSelected = t.id === selectedId;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => handleSelect(t)}
                className={`w-full text-left px-3 py-2.5 rounded-lg border transition-colors ${
                  isSelected
                    ? "border-teal-300 bg-teal-50/50"
                    : "border-border hover:bg-muted/30"
                }`}
              >
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate flex-1">
                    {t.name}
                  </p>
                  {t.isLibrary && (
                    <Library className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                  )}
                  <TemplateCategoryBadge category={t.category} />
                  {isSelected && (
                    <Check className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                  Subject: {t.subject}
                </p>
              </button>
            );
          })}

          {templates?.length === 0 && (
            <div className="flex flex-col items-center py-8 text-center">
              <Mail className="h-6 w-6 text-muted-foreground/30 mb-2" />
              <p className="text-xs text-muted-foreground">
                {search ? "No templates match" : "No email templates yet"}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

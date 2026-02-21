"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Copy,
  Pencil,
  Trash2,
  Library,
  Loader2,
  FileText,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  useTemplates,
  useDeleteTemplate,
  useDuplicateTemplate,
} from "../hooks/use-templates";
import { TEMPLATE_CATEGORIES } from "../server/library-templates";
import { TemplateCategoryBadge } from "./TemplateCategoryBadge";
import { TemplateDialog } from "./TemplateDialog";
import { previewTemplate } from "../lib/tokens";

export function TemplateManager() {
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);

  const { data: templates, isLoading } = useTemplates({
    category,
    search: search.trim() || undefined,
  });
  const deleteTemplate = useDeleteTemplate();
  const duplicateTemplate = useDuplicateTemplate();

  const handleEdit = (template: any) => {
    setEditingTemplate(template);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingTemplate(null);
    setDialogOpen(true);
  };

  const handleDuplicate = (id: string) => {
    duplicateTemplate.mutate(
      { id },
      {
        onSuccess: () => toast.success("Template duplicated"),
        onError: (err) => toast.error(err?.message || "Failed to duplicate"),
      },
    );
  };

  const handleDelete = (id: string) => {
    deleteTemplate.mutate(
      { id },
      {
        onSuccess: () => toast.success("Template deleted"),
        onError: (err) => toast.error(err?.message || "Failed to delete"),
      },
    );
  };

  const libraryTemplates = templates?.filter((t: any) => t.isLibrary) || [];
  const customTemplates = templates?.filter((t: any) => !t.isLibrary) || [];

  return (
    <div className="h-full flex flex-col">
      <AppHeader>
        <AppHeaderTitle title="Templates" />
      </AppHeader>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setCategory(undefined)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                !category
                  ? "bg-foreground/10 text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            {TEMPLATE_CATEGORIES.filter((c) => c.value !== "custom").map(
              (c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() =>
                    setCategory(category === c.value ? undefined : c.value)
                  }
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    category === c.value
                      ? "bg-foreground/10 text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {c.label}
                </button>
              ),
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search templates..."
                className="h-8 pl-8 w-48 text-xs"
              />
            </div>
            <Button size="sm" onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-1.5" />
              New Template
            </Button>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Custom templates */}
        {customTemplates.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Your Templates
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {customTemplates.map((t: any) => (
                <TemplateCard
                  key={t.id}
                  template={t}
                  onEdit={() => handleEdit(t)}
                  onDuplicate={() => handleDuplicate(t.id)}
                  onDelete={() => handleDelete(t.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Library templates */}
        {libraryTemplates.length > 0 && (
          <div className="space-y-2">
            <h3 className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <Library className="h-3 w-3" />
              Template Library
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {libraryTemplates.map((t: any) => (
                <TemplateCard
                  key={t.id}
                  template={t}
                  onEdit={() => handleEdit(t)}
                  onDuplicate={() => handleDuplicate(t.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty */}
        {!isLoading && (templates?.length || 0) === 0 && (
          <div className="flex flex-col items-center py-16 text-center">
            <FileText className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">
              No templates found
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              {search
                ? "Try a different search"
                : "Create your first template to get started"}
            </p>
          </div>
        )}
      </div>

      <TemplateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        template={editingTemplate}
      />
    </div>
  );
}

// ─── Template Card ──────────────────────────────────

function TemplateCard({
  template,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  template: any;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className="border rounded-lg p-4 hover:bg-muted/10 transition-colors group">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium truncate">{template.name}</p>
            {template.isLibrary && (
              <Library className="h-3 w-3 text-muted-foreground/40 shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <TemplateCategoryBadge category={template.category} />
            {template._count?.campaigns > 0 && (
              <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                <Send className="h-2.5 w-2.5" />
                {template._count.campaigns} campaign
                {template._count.campaigns !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onEdit}
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onDuplicate}
          >
            <Copy className="h-3 w-3" />
          </Button>
          {onDelete && (
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
                  <AlertDialogTitle>Delete template?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete "{template.name}". Campaigns
                    using this template won't be affected.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Body preview */}
      <div className="rounded-lg bg-slate-50 border px-3 py-2 mt-2">
        <p className="text-xs text-muted-foreground whitespace-pre-wrap line-clamp-3">
          {previewTemplate(template.body)}
        </p>
      </div>
    </div>
  );
}

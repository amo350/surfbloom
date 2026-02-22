"use client";

import {
  ArrowLeft,
  Copy,
  Library,
  Loader2,
  Mail,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { TemplateCategoryBadge } from "@/features/campaigns/components/TemplateCategoryBadge";
import {
  useDeleteEmailTemplate,
  useDuplicateEmailTemplate,
  useEmailCategories,
  useEmailTemplates,
} from "../hooks/use-email-templates";
import { EmailTemplateDialog } from "./EmailTemplateDialog";

export function EmailTemplateManager({ basePath = "/index" }: { basePath?: string }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState<any>(null);
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState("");

  const { data: templates, isLoading } = useEmailTemplates({
    category,
    search: search.trim() || undefined,
  });
  const { data: categories } = useEmailCategories();
  const deleteTemplate = useDeleteEmailTemplate();
  const duplicateTemplate = useDuplicateEmailTemplate();

  const customTemplates = templates?.filter((t: any) => !t.isLibrary) || [];
  const libraryTemplates = templates?.filter((t: any) => t.isLibrary) || [];

  const handleEdit = (template: any) => {
    if (template.isLibrary) {
      toast.error("Duplicate a library template to edit it");
      return;
    }
    setEditTemplate(template);
    setDialogOpen(true);
  };

  const handleDuplicate = (id: string) => {
    duplicateTemplate.mutate(
      { id },
      {
        onSuccess: () => toast.success("Template duplicated"),
        onError: (err) => toast.error(err?.message || "Failed"),
      },
    );
  };

  const handleDelete = (id: string) => {
    deleteTemplate.mutate(
      { id },
      {
        onSuccess: () => toast.success("Template deleted"),
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
          <AppHeaderTitle title="Email Templates" />
        </div>
      </AppHeader>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Toolbar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates..."
              className="h-9 pl-8 text-sm"
            />
          </div>
          <Button
            size="sm"
            onClick={() => {
              setEditTemplate(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            New Template
          </Button>
        </div>

        {/* Category pills */}
        <div className="flex gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setCategory(undefined)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
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
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                category === c.value
                  ? "bg-slate-900 text-white"
                  : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && (
          <>
            {/* Custom templates */}
            {customTemplates.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Your Templates
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {customTemplates.map((t: any) => (
                    <EmailTemplateCard
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
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Template Library
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {libraryTemplates.map((t: any) => (
                    <EmailTemplateCard
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
            {customTemplates.length === 0 && libraryTemplates.length === 0 && (
              <div className="flex flex-col items-center py-16 text-center">
                <Mail className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">
                  {search
                    ? "No templates match your search"
                    : "No email templates yet"}
                </p>
                {!search && (
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    Get started by creating a custom template or duplicate one
                    from the library.
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <EmailTemplateDialog
        open={dialogOpen}
        onOpenChange={(v) => {
          setDialogOpen(v);
          if (!v) setEditTemplate(null);
        }}
        editTemplate={editTemplate}
      />
    </div>
  );
}

function EmailTemplateCard({
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
        <div className="flex items-center gap-2 min-w-0">
          <p className="text-sm font-medium truncate">{template.name}</p>
          {template.isLibrary && (
            <Library className="h-3 w-3 text-muted-foreground/40 shrink-0" />
          )}
          <TemplateCategoryBadge category={template.category} />
        </div>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {!template.isLibrary && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onEdit}
            >
              <Pencil className="h-3 w-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onDuplicate}
          >
            <Copy className="h-3 w-3" />
          </Button>
          {onDelete && !template.isLibrary && (
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
                    This will permanently delete "{template.name}".
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

      <p className="text-xs text-muted-foreground mb-1.5">
        Subject: {template.subject}
      </p>

      <p className="text-xs text-muted-foreground line-clamp-2">
        {template.htmlBody.replace(/<[^>]+>/g, " ").slice(0, 200)}
      </p>
    </div>
  );
}

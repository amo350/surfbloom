"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Pencil, X, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { StageBadge } from "./StageBadge";
import {
  useUpdateContact,
  useCategories,
  useAddCategoryToContact,
  useRemoveCategoryFromContact,
  useCreateCategory,
  useStages,
} from "../hooks/use-contacts";

export function ContactPanelDetails({ contact }: { contact: any }) {
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(contact.firstName || "");
  const [lastName, setLastName] = useState(contact.lastName || "");
  const [email, setEmail] = useState(contact.email || "");
  const [phone, setPhone] = useState(contact.phone || "");
  const [notes, setNotes] = useState(contact.notes || "");
  const [catSearch, setCatSearch] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const categoryMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setFirstName(contact.firstName || "");
    setLastName(contact.lastName || "");
    setEmail(contact.email || "");
    setPhone(contact.phone || "");
    setNotes(contact.notes || "");
  }, [
    contact.firstName,
    contact.lastName,
    contact.email,
    contact.phone,
    contact.notes,
  ]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!categoryMenuRef.current) return;
      if (!categoryMenuRef.current.contains(event.target as Node)) {
        setCategoryMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateContact = useUpdateContact();
  const addCategory = useAddCategoryToContact();
  const removeCategory = useRemoveCategoryFromContact();
  const createCategory = useCreateCategory();

  const { data: allCategories } = useCategories(
    contact.workspaceId,
    catSearch || undefined,
  );

  const { data: stages } = useStages();

  const contactCategoryIds = new Set(
    contact.categories?.map((cc: any) => cc.category.id) || [],
  );
  const availableCategories = useMemo(
    () =>
      (allCategories || []).filter((category: any) => !contactCategoryIds.has(category.id)),
    [allCategories, contactCategoryIds],
  );

  const handleSave = () => {
    updateContact.mutate(
      {
        id: contact.id,
        firstName,
        lastName: lastName || null,
        email: email || null,
        phone: phone || null,
        notes: notes || null,
      },
      { onSuccess: () => setEditing(false) },
    );
  };

  const handleStageChange = (stage: string) => {
    updateContact.mutate({ id: contact.id, stage: stage as any });
  };

  const handleAddCategory = (categoryId: string) => {
    addCategory.mutate({ contactId: contact.id, categoryId });
  };

  const handleRemoveCategory = (categoryId: string) => {
    removeCategory.mutate({ contactId: contact.id, categoryId });
  };

  const handleCreateAndAdd = () => {
    if (!newCategoryName.trim()) {
      toast.error("Type a category name first");
      return;
    }
    createCategory.mutate(
      { workspaceId: contact.workspaceId, name: newCategoryName.trim() },
      {
        onSuccess: (newCat) => {
          addCategory.mutate({ contactId: contact.id, categoryId: newCat.id });
          setCatSearch("");
          setNewCategoryName("");
          setShowNewCategoryInput(false);
          setCategoryMenuOpen(false);
        },
      },
    );
  };

  return (
    <div className="p-4 space-y-5">
      {/* Stage */}
      <div className="space-y-2">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Stage
        </p>
        <div className="flex flex-wrap gap-1.5">
          {(stages || []).map((s: any) => (
            <button
              key={s.slug}
              type="button"
              onClick={() => handleStageChange(s.slug)}
              className={`transition-opacity ${
                contact.stage === s.slug
                  ? "opacity-100"
                  : "opacity-40 hover:opacity-70"
              }`}
            >
              <StageBadge stage={s.slug} name={s.name} color={s.color} />
            </button>
          ))}
        </div>
      </div>

      {/* Contact info */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Contact Info
          </p>
          {!editing ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setEditing(true)}
            >
              <Pencil className="h-3 w-3" />
            </Button>
          ) : (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setEditing(false)}
              >
                <X className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-teal-600"
                onClick={handleSave}
                disabled={updateContact.isPending}
              >
                <Check className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        {editing ? (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                className="h-8 text-xs"
              />
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                className="h-8 text-xs"
              />
            </div>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="h-8 text-xs"
            />
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone"
              className="h-8 text-xs"
            />
          </div>
        ) : (
          <div className="space-y-1.5 text-sm">
            <Row
              label="Name"
              value={
                [contact.firstName, contact.lastName]
                  .filter(Boolean)
                  .join(" ") || "—"
              }
            />
            <Row label="Email" value={contact.email || "—"} />
            <Row label="Phone" value={contact.phone || "—"} />
            <Row label="Source" value={contact.source || "—"} />
            <Row label="Location" value={contact.workspace?.name || "—"} />
          </div>
        )}
      </div>

      {/* Categories */}
      <div className="space-y-2">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Categories
        </p>

        {/* Current categories */}
        <div className="flex flex-wrap gap-1.5">
          {contact.categories?.map((cc: any) => (
            <span
              key={cc.category.id}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted text-muted-foreground"
            >
              {cc.category.name}
              <button
                type="button"
                onClick={() => handleRemoveCategory(cc.category.id)}
                className="hover:text-destructive transition-colors"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
        </div>

        {/* Add category */}
        <div className="relative" ref={categoryMenuRef}>
          <Input
            value={catSearch}
            onChange={(e) => setCatSearch(e.target.value)}
            onFocus={() => setCategoryMenuOpen(true)}
            onKeyDown={(event) => {
              if (event.key === "Escape") setCategoryMenuOpen(false);
            }}
            placeholder="Add category..."
            className="h-7 text-xs"
          />

          {categoryMenuOpen && (
            <div className="absolute top-[calc(100%+6px)] left-0 right-0 z-20 rounded-lg border bg-popover shadow-md overflow-hidden">
              <div className="max-h-52 overflow-y-auto">
                {availableCategories.length > 0 ? (
                  availableCategories.map((cat: any) => (
                    <button
                      key={cat.id}
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        handleAddCategory(cat.id);
                        setCatSearch("");
                        setNewCategoryName("");
                        setShowNewCategoryInput(false);
                        setCategoryMenuOpen(false);
                      }}
                      className="w-full flex items-center px-2.5 py-1.5 text-xs hover:bg-muted/50 transition-colors"
                    >
                      {cat.name}
                    </button>
                  ))
                ) : (
                  <p className="px-2.5 py-2 text-xs text-muted-foreground">
                    No categories found
                  </p>
                )}
              </div>

              <div className="border-t">
                {!showNewCategoryInput ? (
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      setShowNewCategoryInput(true);
                      setNewCategoryName(catSearch.trim());
                    }}
                    className="w-full flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-teal-600 hover:bg-teal-50 transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                    New Category
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5">
                    <Input
                      value={newCategoryName}
                      onChange={(event) => setNewCategoryName(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          handleCreateAndAdd();
                        }
                        if (event.key === "Escape") {
                          event.preventDefault();
                          setShowNewCategoryInput(false);
                          setNewCategoryName("");
                        }
                      }}
                      onMouseDown={(event) => event.stopPropagation()}
                      placeholder="New category name..."
                      className="h-7 text-xs"
                      autoFocus
                    />
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={handleCreateAndAdd}
                      disabled={createCategory.isPending}
                      className="h-7 w-7 inline-flex items-center justify-center rounded-md border text-teal-600 hover:bg-teal-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Create category"
                      aria-label="Create category"
                    >
                      {createCategory.isPending ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Plus className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Notes
        </p>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => {
            if (notes !== (contact.notes || "")) {
              updateContact.mutate({ id: contact.id, notes: notes || null });
            }
          }}
          placeholder="Add notes..."
          className="text-xs resize-none min-h-[80px]"
        />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-medium truncate ml-3 max-w-[180px] capitalize">
        {value}
      </span>
    </div>
  );
}

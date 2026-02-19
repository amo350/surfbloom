"use client";

import { useState } from "react";
import { Check, Pencil, X, Plus, Loader2 } from "lucide-react";
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
} from "../hooks/use-contacts";

const STAGES = [
  "new_lead",
  "prospecting",
  "appointment",
  "payment",
  "not_a_fit",
  "lost",
] as const;

export function ContactPanelDetails({ contact }: { contact: any }) {
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(contact.firstName || "");
  const [lastName, setLastName] = useState(contact.lastName || "");
  const [email, setEmail] = useState(contact.email || "");
  const [phone, setPhone] = useState(contact.phone || "");
  const [notes, setNotes] = useState(contact.notes || "");
  const [catSearch, setCatSearch] = useState("");

  const updateContact = useUpdateContact();
  const addCategory = useAddCategoryToContact();
  const removeCategory = useRemoveCategoryFromContact();
  const createCategory = useCreateCategory();

  const { data: allCategories } = useCategories(
    contact.workspaceId,
    catSearch || undefined,
  );

  const contactCategoryIds = new Set(
    contact.categories?.map((cc: any) => cc.category.id) || [],
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
    if (!catSearch.trim()) return;
    createCategory.mutate(
      { workspaceId: contact.workspaceId, name: catSearch.trim() },
      {
        onSuccess: (newCat) => {
          addCategory.mutate({ contactId: contact.id, categoryId: newCat.id });
          setCatSearch("");
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
          {STAGES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleStageChange(s)}
              className={`transition-opacity ${
                contact.stage === s
                  ? "opacity-100"
                  : "opacity-40 hover:opacity-70"
              }`}
            >
              <StageBadge stage={s} />
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
        <div className="relative">
          <Input
            value={catSearch}
            onChange={(e) => setCatSearch(e.target.value)}
            placeholder="Add category..."
            className="h-7 text-xs"
          />
        </div>

        {catSearch.trim() && (
          <div className="border rounded-lg overflow-hidden">
            {allCategories
              ?.filter((c: any) => !contactCategoryIds.has(c.id))
              .slice(0, 5)
              .map((cat: any) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    handleAddCategory(cat.id);
                    setCatSearch("");
                  }}
                  className="w-full flex items-center px-2.5 py-1.5 text-xs hover:bg-muted/50 transition-colors"
                >
                  {cat.name}
                </button>
              ))}

            {allCategories &&
              !allCategories.some(
                (c: any) =>
                  c.name.toLowerCase() === catSearch.trim().toLowerCase(),
              ) && (
                <button
                  type="button"
                  onClick={handleCreateAndAdd}
                  disabled={createCategory.isPending}
                  className="w-full flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-teal-600 hover:bg-teal-50 transition-colors"
                >
                  {createCategory.isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Plus className="h-3 w-3" />
                  )}
                  Create "{catSearch.trim()}"
                </button>
              )}
          </div>
        )}
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

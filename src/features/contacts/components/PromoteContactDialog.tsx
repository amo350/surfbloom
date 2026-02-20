"use client";

import { useEffect, useState } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { usePromoteToContact, useStages } from "../hooks/use-contacts";
import { StageBadge } from "./StageBadge";

export function PromoteContactDialog({
  open,
  onOpenChange,
  contact,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
}) {
  const promote = usePromoteToContact();
  const { data: stages } = useStages();
  const stageList =
    stages && stages.length > 0
      ? stages
      : [
          { slug: "new_lead", name: "New Lead", color: "blue" },
          { slug: "prospecting", name: "Prospecting", color: "violet" },
          { slug: "appointment", name: "Appointment", color: "amber" },
          { slug: "payment", name: "Payment", color: "emerald" },
          { slug: "not_a_fit", name: "Not a Fit", color: "slate" },
          { slug: "lost", name: "Lost", color: "red" },
        ];

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [stage, setStage] = useState("new_lead");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open && contact) {
      setFirstName(contact.firstName || "");
      setLastName(contact.lastName || "");
      setEmail(contact.email || "");
      setPhone(contact.phone || "");
      setStage("new_lead");
      setNotes("");
    }
  }, [open, contact]);

  const handleSubmit = () => {
    if (!contact?.id) return;
    if (!firstName.trim()) {
      toast.error("First name is required");
      return;
    }

    promote.mutate(
      {
        id: contact.id,
        firstName: firstName.trim(),
        lastName: lastName.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        stage,
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Contact created");
          onOpenChange(false);
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-teal-600" />
            Save as Contact
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                First Name *
              </label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                className="h-9"
                autoFocus
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Last Name
              </label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                className="h-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Email
              </label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="h-9"
                type="email"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Phone
              </label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555 555 5555"
                className="h-9"
                type="tel"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Stage
            </label>
            <div className="flex flex-wrap gap-1.5">
              {stageList.map((s: { slug: string; name: string; color: string }) => (
                <button
                  key={s.slug}
                  type="button"
                  onClick={() => setStage(s.slug)}
                  className={`transition-opacity ${
                    stage === s.slug ? "opacity-100" : "opacity-40 hover:opacity-70"
                  }`}
                >
                  <StageBadge stage={s.slug} name={s.name} color={s.color} />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Notes
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this contact..."
              rows={2}
              className="resize-none text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={promote.isPending || !firstName.trim()}
            >
              {promote.isPending && (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              )}
              Save Contact
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

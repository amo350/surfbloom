"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateContact } from "../hooks/use-contacts";

const schema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  stage: z.string().default("new_lead"),
  notes: z.string().optional(),
});

export function CreateContactDialog({
  workspaceId,
  workspaces,
}: {
  workspaceId?: string;
  workspaces?: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState(workspaceId || "");
  const createContact = useCreateContact();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      stage: "new_lead",
      notes: "",
    },
  });

  const onSubmit = (data: any) => {
    if (!selectedWorkspace) {
      toast.error("Select a location");
      return;
    }

    createContact.mutate(
      {
        workspaceId: selectedWorkspace,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email || undefined,
        phone: data.phone || undefined,
        stage: data.stage as any,
        notes: data.notes || undefined,
        source: "manual" as any,
      },
      {
        onSuccess: () => {
          toast.success("Contact created");
          reset();
          setOpen(false);
        },
        onError: (err) => {
          toast.error(err.message);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1.5" />
          Add Contact
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Contact</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          {/* Location */}
          {!workspaceId && workspaces && (
            <div className="space-y-1.5">
              <Label className="text-xs">Location</Label>
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

          {/* Name */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">First Name *</Label>
              <Input
                {...register("firstName")}
                placeholder="John"
                className="h-9 text-sm"
              />
              {errors.firstName && (
                <p className="text-xs text-destructive">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Last Name</Label>
              <Input
                {...register("lastName")}
                placeholder="Doe"
                className="h-9 text-sm"
              />
            </div>
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input
                {...register("email")}
                placeholder="john@email.com"
                className="h-9 text-sm"
              />
              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Phone</Label>
              <Input
                {...register("phone")}
                placeholder="+1 (555) 123-4567"
                className="h-9 text-sm"
              />
            </div>
          </div>

          {/* Stage */}
          <div className="space-y-1.5">
            <Label className="text-xs">Stage</Label>
            <select
              {...register("stage")}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="new_lead">New Lead</option>
              <option value="prospecting">Prospecting</option>
              <option value="appointment">Appointment</option>
              <option value="payment">Payment</option>
              <option value="not_a_fit">Not a Fit</option>
              <option value="lost">Lost</option>
            </select>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs">Notes</Label>
            <Textarea
              {...register("notes")}
              placeholder="Any notes about this contact..."
              className="text-sm resize-none"
              rows={2}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={createContact.isPending}
          >
            {createContact.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
            ) : null}
            Create Contact
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CreateContactDialogControlled({
  open,
  onOpenChange,
  workspaceId,
  workspaces,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId?: string;
  workspaces?: { id: string; name: string }[];
}) {
  const [selectedWorkspace, setSelectedWorkspace] = useState(workspaceId || "");
  const createContact = useCreateContact();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      stage: "new_lead",
      notes: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset();
      setSelectedWorkspace(workspaceId || "");
    }
  }, [open, reset, workspaceId]);

  const onSubmit = (data: any) => {
    if (!selectedWorkspace) {
      toast.error("Select a location");
      return;
    }

    createContact.mutate(
      {
        workspaceId: selectedWorkspace,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email || undefined,
        phone: data.phone || undefined,
        stage: data.stage as any,
        notes: data.notes || undefined,
        source: "manual" as any,
      },
      {
        onSuccess: () => {
          toast.success("Contact created");
          reset();
          onOpenChange(false);
        },
        onError: (err) => {
          toast.error(err.message);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Contact</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          {!workspaceId && workspaces && workspaces.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-xs">Location</Label>
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
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">First Name *</Label>
              <Input
                {...register("firstName")}
                placeholder="John"
                className="h-9 text-sm"
              />
              {errors.firstName && (
                <p className="text-xs text-destructive">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Last Name</Label>
              <Input
                {...register("lastName")}
                placeholder="Doe"
                className="h-9 text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input
                {...register("email")}
                placeholder="john@email.com"
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Phone</Label>
              <Input
                {...register("phone")}
                placeholder="+1 (555) 123-4567"
                className="h-9 text-sm"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Stage</Label>
            <select
              {...register("stage")}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="new_lead">New Lead</option>
              <option value="prospecting">Prospecting</option>
              <option value="appointment">Appointment</option>
              <option value="payment">Payment</option>
              <option value="not_a_fit">Not a Fit</option>
              <option value="lost">Lost</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Notes</Label>
            <Textarea
              {...register("notes")}
              placeholder="Any notes..."
              className="text-sm resize-none"
              rows={2}
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={createContact.isPending}
          >
            {createContact.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
            ) : null}
            Create Contact
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

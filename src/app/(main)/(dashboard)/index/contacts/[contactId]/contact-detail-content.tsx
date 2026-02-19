"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  MoreHorizontal,
  Trash2,
  Loader2,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AppHeader, AppHeaderTitle } from "@/components/AppHeader";
import {
  useContact,
  useDeleteContact,
} from "@/features/contacts/hooks/use-contacts";
import { ContactPanelDetails } from "@/features/contacts/components/ContactPanelDetail";
import { ContactPanelActivity } from "@/features/contacts/components/ContactPanelActivity";
import { StageBadge } from "@/features/contacts/components/StageBadge";
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

function getInitials(first?: string | null, last?: string | null) {
  return [first?.[0], last?.[0]].filter(Boolean).join("").toUpperCase() || "?";
}

export function ContactDetailContent({
  params,
  workspaceId: workspaceIdProp,
}: {
  params: Promise<{ contactId: string; workspaceId?: string }>;
  workspaceId?: string;
}) {
  const resolved = use(params);
  const contactId = resolved.contactId;
  const workspaceId = workspaceIdProp || resolved.workspaceId;
  const router = useRouter();
  const { data: contact, isLoading } = useContact(contactId);
  const deleteContact = useDeleteContact();
  const [tab, setTab] = useState<"details" | "activity">("details");

  const basePath = workspaceId
    ? `/workspaces/${workspaceId}/contacts`
    : "/index/contacts";

  const handleDelete = () => {
    deleteContact.mutate(
      { id: contactId },
      {
        onSuccess: () => {
          toast.success("Contact deleted");
          router.push(basePath);
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        <AppHeader>
          <AppHeaderTitle title="Contact" />
        </AppHeader>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="h-full flex flex-col">
        <AppHeader>
          <AppHeaderTitle title="Contact" />
        </AppHeader>
        <div className="flex-1 flex flex-col items-center justify-center">
          <p className="text-sm text-muted-foreground">Contact not found</p>
          <Button variant="ghost" size="sm" className="mt-2" asChild>
            <Link href={basePath}>Back to contacts</Link>
          </Button>
        </div>
      </div>
    );
  }

  const name =
    [contact.firstName, contact.lastName].filter(Boolean).join(" ") ||
    "Unknown";
  const initials = getInitials(contact.firstName, contact.lastName);

  return (
    <div className="h-full flex flex-col">
      <AppHeader>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link href={basePath}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <AppHeaderTitle title={name} />
        </div>
      </AppHeader>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-6 space-y-6">
          {/* Profile card */}
          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shrink-0 shadow-sm">
                <span className="text-xl font-bold text-white">{initials}</span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl font-semibold">{name}</h1>
                  <StageBadge stage={contact.stage} />
                </div>

                <div className="flex items-center gap-4 mt-1.5">
                  {contact.phone && (
                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      {contact.phone}
                    </span>
                  )}
                  {contact.email && (
                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" />
                      {contact.email}
                    </span>
                  )}
                </div>

                {contact.workspace?.name && (
                  <p className="text-xs text-muted-foreground/60 mt-1.5">
                    {contact.workspace.name}
                  </p>
                )}

                {/* Categories */}
                {contact.categories?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {contact.categories.map((cc: any) => (
                      <span
                        key={cc.category.id}
                        className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted text-muted-foreground"
                      >
                        {cc.category.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 shrink-0">
                <ActionButton icon={MessageSquare} label="Text" />
                <ActionButton icon={Phone} label="Call" />
                <ActionButton icon={Mail} label="Email" />
                <ActionButton icon={Calendar} label="Book" />

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete contact?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete {name} and all associated
                        data. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {deleteContact.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                        ) : null}
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            {/* Linked conversations */}
            {contact.chatRooms?.length > 0 && (
              <div className="mt-5 pt-4 border-t">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Conversations
                </p>
                <div className="flex flex-wrap gap-2">
                  {contact.chatRooms.map((room: any) => (
                    <Link
                      key={room.id}
                      href={
                        workspaceId
                          ? `/workspaces/${workspaceId}/conversations`
                          : "/index/conversations"
                      }
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs text-muted-foreground hover:bg-muted/50 transition-colors"
                    >
                      <MessageSquare className="h-3 w-3" />
                      <span className="capitalize">
                        {room.channel || "webchat"}
                      </span>
                      <span className="text-muted-foreground/40">·</span>
                      <span>
                        {new Date(room.updatedAt).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <ExternalLink className="h-2.5 w-2.5 ml-0.5" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Two columns — Details + Activity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Details */}
            <div className="rounded-xl border bg-card">
              <div className="px-4 py-3 border-b">
                <p className="text-sm font-medium">Details</p>
              </div>
              <ContactPanelDetails contact={contact} />
            </div>

            {/* Activity */}
            <div className="rounded-xl border bg-card">
              <div className="px-4 py-3 border-b">
                <p className="text-sm font-medium">Activity</p>
              </div>
              <ContactPanelActivity contactId={contactId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: any;
  label: string;
  onClick?: () => void;
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9 text-muted-foreground hover:text-foreground"
      onClick={onClick}
      title={label}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
}

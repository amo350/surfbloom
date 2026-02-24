"use client";

import {
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Copy,
  Eye,
  EyeOff,
  Key,
  Loader2,
  Pencil,
  Plus,
  Power,
  PowerOff,
  Trash2,
  Webhook,
  XCircle,
} from "lucide-react";
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
import {
  useDeleteWebhookEndpoint,
  useRotateWebhookSecret,
  useUpdateWebhookEndpoint,
  useWebhookDeliveries,
  useWebhookEndpoints,
} from "../hooks/use-webhooks";
import { WebhookEndpointDialog } from "./WebhookEndpointDialog";

export function WebhookManager({ workspaceId }: { workspaceId: string }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editEndpoint, setEditEndpoint] = useState<any>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [visibleSecret, setVisibleSecret] = useState<Record<string, boolean>>(
    {},
  );
  const [deliveryPage, setDeliveryPage] = useState<Record<string, number>>({});

  const { data: endpoints, isLoading } = useWebhookEndpoints(workspaceId);
  const updateEndpoint = useUpdateWebhookEndpoint();
  const deleteEndpoint = useDeleteWebhookEndpoint();
  const rotateSecret = useRotateWebhookSecret();

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
    setDeliveryPage((prev) => ({ ...prev, [id]: prev[id] || 1 }));
  };

  const handleToggleActive = (id: string, active: boolean) => {
    updateEndpoint.mutate(
      { id, active: !active },
      {
        onSuccess: () =>
          toast.success(active ? "Webhook paused" : "Webhook activated"),
        onError: (err) => toast.error(err?.message || "Failed"),
      },
    );
  };

  const handleDelete = (id: string) => {
    deleteEndpoint.mutate(
      { id },
      {
        onSuccess: () => toast.success("Webhook deleted"),
        onError: (err) => toast.error(err?.message || "Failed"),
      },
    );
  };

  const handleRotateSecret = (id: string) => {
    rotateSecret.mutate(
      { id },
      {
        onSuccess: () => toast.success("Secret rotated"),
        onError: (err) => toast.error(err?.message || "Failed"),
      },
    );
  };

  const copyText = async (value: string, message: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(message);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="h-full flex flex-col">
      <AppHeader>
        <AppHeaderTitle title="Webhook Endpoints" />
      </AppHeader>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Send signed event payloads to external tools and workflows
          </p>
          <Button
            size="sm"
            onClick={() => {
              setEditEndpoint(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            New Endpoint
          </Button>
        </div>

        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && endpoints && endpoints.length > 0 && (
          <div className="space-y-3">
            {endpoints.map((ep: any) => (
              <EndpointCard
                key={ep.id}
                endpoint={ep}
                expanded={!!expanded[ep.id]}
                onToggleExpanded={() => toggleExpanded(ep.id)}
                onToggleActive={() => handleToggleActive(ep.id, ep.active)}
                onEdit={() => {
                  setEditEndpoint(ep);
                  setDialogOpen(true);
                }}
                onDelete={() => handleDelete(ep.id)}
                onRotateSecret={() => handleRotateSecret(ep.id)}
                showSecret={!!visibleSecret[ep.id]}
                onToggleSecretVisibility={() =>
                  setVisibleSecret((prev) => ({
                    ...prev,
                    [ep.id]: !prev[ep.id],
                  }))
                }
                onCopyUrl={() => copyText(ep.url, "URL copied")}
                onCopySecret={() => copyText(ep.secret, "Secret copied")}
                page={deliveryPage[ep.id] || 1}
                setPage={(page) =>
                  setDeliveryPage((prev) => ({ ...prev, [ep.id]: page }))
                }
              />
            ))}
          </div>
        )}

        {!isLoading && (!endpoints || endpoints.length === 0) && (
          <div className="flex flex-col items-center py-16 text-center">
            <Webhook className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">
              No webhook endpoints yet
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1 max-w-md">
              Create an endpoint to receive campaign and contact events in your
              external system.
            </p>
          </div>
        )}
      </div>

      <WebhookEndpointDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        workspaceId={workspaceId}
        editEndpoint={editEndpoint}
      />
    </div>
  );
}

function EndpointCard({
  endpoint,
  expanded,
  onToggleExpanded,
  onToggleActive,
  onEdit,
  onDelete,
  onRotateSecret,
  showSecret,
  onToggleSecretVisibility,
  onCopyUrl,
  onCopySecret,
  page,
  setPage,
}: {
  endpoint: any;
  expanded: boolean;
  onToggleExpanded: () => void;
  onToggleActive: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onRotateSecret: () => void;
  showSecret: boolean;
  onToggleSecretVisibility: () => void;
  onCopyUrl: () => void;
  onCopySecret: () => void;
  page: number;
  setPage: (page: number) => void;
}) {
  const { data: deliveryData, isLoading } = useWebhookDeliveries(
    expanded ? endpoint.id : null,
    page,
  );
  const totalPages = deliveryData
    ? Math.max(1, Math.ceil(deliveryData.total / deliveryData.limit))
    : 1;

  return (
    <div className={`border rounded-lg ${endpoint.active ? "" : "opacity-70"}`}>
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Webhook className="h-4 w-4 text-teal-600" />
              <p className="text-sm font-medium truncate">{endpoint.url}</p>
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <StatusPill active={endpoint.active} />
              <DeliveryHealth
                status={endpoint.lastStatus}
                error={endpoint.lastError}
              />
              <span className="text-[10px] text-muted-foreground">
                {endpoint._count?.deliveries || 0} deliveries
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onEdit}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onToggleActive}
            >
              {endpoint.active ? (
                <PowerOff className="h-3.5 w-3.5" />
              ) : (
                <Power className="h-3.5 w-3.5" />
              )}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete webhook endpoint?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This removes the endpoint and all associated delivery logs.
                    This action cannot be undone.
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
          </div>
        </div>

        <div className="rounded-lg border bg-muted/10 px-3 py-2 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              Signing Secret
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={onToggleSecretVisibility}
              >
                {showSecret ? (
                  <EyeOff className="h-3 w-3" />
                ) : (
                  <Eye className="h-3 w-3" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={onCopySecret}
              >
                <Copy className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={onRotateSecret}
              >
                <Key className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <p className="text-xs font-mono break-all">
            {showSecret ? endpoint.secret : "•".repeat(20)}
          </p>
        </div>

        <div className="rounded-lg border bg-muted/10 px-3 py-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              URL
            </p>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onCopyUrl}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
          <p className="text-xs font-mono break-all mt-1">{endpoint.url}</p>
        </div>

        <div className="space-y-1">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Events
          </p>
          <div className="flex flex-wrap gap-1">
            {(endpoint.events || []).map((evt: string) => (
              <span
                key={evt}
                className="text-[10px] bg-slate-100 text-slate-700 border border-slate-200 px-1.5 py-0.5 rounded font-mono"
              >
                {evt}
              </span>
            ))}
          </div>
        </div>

        {!!endpoint.lastError && (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-2.5 py-2">
            <p className="text-[11px] text-amber-700 flex items-start gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span className="line-clamp-2">{endpoint.lastError}</span>
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={onToggleExpanded}
          className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
        >
          {expanded ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
          {expanded ? "Hide" : "Show"} delivery log
        </button>
      </div>

      {expanded && (
        <div className="border-t px-4 py-3 space-y-2">
          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Loading deliveries...
            </div>
          )}

          {!isLoading && deliveryData?.deliveries?.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No delivery attempts yet.
            </p>
          )}

          {!isLoading && (deliveryData?.deliveries?.length ?? 0) > 0 && (
            <>
              <div className="space-y-1.5">
                {deliveryData?.deliveries?.map((d: any) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between rounded-md border px-2.5 py-1.5"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-mono truncate">{d.event}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(d.createdAt).toLocaleString()}
                        {d.duration ? ` · ${d.duration}ms` : ""}
                        {d.attemptCount > 1
                          ? ` · attempt ${d.attemptCount}`
                          : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      {typeof d.status === "number" &&
                      d.status >= 200 &&
                      d.status < 300 ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600">
                          <CheckCircle className="h-3 w-3" />
                          {d.status}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-red-600">
                          <XCircle className="h-3 w-3" />
                          {d.status || "ERR"}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page <= 1}
                  >
                    Prev
                  </Button>
                  <span className="text-[10px] text-muted-foreground">
                    {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page >= totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function StatusPill({ active }: { active: boolean }) {
  return (
    <span
      className={`text-[10px] px-1.5 py-0.5 rounded border ${
        active
          ? "text-emerald-700 bg-emerald-50 border-emerald-200"
          : "text-amber-700 bg-amber-50 border-amber-200"
      }`}
    >
      {active ? "Active" : "Paused"}
    </span>
  );
}

function DeliveryHealth({
  status,
  error,
}: {
  status: number | null;
  error: string | null;
}) {
  if (error) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] text-amber-700">
        <AlertTriangle className="h-3 w-3" />
        Error
      </span>
    );
  }

  if (typeof status === "number" && status >= 200 && status < 300) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700">
        <CheckCircle className="h-3 w-3" />
        Healthy
      </span>
    );
  }

  if (typeof status === "number") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] text-red-700">
        <XCircle className="h-3 w-3" />
        HTTP {status}
      </span>
    );
  }

  return (
    <span className="text-[10px] text-muted-foreground inline-flex items-center gap-1">
      <AlertTriangle className="h-3 w-3" />
      No deliveries yet
    </span>
  );
}

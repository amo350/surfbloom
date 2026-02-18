// src/features/integrations/components/TwilioConfigCard.tsx
"use client";

import { useState } from "react";
import {
  Phone,
  CheckCircle,
  Loader2,
  Search,
  Plus,
  Trash2,
  MessageSquare,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  useTwilioConfig,
  useSetupTwilio,
  useDisconnectTwilio,
  usePhoneNumbers,
  useSearchNumbers,
  useProvisionNumber,
  useRemoveNumber,
  useSendSms,
} from "../hooks/use-integrations";

type Workspace = {
  id: string;
  name: string;
  imageUrl: string | null;
};

export function TwilioConfigCard({ workspaces }: { workspaces: Workspace[] }) {
  const config = useTwilioConfig();
  const setup = useSetupTwilio();
  const disconnect = useDisconnectTwilio();
  const phoneNumbers = usePhoneNumbers();
  const searchNumbers = useSearchNumbers();
  const provisionNumber = useProvisionNumber();
  const removeNumber = useRemoveNumber();

  const [areaCode, setAreaCode] = useState("");
  const [selectedWorkspace, setSelectedWorkspace] = useState("");
  const [testNumber, setTestNumber] = useState("");
  const [testWorkspace, setTestWorkspace] = useState("");
  const [numberType, setNumberType] = useState<"local" | "tollFree">("local");

  const testSms = useSendSms();

  const isConnected = !!config.data;

  const handleSetup = () => {
    setup.mutate(undefined, {
      onSuccess: () => toast.success("Twilio messaging enabled"),
      onError: (err) => toast.error(err.message),
    });
  };

  const handleDisconnect = () => {
    disconnect.mutate(undefined, {
      onSuccess: () => toast.success("Twilio disconnected"),
    });
  };

  const handleProvision = (phoneNumber: string) => {
    if (!selectedWorkspace) {
      toast.error("Select a location first");
      return;
    }
    provisionNumber.mutate(
      { phoneNumber, workspaceId: selectedWorkspace },
      {
        onSuccess: () => {
          toast.success("Phone number provisioned");
          setSelectedWorkspace("");
          searchNumbers.reset();
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  const availableWorkspaces = workspaces.filter(
    (w) => !phoneNumbers.data?.some((pn) => pn.workspaceId === w.id),
  );

  return (
    <div className="space-y-6">
      {/* ─── Connection Card ─────────────────────────── */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center">
              <Phone className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">SMS Messaging</h3>
              <p className="text-xs text-muted-foreground">
                Send and receive text messages with customers.
              </p>
            </div>
          </div>
          {isConnected && (
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-xs font-medium text-green-600">Active</span>
            </div>
          )}
        </div>

        {isConnected ? (
          <div className="flex items-center justify-between pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              {config.data?.friendlyName}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDisconnect}
              disabled={disconnect.isPending}
            >
              {disconnect.isPending ? "Disconnecting..." : "Disconnect"}
            </Button>
          </div>
        ) : (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground mb-3">
              Enable SMS messaging to send review requests, notifications, and
              have two-way conversations with customers.
            </p>
            <Button
              onClick={handleSetup}
              disabled={setup.isPending}
              className="w-full"
            >
              {setup.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Setting up...
                </>
              ) : (
                "Enable SMS Messaging"
              )}
            </Button>
          </div>
        )}
      </div>

      {/* ─── Phone Numbers Card ──────────────────────── */}
      {isConnected && (
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div>
            <h3 className="text-sm font-semibold">Phone Numbers</h3>
            <p className="text-xs text-muted-foreground">
              Each location gets a local phone number for SMS.
            </p>
          </div>

          {/* Existing numbers */}
          {phoneNumbers.data?.map((pn) => (
            <div
              key={pn.id}
              className="py-3 border-b border-border/30 last:border-0 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg overflow-hidden bg-muted shrink-0">
                    {pn.workspace.imageUrl ? (
                      <Image
                        src={pn.workspace.imageUrl}
                        alt={pn.workspace.name}
                        width={32}
                        height={32}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-xs font-semibold text-muted-foreground">
                        {pn.workspace.name[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{pn.workspace.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {pn.phoneNumber}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setTestWorkspace(
                        testWorkspace === pn.workspaceId ? "" : pn.workspaceId,
                      )
                    }
                  >
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      removeNumber.mutate(
                        { id: pn.id },
                        { onSuccess: () => toast.success("Number removed") },
                      )
                    }
                    disabled={removeNumber.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>

              {/* Test SMS inline */}
              {testWorkspace === pn.workspaceId && (
                <div className="flex gap-2 pl-11">
                  <Input
                    value={testNumber}
                    onChange={(e) => setTestNumber(e.target.value)}
                    placeholder="+15551234567"
                    className="flex-1 font-mono text-xs"
                  />
                  <Button
                    size="sm"
                    disabled={testSms.isPending || !testNumber}
                    onClick={() => {
                      testSms.mutate(
                        {
                          workspaceId: pn.workspaceId,
                          to: testNumber,
                          body: "Test message from SurfBloom.",
                        },
                        {
                          onSuccess: () => {
                            toast.success("Test SMS sent");
                            setTestNumber("");
                            setTestWorkspace("");
                          },
                          onError: (err) => toast.error(err.message),
                        },
                      );
                    }}
                  >
                    {testSms.isPending ? "Sending..." : "Send Test"}
                  </Button>
                </div>
              )}
            </div>
          ))}

          {/* Add number section */}
          {availableWorkspaces.length > 0 && (
            <div className="space-y-3 pt-2 border-t">
              <div className="space-y-2">
                <label className="text-xs font-medium">Location</label>
                <select
                  value={selectedWorkspace}
                  onChange={(e) => setSelectedWorkspace(e.target.value)}
                  className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm"
                >
                  <option value="">Select a location...</option>
                  {availableWorkspaces.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Number type toggle */}
              <div className="flex rounded-lg border border-border/40 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setNumberType("local")}
                  className={`flex-1 py-1.5 text-xs font-medium transition-colors ${
                    numberType === "local"
                      ? "bg-teal-50 text-teal-700"
                      : "text-muted-foreground hover:bg-muted/30"
                  }`}
                >
                  Local
                </button>
                <button
                  type="button"
                  onClick={() => setNumberType("tollFree")}
                  className={`flex-1 py-1.5 text-xs font-medium transition-colors border-l border-border/40 ${
                    numberType === "tollFree"
                      ? "bg-teal-50 text-teal-700"
                      : "text-muted-foreground hover:bg-muted/30"
                  }`}
                >
                  Toll-Free
                </button>
              </div>

              {/* Search */}
              <div className="flex gap-2">
                {numberType === "local" && (
                  <Input
                    value={areaCode}
                    onChange={(e) => setAreaCode(e.target.value)}
                    placeholder="Area code (optional)"
                    className="flex-1"
                  />
                )}
                <Button
                  onClick={() =>
                    searchNumbers.mutate(
                      {
                        areaCode: numberType === "local" ? areaCode || undefined : undefined,
                        type: numberType,
                      },
                      { onError: (err) => toast.error(err.message) },
                    )
                  }
                  disabled={searchNumbers.isPending}
                  variant="outline"
                  className={numberType === "tollFree" ? "w-full" : ""}
                >
                  {searchNumbers.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-1" />
                      {numberType === "local" ? "Search Local" : "Search Toll-Free"}
                    </>
                  )}
                </Button>
              </div>

              {searchNumbers.data && (
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {searchNumbers.data.map((n) => (
                    <div
                      key={n.phoneNumber}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/40 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-mono">{n.phoneNumber}</p>
                        <p className="text-xs text-muted-foreground">
                          {n.locality}, {n.region}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleProvision(n.phoneNumber)}
                        disabled={
                          provisionNumber.isPending || !selectedWorkspace
                        }
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Buy
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {availableWorkspaces.length === 0 &&
          phoneNumbers.data &&
          phoneNumbers.data.length > 0 ? (
            <p className="text-xs text-muted-foreground pt-2 border-t">
              All locations have phone numbers assigned.
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}

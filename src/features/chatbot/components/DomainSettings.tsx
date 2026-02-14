"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  useDomains,
  useAddDomain,
  useUpdateDomain,
  useRemoveDomain,
} from "../hooks/use-chatbot";
import { useTRPC } from "@/trpc/client";
import {
  Plus,
  Copy,
  Check,
  Trash2,
  Globe,
  Code,
  Loader2,
  MapPin,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ChatBotConfigDialog } from "./ChatBotConfigDialog";

const addDomainSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Domain must be at least 3 characters")
    .refine(
      (v) => /^((?!-)[A-Za-z0-9-]{1,63}(?<!-)\.)+[A-Za-z]{2,}$/.test(v),
      "Enter a valid domain (e.g. mybusiness.com)",
    ),
});

type AddDomainForm = z.infer<typeof addDomainSchema>;

function getEmbedSnippet(domainId: string) {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://app.surfbloom.com";

  return `const iframe = document.createElement("iframe");

const iframeStyles = (styleString) => {
  const style = document.createElement('style');
  style.textContent = styleString;
  document.head.append(style);
}

iframeStyles(\`
  .chat-frame {
    position: fixed;
    bottom: 50px;
    right: 50px;
    border: none;
    z-index: 999999;
  }
\`)

iframe.src = "${origin}/chatbot"
iframe.classList.add('chat-frame')
document.body.appendChild(iframe)

window.addEventListener("message", (e) => {
  if(e.origin !== "${origin}") return null
  let dimensions = JSON.parse(e.data)
  iframe.width = dimensions.width
  iframe.height = dimensions.height
  iframe.contentWindow.postMessage("${domainId}", "${origin}/")
})`;
}

export function DomainSettingsButton() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Globe className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col overflow-hidden p-0">
        {/* Hero header — fixed, never shrinks */}
        <div className="relative overflow-hidden shrink-0 min-h-[7.5rem] bg-gradient-to-b from-white/90 via-amber-50/30 to-teal-50/40 dark:from-gray-900/90 dark:via-amber-950/10 dark:to-teal-950/20 px-6 pt-8 pb-6">
          <div className="absolute inset-x-0 bottom-0 h-16 opacity-[0.03] pointer-events-none">
            <svg
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
              className="w-full h-full"
            >
              <path
                d="M0,40 C200,80 400,10 600,50 C800,90 1000,20 1200,60 L1200,120 L0,120 Z"
                fill="currentColor"
                className="text-teal-500"
              />
            </svg>
          </div>
          <div className="relative flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 text-white shadow-lg shadow-teal-500/20">
              <Globe className="w-4 h-4" />
            </div>
            <SheetTitle className="text-lg font-bold bg-gradient-to-r from-teal-600 via-amber-500 to-orange-500 bg-clip-text text-transparent">
              Domain Settings
            </SheetTitle>
          </div>
          <SheetDescription className="text-sm text-muted-foreground relative">
            Add your business domains to embed the SurfBloom chatbot on your
            website.
          </SheetDescription>
        </div>

        {/* Scrollable body only */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6 space-y-6">
          <AddDomainForm onSuccess={() => {}} />
          <Separator />
          <DomainList />
        </div>
      </SheetContent>
    </Sheet>
  );
}

function AddDomainForm({ onSuccess }: { onSuccess: () => void }) {
  const addDomain = useAddDomain();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddDomainForm>({
    resolver: zodResolver(addDomainSchema),
  });

  return (
    <form
      onSubmit={handleSubmit((data) =>
        addDomain.mutate(
          { name: data.name },
          { onSuccess: () => { reset(); onSuccess(); } },
        ),
      )}
      className="space-y-3"
    >
      <Label htmlFor="domain-name" className="text-sm font-medium">
        Add a domain
      </Label>
      <div className="flex gap-3">
        <Input
          id="domain-name"
          placeholder="mybusiness.com"
          {...register("name")}
          className="flex-1 h-10 rounded-xl border-border/60 focus-visible:ring-teal-500/30"
        />
        <Button
          type="submit"
          disabled={addDomain.isPending}
          className="shrink-0 h-10 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 border-0 shadow-md shadow-teal-500/15 px-5"
        >
          {addDomain.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4 mr-1.5" />
          )}
          Add
        </Button>
      </div>
      {errors.name && (
        <p className="text-xs text-destructive">{errors.name.message}</p>
      )}
    </form>
  );
}

function DomainList() {
  const { data: domains, isLoading } = useDomains();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!domains || domains.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-50 to-amber-50 dark:from-teal-950/30 dark:to-amber-950/20 text-2xl shadow-sm ring-1 ring-teal-100/50 dark:ring-teal-800/30 mb-3">
          🌊
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          No domains yet
        </p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          Add your first domain above to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Your Domains
      </h3>
      {domains.map((domain) => (
        <DomainCard key={domain.id} domain={domain} />
      ))}
    </div>
  );
}

function DomainCard({
  domain,
}: {
  domain: {
    id: string;
    name: string;
    workspaceId: string | null;
    workspace: {
      id: string;
      name: string;
      city: string | null;
      state: string | null;
    } | null;
  };
}) {
  const [copied, setCopied] = useState(false);
  const trpc = useTRPC();
  const { data: workspaces } = useQuery(
    trpc.workspaces.getMany.queryOptions({ page: 1, pageSize: 100 }),
  );
  const updateDomain = useUpdateDomain();
  const removeDomain = useRemoveDomain();

  const snippet = getEmbedSnippet(domain.id);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-r from-card/90 via-card/80 to-teal-50/20 dark:to-teal-950/10 shadow-sm hover:shadow-md transition-all duration-300">
      {/* Subtle wave */}
      <div className="absolute inset-y-0 right-0 w-32 opacity-[0.04] group-hover:opacity-[0.07] pointer-events-none transition-opacity duration-500">
        <svg
          viewBox="0 0 200 200"
          preserveAspectRatio="none"
          className="h-full w-full"
        >
          <path
            d="M120,0 C140,40 100,60 120,100 C140,140 100,160 120,200 L200,200 L200,0 Z"
            fill="currentColor"
            className="text-teal-500"
          />
        </svg>
      </div>

      <div className="relative p-4 space-y-3">
        {/* Domain name + actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-50 to-teal-50 dark:from-amber-950/20 dark:to-teal-950/20 ring-1 ring-border/50">
              <Globe className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
            </div>
            <span className="text-sm font-semibold">{domain.name}</span>
          </div>
          <div className="flex items-center gap-1">
            <ChatBotConfigDialog
              domainId={domain.id}
              domainName={domain.name}
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() => removeDomain.mutate({ id: domain.id })}
              disabled={removeDomain.isPending}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Location pin */}
        <div className="space-y-1.5">
          <Label className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <MapPin className="h-3 w-3" />
            Pin to location (optional)
          </Label>
          <Select
            value={domain.workspaceId ?? "none"}
            onValueChange={(v) =>
              updateDomain.mutate({
                id: domain.id,
                workspaceId: v === "none" ? null : v,
              })
            }
          >
            <SelectTrigger className="h-8 text-sm rounded-lg border-border/60">
              <SelectValue placeholder="All locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">All locations</SelectItem>
              {workspaces?.items?.map((ws) => (
                <SelectItem key={ws.id} value={ws.id}>
                  {ws.name}
                  {ws.city && ws.state ? ` — ${ws.city}, ${ws.state}` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Embed snippet */}
        <div className="space-y-1.5">
          <Label className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <Code className="h-3 w-3" />
            Embed code
          </Label>
          <div className="relative">
            <pre className="rounded-xl bg-muted/40 dark:bg-muted/20 border border-border/40 p-3 pr-10 text-[11px] font-mono text-muted-foreground overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
              {snippet}
            </pre>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1.5 right-1.5 h-7 w-7"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-teal-600" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

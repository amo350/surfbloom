"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CheckSquare,
  Clock,
  FileText,
  GitBranch,
  Globe,
  Hash,
  Link,
  Mail,
  MessageSquare,
  Play,
  Search,
  Sparkles,
  Star,
  Tag,
  Timer,
  UserCog,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { NodeType } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface NodeOption {
  type: NodeType;
  label: string;
  description: string;
  icon: LucideIcon;
  keywords?: string[];
}

interface NodeCategory {
  id: string;
  label: string;
  nodes: NodeOption[];
}

const NODE_CATEGORIES: NodeCategory[] = [
  {
    id: "triggers",
    label: "Triggers",
    nodes: [
      {
        type: NodeType.CONTACT_CREATED,
        label: "Contact Created",
        description: "New contact is added",
        icon: UserPlus,
        keywords: ["lead", "new", "signup"],
      },
      {
        type: NodeType.REVIEW_RECEIVED,
        label: "Review Received",
        description: "Google review is synced",
        icon: Star,
        keywords: ["rating", "google", "feedback", "stars"],
      },
      {
        type: NodeType.CATEGORY_ADDED,
        label: "Category Added",
        description: "Tag is applied to contact",
        icon: Tag,
        keywords: ["tag", "label", "segment"],
      },
      {
        type: NodeType.SCHEDULE,
        label: "Schedule",
        description: "Recurring time-based trigger",
        icon: Clock,
        keywords: ["cron", "recurring", "daily", "weekly", "timer"],
      },
      {
        type: NodeType.MANUAL_TRIGGER,
        label: "Manual Trigger",
        description: "Run workflow manually",
        icon: Play,
        keywords: ["start", "test", "run"],
      },
      {
        type: NodeType.GOOGLE_FORM_TRIGGER,
        label: "Google Form",
        description: "Form submission received",
        icon: FileText,
        keywords: ["form", "submission", "intake"],
      },
    ],
  },
  {
    id: "actions",
    label: "Actions",
    nodes: [
      {
        type: NodeType.SEND_SMS,
        label: "Send SMS",
        description: "Send a text message",
        icon: MessageSquare,
        keywords: ["text", "message", "twilio", "sms"],
      },
      {
        type: NodeType.SEND_EMAIL,
        label: "Send Email",
        description: "Send an email",
        icon: Mail,
        keywords: ["email", "mail", "resend"],
      },
      {
        type: NodeType.CREATE_TASK,
        label: "Create Task",
        description: "Add a task to the board",
        icon: CheckSquare,
        keywords: ["todo", "task", "kanban", "board", "action item"],
      },
      {
        type: NodeType.UPDATE_CONTACT,
        label: "Update Contact",
        description: "Stage, category, note, or assignment",
        icon: UserCog,
        keywords: ["stage", "category", "tag", "note", "assign", "pipeline"],
      },
      {
        type: NodeType.POST_SLACK,
        label: "Post to Slack",
        description: "Send a Slack notification",
        icon: Hash,
        keywords: ["slack", "notify", "alert", "webhook"],
      },
    ],
  },
  {
    id: "logic",
    label: "Logic",
    nodes: [
      {
        type: NodeType.IF_ELSE,
        label: "If/Else",
        description: "Branch on a condition",
        icon: GitBranch,
        keywords: ["branch", "condition", "filter", "check", "split"],
      },
      {
        type: NodeType.WAIT,
        label: "Wait",
        description: "Pause for a duration",
        icon: Timer,
        keywords: ["delay", "pause", "sleep", "timer"],
      },
    ],
  },
  {
    id: "ai",
    label: "AI",
    nodes: [
      {
        type: NodeType.AI_NODE,
        label: "AI Node",
        description: "Generate, analyze, or summarize",
        icon: Sparkles,
        keywords: ["claude", "gpt", "gemini", "grok", "llm", "generate", "ai"],
      },
    ],
  },
  {
    id: "advanced",
    label: "Advanced",
    nodes: [
      {
        type: NodeType.HTTP_REQUEST,
        label: "HTTP Request",
        description: "Call any API endpoint",
        icon: Globe,
        keywords: ["api", "webhook", "http", "rest", "fetch", "request"],
      },
      {
        type: NodeType.STRIPE_TRIGGER,
        label: "Stripe Trigger",
        description: "Stripe payment event",
        icon: Link,
        keywords: ["payment", "stripe", "billing", "charge"],
      },
    ],
  },
];

interface NodeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (type: NodeType) => void;
}

export function NodeSelector({ open, onOpenChange, onSelect }: NodeSelectorProps) {
  const [search, setSearch] = useState("");
  const [focusIndex, setFocusIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setSearch("");
      setFocusIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const filteredCategories = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return NODE_CATEGORIES;

    return NODE_CATEGORIES.map((category) => ({
      ...category,
      nodes: category.nodes.filter((node) => {
        const haystack = [node.label, node.description, ...(node.keywords || [])]
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      }),
    })).filter((category) => category.nodes.length > 0);
  }, [search]);

  const flatNodes = useMemo(
    () => filteredCategories.flatMap((category) => category.nodes),
    [filteredCategories],
  );

  useEffect(() => {
    setFocusIndex((index) =>
      index >= flatNodes.length ? Math.max(0, flatNodes.length - 1) : index,
    );
  }, [flatNodes.length]);

  useEffect(() => {
    if (!listRef.current) return;
    const focused = listRef.current.querySelector(
      `[data-node-index="${focusIndex}"]`,
    );
    if (focused) {
      focused.scrollIntoView({ block: "nearest" });
    }
  }, [focusIndex]);

  const handleSelect = useCallback(
    (type: NodeType) => {
      onSelect(type);
      onOpenChange(false);
    },
    [onOpenChange, onSelect],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setFocusIndex((index) => Math.min(index + 1, flatNodes.length - 1));
          break;
        case "ArrowUp":
          event.preventDefault();
          setFocusIndex((index) => Math.max(index - 1, 0));
          break;
        case "Enter":
          event.preventDefault();
          if (flatNodes[focusIndex]) {
            handleSelect(flatNodes[focusIndex].type);
          }
          break;
        case "Escape":
          event.preventDefault();
          onOpenChange(false);
          break;
      }
    },
    [flatNodes, focusIndex, handleSelect, onOpenChange],
  );

  let runningIndex = 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[360px] p-0 flex flex-col sm:w-[400px]"
        onKeyDown={handleKeyDown}
      >
        <SheetHeader className="px-4 pt-4 pb-0">
          <SheetTitle className="text-sm font-medium">Add Node</SheetTitle>
          <div className="relative mt-2">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setFocusIndex(0);
              }}
              placeholder="Search nodes..."
              className="h-9 pl-8 text-sm"
              autoComplete="off"
            />
          </div>
        </SheetHeader>

        <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {filteredCategories.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No nodes match &quot;{search}&quot;
            </p>
          )}

          {filteredCategories.map((category) => {
            return (
              <div key={category.id}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {category.label}
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  {category.nodes.map((node) => {
                    const currentIndex = runningIndex++;
                    const isFocused = currentIndex === focusIndex;

                    return (
                      <button
                        key={node.type}
                        type="button"
                        data-focused={isFocused}
                        data-node-index={currentIndex}
                        onClick={() => handleSelect(node.type)}
                        onMouseEnter={() => setFocusIndex(currentIndex)}
                        className={cn(
                          "flex items-start gap-2.5 rounded-lg border p-2.5 text-left transition-colors",
                          "hover:bg-accent hover:border-accent-foreground/20",
                          isFocused &&
                            "bg-accent border-accent-foreground/20 ring-1 ring-accent-foreground/10",
                        )}
                      >
                        <div
                          className={cn(
                            "flex size-7 shrink-0 items-center justify-center rounded-md",
                            category.id === "triggers" && "bg-blue-500/10 text-blue-600",
                            category.id === "actions" && "bg-green-500/10 text-green-600",
                            category.id === "logic" && "bg-amber-500/10 text-amber-600",
                            category.id === "ai" && "bg-purple-500/10 text-purple-600",
                            category.id === "advanced" && "bg-slate-500/10 text-slate-600",
                          )}
                        >
                          <node.icon className="size-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium leading-none mb-0.5">
                            {node.label}
                          </p>
                          <p className="text-[10px] text-muted-foreground leading-tight">
                            {node.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-4 py-2 border-t bg-muted/30">
          <p className="text-[10px] text-muted-foreground text-center">
            <kbd className="px-1 py-0.5 rounded bg-muted border text-[9px]">↑↓</kbd>{" "}
            navigate{" "}
            <kbd className="px-1 py-0.5 rounded bg-muted border text-[9px]">↵</kbd>{" "}
            select{" "}
            <kbd className="px-1 py-0.5 rounded bg-muted border text-[9px]">esc</kbd>{" "}
            close
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

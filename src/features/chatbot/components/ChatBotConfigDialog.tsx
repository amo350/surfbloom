"use client";

import { useUploadThing } from "@/lib/uploadthing-client";
import { useState, useRef } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useDomains,
  useChatBotConfig,
  useUpdateChatBotConfig,
  useHelpDeskItems,
  useCreateHelpDeskItem,
  useDeleteHelpDeskItem,
  useFilterQuestions,
  useCreateFilterQuestion,
  useDeleteFilterQuestion,
} from "../hooks/use-chatbot";
import {
  Bot,
  ChevronDown,
  Globe,
  Loader2,
  Plus,
  Trash2,
  MessageCircle,
  HelpCircle,
  Filter,
  Palette,
  Save,
  ImagePlus,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

// ─── Schemas ──────────────────────────────────────────────
const helpDeskSchema = z.object({
  question: z.string().trim().min(1, "Required"),
  answer: z.string().trim().min(1, "Required"),
});

const filterQuestionSchema = z.object({
  question: z.string().trim().min(1, "Required"),
});

type HelpDeskForm = z.infer<typeof helpDeskSchema>;
type FilterQuestionForm = z.infer<typeof filterQuestionSchema>;

// ─── Main Dialog ──────────────────────────────────────────
export function ChatBotConfigDialog({
  domainId,
  domainName,
  trigger,
}: {
  domainId: string;
  domainName: string;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-teal-600"
          >
            <Bot className="h-3.5 w-3.5" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto p-0">
        {/* Hero */}
        <div className="relative overflow-hidden bg-gradient-to-b from-white/90 via-amber-50/30 to-teal-50/40 dark:from-gray-900/90 dark:via-amber-950/10 dark:to-teal-950/20 px-6 pt-6 pb-4">
          <div className="absolute inset-x-0 bottom-0 h-12 opacity-[0.03] pointer-events-none">
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
          <DialogHeader className="relative">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 text-white shadow-lg shadow-teal-500/20">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">
                  Chatbot Settings
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {domainName}
                </p>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="px-6 pb-6">
          <Accordion
            type="multiple"
            defaultValue={["appearance"]}
            className="space-y-2"
          >
            {/* Appearance */}
            <AccordionItem value="appearance" className="border-none">
              <AccordionTrigger className="py-3 px-0 hover:no-underline">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Palette className="h-4 w-4 text-teal-500" />
                  Appearance & Welcome Message
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-4">
                <AppearanceSection domainId={domainId} />
              </AccordionContent>
            </AccordionItem>

            <Separator />

            {/* Help Desk */}
            <AccordionItem value="helpdesk" className="border-none">
              <AccordionTrigger className="py-3 px-0 hover:no-underline">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <HelpCircle className="h-4 w-4 text-amber-500" />
                  Help Desk (FAQ)
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-4">
                <HelpDeskSection domainId={domainId} />
              </AccordionContent>
            </AccordionItem>

            <Separator />

            {/* Filter Questions */}
            <AccordionItem value="filter" className="border-none">
              <AccordionTrigger className="py-3 px-0 hover:no-underline">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Filter className="h-4 w-4 text-orange-500" />
                  Qualification Questions
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-4">
                <FilterQuestionsSection domainId={domainId} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Appearance Section ───────────────────────────────────
function AppearanceSection({ domainId }: { domainId: string }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: config, isLoading } = useChatBotConfig(domainId);
  const updateConfig = useUpdateChatBotConfig(domainId);

  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [headerText, setHeaderText] = useState("Sales Rep");
  const [themeColor, setThemeColor] = useState("#14b8a6");
  const [icon, setIcon] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  if (config && !initialized) {
    setWelcomeMessage(config.welcomeMessage ?? "");
    setHeaderText(config.headerText ?? "Sales Rep");
    setThemeColor(config.themeColor ?? "#14b8a6");
    setIcon(config.icon ?? null);
    setInitialized(true);
  }

  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res) => {
      if (res?.[0]?.url) {
        setIcon(res[0].url);
        toast.success("Icon uploaded");
      }
    },
    onUploadError: (error) => {
      toast.error(error.message);
    },
  });

  const handleIconSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      startUpload([file]);
    }
  };

  const handleSave = () => {
    updateConfig.mutate({
      domainId,
      welcomeMessage: welcomeMessage || undefined,
      headerText: headerText || undefined,
      themeColor,
      icon,
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Chatbot Icon */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Chatbot Icon</Label>
        <p className="text-[11px] text-muted-foreground">
          Change the icon for your chatbot widget.
        </p>
        <div className="flex items-center gap-3 pt-1">
          {/* Preview */}
          <div className="relative">
            {icon ? (
              <div className="h-16 w-16 rounded-full overflow-hidden ring-2 ring-border/50">
                <Image
                  src={icon}
                  alt="Chatbot icon"
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-md">
                <Bot className="h-7 w-7 text-white" />
              </div>
            )}
            {icon && (
              <button
                type="button"
                onClick={() => setIcon(null)}
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Upload button */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleIconSelect}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="rounded-lg text-xs"
            >
              {isUploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              ) : (
                <ImagePlus className="h-3.5 w-3.5 mr-1.5" />
              )}
              {icon ? "Change Image" : "Upload Image"}
            </Button>
          </div>
        </div>
      </div>

      {/* Welcome Message */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium flex items-center gap-1.5">
          <MessageCircle className="h-3 w-3 text-muted-foreground" />
          Welcome Message
        </Label>
        <Textarea
          value={welcomeMessage}
          onChange={(e) => setWelcomeMessage(e.target.value)}
          placeholder="Hey there, How can we assist?"
          className="min-h-[72px] rounded-xl border-border/60 text-sm resize-none focus-visible:ring-teal-500/30"
          rows={2}
        />
      </div>

      {/* Header Text */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Header Text</label>
        <input
          type="text"
          value={headerText}
          onChange={(e) => setHeaderText(e.target.value)}
          placeholder="Sales Rep"
          className="w-full h-9 rounded-lg border border-border/40 bg-background px-3 text-sm outline-none"
        />
      </div>

      {/* Theme Color — show header preview instead of prompt */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Theme Color</label>
        <div className="rounded-xl overflow-hidden border border-border/40">
          {/* Mini header preview */}
          <div
            className="px-3 py-2.5 flex items-center gap-2"
            style={{ backgroundColor: themeColor || "#14b8a6" }}
          >
            <div className="h-7 w-7 rounded-full bg-white/20 shrink-0" />
            <span className="text-white text-xs font-semibold truncate">
              {headerText || "Sales Rep"}
            </span>
          </div>
          <div className="bg-gray-50 px-3 py-2 flex items-center gap-2">
            <div className="flex-1 h-7 rounded-md bg-gray-200" />
            <div
              className="h-7 w-7 rounded-md"
              style={{ backgroundColor: themeColor || "#14b8a6" }}
            />
          </div>
        </div>
        <input
          type="color"
          value={themeColor || "#14b8a6"}
          onChange={(e) => setThemeColor(e.target.value)}
          className="h-10 w-full cursor-pointer rounded-lg border border-border/40"
        />
      </div>

      <Button
        onClick={handleSave}
        disabled={updateConfig.isPending || isUploading}
        className="w-full rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 border-0 shadow-md shadow-teal-500/15"
      >
        {updateConfig.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Save className="h-4 w-4 mr-2" />
        )}
        Save Changes
      </Button>
    </div>
  );
}

// ─── Help Desk accordion item ───────────────────────────────
function HelpDeskAccordionItem({
  item,
  onDelete,
  isDeleting,
}: {
  item: { id: string; question: string; answer: string };
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="group rounded-xl border border-border/40 overflow-hidden">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((p) => !p)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setOpen((p) => !p); }}
        className="flex w-full items-center justify-between px-3 py-2.5 text-left hover:bg-muted/30 transition-colors cursor-pointer"
      >
        <span className="text-sm font-medium truncate flex-1 pr-2">
          {item.question}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            disabled={isDeleting}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
          />
        </div>
      </div>
      {open && (
        <div className="px-3 pb-3 text-xs text-muted-foreground leading-relaxed border-t border-border/20 pt-2">
          {item.answer}
        </div>
      )}
    </div>
  );
}

// ─── Help Desk Section ────────────────────────────────────
function HelpDeskSection({ domainId }: { domainId: string }) {
  const { data: items, isLoading } = useHelpDeskItems(domainId);
  const createItem = useCreateHelpDeskItem(domainId);
  const deleteItem = useDeleteHelpDeskItem(domainId);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<HelpDeskForm>({
    resolver: zodResolver(helpDeskSchema),
  });

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Add FAQ entries that your chatbot can reference when answering
        questions.
      </p>

      {/* Add form */}
      <form
        onSubmit={handleSubmit((data) =>
          createItem.mutate(
            { domainId, ...data },
            { onSuccess: () => reset() },
          ),
        )}
        className="space-y-3 rounded-xl bg-muted/30 dark:bg-muted/10 border border-border/40 p-3"
      >
        <div className="space-y-1.5">
          <Input
            placeholder="Question (e.g. What are your hours?)"
            {...register("question")}
            className="h-8 text-sm rounded-lg border-border/60 focus-visible:ring-teal-500/30"
          />
          {errors.question && (
            <p className="text-[11px] text-destructive">
              {errors.question.message}
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <Textarea
            placeholder="Answer"
            {...register("answer")}
            className="min-h-[56px] text-sm rounded-lg border-border/60 resize-none focus-visible:ring-teal-500/30"
            rows={2}
          />
          {errors.answer && (
            <p className="text-[11px] text-destructive">
              {errors.answer.message}
            </p>
          )}
        </div>
        <Button
          type="submit"
          size="sm"
          disabled={createItem.isPending}
          className="rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 border-0"
        >
          {createItem.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
          ) : (
            <Plus className="h-3.5 w-3.5 mr-1.5" />
          )}
          Add
        </Button>
      </form>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      ) : items && items.length > 0 ? (
        <div className="space-y-2">
          {items.map((item) => (
            <HelpDeskAccordionItem
              key={item.id}
              item={item}
              onDelete={() => deleteItem.mutate({ id: item.id })}
              isDeleting={deleteItem.isPending}
            />
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground/60 text-center py-3">
          No FAQ entries yet
        </p>
      )}
    </div>
  );
}

// ─── Filter Questions Section ─────────────────────────────
function FilterQuestionsSection({ domainId }: { domainId: string }) {
  const { data: questions, isLoading } = useFilterQuestions(domainId);
  const createQuestion = useCreateFilterQuestion(domainId);
  const deleteQuestion = useDeleteFilterQuestion(domainId);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FilterQuestionForm>({
    resolver: zodResolver(filterQuestionSchema),
  });

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Questions the bot asks visitors to qualify them and route conversations.
      </p>

      {/* Add form */}
      <form
        onSubmit={handleSubmit((data) =>
          createQuestion.mutate(
            { domainId, ...data },
            { onSuccess: () => reset() },
          ),
        )}
        className="flex gap-2"
      >
        <div className="flex-1 space-y-1">
          <Input
            placeholder="e.g. Which location are you nearest to?"
            {...register("question")}
            className="h-8 text-sm rounded-lg border-border/60 focus-visible:ring-teal-500/30"
          />
          {errors.question && (
            <p className="text-[11px] text-destructive">
              {errors.question.message}
            </p>
          )}
        </div>
        <Button
          type="submit"
          size="sm"
          disabled={createQuestion.isPending}
          className="shrink-0 h-8 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 border-0"
        >
          {createQuestion.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Plus className="h-3.5 w-3.5" />
          )}
        </Button>
      </form>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      ) : questions && questions.length > 0 ? (
        <div className="space-y-2">
          {questions.map((q) => (
            <div
              key={q.id}
              className="group flex items-center justify-between rounded-xl bg-card/80 border border-border/40 px-3 py-2.5"
            >
              <p className="text-sm truncate flex-1">{q.question}</p>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                onClick={() => deleteQuestion.mutate({ id: q.id })}
                disabled={deleteQuestion.isPending}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground/60 text-center py-3">
          No qualification questions yet
        </p>
      )}
    </div>
  );
}

// ─── Navbar quick access ───────────────────────────────────
export function ChatBotQuickAccess() {
  const { data: domains, isLoading } = useDomains();

  // Loading state
  if (isLoading) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9" disabled>
        <Bot className="h-4 w-4" />
      </Button>
    );
  }

  // No domains — disabled with tooltip feel
  if (!domains || domains.length === 0) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 opacity-50 cursor-not-allowed"
        disabled
      >
        <Bot className="h-4 w-4" />
      </Button>
    );
  }

  // Single domain — open config directly
  if (domains.length === 1) {
    return (
      <ChatBotConfigDialog
        domainId={domains[0].id}
        domainName={domains[0].name}
        trigger={
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Bot className="h-4 w-4" />
          </Button>
        }
      />
    );
  }

  // Multiple domains — picker
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Bot className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0" align="end">
        <div className="py-1">
          <p className="px-3 py-2 text-xs font-medium text-muted-foreground">
            Select domain
          </p>
          {domains.map((d) => (
            <DomainPickerItem key={d.id} domain={d} />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function DomainPickerItem({
  domain,
}: {
  domain: { id: string; name: string };
}) {
  return (
    <ChatBotConfigDialog
      domainId={domain.id}
      domainName={domain.name}
      trigger={
        <button
          type="button"
          className="flex w-full items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted/60 transition-colors"
        >
          <Globe className="h-3.5 w-3.5 text-muted-foreground" />
          {domain.name}
        </button>
      }
    />
  );
}

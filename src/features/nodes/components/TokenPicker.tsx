"use client";

import { Braces } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { TOKEN_CATEGORIES, TOKEN_DEFINITIONS } from "../actions/lib/token-map";

interface TokenPickerProps {
  onInsert: (token: string) => void;
  variant?: "campaign" | "handlebars" | "both";
}

const HANDLEBARS_TOKEN_MAP: Record<string, string> = {
  first_name: "contact.firstName",
  last_name: "contact.lastName",
  full_name: "contact.fullName",
  email: "contact.email",
  phone: "contact.phone",
  location_name: "location_name",
  location_phone: "location_phone",
  review_link: "workspace.googleReviewUrl",
  feedback_link: "workspace.feedbackLink",
  review_rating: "review.rating",
  review_text: "review.text",
  reviewer_name: "review.authorName",
  ai_output: "aiOutput",
};

export function TokenPicker({ onInsert, variant = "campaign" }: TokenPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return TOKEN_DEFINITIONS;
    return TOKEN_DEFINITIONS.filter(
      (token) =>
        token.label.toLowerCase().includes(query) ||
        token.token.toLowerCase().includes(query),
    );
  }, [search]);

  const handleSelect = (token: string) => {
    if (variant === "campaign") {
      onInsert(`{${token}}`);
    } else if (variant === "handlebars") {
      onInsert(`{{${HANDLEBARS_TOKEN_MAP[token] || token}}}`);
    } else {
      onInsert(`{${token}}`);
    }

    setOpen(false);
    setSearch("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-1.5 text-[10px] text-muted-foreground"
        >
          <Braces className="size-3 mr-1" />
          Insert variable
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <div className="p-2 border-b">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search tokens..."
            className="h-7 text-xs"
            autoFocus
          />
        </div>
        <div className="max-h-56 overflow-y-auto py-1">
          {TOKEN_CATEGORIES.map((category) => {
            const categoryTokens = filtered.filter(
              (token) => token.category === category.id,
            );
            if (categoryTokens.length === 0) return null;

            return (
              <div key={category.id}>
                <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {category.label}
                </div>
                {categoryTokens.map((token) => (
                  <button
                    key={token.token}
                    type="button"
                    onClick={() => handleSelect(token.token)}
                    className={cn(
                      "w-full flex items-center justify-between px-2 py-1.5 text-left",
                      "hover:bg-accent text-xs transition-colors",
                    )}
                  >
                    <span>{token.label}</span>
                    <code className="text-[10px] text-muted-foreground">
                      {`{${token.token}}`}
                    </code>
                  </button>
                ))}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">
              No tokens match
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

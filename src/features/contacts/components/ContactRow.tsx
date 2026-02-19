import Link from "next/link";
import { StageBadge } from "./StageBadge";

type Contact = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  stage: string;
  source: string;
  lastContactedAt: string | null;
  createdAt: string;
  workspace: { id: string; name: string } | null;
  categories: {
    category: { id: string; name: string; color: string | null };
  }[];
};

export function ContactRow({
  contact,
  basePath = "/index/contacts",
}: {
  contact: Contact;
  basePath?: string;
}) {
  const name =
    [contact.firstName, contact.lastName].filter(Boolean).join(" ") || "—";

  return (
    <Link
      href={`${basePath}/${contact.id}`}
      className="flex items-center gap-4 px-4 py-3 border-b border-border/40 hover:bg-muted/30 transition-colors"
    >
      {/* Avatar */}
      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
        <span className="text-xs font-semibold text-muted-foreground">
          {(contact.firstName?.[0] || "?").toUpperCase()}
        </span>
      </div>

      {/* Name + contact */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{name}</p>
        <p className="text-xs text-muted-foreground truncate">
          {contact.email || contact.phone || "No contact info"}
        </p>
      </div>

      {/* Stage */}
      <div className="hidden sm:block shrink-0">
        <StageBadge stage={contact.stage} />
      </div>

      {/* Categories */}
      <div className="hidden md:flex items-center gap-1 shrink-0 max-w-[150px]">
        {contact.categories.slice(0, 2).map((cc) => (
          <span
            key={cc.category.id}
            className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground truncate"
          >
            {cc.category.name}
          </span>
        ))}
        {contact.categories.length > 2 && (
          <span className="text-[10px] text-muted-foreground">
            +{contact.categories.length - 2}
          </span>
        )}
      </div>

      {/* Location */}
      <div className="hidden lg:block shrink-0 w-[120px]">
        <p className="text-xs text-muted-foreground truncate">
          {contact.workspace?.name || "—"}
        </p>
      </div>

      {/* Source */}
      <div className="hidden lg:block shrink-0 w-[70px]">
        <span className="text-[10px] text-muted-foreground capitalize">
          {contact.source}
        </span>
      </div>

      {/* Date */}
      <div className="shrink-0 w-[80px] text-right">
        <p className="text-[11px] text-muted-foreground">
          {new Date(contact.createdAt).toLocaleDateString([], {
            month: "short",
            day: "numeric",
          })}
        </p>
      </div>
    </Link>
  );
}

// src/features/chatbot/components/widget/LocationSelector.tsx
"use client";

type Location = {
  id: string;
  name: string;
  imageUrl: string | null;
};

type Props = {
  locations: Location[];
  onSelect: (locationId: string) => void;
};

export function LocationSelector({ locations, onSelect }: Props) {
  return (
    <div className="px-3 py-2 space-y-2">
      <p className="text-xs text-muted-foreground px-1">
        Which location are you reaching out to?
      </p>
      <div className="space-y-1.5">
        {locations.map((loc) => (
          <button
            key={loc.id}
            type="button"
            onClick={() => onSelect(loc.id)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border/30 hover:bg-muted/40 transition-colors text-left"
          >
            <div className="h-10 w-10 rounded-lg overflow-hidden shrink-0 bg-muted">
              {loc.imageUrl ? (
                <img
                  src={loc.imageUrl}
                  alt={loc.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-sm font-semibold text-muted-foreground">
                  {loc.name[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <span className="text-sm font-medium truncate">{loc.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

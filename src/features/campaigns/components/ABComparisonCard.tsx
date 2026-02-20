"use client";

import { Trophy } from "lucide-react";

function pct(num: number, denom: number): string {
  if (denom === 0) return "0%";
  return `${((num / denom) * 100).toFixed(1)}%`;
}

export function ABComparisonCard({
  campaign,
}: {
  campaign: {
    variantB: string | null;
    variantSplit: number;
    messageTemplate: string;
    variantASent: number;
    variantADelivered: number;
    variantAReplied: number;
    variantBSent: number;
    variantBDelivered: number;
    variantBReplied: number;
    status: string;
  };
}) {
  if (!campaign.variantB) return null;

  const aReplyRate =
    campaign.variantASent > 0
      ? campaign.variantAReplied / campaign.variantASent
      : 0;
  const bReplyRate =
    campaign.variantBSent > 0
      ? campaign.variantBReplied / campaign.variantBSent
      : 0;

  const aDeliveryRate =
    campaign.variantASent > 0
      ? campaign.variantADelivered / campaign.variantASent
      : 0;
  const bDeliveryRate =
    campaign.variantBSent > 0
      ? campaign.variantBDelivered / campaign.variantBSent
      : 0;

  const isComplete = campaign.status === "completed";
  const hasData = campaign.variantASent > 0 || campaign.variantBSent > 0;

  // Determine winner by reply rate, then delivery rate
  let winner: "A" | "B" | null = null;
  if (isComplete && hasData) {
    if (aReplyRate !== bReplyRate) {
      winner = aReplyRate > bReplyRate ? "A" : "B";
    } else if (aDeliveryRate !== bDeliveryRate) {
      winner = aDeliveryRate > bDeliveryRate ? "A" : "B";
    }
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b bg-muted/10">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          A/B Test Results
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Split: {campaign.variantSplit}% A / {100 - campaign.variantSplit}% B
        </p>
      </div>

      <div className="grid grid-cols-2 divide-x">
        {/* Variant A */}
        <VariantColumn
          label="A"
          color="teal"
          isWinner={winner === "A"}
          sent={campaign.variantASent}
          delivered={campaign.variantADelivered}
          replied={campaign.variantAReplied}
          deliveryRate={pct(campaign.variantADelivered, campaign.variantASent)}
          replyRate={pct(campaign.variantAReplied, campaign.variantASent)}
          message={campaign.messageTemplate}
        />

        {/* Variant B */}
        <VariantColumn
          label="B"
          color="violet"
          isWinner={winner === "B"}
          sent={campaign.variantBSent}
          delivered={campaign.variantBDelivered}
          replied={campaign.variantBReplied}
          deliveryRate={pct(campaign.variantBDelivered, campaign.variantBSent)}
          replyRate={pct(campaign.variantBReplied, campaign.variantBSent)}
          message={campaign.variantB}
        />
      </div>
    </div>
  );
}

function VariantColumn({
  label,
  color,
  isWinner,
  sent,
  delivered,
  replied,
  deliveryRate,
  replyRate,
  message,
}: {
  label: string;
  color: "teal" | "violet";
  isWinner: boolean;
  sent: number;
  delivered: number;
  replied: number;
  deliveryRate: string;
  replyRate: string;
  message: string | null;
}) {
  const labelColor = color === "teal" ? "text-teal-600" : "text-violet-600";
  const barColor = color === "teal" ? "bg-teal-500" : "bg-violet-500";
  const winnerBg = color === "teal" ? "bg-teal-50" : "bg-violet-50";

  return (
    <div className={`p-4 space-y-3 ${isWinner ? winnerBg : ""}`}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className={`text-sm font-semibold ${labelColor}`}>
          Variant {label}
        </span>
        {isWinner && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-100 border border-amber-200">
            <Trophy className="h-2.5 w-2.5 text-amber-600" />
            <span className="text-[10px] font-semibold text-amber-700">
              Winner
            </span>
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="space-y-2">
        <StatRow label="Sent" value={sent.toLocaleString()} />
        <StatRow
          label="Delivered"
          value={delivered.toLocaleString()}
          sub={deliveryRate}
        />
        <StatRow
          label="Replied"
          value={replied.toLocaleString()}
          sub={replyRate}
          highlight
        />

        {/* Reply rate bar */}
        <div className="pt-1">
          <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
            <div
              className={`h-full rounded-full ${barColor} transition-all`}
              style={{
                width: `${sent > 0 ? (replied / sent) * 100 : 0}%`,
              }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            {replyRate} reply rate
          </p>
        </div>
      </div>

      {/* Message preview */}
      {message && (
        <div className="pt-2 border-t">
          <p className="text-[10px] font-medium text-muted-foreground mb-1">
            Message
          </p>
          <p className="text-xs text-muted-foreground whitespace-pre-wrap line-clamp-4">
            {message}
          </p>
        </div>
      )}
    </div>
  );
}

function StatRow({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1.5">
        <span
          className={`text-sm font-medium ${
            highlight ? "text-foreground" : ""
          }`}
        >
          {value}
        </span>
        {sub && (
          <span className="text-[10px] text-muted-foreground">({sub})</span>
        )}
      </div>
    </div>
  );
}

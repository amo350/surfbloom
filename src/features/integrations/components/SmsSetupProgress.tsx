// src/features/integrations/components/SmsSetupProgress.tsx
"use client";

import {
  CheckCircle,
  Clock,
  Circle,
  MessageSquare,
  Shield,
  Phone,
} from "lucide-react";

type Step = {
  label: string;
  description: string;
  status: "complete" | "active" | "upcoming";
  icon: React.ReactNode;
};

function StepItem({ step, isLast }: { step: Step; isLast: boolean }) {
  return (
    <div className="flex gap-3">
      {/* Icon + connector line */}
      <div className="flex flex-col items-center">
        <div
          className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
            step.status === "complete"
              ? "bg-green-50 text-green-600"
              : step.status === "active"
                ? "bg-amber-50 text-amber-600"
                : "bg-muted text-muted-foreground"
          }`}
        >
          {step.status === "complete" ? (
            <CheckCircle className="h-4 w-4" />
          ) : step.status === "active" ? (
            <Clock className="h-4 w-4" />
          ) : (
            <Circle className="h-4 w-4" />
          )}
        </div>
        {!isLast && (
          <div
            className={`w-px flex-1 my-1 ${
              step.status === "complete" ? "bg-green-300" : "bg-border"
            }`}
          />
        )}
      </div>

      {/* Content */}
      <div className="pb-5">
        <p
          className={`text-sm font-medium leading-tight ${
            step.status === "upcoming" ? "text-muted-foreground" : ""
          }`}
        >
          {step.label}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {step.description}
        </p>
      </div>
    </div>
  );
}

export function SmsSetupProgress({
  hasSubaccount,
  hasPhoneNumber,
  verificationStatus,
  phoneNumber,
}: {
  hasSubaccount: boolean;
  hasPhoneNumber: boolean;
  verificationStatus: string;
  phoneNumber?: string | null;
}) {
  const isVerified = verificationStatus === "approved";

  const steps: Step[] = [
    {
      label: "SMS Messaging Enabled",
      description: hasSubaccount
        ? "Your messaging account is set up and active."
        : "Enable SMS messaging on the Integrations page.",
      status: hasSubaccount ? "complete" : "active",
      icon: <MessageSquare className="h-4 w-4" />,
    },
    {
      label: "Phone Number Assigned",
      description: hasPhoneNumber
        ? `${phoneNumber} is ready for this location.`
        : "Search and assign a local number on the Integrations page.",
      status: hasPhoneNumber
        ? "complete"
        : hasSubaccount
          ? "active"
          : "upcoming",
      icon: <Phone className="h-4 w-4" />,
    },
    {
      label: "Carrier Verification",
      description: isVerified
        ? "Fully verified — no sending limits."
        : verificationStatus === "pending"
          ? "Your application is being reviewed by mobile carriers. This typically takes 1-5 business days. You can still send SMS to verified numbers during this time."
          : "Submitted automatically when your number is assigned.",
      status: isVerified
        ? "complete"
        : verificationStatus === "pending"
          ? "active"
          : "upcoming",
      icon: <Shield className="h-4 w-4" />,
    },
  ];

  const allComplete = steps.every((s) => s.status === "complete");

  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <div>
        <h3 className="text-sm font-semibold">SMS Setup</h3>
        {allComplete ? (
          <p className="text-xs text-green-600 font-medium mt-0.5">
            Fully operational — ready to send at scale.
          </p>
        ) : (
          <p className="text-xs text-muted-foreground mt-0.5">
            Complete these steps to start sending SMS messages.
          </p>
        )}
      </div>

      <div>
        {steps.map((step, i) => (
          <StepItem
            key={step.label}
            step={step}
            isLast={i === steps.length - 1}
          />
        ))}
      </div>

      {/* Twilio reassurance */}
      {!allComplete && (
        <div className="rounded-lg bg-blue-50/50 border border-blue-100 px-3 py-2.5">
          <p className="text-xs text-blue-800 font-medium">Powered by Twilio</p>
          <p className="text-[11px] text-blue-700 mt-0.5 leading-relaxed">
            Your messages are delivered through Twilio, the industry-leading
            messaging platform trusted by over 300,000 businesses worldwide. All
            messages comply with TCPA regulations and carrier requirements.
            {verificationStatus === "pending" && (
              <span className="block mt-1">
                While carrier verification is processing, you can send SMS to
                individually verified numbers. Once approved, all sending
                restrictions are lifted.
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}

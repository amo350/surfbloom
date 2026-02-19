import { MessageCircle, MessageSquare, Phone } from "lucide-react";

const CHANNEL_CONFIG = {
  webchat: {
    icon: MessageSquare,
    label: "Chat",
    color: "text-teal-600 bg-teal-50",
  },
  sms: {
    icon: Phone,
    label: "SMS",
    color: "text-blue-600 bg-blue-50",
  },
  feedback: {
    icon: MessageCircle,
    label: "Feedback",
    color: "text-amber-600 bg-amber-50",
  },
} as const;

export function ChannelBadge({ channel }: { channel: string }) {
  const config =
    CHANNEL_CONFIG[channel as keyof typeof CHANNEL_CONFIG] ||
    CHANNEL_CONFIG.webchat;
  const Icon = config.icon;

  return (
    <div className={`p-0.5 rounded ${config.color}`} title={config.label}>
      <Icon className="h-3 w-3" />
    </div>
  );
}

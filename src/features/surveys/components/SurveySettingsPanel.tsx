"use client";

import { useState, useEffect } from "react";
import { Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useUpdateSurvey } from "../hooks/use-surveys";

interface SurveySettingsPanelProps {
  survey: {
    id: string;
    status: string;
    thankYouMessage: string;
    reviewThreshold: number;
    taskThreshold: number;
    reviewUrl: string | null;
    taskAssigneeId: string | null;
  };
  teamMembers?: { id: string; name: string | null; email: string }[];
}

export function SurveySettingsPanel({
  survey,
  teamMembers = [],
}: SurveySettingsPanelProps) {
  const [thankYou, setThankYou] = useState(survey.thankYouMessage);
  const [reviewThreshold, setReviewThreshold] = useState(
    survey.reviewThreshold,
  );
  const [taskThreshold, setTaskThreshold] = useState(survey.taskThreshold);
  const [reviewUrl, setReviewUrl] = useState(survey.reviewUrl || "");
  const [assigneeId, setAssigneeId] = useState(survey.taskAssigneeId || "none");

  const updateSurvey = useUpdateSurvey();

  useEffect(() => {
    setThankYou(survey.thankYouMessage);
    setReviewThreshold(survey.reviewThreshold);
    setTaskThreshold(survey.taskThreshold);
    setReviewUrl(survey.reviewUrl || "");
    setAssigneeId(survey.taskAssigneeId || "none");
  }, [survey]);

  const isValidHttpUrl = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return true;
    try {
      const parsed = new URL(trimmed);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleSave = () => {
    if (!isValidHttpUrl(reviewUrl)) {
      toast.error("Please enter a valid https:// or http:// URL");
      return;
    }

    updateSurvey.mutate(
      {
        id: survey.id,
        thankYouMessage: thankYou.trim() || "Thank you for your feedback!",
        reviewThreshold,
        taskThreshold,
        reviewUrl: reviewUrl.trim() || null,
        taskAssigneeId: assigneeId === "none" ? null : assigneeId,
      },
      {
        onSuccess: () => toast.success("Settings saved"),
        onError: (err) => toast.error(err?.message || "Failed"),
      },
    );
  };

  const editable = survey.status !== "active";

  return (
    <div className="space-y-6 max-w-lg">
      {survey.status === "active" && (
        <div className="px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700">
          Set to draft to edit settings
        </div>
      )}

      {/* Review Redirect */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold">Review Redirect</h3>
        <p className="text-[10px] text-muted-foreground">
          Customers scoring at or above this threshold will see a prompt to
          leave a public review
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Threshold
            </label>
            <Select
              value={String(reviewThreshold)}
              onValueChange={(v) => setReviewThreshold(Number(v))}
              disabled={!editable}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[6, 7, 8, 9, 10].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}+ out of 10
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Google Review URL
          </label>
          <div className="relative">
            <Input
              value={reviewUrl}
              onChange={(e) => setReviewUrl(e.target.value)}
              placeholder="https://g.page/your-business/review"
              className="h-9 pr-8"
              disabled={!editable}
            />
            {reviewUrl && isValidHttpUrl(reviewUrl) && (
              <a
                href={reviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute right-2.5 top-1/2 -translate-y-1/2"
              >
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
              </a>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground">
            Find this in Google Business Profile → Share review form
          </p>
        </div>
      </section>

      {/* Task Creation */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold">Low Score Alerts</h3>
        <p className="text-[10px] text-muted-foreground">
          Customers scoring at or below this threshold will trigger a task for
          your team to follow up
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Threshold
            </label>
            <Select
              value={String(taskThreshold)}
              onValueChange={(v) => setTaskThreshold(Number(v))}
              disabled={!editable}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[3, 4, 5, 6, 7].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} or below
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Assign to
            </label>
            <Select
              value={assigneeId}
              onValueChange={setAssigneeId}
              disabled={!editable}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Unassigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Unassigned</SelectItem>
                {teamMembers.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name || m.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Thank You Message */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold">Thank You Message</h3>
        <p className="text-[10px] text-muted-foreground">
          Shown to respondents who score between the review and task thresholds
        </p>
        <Textarea
          value={thankYou}
          onChange={(e) => setThankYou(e.target.value)}
          rows={2}
          className="resize-none text-sm"
          maxLength={500}
          disabled={!editable}
        />
      </section>

      {/* Save */}
      {editable && (
        <Button
          size="sm"
          onClick={handleSave}
          disabled={updateSurvey.isPending}
        >
          {updateSurvey.isPending && (
            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
          )}
          Save Settings
        </Button>
      )}
    </div>
  );
}

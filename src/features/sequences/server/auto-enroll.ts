import { prisma } from "@/lib/prisma";
import { enrollContact } from "./enroll";

interface AutoEnrollResult {
  sequencesChecked: number;
  enrolled: number;
  skipped: number;
  details: {
    sequenceId: string;
    sequenceName: string;
    enrolled: boolean;
    reason?: string;
  }[];
}

type SequenceTriggerType = "contact_created" | "keyword_join" | "stage_change";

/**
 * Find all active sequences in a workspace that match the given trigger,
 * and enroll the contact into each one.
 *
 * Fire-and-forget safe — catches all errors internally.
 */
export async function autoEnrollByTrigger(
  workspaceId: string,
  contactId: string,
  triggerType: SequenceTriggerType,
  triggerValue?: string,
): Promise<AutoEnrollResult> {
  const result: AutoEnrollResult = {
    sequencesChecked: 0,
    enrolled: 0,
    skipped: 0,
    details: [],
  };

  try {
    const where: {
      workspaceId: string;
      status: "active";
      triggerType: SequenceTriggerType;
      triggerValue?: string;
    } = {
      workspaceId,
      status: "active",
      triggerType,
    };

    if (
      (triggerType === "keyword_join" || triggerType === "stage_change") &&
      triggerValue
    ) {
      where.triggerValue = triggerValue;
    }

    const sequences = await prisma.campaignSequence.findMany({
      where,
      select: {
        id: true,
        name: true,
      },
    });

    result.sequencesChecked = sequences.length;

    if (sequences.length === 0) return result;

    for (const sequence of sequences) {
      try {
        const enrollResult = await enrollContact(sequence.id, contactId);

        result.details.push({
          sequenceId: sequence.id,
          sequenceName: sequence.name,
          enrolled: enrollResult.enrolled,
          reason: enrollResult.skippedReason,
        });

        if (enrollResult.enrolled) {
          result.enrolled++;
        } else {
          result.skipped++;
        }
      } catch (err) {
        console.error(
          `Auto-enroll error [sequence=${sequence.id}, contact=${contactId}]:`,
          err,
        );
        result.skipped++;
        result.details.push({
          sequenceId: sequence.id,
          sequenceName: sequence.name,
          enrolled: false,
          reason: `error: ${
            (err as { message?: string })?.message?.slice(0, 200) || "unknown"
          }`,
        });
      }
    }
  } catch (err) {
    console.error(
      `Auto-enroll lookup error [workspace=${workspaceId}, trigger=${triggerType}]:`,
      err,
    );
  }

  return result;
}

export function autoEnrollOnContactCreated(
  workspaceId: string,
  contactId: string,
): Promise<AutoEnrollResult> {
  return autoEnrollByTrigger(workspaceId, contactId, "contact_created");
}

export function autoEnrollOnKeywordJoin(
  workspaceId: string,
  contactId: string,
  keyword: string,
): Promise<AutoEnrollResult> {
  return autoEnrollByTrigger(workspaceId, contactId, "keyword_join", keyword);
}

export function autoEnrollOnStageChange(
  workspaceId: string,
  contactId: string,
  newStage: string,
): Promise<AutoEnrollResult> {
  return autoEnrollByTrigger(workspaceId, contactId, "stage_change", newStage);
}

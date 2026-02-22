import { prisma } from "@/lib/prisma";

interface EnrollResult {
  enrolled: boolean;
  enrollmentId?: string;
  skippedReason?: string;
}

export async function enrollContact(
  sequenceId: string,
  contactId: string,
): Promise<EnrollResult> {
  const sequence = await prisma.campaignSequence.findUnique({
    where: { id: sequenceId },
    select: {
      id: true,
      status: true,
      workspaceId: true,
      frequencyCapDays: true,
      audienceType: true,
      audienceStage: true,
      audienceCategoryId: true,
      audienceInactiveDays: true,
      steps: {
        orderBy: { order: "asc" },
        take: 1,
        select: { id: true, delayMinutes: true },
      },
    },
  });

  if (!sequence) {
    return { enrolled: false, skippedReason: "sequence_not_found" };
  }

  if (sequence.status !== "active") {
    return { enrolled: false, skippedReason: "sequence_not_active" };
  }

  if (sequence.steps.length === 0) {
    return { enrolled: false, skippedReason: "no_steps" };
  }

  const contact = await prisma.chatContact.findUnique({
    where: { id: contactId },
    select: {
      id: true,
      workspaceId: true,
      optedOut: true,
      stage: true,
      categories: { select: { id: true } },
      lastContactedAt: true,
    },
  });

  if (!contact) {
    return { enrolled: false, skippedReason: "contact_not_found" };
  }

  if (contact.workspaceId !== sequence.workspaceId) {
    return { enrolled: false, skippedReason: "wrong_workspace" };
  }

  if (contact.optedOut) {
    return { enrolled: false, skippedReason: "opted_out" };
  }

  if (sequence.audienceType === "stage" && sequence.audienceStage) {
    if (contact.stage !== sequence.audienceStage) {
      return { enrolled: false, skippedReason: "audience_filter_stage" };
    }
  }

  if (sequence.audienceType === "category" && sequence.audienceCategoryId) {
    const hasCategory = contact.categories.some(
      (c) => c.id === sequence.audienceCategoryId,
    );
    if (!hasCategory) {
      return { enrolled: false, skippedReason: "audience_filter_category" };
    }
  }

  if (sequence.audienceType === "inactive" && sequence.audienceInactiveDays) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - sequence.audienceInactiveDays);
    if (contact.lastContactedAt && contact.lastContactedAt > cutoff) {
      return { enrolled: false, skippedReason: "audience_filter_inactive" };
    }
  }

  if (sequence.frequencyCapDays) {
    const capCutoff = new Date();
    capCutoff.setDate(capCutoff.getDate() - sequence.frequencyCapDays);

    const recentEnrollment = await prisma.campaignSequenceEnrollment.findFirst({
      where: {
        sequenceId,
        contactId,
        enrolledAt: { gte: capCutoff },
      },
      select: { id: true },
    });

    if (recentEnrollment) {
      return { enrolled: false, skippedReason: "frequency_cap" };
    }
  }

  const existingEnrollment = await prisma.campaignSequenceEnrollment.findFirst({
    where: {
      sequenceId,
      contactId,
    },
    select: { id: true },
  });

  if (existingEnrollment) {
    return { enrolled: false, skippedReason: "already_enrolled" };
  }

  const firstStep = sequence.steps[0];
  const nextStepAt = new Date();
  nextStepAt.setMinutes(nextStepAt.getMinutes() + firstStep.delayMinutes);

  const enrollment = await prisma.campaignSequenceEnrollment.create({
    data: {
      sequenceId,
      contactId,
      status: "active",
      currentStep: 1,
      nextStepAt,
      enrolledAt: new Date(),
    },
  });

  return { enrolled: true, enrollmentId: enrollment.id };
}

export async function enrollContacts(
  sequenceId: string,
  contactIds: string[],
): Promise<{
  enrolled: number;
  skipped: number;
  results: EnrollResult[];
}> {
  const results: EnrollResult[] = [];

  for (const contactId of contactIds) {
    const result = await enrollContact(sequenceId, contactId);
    results.push(result);
  }

  const enrolled = results.filter((r) => r.enrolled).length;
  const skipped = results.filter((r) => !r.enrolled).length;

  return { enrolled, skipped, results };
}

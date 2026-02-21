import { prisma } from "@/lib/prisma";

export async function updateCampaignStats(campaignId: string) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    select: { variantB: true },
  });

  if (!campaign) return;

  // Overall stats
  const stats = await prisma.campaignRecipient.groupBy({
    by: ["status"],
    where: { campaignId },
    _count: true,
  });

  const statMap: Record<string, number> = {};
  for (const s of stats) {
    statMap[s.status] = s._count;
  }

  const updateData: any = {
    sentCount:
      (statMap["sent"] || 0) +
      (statMap["delivered"] || 0) +
      (statMap["replied"] || 0),
    deliveredCount: statMap["delivered"] || 0,
    failedCount: statMap["failed"] || 0,
    repliedCount: statMap["replied"] || 0,
  };

  // Per-variant stats if A/B
  if (campaign?.variantB) {
    const variantStats = await prisma.campaignRecipient.groupBy({
      by: ["variant", "status"],
      where: { campaignId },
      _count: true,
    });

    const vMap: Record<string, Record<string, number>> = { A: {}, B: {} };
    for (const s of variantStats) {
      if (s.variant === "A" || s.variant === "B") {
        vMap[s.variant][s.status] = s._count;
      }
    }

    updateData.variantASent =
      (vMap.A["sent"] || 0) +
      (vMap.A["delivered"] || 0) +
      (vMap.A["replied"] || 0);
    updateData.variantADelivered = vMap.A["delivered"] || 0;
    updateData.variantAReplied = vMap.A["replied"] || 0;

    updateData.variantBSent =
      (vMap.B["sent"] || 0) +
      (vMap.B["delivered"] || 0) +
      (vMap.B["replied"] || 0);
    updateData.variantBDelivered = vMap.B["delivered"] || 0;
    updateData.variantBReplied = vMap.B["replied"] || 0;
  }

  await prisma.campaign.update({
    where: { id: campaignId },
    data: updateData,
  });
}

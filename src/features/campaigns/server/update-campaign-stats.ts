import { prisma } from "@/lib/prisma";

export async function updateCampaignStats(campaignId: string) {
  const stats = await prisma.campaignRecipient.groupBy({
    by: ["status"],
    where: { campaignId },
    _count: true,
  });

  const statMap: Record<string, number> = {};
  for (const s of stats) {
    statMap[s.status] = s._count;
  }

  await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      sentCount:
        (statMap["sent"] || 0) +
        (statMap["delivered"] || 0) +
        (statMap["replied"] || 0),
      deliveredCount: statMap["delivered"] || 0,
      failedCount: statMap["failed"] || 0,
      repliedCount: statMap["replied"] || 0,
    },
  });
}

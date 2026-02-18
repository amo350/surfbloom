// src/app/(main)/(dashboard)/index/integrations/page.tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { IntegrationsContent } from "@/app/(main)/(dashboard)/index/integrations/integrations-content";

export default async function IntegrationsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/sign-in");

  const workspaces = await prisma.workspace.findMany({
    where: {
      members: { some: { userId: session.user.id } },
    },
    select: {
      id: true,
      name: true,
      imageUrl: true,
    },
    orderBy: { name: "asc" },
  });

  return <IntegrationsContent workspaces={workspaces} />;
}

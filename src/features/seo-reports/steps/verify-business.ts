import { NonRetriableError } from "inngest";
import { prisma } from "@/lib/prisma";
import { normalize } from "../lib/helpers";
import type { Verification } from "../lib/report-schema";
import type { ReportContext, ReportStepFn } from "./types";

export const verifyBusiness: ReportStepFn = async (ctx, step) => {
  if (!ctx.place) {
    throw new NonRetriableError("verify-business requires place data");
  }

  const verification = await step.run("verify-business", async () => {
    const workspace = await prisma.workspace.findUniqueOrThrow({
      where: { id: ctx.workspaceId },
      select: {
        name: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
      },
    });

    const place = ctx.place as any;
    const mismatches: {
      field: string;
      workspace: string | null;
      outscraper: string | null;
    }[] = [];

    if (workspace.address && place.full_address) {
      const wsAddr = normalize(workspace.address);
      const osAddr = normalize(place.full_address);
      if (!osAddr.includes(wsAddr) && !wsAddr.includes(osAddr)) {
        mismatches.push({
          field: "address",
          workspace: workspace.address,
          outscraper: place.full_address,
        });
      }
    }

    if (workspace.city && place.city) {
      if (normalize(workspace.city) !== normalize(place.city)) {
        mismatches.push({
          field: "city",
          workspace: workspace.city,
          outscraper: place.city,
        });
      }
    }

    if (workspace.state && place.state) {
      if (normalize(workspace.state) !== normalize(place.state)) {
        mismatches.push({
          field: "state",
          workspace: workspace.state,
          outscraper: place.state,
        });
      }
    }

    if (workspace.name && place.name) {
      const wsName = normalize(workspace.name);
      const osName = normalize(place.name);
      if (!osName.includes(wsName) && !wsName.includes(osName)) {
        mismatches.push({
          field: "name",
          workspace: workspace.name,
          outscraper: place.name,
        });
      }
    }

    const hasWorkspaceAddress = !!(workspace.address || workspace.city);
    let confidence: "high" | "medium" | "low";
    let matched: boolean;

    if (!hasWorkspaceAddress) {
      confidence = "low";
      matched = true;
    } else if (mismatches.length === 0) {
      confidence = "high";
      matched = true;
    } else if (
      mismatches.some((m) => m.field === "city" || m.field === "state")
    ) {
      confidence = "low";
      matched = false;
    } else {
      confidence = "medium";
      matched = true;
    }

    const needsReview =
      !hasWorkspaceAddress ||
      !matched ||
      confidence === "low" ||
      (confidence === "medium" && mismatches.length > 0);

    const result: Verification = {
      matched,
      confidence,
      workspaceData: {
        name: workspace.name,
        address: workspace.address,
        city: workspace.city,
        state: workspace.state,
        zipCode: workspace.zipCode,
      },
      outscraperData: {
        name: place.name || null,
        address: place.full_address || null,
        placeId: place.place_id || null,
        latitude: place.latitude || null,
        longitude: place.longitude || null,
      },
      mismatches,
      needsReview,
    };

    await prisma.report.update({
      where: { id: ctx.reportId },
      data: { verification: result as any },
    });

    return result;
  });

  return { ...ctx, verification };
};

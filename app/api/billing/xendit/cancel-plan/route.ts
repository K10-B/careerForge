import { BillingStatus, PlanTier } from "@prisma/client";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscription = await prisma.billingSubscription.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: { planTier: PlanTier.FREE },
      }),
      ...(subscription
        ? [
            prisma.billingSubscription.update({
              where: { id: subscription.id },
              data: {
                status: BillingStatus.CANCELED,
                currentPeriodEnd: new Date(),
              },
            }),
          ]
        : []),
    ]);

    return NextResponse.json({ success: true, message: "Plan canceled. Your workspace is back on Free." });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to cancel plan." }, { status: 400 });
  }
}

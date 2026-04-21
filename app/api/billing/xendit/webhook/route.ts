import { BillingStatus, PlanTier } from "@prisma/client";
import { NextResponse } from "next/server";

import { markSubscriptionPaid, verifyXenditCallbackToken } from "@/lib/billing";
import { prisma } from "@/lib/prisma";

type XenditInvoiceWebhook = {
  id?: string;
  external_id?: string;
  status?: string;
  paid_at?: string;
};

export async function POST(request: Request) {
  try {
    if (!verifyXenditCallbackToken(request)) {
      return NextResponse.json({ error: "Unauthorized webhook." }, { status: 401 });
    }

    const body = (await request.json()) as XenditInvoiceWebhook;
    const externalId = body.external_id;
    if (!externalId) {
      return NextResponse.json({ received: true });
    }

    const subscription = await prisma.billingSubscription.findUnique({
      where: { xenditExternalId: externalId },
      select: { id: true, userId: true },
    });

    if (!subscription) {
      return NextResponse.json({ received: true });
    }

    if (body.status === "PAID") {
      await markSubscriptionPaid(subscription.id, body.id ?? null, body.paid_at ? new Date(body.paid_at) : new Date());
      return NextResponse.json({ received: true });
    }

    if (body.status === "EXPIRED") {
      await prisma.$transaction([
        prisma.billingSubscription.update({
          where: { id: subscription.id },
          data: { status: BillingStatus.EXPIRED },
        }),
        prisma.user.update({
          where: { id: subscription.userId },
          data: { planTier: PlanTier.FREE },
        }),
      ]);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Webhook handling failed." }, { status: 400 });
  }
}

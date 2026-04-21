import { BillingInterval, BillingStatus } from "@prisma/client";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { createBillingExternalId, createXenditInvoice, getBaseUrl, getBillingSnapshotForUser, getPlanPrice } from "@/lib/billing";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: "Sign in first to start billing." }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const interval = body?.interval === "YEARLY" ? BillingInterval.YEARLY : BillingInterval.MONTHLY;
    const billing = await getBillingSnapshotForUser(session.user.id);

    if (billing.planTier === "PRO" && billing.currentPeriodEnd && billing.currentPeriodEnd.getTime() > Date.now()) {
      return NextResponse.json({ error: "Your Pro plan is already active." }, { status: 409 });
    }

    const externalId = createBillingExternalId(session.user.id, interval);
    const amount = getPlanPrice(interval);
    const intervalLabel = interval === BillingInterval.YEARLY ? "yearly" : "monthly";
    const baseUrl = getBaseUrl();
    const invoice = await createXenditInvoice({
      externalId,
      amount,
      email: session.user.email,
      description: `CareerForge Pro (${intervalLabel}) - test mode checkout`,
      successRedirectUrl: `${baseUrl}/dashboard/settings?billing=processing`,
      failureRedirectUrl: `${baseUrl}/dashboard/settings?billing=cancelled`,
    });

    await prisma.billingSubscription.upsert({
      where: { userId: session.user.id },
      update: {
        provider: "XENDIT",
        status: BillingStatus.PENDING,
        billingInterval: interval,
        amount,
        currency: "PHP",
        xenditExternalId: externalId,
        xenditInvoiceId: invoice.id,
        xenditInvoiceUrl: invoice.invoice_url,
      },
      create: {
        userId: session.user.id,
        provider: "XENDIT",
        status: BillingStatus.PENDING,
        billingInterval: interval,
        amount,
        currency: "PHP",
        xenditExternalId: externalId,
        xenditInvoiceId: invoice.id,
        xenditInvoiceUrl: invoice.invoice_url,
      },
    });

    return NextResponse.json({ url: invoice.invoice_url });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to start checkout." }, { status: 400 });
  }
}

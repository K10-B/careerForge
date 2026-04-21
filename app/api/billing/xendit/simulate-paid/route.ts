import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { markSubscriptionPaid } from "@/lib/billing";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Test-mode payment simulation is disabled in production." }, { status: 403 });
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscription = await prisma.billingSubscription.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        status: true,
        xenditInvoiceId: true,
      },
    });

    if (!subscription) {
      return NextResponse.json({ error: "No billing session found yet. Start checkout first." }, { status: 404 });
    }

    if (subscription.status === "ACTIVE") {
      return NextResponse.json({ success: true, message: "Your Pro plan is already active." });
    }

    await markSubscriptionPaid(subscription.id, subscription.xenditInvoiceId ?? null, new Date());

    return NextResponse.json({ success: true, message: "Test payment confirmed. Your plan is now Pro." });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to simulate payment." }, { status: 400 });
  }
}

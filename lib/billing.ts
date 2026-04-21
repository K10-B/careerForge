import { BillingInterval, BillingStatus, PlanTier, Prisma } from "@prisma/client";

import { freePlanLimits, pricingPlans } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

const XENDIT_API_BASE = "https://api.xendit.co";

type BillingUserShape = {
  planTier: PlanTier;
  billingSubscription: {
    id?: string;
    status: BillingStatus;
    billingInterval: BillingInterval | null;
    currentPeriodEnd: Date | null;
    xenditInvoiceId?: string | null;
  } | null;
};

export type BillingSnapshot = {
  planTier: PlanTier;
  status: BillingStatus;
  billingInterval: BillingInterval | null;
  currentPeriodEnd: Date | null;
  limits: {
    resumeWorkspaces: number | null;
    coverLetterGenerationsPerMonth: number | null;
    bulletImprovementsPerMonth: number | null;
  };
};

export type BillingGuardResult = {
  allowed: boolean;
  message?: string;
};

function startOfCurrentPeriod() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

export function addBillingPeriod(date: Date, interval: BillingInterval) {
  const next = new Date(date);
  if (interval === BillingInterval.YEARLY) {
    next.setUTCFullYear(next.getUTCFullYear() + 1);
    return next;
  }

  next.setUTCMonth(next.getUTCMonth() + 1);
  return next;
}

export async function ensureUsagePeriod(userId: string) {
  const usage = await prisma.userUsage.upsert({
    where: { userId },
    update: { lastActiveAt: new Date() },
    create: { userId, billingPeriodStart: startOfCurrentPeriod() },
  });

  const currentPeriod = startOfCurrentPeriod();
  if (usage.billingPeriodStart < currentPeriod) {
    return prisma.userUsage.update({
      where: { userId },
      data: {
        bulletImprovements: 0,
        coverLetterGenerations: 0,
        billingPeriodStart: currentPeriod,
        lastActiveAt: new Date(),
      },
    });
  }

  return usage;
}

export function getPlanPrice(interval: BillingInterval) {
  const proPlan = pricingPlans.find((plan) => plan.name === "Pro");
  if (!proPlan) {
    throw new Error("Pro plan configuration is missing.");
  }

  return interval === BillingInterval.YEARLY ? proPlan.yearly * 12 : proPlan.monthly;
}

export function resolveEffectivePlan(user: BillingUserShape): BillingSnapshot {
  const subscription = user.billingSubscription;
  const currentPeriodEnd = subscription?.currentPeriodEnd ?? null;
  const activeSubscription =
    subscription?.status === BillingStatus.ACTIVE &&
    currentPeriodEnd &&
    currentPeriodEnd.getTime() > Date.now();

  const planTier = activeSubscription ? PlanTier.PRO : PlanTier.FREE;

  return {
    planTier,
    status: activeSubscription ? BillingStatus.ACTIVE : subscription?.status ?? BillingStatus.NONE,
    billingInterval: activeSubscription ? subscription?.billingInterval ?? null : null,
    currentPeriodEnd: activeSubscription ? currentPeriodEnd : null,
    limits:
      planTier === PlanTier.PRO
        ? {
            resumeWorkspaces: null,
            coverLetterGenerationsPerMonth: null,
            bulletImprovementsPerMonth: null,
          }
        : {
            resumeWorkspaces: freePlanLimits.resumeWorkspaces,
            coverLetterGenerationsPerMonth: freePlanLimits.coverLetterGenerationsPerMonth,
            bulletImprovementsPerMonth: freePlanLimits.bulletImprovementsPerMonth,
          },
  };
}

export async function getBillingSnapshotForUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      planTier: true,
      billingSubscription: {
        select: {
          id: true,
          status: true,
          billingInterval: true,
          currentPeriodEnd: true,
          xenditInvoiceId: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error("User not found.");
  }

  if (
    user.billingSubscription?.status === BillingStatus.PENDING &&
    user.billingSubscription.id &&
    user.billingSubscription.xenditInvoiceId
  ) {
    try {
      const invoice = await getXenditInvoice(user.billingSubscription.xenditInvoiceId);

      if (invoice.status === "PAID") {
        await markSubscriptionPaid(
          user.billingSubscription.id,
          invoice.id,
          invoice.paid_at ? new Date(invoice.paid_at) : new Date(),
        );

        const refreshedUser = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            planTier: true,
            billingSubscription: {
              select: {
                status: true,
                billingInterval: true,
                currentPeriodEnd: true,
              },
            },
          },
        });

        if (refreshedUser) {
          return resolveEffectivePlan(refreshedUser);
        }
      }
    } catch {
      // Keep the current pending state if Xendit cannot be checked.
    }
  }

  return resolveEffectivePlan(user);
}

export async function assertResumeCreationAllowed(userId: string): Promise<BillingGuardResult> {
  const [billing, resumeCount] = await Promise.all([
    getBillingSnapshotForUser(userId),
    prisma.resume.count({ where: { userId } }),
  ]);

  if (billing.planTier === PlanTier.PRO) {
    return { allowed: true };
  }

  if (resumeCount >= freePlanLimits.resumeWorkspaces) {
    return {
      allowed: false,
      message: "Free tier includes 1 resume workspace. Upgrade to Pro to create more resumes.",
    };
  }

  return { allowed: true };
}

export async function assertCoverLetterGenerationAllowed(userId: string): Promise<BillingGuardResult> {
  const [billing, usage] = await Promise.all([
    getBillingSnapshotForUser(userId),
    ensureUsagePeriod(userId),
  ]);

  if (billing.planTier === PlanTier.PRO) {
    return { allowed: true };
  }

  if (usage.coverLetterGenerations >= freePlanLimits.coverLetterGenerationsPerMonth) {
    return {
      allowed: false,
      message: "Free tier includes 3 cover letter generations per month. Upgrade to Pro for unlimited drafts.",
    };
  }

  return { allowed: true };
}

export async function assertBulletImprovementAllowed(userId: string): Promise<BillingGuardResult> {
  const [billing, usage] = await Promise.all([
    getBillingSnapshotForUser(userId),
    ensureUsagePeriod(userId),
  ]);

  if (billing.planTier === PlanTier.PRO) {
    return { allowed: true };
  }

  if (usage.bulletImprovements >= freePlanLimits.bulletImprovementsPerMonth) {
    return {
      allowed: false,
      message: "Free tier includes 5 AI bullet improvements per month. Upgrade to Pro for unlimited rewrites.",
    };
  }

  return { allowed: true };
}

export function getBaseUrl() {
  return process.env.NEXTAUTH_URL || "http://localhost:3000";
}

function getXenditAuthHeader() {
  const secretKey = process.env.XENDIT_SECRET_KEY;

  if (!secretKey) {
    throw new Error("Xendit is not configured yet. Add XENDIT_SECRET_KEY to continue.");
  }

  const token = Buffer.from(`${secretKey}:`).toString("base64");
  return `Basic ${token}`;
}

type CreateInvoiceInput = {
  externalId: string;
  amount: number;
  email: string;
  description: string;
  successRedirectUrl: string;
  failureRedirectUrl: string;
};

export async function createXenditInvoice(input: CreateInvoiceInput) {
  const response = await fetch(`${XENDIT_API_BASE}/v2/invoices`, {
    method: "POST",
    headers: {
      Authorization: getXenditAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      external_id: input.externalId,
      amount: input.amount,
      payer_email: input.email,
      description: input.description,
      currency: "PHP",
      success_redirect_url: input.successRedirectUrl,
      failure_redirect_url: input.failureRedirectUrl,
    }),
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message ?? data?.error_code ?? "Unable to start Xendit checkout.");
  }

  return data as {
    id: string;
    external_id: string;
    invoice_url: string;
    status: string;
  };
}

async function getXenditInvoice(invoiceId: string) {
  const response = await fetch(`${XENDIT_API_BASE}/v2/invoices/${invoiceId}`, {
    method: "GET",
    headers: {
      Authorization: getXenditAuthHeader(),
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message ?? data?.error_code ?? "Unable to read Xendit invoice.");
  }

  return data as {
    id: string;
    status: string;
    paid_at?: string | null;
  };
}

export function verifyXenditCallbackToken(request: Request) {
  const expected = process.env.XENDIT_WEBHOOK_TOKEN;
  if (!expected) {
    throw new Error("Xendit webhook verification is not configured yet.");
  }

  const received = request.headers.get("x-callback-token");
  return received === expected;
}

export async function markSubscriptionPaid(subscriptionId: string, invoiceId: string | null, paidAt: Date) {
  const subscription = await prisma.billingSubscription.findUnique({
    where: { id: subscriptionId },
    select: {
      id: true,
      billingInterval: true,
      userId: true,
    },
  });

  if (!subscription?.billingInterval) {
    throw new Error("Billing subscription is missing interval data.");
  }

  const currentPeriodEnd = addBillingPeriod(paidAt, subscription.billingInterval);

  await prisma.$transaction([
    prisma.billingSubscription.update({
      where: { id: subscription.id },
      data: {
        status: BillingStatus.ACTIVE,
        xenditInvoiceId: invoiceId ?? undefined,
        currentPeriodStart: paidAt,
        currentPeriodEnd,
        lastPaidAt: paidAt,
      },
    }),
    prisma.user.update({
      where: { id: subscription.userId },
      data: { planTier: PlanTier.PRO },
    }),
  ]);
}

export async function syncExpiredPlans() {
  const now = new Date();

  const expired = await prisma.billingSubscription.findMany({
    where: {
      status: BillingStatus.ACTIVE,
      currentPeriodEnd: { lte: now },
    },
    select: { id: true, userId: true },
  });

  if (!expired.length) {
    return;
  }

  await prisma.$transaction([
    prisma.billingSubscription.updateMany({
      where: { id: { in: expired.map((item) => item.id) } },
      data: { status: BillingStatus.EXPIRED },
    }),
    prisma.user.updateMany({
      where: { id: { in: expired.map((item) => item.userId) } },
      data: { planTier: PlanTier.FREE },
    }),
  ]);
}

export function createBillingExternalId(userId: string, interval: BillingInterval) {
  return `careerforge-${interval.toLowerCase()}-${userId}-${Date.now()}`;
}

export const billingSelect = {
  planTier: true,
  billingSubscription: {
    select: {
      status: true,
      billingInterval: true,
      currentPeriodEnd: true,
    },
  },
} satisfies Prisma.UserSelect;

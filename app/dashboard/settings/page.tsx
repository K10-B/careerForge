import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ManagePlanDialogButton } from "@/components/billing/manage-plan-dialog-button";
import { PlanCtaButton } from "@/components/billing/plan-cta-button";
import { TestModePaidButton } from "@/components/billing/test-mode-paid-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { getBillingSnapshotForUser, syncExpiredPlans } from "@/lib/billing";
import { prisma } from "@/lib/prisma";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ billing?: string }>;
}) {
  const session = await auth();
  const userId = session?.user?.id;
  await syncExpiredPlans();
  const params = (await searchParams) ?? {};
  const [usage, resumeCount, coverLetterCount, billing] = userId
    ? await Promise.all([
        prisma.userUsage.findUnique({ where: { userId } }),
        prisma.resume.count({ where: { userId } }),
        prisma.coverLetter.count({ where: { userId } }),
        getBillingSnapshotForUser(userId),
      ])
    : [null, 0, 0, null];
  const billingMessage =
    params.billing === "processing"
      ? "Checkout was created in test mode. Once Xendit confirms payment, your plan will switch to Pro automatically."
      : params.billing === "cancelled"
        ? "Checkout was cancelled before payment completed."
        : params.billing === "success"
          ? "Payment returned successfully. We're waiting for the webhook confirmation now."
          : null;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Button asChild variant="ghost" className="h-9 w-fit rounded-full border border-white/8 bg-white/[0.03] px-3 text-slate-200 hover:bg-white/[0.06] hover:text-white">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <div>
          <p className="text-sm font-medium text-accent">Settings</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Workspace preferences</h1>
        </div>
      </div>
      {billingMessage ? (
        <div className="rounded-[24px] border border-sky-400/20 bg-sky-400/10 px-4 py-3 text-sm text-sky-100">
          {billingMessage}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Current signed-in identity for this workspace.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div><p className="text-muted-foreground">Name</p><p className="font-medium">{session?.user?.name ?? "-"}</p></div>
            <div><p className="text-muted-foreground">Email</p><p className="font-medium">{session?.user?.email ?? "-"}</p></div>
            <div className="space-y-2">
              <p className="text-muted-foreground">Plan</p>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="mt-1">
                  {billing?.planTier === "PRO" ? "Pro" : "Free"}
                </Badge>
                {billing?.status === "ACTIVE" && billing.currentPeriodEnd ? (
                  <span className="text-xs text-muted-foreground">
                    Active until {new Date(billing.currentPeriodEnd).toLocaleDateString()}
                  </span>
                ) : null}
              </div>
            </div>
            <div className="rounded-[20px] border border-border/70 bg-muted/40 p-4">
              <p className="text-sm font-medium text-foreground">Billing</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Xendit is wired in test mode so you can demo the real checkout flow safely before business verification is finished.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                {billing?.planTier === "PRO" ? (
                  <ManagePlanDialogButton
                    planTier={billing.planTier}
                    status={billing.status}
                    billingInterval={billing.billingInterval}
                    currentPeriodEnd={billing.currentPeriodEnd ? billing.currentPeriodEnd.toISOString() : null}
                  />
                ) : (
                  <PlanCtaButton
                    planName="Pro"
                    interval="MONTHLY"
                    variant="accent"
                  />
                )}
                <Button asChild variant="outline">
                  <Link href="/pricing">View pricing</Link>
                </Button>
              </div>
              {billing?.status === "PENDING" ? (
                <div className="mt-4 rounded-[18px] border border-emerald-400/15 bg-emerald-400/5 p-3">
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-emerald-300/90">Test mode shortcut</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    For demos on localhost, you can confirm the pending checkout here without waiting for a live webhook callback.
                  </p>
                  <div className="mt-3">
                    <TestModePaidButton />
                  </div>
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage snapshot</CardTitle>
            <CardDescription>Free plan limits reset monthly. Pro removes the caps.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center justify-between"><span className="text-muted-foreground">Resumes</span><span className="font-medium">{resumeCount}</span></div>
            <div className="flex items-center justify-between"><span className="text-muted-foreground">Cover letters</span><span className="font-medium">{coverLetterCount}</span></div>
            <div className="flex items-center justify-between"><span className="text-muted-foreground">Cover letter generations</span><span className="font-medium">{usage?.coverLetterGenerations ?? 0}{billing?.limits.coverLetterGenerationsPerMonth ? ` / ${billing.limits.coverLetterGenerationsPerMonth}` : ""}</span></div>
            <div className="flex items-center justify-between"><span className="text-muted-foreground">Bullet improvements</span><span className="font-medium">{usage?.bulletImprovements ?? 0}{billing?.limits.bulletImprovementsPerMonth ? ` / ${billing.limits.bulletImprovementsPerMonth}` : ""}</span></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

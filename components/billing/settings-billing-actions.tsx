"use client";

import Link from "next/link";
import { useState } from "react";

import { ManagePlanDialogButton } from "@/components/billing/manage-plan-dialog-button";
import { PlanCtaButton } from "@/components/billing/plan-cta-button";
import { TestModePaidButton } from "@/components/billing/test-mode-paid-button";
import { Button } from "@/components/ui/button";

type SettingsBillingActionsProps = {
  planTier: "FREE" | "PRO";
  status: "NONE" | "PENDING" | "ACTIVE" | "EXPIRED" | "CANCELED";
  billingInterval: "MONTHLY" | "YEARLY" | null;
  currentPeriodEnd: string | null;
};

export function SettingsBillingActions({
  planTier,
  status,
  billingInterval,
  currentPeriodEnd,
}: SettingsBillingActionsProps) {
  const [localPlanTier, setLocalPlanTier] = useState<"FREE" | "PRO">(planTier);
  const [localStatus, setLocalStatus] = useState<"NONE" | "PENDING" | "ACTIVE" | "EXPIRED" | "CANCELED">(status);

  const hasActiveProPlan = localPlanTier === "PRO" && localStatus === "ACTIVE";

  return (
    <>
      <div className="mt-4 flex flex-wrap gap-3">
        {hasActiveProPlan ? (
          <ManagePlanDialogButton
            planTier={localPlanTier}
            status={localStatus}
            billingInterval={billingInterval}
            currentPeriodEnd={currentPeriodEnd}
            onPlanCanceled={() => {
              setLocalPlanTier("FREE");
              setLocalStatus("CANCELED");
            }}
          />
        ) : (
          <PlanCtaButton
            planName="Pro"
            interval="MONTHLY"
            variant="accent"
            overridePlanTier={localPlanTier}
          />
        )}
        <Button asChild variant="outline">
          <Link href="/pricing">View pricing</Link>
        </Button>
      </div>
      {localStatus === "PENDING" && localPlanTier !== "PRO" ? (
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
    </>
  );
}

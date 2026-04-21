"use client";

import { CalendarDays, CreditCard, ShieldCheck, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { CancelPlanButton } from "@/components/billing/cancel-plan-button";
import { Button } from "@/components/ui/button";

type ManagePlanDialogButtonProps = {
  planTier: "FREE" | "PRO";
  status: "NONE" | "PENDING" | "ACTIVE" | "EXPIRED" | "CANCELED";
  billingInterval: "MONTHLY" | "YEARLY" | null;
  currentPeriodEnd: string | null;
};

export function ManagePlanDialogButton({
  planTier,
  status,
  billingInterval,
  currentPeriodEnd,
}: ManagePlanDialogButtonProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Manage plan
      </Button>

      {mounted && open
        ? createPortal(
            <div
              className="fixed inset-0 z-[120] grid place-items-center bg-slate-950/72 p-4 backdrop-blur-2xl"
              onClick={() => setOpen(false)}
            >
              <div
                className="w-full max-w-xl rounded-[28px] border border-white/10 bg-slate-950/96 p-6 shadow-[0_30px_120px_rgba(2,6,23,0.5)] ring-1 ring-white/5"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-accent">Plan details</p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white">
                      {planTier === "PRO" ? "CareerForge Pro" : "CareerForge Free"}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      Review the active tier on this workspace and manage the current demo billing state from one place.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full text-slate-400 hover:bg-white/[0.05] hover:text-white"
                    onClick={() => setOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[20px] border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex items-center gap-2 text-slate-300">
                      <ShieldCheck className="h-4 w-4 text-sky-300" />
                      <span className="text-xs font-medium uppercase tracking-[0.14em]">Tier</span>
                    </div>
                    <p className="mt-3 text-lg font-semibold text-white">{planTier === "PRO" ? "Pro" : "Free"}</p>
                  </div>
                  <div className="rounded-[20px] border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex items-center gap-2 text-slate-300">
                      <CreditCard className="h-4 w-4 text-sky-300" />
                      <span className="text-xs font-medium uppercase tracking-[0.14em]">Billing</span>
                    </div>
                    <p className="mt-3 text-lg font-semibold text-white">
                      {billingInterval ? `${billingInterval.charAt(0)}${billingInterval.slice(1).toLowerCase()}` : "—"}
                    </p>
                  </div>
                  <div className="rounded-[20px] border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex items-center gap-2 text-slate-300">
                      <CalendarDays className="h-4 w-4 text-sky-300" />
                      <span className="text-xs font-medium uppercase tracking-[0.14em]">Status</span>
                    </div>
                    <p className="mt-3 text-lg font-semibold text-white">
                      {status.charAt(0) + status.slice(1).toLowerCase()}
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-[22px] border border-white/8 bg-white/[0.02] p-5">
                  <p className="text-sm font-medium text-white">Current cycle</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {currentPeriodEnd
                      ? `Your current ${planTier === "PRO" ? "Pro" : "Free"} state is set through ${new Date(currentPeriodEnd).toLocaleDateString()}.`
                      : "No paid billing cycle is active on this workspace right now."}
                  </p>
                  {planTier === "PRO" ? (
                    <div className="mt-4 rounded-[18px] border border-amber-400/15 bg-amber-400/5 p-4">
                      <p className="text-xs font-medium uppercase tracking-[0.14em] text-amber-300/90">Plan controls</p>
                      <p className="mt-2 text-xs leading-5 text-slate-400">
                        Canceling here is intended for demo/test mode and immediately returns the workspace to the Free tier.
                      </p>
                      <div className="mt-4">
                        <CancelPlanButton />
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

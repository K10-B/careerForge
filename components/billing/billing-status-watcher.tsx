"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type BillingStatusWatcherProps = {
  enabled: boolean;
};

export function BillingStatusWatcher({ enabled }: BillingStatusWatcherProps) {
  const router = useRouter();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let stopped = false;

    const checkBilling = async () => {
      try {
        const response = await fetch("/api/billing/status", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) return;

        const data = (await response.json()) as {
          billing?: { planTier?: "FREE" | "PRO"; status?: string };
        };

        if (data.billing?.planTier === "PRO" && data.billing?.status === "ACTIVE") {
          stopped = true;
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          router.refresh();
        }
      } catch {
        // Keep polling quietly while the test checkout settles.
      }
    };

    void checkBilling();
    intervalRef.current = setInterval(checkBilling, 2500);

    return () => {
      stopped = true;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, router]);

  return null;
}

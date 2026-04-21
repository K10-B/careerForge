"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

type CancelPlanButtonProps = {
  onCanceled?: () => void;
};

export function CancelPlanButton({ onCanceled }: CancelPlanButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [confirming, setConfirming] = useState(false);

  const handleCancelPlan = async () => {
    setIsLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/billing/xendit/cancel-plan", {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Unable to cancel plan.");
      }

      setMessage(data.message ?? "Plan canceled.");
      setConfirming(false);
      onCanceled?.();
      router.replace("/dashboard/settings");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to cancel plan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      {!confirming ? (
        <Button variant="outline" disabled={isLoading} onClick={() => setConfirming(true)}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Cancel plan
        </Button>
      ) : (
        <div className="rounded-[18px] border border-white/8 bg-slate-950/70 p-4">
          <p className="text-sm font-medium text-white">Cancel Pro plan?</p>
          <p className="mt-2 text-xs leading-5 text-slate-400">
            This moves the workspace back to the Free tier right away. You can upgrade again anytime.
          </p>
          <div className="mt-4 flex gap-2">
            <Button variant="outline" disabled={isLoading} onClick={handleCancelPlan}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Yes, cancel plan
            </Button>
            <Button variant="ghost" disabled={isLoading} onClick={() => setConfirming(false)}>
              Keep Pro
            </Button>
          </div>
        </div>
      )}
      {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}
    </div>
  );
}

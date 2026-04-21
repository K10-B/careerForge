"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function CancelPlanButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        disabled={isLoading}
        onClick={async () => {
          const confirmed = window.confirm("Cancel Pro and move this workspace back to the Free plan?");
          if (!confirmed) {
            return;
          }

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
            router.refresh();
          } catch (error) {
            setMessage(error instanceof Error ? error.message : "Unable to cancel plan.");
          } finally {
            setIsLoading(false);
          }
        }}
      >
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Cancel plan
      </Button>
      {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}
    </div>
  );
}

"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function TestModePaidButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        disabled={isLoading}
        onClick={async () => {
          setIsLoading(true);
          setMessage("");
          try {
            const response = await fetch("/api/billing/xendit/simulate-paid", {
              method: "POST",
            });
            const data = await response.json();
            if (!response.ok) {
              throw new Error(data.error ?? "Unable to confirm the test payment.");
            }

            setMessage(data.message ?? "Test payment confirmed.");
            router.refresh();
          } catch (error) {
            setMessage(error instanceof Error ? error.message : "Unable to confirm the test payment.");
          } finally {
            setIsLoading(false);
          }
        }}
      >
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
        Mark as paid (test mode)
      </Button>
      {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}
    </div>
  );
}

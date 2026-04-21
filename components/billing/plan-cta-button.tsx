"use client";

import Link from "next/link";
import { Loader2, Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

type PlanCtaButtonProps = {
  planName: "Free" | "Pro";
  interval?: "MONTHLY" | "YEARLY";
  className?: string;
  variant?: "accent" | "outline" | "ghost" | "default";
};

export function PlanCtaButton({
  planName,
  interval = "MONTHLY",
  className,
  variant = "outline",
}: PlanCtaButtonProps) {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const planTier = session?.user?.planTier ?? "FREE";

  if (planName === "Free") {
    return (
      <Button asChild className={className} variant={variant}>
        <Link href={status === "authenticated" ? "/dashboard" : "/signup"}>Start Free</Link>
      </Button>
    );
  }

  if (status !== "authenticated") {
    return (
      <Button asChild className={className} variant={variant}>
        <Link href="/signup">Create account to upgrade</Link>
      </Button>
    );
  }

  if (planTier === "PRO") {
    return (
      <Button asChild className={className} variant="outline">
        <Link href="/dashboard/settings">Manage plan</Link>
      </Button>
    );
  }

  return (
    <Button
      className={className}
      variant={variant}
      disabled={isLoading}
      onClick={async () => {
        setIsLoading(true);
        try {
          const response = await fetch("/api/billing/xendit/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ interval }),
          });
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error ?? "Unable to start checkout.");
          }

          window.location.href = data.url;
        } catch (error) {
          window.alert(error instanceof Error ? error.message : "Unable to start checkout.");
          setIsLoading(false);
        }
      }}
    >
      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
      Upgrade to Pro
    </Button>
  );
}

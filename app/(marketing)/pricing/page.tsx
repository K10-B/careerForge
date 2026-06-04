"use client";
import { motion } from "framer-motion";
import { useState } from "react";

import { PlanCtaButton } from "@/components/billing/plan-cta-button";
import { featureComparison, pricingPlans } from "@/lib/constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PricingPage() {
  const [yearly, setYearly] = useState(false);

  return (
    <main className="px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="text-sm font-medium text-accent">Pricing</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">Plans that scale with your search.</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">Start with the essentials, then unlock unlimited AI support and deeper tracking once momentum builds.</p>
          <div className="mx-auto mt-8 inline-grid grid-cols-2 rounded-full border border-sky-100 bg-white/90 p-1 shadow-sm shadow-sky-500/10 dark:border-border/70 dark:bg-card/80 dark:shadow-none">
            <div className="relative col-span-2 grid grid-cols-2">
              <motion.div
                className="absolute inset-y-0 w-1/2 rounded-full bg-sky-500 shadow-[0_10px_26px_rgba(14,165,233,0.26)]"
                animate={{ x: yearly ? "100%" : "0%" }}
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
              <button
                type="button"
                aria-pressed={!yearly}
                className={`relative z-10 rounded-full px-5 py-2 text-sm font-medium transition-colors duration-200 ${!yearly ? "text-white" : "text-slate-600 hover:text-sky-700 dark:text-muted-foreground dark:hover:text-slate-100"}`}
                onClick={() => setYearly(false)}
              >
                Monthly
              </button>
              <button
                type="button"
                aria-pressed={yearly}
                className={`relative z-10 rounded-full px-5 py-2 text-sm font-medium transition-colors duration-200 ${yearly ? "text-white" : "text-slate-600 hover:text-sky-700 dark:text-muted-foreground dark:hover:text-slate-100"}`}
                onClick={() => setYearly(true)}
              >
                Yearly
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {pricingPlans.map((plan, index) => (
            <motion.div key={plan.name} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08, duration: 0.35 }}>
              <Card className={`flex h-full flex-col ${plan.name === "Pro" ? "border-accent shadow-glow" : ""}`}>
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col">
                  <div className="flex items-end gap-2">
                    <p className="text-5xl font-semibold">${yearly ? plan.yearly : plan.monthly}</p>
                    <p className="pb-2 text-sm text-muted-foreground">/ month</p>
                  </div>
                  <div className="mt-6 space-y-3 text-sm text-muted-foreground">
                    {plan.features.map((feature) => <p key={feature}>{feature}</p>)}
                  </div>
                  <div className="mt-auto pt-8">
                    <PlanCtaButton
                      className="w-full"
                      interval={yearly ? "YEARLY" : "MONTHLY"}
                      planName={plan.name as "Free" | "Pro"}
                      variant={plan.name === "Pro" ? "accent" : "outline"}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 rounded-[36px] border border-border/70 bg-card/70 p-8 backdrop-blur-xl md:p-10">
          <h2 className="text-2xl font-semibold">Feature comparison</h2>
          <div className="mt-6 overflow-hidden rounded-[28px] border border-border/70">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-5 py-4 font-medium">Feature</th>
                  <th className="px-5 py-4 font-medium">Free</th>
                  <th className="px-5 py-4 font-medium">Pro</th>
                </tr>
              </thead>
              <tbody>
                {featureComparison.map(([feature, free, pro]) => (
                  <tr key={feature} className="border-t border-border/70">
                    <td className="px-5 py-4 font-medium">{feature}</td>
                    <td className="px-5 py-4 text-muted-foreground">{free}</td>
                    <td className="px-5 py-4 text-muted-foreground">{pro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}

import Link from "next/link";

import { Button } from "@/components/ui/button";

export function MarketingFooter() {
  return (
    <footer className="border-t border-border/60 px-6 py-16">
      <div className="mx-auto max-w-7xl rounded-[32px] border border-border/70 bg-card/70 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl md:p-12">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="text-sm font-medium text-accent">Ready to move faster?</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
              Build stronger resumes, personalize every application, and keep your search organized in one polished workspace.
            </h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button asChild variant="outline" size="lg">
              <Link href="/pricing">See pricing</Link>
            </Button>
            <Button asChild variant="accent" size="lg">
              <Link href="/signup">Create your workspace</Link>
            </Button>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-border/70 pt-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>CareerForge AI. Crafted for ambitious operators in progress.</p>
          <div className="flex gap-4">
            <Link href="/">Home</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/signin">Sign in</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}


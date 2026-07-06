import { Sparkles } from "lucide-react";

import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative grid min-h-screen bg-background lg:grid-cols-2">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>
      <div className="flex items-center justify-center px-6 py-12">{children}</div>
      <div className="hidden border-l border-border/60 lg:block">
        <div className="grid-pattern flex h-full items-center justify-center p-12">
          <div className="max-w-lg rounded-[36px] border border-border/70 bg-card/70 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl">
            <div className="inline-flex items-center rounded-full bg-accent/10 px-4 py-2 text-sm font-medium text-accent">
              <Sparkles className="mr-2 h-4 w-4" />CareerForge AI
            </div>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight">A cleaner, faster way to run your entire job search.</h1>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">Create stronger resumes, tailor every cover letter, and track applications without losing signal.</p>
          </div>
        </div>
      </div>
    </main>
  );
}

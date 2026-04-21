"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, BriefcaseBusiness, FileText, LayoutDashboard, PenSquare, Settings, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/resumes", label: "Resumes", icon: FileText },
  { href: "/dashboard/cover-letters", label: "Cover letters", icon: PenSquare },
  { href: "/dashboard/job-tracker", label: "Job tracker", icon: BriefcaseBusiness },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const planTier = session?.user?.planTier ?? "FREE";

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-4 lg:flex-row lg:px-6 lg:py-6">
        <aside className="glass flex flex-col rounded-[32px] p-4 lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:w-72 lg:p-5">
          <div className="flex items-center justify-between gap-3 border-b border-border/70 pb-4">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="-translate-y-0.5 flex h-11 w-11 items-center justify-center overflow-hidden">
                <Image src="/forge-icon.png" alt="CareerForge icon" width={44} height={44} className="h-full w-full object-contain" priority />
              </div>
              <div>
                <p className="font-semibold">CareerForge AI</p>
                <p className="text-xs text-muted-foreground">Premium search workspace</p>
              </div>
            </Link>
          </div>

          <div className="mt-5 rounded-[24px] border border-sky-500/20 bg-gradient-to-br from-sky-500/10 via-sky-500/5 to-emerald-500/10 p-4 shadow-[0_12px_32px_rgba(14,165,233,0.08)]">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-300/90">
              <Sparkles className="h-3.5 w-3.5" />
              {planTier === "PRO" ? "Pro tier" : "Free tier"}
            </div>
            <p className="mt-2 text-sm font-medium text-foreground">
              {planTier === "PRO" ? "Your workspace is active on Pro." : "Your workspace is active on the free plan."}
            </p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {planTier === "PRO"
                ? "Unlimited AI support and deeper search momentum are unlocked in this workspace."
                : "Keep building resumes, cover letters, and tracked roles in one calm flow."}
            </p>
          </div>

          <nav className="mt-5 grid flex-1 gap-2 content-start">
            {links.map((link, index) => {
              const Icon = link.icon;
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`);

              return (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.24 }}
                >
                  <Link
                    href={link.href}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-all duration-200",
                      active
                        ? "bg-primary text-primary-foreground shadow-lg shadow-slate-950/10"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                </motion.div>
              );
            })}
            <Link
              href="/"
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
          </nav>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}



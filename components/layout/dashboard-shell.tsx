"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, BriefcaseBusiness, FileText, LayoutDashboard, PenSquare, Settings } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { motion } from "framer-motion";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn, initials } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/resumes", label: "Resumes", icon: FileText },
  { href: "/dashboard/cover-letters", label: "Cover letters", icon: PenSquare },
  { href: "/dashboard/job-tracker", label: "Job tracker", icon: BriefcaseBusiness },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data } = useSession();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-4 lg:flex-row lg:px-6 lg:py-6">
        <aside className="glass rounded-[32px] p-4 lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:w-72 lg:p-5">
          <div className="flex items-center justify-between gap-3 border-b border-border/70 pb-4">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-500 text-sm font-semibold text-white shadow-lg shadow-sky-500/25">
                CF
              </div>
              <div>
                <p className="font-semibold">CareerForge AI</p>
                <p className="text-xs text-muted-foreground">Premium search workspace</p>
              </div>
            </Link>
            <ThemeToggle />
          </div>

          <nav className="mt-5 grid gap-2">
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
              Back to landing page
            </Link>
          </nav>

          <div className="mt-6 rounded-[28px] border border-border/70 bg-background/80 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary font-semibold text-secondary-foreground">
                {initials(data?.user?.name)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{data?.user?.name ?? "CareerForge user"}</p>
                <p className="truncate text-xs text-muted-foreground">{data?.user?.email}</p>
              </div>
            </div>
            <Button className="mt-4 w-full" variant="outline" onClick={() => signOut({ callbackUrl: "/" })}>
              Sign out
            </Button>
          </div>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}





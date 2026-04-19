"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { initials } from "@/lib/utils";

const navItems = [
  { href: "#features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export function MarketingNavbar() {
  const [open, setOpen] = useState(false);
  const { data } = useSession();
  const isSignedIn = Boolean(data?.user);
  const userInitials = initials(data?.user?.name ?? data?.user?.email ?? "CF");

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-500 text-sm font-semibold text-white shadow-lg shadow-sky-500/20">
            CF
          </div>
          <div>
            <p className="font-semibold">CareerForge AI</p>
            <p className="text-xs text-muted-foreground">AI job search cockpit</p>
          </div>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => (
            <Button asChild key={item.href} variant="ghost">
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
          <ThemeToggle />
          {isSignedIn ? (
            <>
              <Button asChild variant="outline">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Link
                href="/dashboard"
                aria-label="Open dashboard"
                className="group relative flex h-12 w-12 items-center justify-center rounded-full border border-sky-400/45 bg-sky-500/12 text-sm font-semibold text-foreground shadow-[0_0_0_1px_rgba(14,165,233,0.12),0_12px_32px_rgba(14,165,233,0.12)] transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-300/70 hover:bg-sky-500/16 hover:shadow-[0_0_0_1px_rgba(56,189,248,0.18),0_18px_38px_rgba(14,165,233,0.18)]"
              >
                <span>{userInitials}</span>
                <span className="absolute bottom-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-background bg-sky-500 shadow-[0_0_0_3px_rgba(14,165,233,0.18)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                </span>
              </Link>
            </>
          ) : (
            <>
              <Button asChild variant="accent">
                <Link href="/signup">
                  Start free
                  <Sparkles className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/signup">Sign up</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/signin">Sign in</Link>
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          {isSignedIn ? (
            <Link
              href="/dashboard"
              aria-label="Open dashboard"
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-sky-400/45 bg-sky-500/12 text-xs font-semibold text-foreground shadow-[0_0_0_1px_rgba(14,165,233,0.12),0_10px_24px_rgba(14,165,233,0.12)] transition-all duration-200 hover:border-sky-300/70 hover:bg-sky-500/16"
            >
              <span>{userInitials}</span>
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border border-background bg-sky-500" />
            </Link>
          ) : null}
          <Button variant="outline" size="icon" onClick={() => setOpen((value) => !value)}>
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="border-t border-border/60 bg-background px-6 py-4 md:hidden"
          >
            <div className="grid gap-3">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="rounded-2xl px-3 py-2 text-sm hover:bg-muted" onClick={() => setOpen(false)}>
                  {item.label}
                </Link>
              ))}
              {isSignedIn ? (
                <Link href="/dashboard" className="rounded-2xl px-3 py-2 text-sm hover:bg-muted" onClick={() => setOpen(false)}>
                  Open dashboard
                </Link>
              ) : (
                <>
                  <Link href="/signup" className="rounded-2xl bg-primary px-3 py-2 text-sm text-primary-foreground" onClick={() => setOpen(false)}>
                    Start free
                  </Link>
                  <Link href="/signup" className="rounded-2xl px-3 py-2 text-sm hover:bg-muted" onClick={() => setOpen(false)}>
                    Sign up
                  </Link>
                  <Link href="/signin" className="rounded-2xl px-3 py-2 text-sm hover:bg-muted" onClick={() => setOpen(false)}>
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

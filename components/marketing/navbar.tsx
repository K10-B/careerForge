"use client";

import Image from "next/image";
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
          <div className="-translate-y-0.5 flex h-11 w-11 items-center justify-center overflow-hidden">
            <Image src="/forge-icon.png" alt="CareerForge icon" width={44} height={44} className="h-full w-full object-contain" priority />
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
                className="group relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-cyan-300/70 bg-gradient-to-br from-[#163a63] via-[#102742] to-[#0b1323] text-sm font-extrabold text-white shadow-[0_0_0_1px_rgba(103,232,249,0.24),0_8px_20px_rgba(2,6,23,0.24)] transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-200/90 hover:from-[#1a4777] hover:via-[#13304f] hover:to-[#0b1323] hover:shadow-[0_0_0_1px_rgba(103,232,249,0.2),0_14px_28px_rgba(2,6,23,0.32)]"
              >
                <span className="leading-none">{userInitials}</span>
                <span className="absolute bottom-0 right-0 flex h-3 w-3 items-center justify-center rounded-full border-2 border-background bg-cyan-400 shadow-[0_0_0_3px_rgba(34,211,238,0.18)]">
                  <span className="h-1 w-1 rounded-full bg-white" />
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
              className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-cyan-300/70 bg-gradient-to-br from-[#163a63] via-[#102742] to-[#0b1323] text-xs font-bold text-white shadow-[0_0_0_1px_rgba(103,232,249,0.2),0_10px_24px_rgba(2,6,23,0.24)] transition-all duration-200 hover:border-cyan-200/90 hover:from-[#1a4777] hover:via-[#13304f] hover:to-[#0b1323]"
            >
              <span className="leading-none">{userInitials}</span>
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-cyan-400 shadow-[0_0_0_3px_rgba(34,211,238,0.18)]" />
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



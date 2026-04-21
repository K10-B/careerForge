"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { FileText, LayoutDashboard, Settings } from "lucide-react";
import { useTheme } from "next-themes";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";
import { initials } from "@/lib/utils";

type DashboardProfileMenuProps = {
  name?: string | null;
  email?: string | null;
  compact?: boolean;
};

export function DashboardProfileMenu({ name, email, compact = false }: DashboardProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const isDark = resolvedTheme === "dark";
  const themeLabel = !mounted ? "Toggle theme" : isDark ? "Light theme" : "Dark theme";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;

      setMenuPosition({
        top: rect.bottom + 12,
        left: rect.right - 256,
      });
    };

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      setOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div className="shrink-0">
      <button
        ref={triggerRef}
        type="button"
        aria-label="Open account menu"
        onClick={() => setOpen((value) => !value)}
        className={`group relative flex items-center justify-center rounded-full border-2 border-cyan-300/70 bg-gradient-to-br from-[#163a63] via-[#102742] to-[#0b1323] font-bold text-white shadow-[0_0_0_1px_rgba(103,232,249,0.24),0_12px_28px_rgba(2,6,23,0.24)] transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-200/90 hover:from-[#1a4777] hover:via-[#13304f] hover:to-[#0b1323] hover:shadow-[0_0_0_1px_rgba(103,232,249,0.2),0_18px_36px_rgba(2,6,23,0.32)] ${
          compact ? "h-10 w-10 text-sm" : "h-14 w-14 text-base"
        }`}
      >
        <span className="leading-none">{initials(name)}</span>
        <span
          className={`absolute flex items-center justify-center rounded-full border-2 border-background bg-cyan-400 shadow-[0_0_0_4px_rgba(34,211,238,0.2)] ${
            compact ? "bottom-0 right-0 h-3.5 w-3.5" : "bottom-0.5 right-0.5 h-5 w-5"
          }`}
        >
          <span className={compact ? "h-1 w-1 rounded-full bg-white" : "h-2 w-2 rounded-full bg-white"} />
        </span>
      </button>
      {mounted && open
        ? createPortal(
            <div
              ref={menuRef}
              className="fixed z-[140] w-64 rounded-[22px] border border-border/70 bg-slate-950/98 p-3 shadow-[0_24px_64px_rgba(2,6,23,0.46)] backdrop-blur-xl"
              style={{ top: menuPosition.top, left: menuPosition.left }}
            >
          <div className="flex items-center gap-3 rounded-[18px] px-1 py-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-300/40 bg-gradient-to-br from-[#163a63] via-[#102742] to-[#0b1323] font-bold text-white shadow-[0_0_0_1px_rgba(103,232,249,0.12),0_8px_20px_rgba(2,6,23,0.22)]">
              {initials(name)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-5">{name ?? "CareerForge user"}</p>
              <p className="truncate text-xs leading-5 text-muted-foreground">{email}</p>
            </div>
          </div>
          <div className="mt-2 grid gap-1.5">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-[18px] px-3 py-2.5 text-sm text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground"
            >
              <LayoutDashboard className="h-4 w-4" />
              Overview
            </Link>
            <Link
              href="/dashboard/resumes"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-[18px] px-3 py-2.5 text-sm text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground"
            >
              <FileText className="h-4 w-4" />
              Resumes
            </Link>
            <Link
              href="/dashboard/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-[18px] px-3 py-2.5 text-sm text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
            <button
              type="button"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="flex items-center gap-3 rounded-[18px] px-3 py-2.5 text-sm text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground"
            >
              <Image
                src={mounted && isDark ? "/theme-sun.png" : "/theme-moon.png"}
                alt=""
                aria-hidden="true"
                width={16}
                height={16}
                className="h-4 w-4 object-contain"
              />
              {themeLabel}
            </button>
          </div>
          <Button
            className="mt-2.5 h-10 w-full rounded-[18px]"
            variant="outline"
            onClick={async () => {
              setOpen(false);
              await signOut({ redirect: false });
              router.push("/signin");
            }}
          >
            Sign out
          </Button>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

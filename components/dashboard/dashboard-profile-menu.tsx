"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { initials } from "@/lib/utils";

type DashboardProfileMenuProps = {
  name?: string | null;
  email?: string | null;
};

export function DashboardProfileMenu({ name, email }: DashboardProfileMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        aria-label="Open account menu"
        onClick={() => setOpen((value) => !value)}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-cyan-300/70 bg-gradient-to-br from-[#163a63] via-[#102742] to-[#0b1323] text-base font-bold text-white shadow-[0_0_0_1px_rgba(103,232,249,0.24),0_12px_28px_rgba(2,6,23,0.24)] transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-200/90 hover:from-[#1a4777] hover:via-[#13304f] hover:to-[#0b1323] hover:shadow-[0_0_0_1px_rgba(103,232,249,0.2),0_18px_36px_rgba(2,6,23,0.32)]"
      >
        <span className="leading-none">{initials(name)}</span>
        <span className="absolute bottom-0.5 right-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-cyan-400 shadow-[0_0_0_4px_rgba(34,211,238,0.2)]">
          <span className="h-2 w-2 rounded-full bg-white" />
        </span>
      </button>
      {open ? (
        <div className="absolute right-0 top-full z-20 mt-3 w-64 rounded-[22px] border border-border/70 bg-background/95 p-3 shadow-[0_18px_40px_rgba(2,6,23,0.35)] backdrop-blur-xl">
          <div className="flex items-center gap-3 rounded-[18px] px-1 py-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-[18px] bg-secondary font-semibold text-secondary-foreground">
              {initials(name)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-5">{name ?? "CareerForge user"}</p>
              <p className="truncate text-xs leading-5 text-muted-foreground">{email}</p>
            </div>
          </div>
          <Button
            className="mt-2.5 h-10 w-full rounded-[18px]"
            variant="outline"
            onClick={() => {
              setOpen(false);
              signOut({ callbackUrl: "/" });
            }}
          >
            Sign out
          </Button>
        </div>
      ) : null}
    </div>
  );
}













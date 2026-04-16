"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";

export function ResumePreviewDialogTrigger({ resumeId, title }: { resumeId: string; title: string }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, resumeId]);

  const dialog = open ? (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/82 p-4 backdrop-blur-md" onClick={() => setOpen(false)}>
      <div
        className="flex h-[min(90vh,920px)] w-full max-w-6xl flex-col overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(2,6,23,0.98))] shadow-[0_30px_100px_rgba(2,6,23,0.58)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-white/8 px-6 py-4">
          <div className="min-w-0">
            <p className="truncate text-xl font-semibold tracking-tight text-white">{title}</p>
            <p className="text-sm text-slate-400">Resume preview</p>
          </div>
          <Button type="button" variant="ghost" size="icon" className="h-10 w-10 rounded-full text-slate-400 hover:bg-white/[0.06] hover:text-white" onClick={() => setOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.08),transparent_38%),linear-gradient(180deg,rgba(15,23,42,0.98),rgba(2,6,23,1))] px-5 py-5 sm:px-6 sm:py-6">
          <div className="relative w-full max-w-[920px] overflow-hidden rounded-[22px] border border-white/8 bg-white shadow-[0_16px_50px_rgba(15,23,42,0.28)]">
            {loading ? (
              <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.08),transparent_35%),linear-gradient(180deg,rgba(15,23,42,0.98),rgba(2,6,23,1))] px-8 py-8">
                <div className="mx-auto max-w-[760px] animate-pulse space-y-6">
                  <div className="space-y-3 text-center">
                    <div className="mx-auto h-8 w-64 rounded-full bg-white/[0.10]" />
                    <div className="mx-auto h-4 w-72 rounded-full bg-white/[0.08]" />
                    <div className="mx-auto h-3 w-80 rounded-full bg-white/[0.06]" />
                  </div>
                  <div className="space-y-4">
                    <div className="h-4 w-28 rounded-full bg-white/[0.10]" />
                    <div className="h-px w-full bg-white/[0.08]" />
                    <div className="space-y-2">
                      <div className="h-3 w-full rounded-full bg-white/[0.08]" />
                      <div className="h-3 w-[96%] rounded-full bg-white/[0.07]" />
                      <div className="h-3 w-[88%] rounded-full bg-white/[0.06]" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-4 w-32 rounded-full bg-white/[0.10]" />
                    <div className="h-px w-full bg-white/[0.08]" />
                    <div className="space-y-3">
                      <div className="h-3 w-[92%] rounded-full bg-white/[0.08]" />
                      <div className="h-3 w-[84%] rounded-full bg-white/[0.07]" />
                      <div className="h-3 w-[89%] rounded-full bg-white/[0.06]" />
                      <div className="h-3 w-[76%] rounded-full bg-white/[0.05]" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-4 w-24 rounded-full bg-white/[0.10]" />
                    <div className="h-px w-full bg-white/[0.08]" />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="h-20 rounded-2xl bg-white/[0.07]" />
                      <div className="h-20 rounded-2xl bg-white/[0.06]" />
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            <iframe
              title={`${title} preview`}
              src={`/resumes/${resumeId}/export?mode=pdf`}
              className={`h-[78vh] min-h-[640px] w-full border-0 transition-opacity duration-300 ${loading ? "opacity-0" : "opacity-100"}`}
              onLoad={() => setLoading(false)}
            />
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <Button
        type="button"
        className="w-fit border-white/8 bg-white/[0.03] text-slate-200 hover:bg-white/[0.06] hover:text-white"
        variant="outline"
        onClick={() => setOpen(true)}
      >
        View details
      </Button>

      {mounted && dialog ? createPortal(dialog, document.body) : null}
    </>
  );
}


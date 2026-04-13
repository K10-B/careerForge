"use client";

import { format } from "date-fns";
import { Check, ChevronDown, Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";

import { deleteJobApplicationAction, saveJobApplicationAction } from "@/app/dashboard/actions";
import { applicationStatuses } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ApplicationItem = {
  id: string;
  company: string;
  role: string;
  status: (typeof applicationStatuses)[number];
  appliedDate: Date | null;
  link: string | null;
  notes: string | null;
};

const statusTone: Record<ApplicationItem["status"], string> = {
  WISHLIST: "border-slate-300 bg-slate-500/5",
  APPLIED: "border-sky-300 bg-sky-500/5",
  INTERVIEW: "border-amber-300 bg-amber-500/5",
  OFFER: "border-emerald-300 bg-emerald-500/5",
  REJECTED: "border-rose-300 bg-rose-500/5",
};

export function JobTrackerManager({ initialApplications }: { initialApplications: ApplicationItem[] }) {
  const [applications, setApplications] = useState(initialApplications);
  const [form, setForm] = useState({ company: "", role: "", status: "WISHLIST", appliedDate: "", link: "", notes: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [statusOpen, setStatusOpen] = useState(false);
  const statusRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!statusRef.current?.contains(event.target as Node)) {
        setStatusOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setStatusOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Application details</CardTitle>
          <CardDescription>Track the role, link, timing, and notes so nothing slips between tabs.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label>Company</Label><Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
          <div className="space-y-2"><Label>Role</Label><Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} /></div>
          <div className="space-y-2">
            <Label htmlFor="application-status-button">Status</Label>
            <div ref={statusRef} className="relative">
              <button
                id="application-status-button"
                type="button"
                aria-haspopup="listbox"
                aria-expanded={statusOpen}
                className="flex h-12 w-full items-center justify-between rounded-2xl border border-input bg-background/70 px-4 text-sm font-medium text-foreground transition hover:border-border hover:bg-background/85 focus:border-sky-400/40 focus:ring-2 focus:ring-sky-400/15"
                onClick={() => setStatusOpen((current) => !current)}
              >
                <span>{form.status}</span>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition ${statusOpen ? "rotate-180" : "rotate-0"}`} />
              </button>

              {statusOpen ? (
                <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-20 overflow-hidden rounded-2xl border border-white/8 bg-slate-950/96 p-2 shadow-[0_20px_50px_rgba(2,6,23,0.45)] backdrop-blur-xl">
                  <div role="listbox" aria-label="Application status options" className="space-y-1">
                    {applicationStatuses.map((status) => {
                      const selected = status === form.status;
                      return (
                        <button
                          key={status}
                          type="button"
                          role="option"
                          aria-selected={selected}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition ${selected ? "bg-sky-400/12 text-white" : "text-slate-300 hover:bg-white/[0.05] hover:text-white"}`}
                          onClick={() => {
                            setForm({ ...form, status });
                            setStatusOpen(false);
                          }}
                        >
                          <span>{status}</span>
                          {selected ? <Check className="h-4 w-4 text-sky-300" /> : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
          <div className="space-y-2"><Label>Applied date</Label><Input type="date" value={form.appliedDate} onChange={(e) => setForm({ ...form, appliedDate: e.target.value })} /></div>
          <div className="space-y-2"><Label>Job link</Label><Input type="url" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} /></div>
          <div className="space-y-2"><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="min-h-[140px]" /></div>
          <Button
            className="w-full"
            variant="accent"
            disabled={isPending}
            onClick={() => {
              setMessage("");
              startTransition(async () => {
                try {
                  await saveJobApplicationAction({ id: editingId ?? undefined, values: form });
                  setMessage(editingId ? "Application updated." : "Application added.");
                  setEditingId(null);
                  setForm({ company: "", role: "", status: "WISHLIST", appliedDate: "", link: "", notes: "" });
                  location.reload();
                } catch (error) {
                  setMessage(error instanceof Error ? error.message : "Unable to save application.");
                }
              });
            }}
          >
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            {editingId ? "Update application" : "Add application"}
          </Button>
          {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {applicationStatuses.map((status) => (
            <Card key={status} className="bg-card/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{status}</CardTitle>
                <CardDescription>{applications.filter((item) => item.status === status).length} roles</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {applications.map((application) => (
            <Card key={application.id} className={`border ${statusTone[application.status]}`}>
              <CardContent className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold">{application.role}</p>
                    <p className="text-sm text-muted-foreground">{application.company}</p>
                  </div>
                  <span className="rounded-full border border-border/60 px-3 py-1 text-xs font-medium">{application.status}</span>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>{application.appliedDate ? format(application.appliedDate, "MMM d, yyyy") : "No applied date yet"}</p>
                  {application.link ? <a href={application.link} target="_blank" className="text-accent underline-offset-4 hover:underline">Open posting</a> : null}
                  {application.notes ? <p>{application.notes}</p> : null}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingId(application.id);
                      setForm({
                        company: application.company,
                        role: application.role,
                        status: application.status,
                        appliedDate: application.appliedDate ? format(application.appliedDate, "yyyy-MM-dd") : "",
                        link: application.link ?? "",
                        notes: application.notes ?? "",
                      });
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startTransition(async () => { await deleteJobApplicationAction(application.id); location.reload(); })}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

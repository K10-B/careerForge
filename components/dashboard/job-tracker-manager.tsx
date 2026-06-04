"use client";

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { Check, ChevronDown, ChevronLeft, ChevronRight, ExternalLink, Loader2, Plus, Trash2, X } from "lucide-react";
import { type ReactNode, useEffect, useMemo, useRef, useState, useTransition } from "react";

import { deleteJobApplicationAction, saveJobApplicationAction } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { applicationStatuses } from "@/lib/constants";

type ApplicationItem = {
  id: string;
  company: string;
  role: string;
  status: (typeof applicationStatuses)[number];
  appliedDate: Date | null;
  link: string | null;
  notes: string | null;
};

type NotesSections = {
  summary: string[];
  responsibilities: string[];
  techStack: string[];
  extra: string[];
};

type AppliedDatePickerProps = {
  value: string;
  onChange: (value: string) => void;
};

const statusTone: Record<ApplicationItem["status"], string> = {
  WISHLIST: "border-sky-200 bg-sky-50 text-sky-900 dark:border-slate-300/25 dark:bg-slate-500/5 dark:text-slate-100",
  APPLIED: "border-blue-200 bg-blue-50 text-blue-900 dark:border-sky-300/25 dark:bg-sky-500/5 dark:text-sky-100",
  INTERVIEW: "border-cyan-200 bg-cyan-50 text-cyan-900 dark:border-amber-300/25 dark:bg-amber-500/5 dark:text-amber-100",
  OFFER: "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-300/25 dark:bg-emerald-500/5 dark:text-emerald-100",
  REJECTED: "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-300/25 dark:bg-rose-500/5 dark:text-rose-100",
};

const previewClampStyle = {
  display: "-webkit-box",
  WebkitLineClamp: 4,
  WebkitBoxOrient: "vertical" as const,
  overflow: "hidden",
};

function getNotesPreview(notes: string | null) {
  return notes?.trim() || "No notes yet. Add a short snapshot of the role, team, or next step.";
}

function isBulletLine(line: string) {
  return /^[\u2022\-*]|^[\u{1F300}-\u{1FAFF}]/u.test(line.trim());
}

function cleanBullet(line: string) {
  return line.replace(/^[\u2022\-*]\s*/u, "").trim();
}

function parseNotesSections(notes: string | null): NotesSections {
  const lines = (notes ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    return { summary: [], responsibilities: [], techStack: [], extra: [] };
  }

  const summary: string[] = [];
  const responsibilities: string[] = [];
  const techStack: string[] = [];
  const extra: string[] = [];

  let mode: keyof NotesSections = "summary";

  for (const line of lines) {
    if (/^tech stack\s*:/i.test(line)) {
      mode = "techStack";
      techStack.push(line.replace(/^tech stack\s*:/i, "").trim());
      continue;
    }

    if (isBulletLine(line)) {
      if (mode !== "techStack") {
        mode = "responsibilities";
        responsibilities.push(cleanBullet(line));
      } else {
        extra.push(cleanBullet(line));
      }
      continue;
    }

    if (mode === "summary") {
      summary.push(line);
      continue;
    }

    if (mode === "techStack") {
      techStack.push(line);
      continue;
    }

    extra.push(line);
  }

  return { summary, responsibilities, techStack, extra };
}

function AppliedDatePicker({ value, onChange }: AppliedDatePickerProps) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState<Date>(() => (value ? parseISO(value) : new Date()));
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (value) {
      setMonth(parseISO(value));
    }
  }, [value]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const selectedDate = value ? parseISO(value) : null;
  const calendarDays = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month), { weekStartsOn: 0 }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn: 0 }),
  });

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className="flex h-12 w-full items-center justify-between rounded-2xl border border-input bg-background/70 px-4 text-sm text-foreground transition hover:border-border hover:bg-background/85 focus:border-sky-400/40 focus:ring-2 focus:ring-sky-400/15"
        onClick={() => setOpen((current) => !current)}
      >
        <span className={value ? "text-foreground" : "text-muted-foreground"}>{value ? format(parseISO(value), "MMM d, yyyy") : "Select a date"}</span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition ${open ? "rotate-180" : "rotate-0"}`} />
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-30 overflow-hidden rounded-2xl border border-sky-100 bg-white/95 p-3.5 shadow-[0_18px_40px_rgba(14,165,233,0.16)] backdrop-blur-xl dark:border-white/8 dark:bg-slate-950/96 dark:shadow-[0_18px_40px_rgba(2,6,23,0.42)]">
          <div className="mb-3 flex items-center justify-between">
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => setMonth((current) => subMonths(current, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <p className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">{format(month, "MMMM yyyy")}</p>
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => setMonth((current) => addMonths(current, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium uppercase tracking-[0.1em] text-slate-500 dark:text-slate-500">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
              <div key={day} className="py-0.5">{day}</div>
            ))}
          </div>

          <div className="mt-1.5 grid grid-cols-7 gap-0.5">
            {calendarDays.map((day) => {
              const selected = selectedDate ? isSameDay(day, selectedDate) : false;
              const inMonth = isSameMonth(day, month);
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  className={`flex h-8 items-center justify-center rounded-lg text-sm transition ${
                    selected
                      ? "bg-sky-500 text-white ring-1 ring-sky-300 dark:bg-sky-400/20 dark:text-sky-100 dark:ring-sky-400/30"
                      : inMonth
                        ? "text-slate-700 hover:bg-sky-50 dark:text-slate-200 dark:hover:bg-white/[0.06]"
                        : "text-slate-300 hover:bg-sky-50/70 dark:text-slate-600 dark:hover:bg-white/[0.03]"
                  } ${isToday(day) && !selected ? "border border-sky-200 dark:border-white/10" : "border border-transparent"}`}
                  onClick={() => {
                    onChange(format(day, "yyyy-MM-dd"));
                    setOpen(false);
                  }}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-sky-100 pt-2.5 dark:border-white/6">
            <Button type="button" variant="ghost" size="sm" className="h-8 px-2.5 text-xs" onClick={() => onChange("")}>Clear</Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                const today = new Date();
                setMonth(today);
                onChange(format(today, "yyyy-MM-dd"));
                setOpen(false);
              }}
            >
              Today
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MetaRow({ application }: { application: ApplicationItem }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[12px] text-muted-foreground">
      <span>{application.appliedDate ? `Applied ${format(application.appliedDate, "MMM d, yyyy")}` : "No applied date yet"}</span>
      {application.link ? (
        <a href={application.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-accent underline-offset-4 hover:underline" onClick={(event) => event.stopPropagation()}>
          Open posting
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      ) : null}
    </div>
  );
}

function ApplicationHeader({ application, showStatus = true }: { application: ApplicationItem; showStatus?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0 space-y-1">
        <p className="text-[1.05rem] font-semibold leading-7 tracking-tight text-foreground">{application.role}</p>
        <p className="text-sm text-muted-foreground">{application.company}</p>
      </div>
      {showStatus ? (
        <span className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${statusTone[application.status]}`}>
          {application.status}
        </span>
      ) : null}
    </div>
  );
}

function NotesSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      {children}
    </div>
  );
}

export function JobTrackerManager({ initialApplications }: { initialApplications: ApplicationItem[] }) {
  const [applications, setApplications] = useState(initialApplications);
  const [form, setForm] = useState({ company: "", role: "", status: "WISHLIST", appliedDate: "", link: "", notes: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [detailApplicationId, setDetailApplicationId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<ApplicationItem["status"] | null>(null);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [statusOpen, setStatusOpen] = useState(false);
  const statusRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setApplications(initialApplications);
    setDetailApplicationId((current) => (current && initialApplications.some((application) => application.id === current) ? current : null));
    setSelectedStatus((current) => (current && initialApplications.some((application) => application.status === current) ? current : null));
  }, [initialApplications]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!statusRef.current?.contains(event.target as Node)) {
        setStatusOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setStatusOpen(false);
        setDetailApplicationId(null);
        setSelectedStatus(null);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const filteredApplications = useMemo(
    () => (selectedStatus ? applications.filter((application) => application.status === selectedStatus) : []),
    [selectedStatus, applications],
  );

  const detailApplication = useMemo(
    () => applications.find((application) => application.id === detailApplicationId) ?? null,
    [applications, detailApplicationId],
  );

  const detailNotesSections = useMemo(() => parseNotesSections(detailApplication?.notes ?? null), [detailApplication?.notes]);

  const hydrateFormFromApplication = (application: ApplicationItem) => {
    setEditingId(application.id);
    setForm({
      company: application.company,
      role: application.role,
      status: application.status,
      appliedDate: application.appliedDate ? format(application.appliedDate, "yyyy-MM-dd") : "",
      link: application.link ?? "",
      notes: application.notes ?? "",
    });
    setDetailApplicationId(null);
    setSelectedStatus(null);
  };

  return (
    <>
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
                  <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-20 overflow-hidden rounded-2xl border border-sky-100 bg-white/95 p-2 shadow-[0_20px_50px_rgba(14,165,233,0.16)] backdrop-blur-xl dark:border-white/8 dark:bg-slate-950/96 dark:shadow-[0_20px_50px_rgba(2,6,23,0.45)]">
                    <div role="listbox" aria-label="Application status options" className="space-y-1">
                      {applicationStatuses.map((status) => {
                        const selected = status === form.status;
                        return (
                          <button
                            key={status}
                            type="button"
                            role="option"
                            aria-selected={selected}
                            className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition ${selected ? "bg-sky-100 text-sky-900 dark:bg-sky-400/12 dark:text-white" : "text-slate-700 hover:bg-sky-50 hover:text-sky-900 dark:text-slate-300 dark:hover:bg-white/[0.05] dark:hover:text-white"}`}
                            onClick={() => {
                              setForm({ ...form, status });
                              setStatusOpen(false);
                            }}
                          >
                            <span>{status}</span>
                            {selected ? <Check className="h-4 w-4 text-sky-600 dark:text-sky-300" /> : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
            <div className="space-y-2"><Label>Applied date</Label><AppliedDatePicker value={form.appliedDate} onChange={(appliedDate) => setForm({ ...form, appliedDate })} /></div>
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
          <div className="space-y-1 rounded-2xl border border-sky-100 bg-sky-50/80 px-4 py-3 shadow-sm shadow-sky-500/10 dark:border-white/6 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.42),rgba(15,23,42,0.18))] dark:shadow-none">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-200">Application pipeline</p>
            <p className="text-xs leading-5 text-sky-700 dark:text-slate-400">Choose a status card to open the applications in that stage.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {applicationStatuses.map((status) => {
              const count = applications.filter((item) => item.status === status).length;
              const active = selectedStatus === status;
              return (
                <button
                  key={status}
                  type="button"
                  className="group text-left"
                  onClick={() => setSelectedStatus(status)}
                >
                  <Card
                    className={`relative overflow-hidden rounded-[24px] transition-all duration-200 ease-out ${
                      active
                        ? "border-sky-300 bg-sky-500 text-white shadow-[0_18px_44px_rgba(14,165,233,0.24)] ring-1 ring-sky-200 dark:border-sky-400/25 dark:bg-[linear-gradient(180deg,rgba(30,41,59,0.98),rgba(15,23,42,0.96))] dark:shadow-[0_18px_44px_rgba(15,23,42,0.32)] dark:ring-sky-400/10"
                        : "border-sky-100 bg-white text-slate-900 shadow-sm shadow-sky-500/10 hover:-translate-y-0.5 hover:scale-[1.01] hover:border-sky-200 hover:bg-sky-50 hover:shadow-[0_18px_36px_rgba(14,165,233,0.16)] dark:border-white/8 dark:bg-[linear-gradient(180deg,rgba(17,24,39,0.94),rgba(15,23,42,0.96))] dark:text-slate-100 dark:hover:border-white/14 dark:hover:bg-[linear-gradient(180deg,rgba(23,31,48,0.98),rgba(15,23,42,0.98))] dark:hover:shadow-[0_18px_36px_rgba(15,23,42,0.26)]"
                    }`}
                  >
                    <div className={`absolute inset-x-0 top-0 h-px transition-opacity duration-200 ${active ? "bg-white/70 opacity-100 dark:bg-sky-400/60" : "bg-sky-300/50 opacity-0 group-hover:opacity-100 dark:bg-white/15"}`} />
                    <CardHeader className="flex min-h-[176px] flex-col items-center justify-center gap-4 px-6 py-6 text-center">
                      <CardTitle className={`text-[1.1rem] font-semibold tracking-[0.015em] ${active ? "text-white" : "text-slate-900 dark:text-slate-100"}`}>{status}</CardTitle>
                      <CardDescription className={`text-[1.5rem] font-semibold leading-none ${active ? "text-white" : "text-slate-700 dark:text-slate-200"}`}>{count} roles</CardDescription>
                      <p className={`text-[11px] transition-colors duration-200 ${active ? "text-sky-50" : "text-sky-700 group-hover:text-sky-800 dark:text-slate-500 dark:group-hover:text-slate-300"}`}>
                        {active ? "Viewing applications" : "Tap to open"}
                      </p>
                    </CardHeader>
                  </Card>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {selectedStatus ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm" onClick={() => setSelectedStatus(null)}>
          <div className="w-full max-w-5xl" onClick={(event) => event.stopPropagation()}>
            <Card className="border-white/10 bg-card/92 shadow-[0_24px_80px_rgba(2,6,23,0.45)]">
              <CardContent className="space-y-4 p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4 border-b border-white/6 pb-4">
                  <div className="min-w-0 space-y-1">
                    <p className="text-xl font-semibold tracking-tight text-foreground">{selectedStatus}</p>
                    <p className="text-sm text-muted-foreground">{filteredApplications.length} application{filteredApplications.length === 1 ? "" : "s"}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="shrink-0" onClick={() => setSelectedStatus(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {filteredApplications.length ? (
                  <div className="grid max-h-[70vh] gap-4 overflow-y-auto pr-1 lg:grid-cols-2">
                    {filteredApplications.map((application) => (
                      <Card
                        key={application.id}
                        className="cursor-pointer border border-white/8 bg-card/60 transition-colors hover:border-white/15 hover:bg-card/72"
                        onClick={() => setDetailApplicationId(application.id)}
                      >
                        <CardContent className="space-y-4 p-5">
                          <div className="space-y-3 border-b border-white/6 pb-3">
                            <ApplicationHeader application={application} showStatus={false} />
                            <MetaRow application={application} />
                          </div>

                          <div className="rounded-2xl border border-white/6 bg-background/42 px-4 py-3">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Preview</p>
                            <p className="mt-2 min-h-[84px] text-[13px] leading-6 text-slate-300/90" style={previewClampStyle}>
                              {getNotesPreview(application.notes)}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 border-t border-white/6 pt-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(event) => {
                                event.stopPropagation();
                                hydrateFormFromApplication(application);
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(event) => {
                                event.stopPropagation();
                                startTransition(async () => { await deleteJobApplicationAction(application.id); location.reload(); });
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="border-dashed border-white/10 bg-card/40">
                    <CardContent className="p-5 text-sm text-muted-foreground">
                      {`No ${selectedStatus.toLowerCase()} applications yet.`}
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}

      {detailApplication ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm" onClick={() => setDetailApplicationId(null)}>
          <div className="w-full max-w-2xl" onClick={(event) => event.stopPropagation()}>
            <Card className="border-white/10 bg-card/92 shadow-[0_24px_80px_rgba(2,6,23,0.45)]">
              <CardContent className="space-y-4 p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4 border-b border-white/6 pb-4">
                  <div className="min-w-0 flex-1 space-y-3">
                    <ApplicationHeader application={detailApplication} />
                    <MetaRow application={detailApplication} />
                  </div>
                  <Button variant="ghost" size="icon" className="shrink-0" onClick={() => setDetailApplicationId(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="rounded-2xl border border-white/6 bg-background/50 px-4 py-4">
                  <div className="max-h-[60vh] space-y-5 overflow-y-auto pr-1">
                    {detailNotesSections.summary.length ? (
                      <NotesSection label="Summary / Description">
                        <div className="space-y-2 text-[13px] leading-6 text-slate-300/95">
                          {detailNotesSections.summary.map((line, index) => (
                            <p key={`summary-${index}`}>{line}</p>
                          ))}
                        </div>
                      </NotesSection>
                    ) : null}

                    {detailNotesSections.responsibilities.length ? (
                      <NotesSection label="Responsibilities">
                        <ul className="space-y-2 pl-4 text-[13px] leading-6 text-slate-300/90 marker:text-slate-400">
                          {detailNotesSections.responsibilities.map((item, index) => (
                            <li key={`responsibility-${index}`}>{item}</li>
                          ))}
                        </ul>
                      </NotesSection>
                    ) : null}

                    {detailNotesSections.techStack.length ? (
                      <NotesSection label="Tech stack">
                        <div className="space-y-1 text-[13px] leading-6 text-slate-300/90">
                          {detailNotesSections.techStack.map((line, index) => (
                            <p key={`tech-${index}`}>{line}</p>
                          ))}
                        </div>
                      </NotesSection>
                    ) : null}

                    {detailNotesSections.extra.length ? (
                      <NotesSection label="Extra notes">
                        <div className="space-y-2 text-[13px] leading-6 text-slate-300/85">
                          {detailNotesSections.extra.map((line, index) => (
                            <p key={`extra-${index}`}>{line}</p>
                          ))}
                        </div>
                      </NotesSection>
                    ) : null}

                    {!detailApplication.notes?.trim() ? (
                      <p className="text-sm text-slate-400">No notes added for this application yet.</p>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 border-t border-white/6 pt-3">
                  <Button variant="outline" size="sm" onClick={() => hydrateFormFromApplication(detailApplication)}>
                    Edit application
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startTransition(async () => { await deleteJobApplicationAction(detailApplication.id); location.reload(); })}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </>
  );
}






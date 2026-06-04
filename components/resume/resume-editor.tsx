"use client";

import { Expand, FileText, Loader2, Minus, Plus, Sparkles, Trash2, X } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useState } from "react";

import { saveResumeAction } from "@/app/dashboard/actions";
import { ResumePreview } from "@/components/resume/resume-preview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { exportResumeToPDF } from "@/lib/exportResumeToPDF";
import { getResumeExportValidationMessage } from "@/lib/validations";
import { joinProjectDescription, splitProjectDescription } from "@/lib/projectBullets";
import { cn } from "@/lib/utils";
import type { ResumeFormValues } from "@/types";

const bulletActions = [
  { value: "improve", label: "Improve", description: "Makes the bullet clearer and stronger." },
  { value: "shorten", label: "Shorten", description: "Makes the bullet tighter." },
  { value: "professionalize", label: "Professionalize", description: "Makes the bullet sound more polished." },
  { value: "achievement-focused", label: "Achievement", description: "Makes the bullet focus more on results and impact." },
] as const;

const fieldClass =
  "h-10 w-full rounded-xl border-sky-100 bg-white px-3.5 text-sm text-slate-900 shadow-none placeholder:text-slate-400 focus-visible:border-sky-400/50 focus-visible:ring-2 focus-visible:ring-sky-400/15 dark:border-white/6 dark:bg-slate-950/42 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus-visible:border-sky-400/35 dark:focus-visible:ring-sky-400/10";
const textareaClass =
  "w-full rounded-xl border-sky-100 bg-white px-3.5 py-2.5 text-sm leading-6 text-slate-900 shadow-none placeholder:text-slate-400 focus-visible:border-sky-400/50 focus-visible:ring-2 focus-visible:ring-sky-400/15 dark:border-white/6 dark:bg-slate-950/42 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus-visible:border-sky-400/35 dark:focus-visible:ring-sky-400/10 resize-y";
const tertiaryButtonClass =
  "h-8 shrink-0 rounded-full border border-sky-100 bg-white px-3 text-xs font-medium text-sky-700 hover:bg-sky-50 hover:text-sky-800 dark:border-white/6 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:bg-white/[0.05] dark:hover:text-white";
const subtleActionClass =
  "h-8 shrink-0 rounded-full px-3 text-xs text-sky-700 hover:bg-sky-50 hover:text-sky-800 dark:text-slate-400 dark:hover:bg-white/[0.05] dark:hover:text-slate-100";
const aiActionClass =
  "h-7 shrink-0 whitespace-nowrap rounded-full border border-sky-100 bg-white px-2 text-[10px] font-medium text-sky-700 hover:bg-sky-50 hover:text-sky-800 dark:border-white/6 dark:bg-white/[0.02] dark:text-slate-300 dark:hover:bg-white/[0.05] dark:hover:text-white";
const skillChipClass =
  "inline-flex max-w-full items-center gap-1.5 rounded-full border border-sky-100 bg-sky-50 px-2.5 py-1 text-xs text-sky-800 dark:border-white/6 dark:bg-white/[0.03] dark:text-slate-300";
const dateFieldClass = cn(fieldClass, "min-w-[140px]");

function cleanAiBulletSuggestion(input: unknown) {
  return String(input ?? "")
    .trim()
    .replace(/^["'`]+|["'`]+$/g, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/_(.*?)_/g, "$1")
    .replace(/^\s*[-*•]\s+/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseSkillsInput(input: string) {
  return input
    .split(/\n+/)
    .map((skill) => skill.trim())
    .filter(Boolean);
}

type SectionProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

function EditorSection({ eyebrow, title, description, actions, children, className }: SectionProps) {

  return (
    <section className={cn("space-y-5 border-t border-sky-100 pt-8 first:border-t-0 first:pt-0 dark:border-white/6", className)}>
      <div className="flex min-w-0 flex-col gap-4 2xl:flex-row 2xl:items-start 2xl:justify-between">
        <div className="min-w-0 flex-1">
          {eyebrow ? <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-500 dark:text-sky-300/85">{eyebrow}</p> : null}
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900 dark:text-white">{title}</h2>
          {description ? <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">{description}</p> : null}
        </div>
        {actions ? <div className="flex min-w-0 flex-wrap items-center gap-2 2xl:justify-end">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}

function Field({ label, hint, className, children }: { label: string; hint?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("min-w-0 space-y-2", className)}>
      <Label className="block text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">{label}</Label>
      {children}
      {hint ? <p className="text-xs leading-5 text-slate-500 dark:text-slate-500">{hint}</p> : null}
    </div>
  );
}

function ExperienceRole({
  item,
  index,
  values,
  aiLoadingKey,
  setAiLoadingKey,
  setMessage,
  updateExperience,
  onRemove,
}: {
  item: ResumeFormValues["experience"][number];
  index: number;
  values: ResumeFormValues;
  aiLoadingKey: string | null;
  setAiLoadingKey: (value: string | null) => void;
  setMessage: (value: string) => void;
  updateExperience: (index: number, field: keyof ResumeFormValues["experience"][number], value: string | string[]) => void;
  onRemove: () => void;
}) {
  return (
    <motion.div layout className="rounded-[20px] bg-white/75 px-4 py-4 ring-1 ring-sky-100 dark:bg-white/[0.02] dark:ring-white/5">
      <div className="flex min-w-0 flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Experience item</p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Structure the role first, then tighten the evidence beneath it.</p>
        </div>
        <Button type="button" variant="ghost" size="sm" className={subtleActionClass} onClick={onRemove}>
          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
          Remove role
        </Button>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Field label="Company" className="xl:col-span-2">
          <Input onKeyDown={(e) => e.stopPropagation()} className={fieldClass} value={item.company} onChange={(e) => updateExperience(index, "company", e.target.value)} />
        </Field>
        <Field label="Role" className="xl:col-span-2">
          <Input onKeyDown={(e) => e.stopPropagation()} className={fieldClass} value={item.role} onChange={(e) => updateExperience(index, "role", e.target.value)} />
        </Field>
        <Field label="Start date" className="xl:col-span-2">
          <Input onKeyDown={(e) => e.stopPropagation()} className={dateFieldClass} value={item.startDate} onChange={(e) => updateExperience(index, "startDate", e.target.value)} />
        </Field>
        <Field label="End date" className="xl:col-span-2">
          <Input onKeyDown={(e) => e.stopPropagation()} className={dateFieldClass} value={item.endDate} onChange={(e) => updateExperience(index, "endDate", e.target.value)} />
        </Field>
      </div>

      <div className="mt-6 space-y-3 border-t border-sky-100 pt-4 dark:border-white/6">
        {item.bullets.map((bullet, bulletIndex) => {
          const key = `${item.id}-${bulletIndex}`;
          return (
            <div key={key} className="space-y-3 rounded-2xl bg-sky-50/70 px-3.5 py-3 ring-1 ring-sky-100 dark:bg-slate-950/18 dark:ring-white/4">
              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Bullet {bulletIndex + 1}</p>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {bulletActions.map((action) => (
                      <Button
                        key={action.value}
                        type="button"
                        size="sm"
                        variant="ghost"
                        className={aiActionClass}
                        title={action.description}
                        aria-label={`${action.label}: ${action.description}`}
                        disabled={aiLoadingKey === `${key}-${action.value}`}
                        onClick={async () => {
                          setAiLoadingKey(`${key}-${action.value}`);
                          setMessage("");
                          try {
                            const response = await fetch("/api/ai/resume-bullets", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ bullet, action: action.value, role: item.role || values.personal.role }),
                            });
                            const data = await response.json();

                            if (!response.ok) {
                              setMessage(data.error ?? "Unable to improve bullet.");
                              return;
                            }

                            const nextBullets = [...item.bullets];
                            nextBullets[bulletIndex] = cleanAiBulletSuggestion(data.suggestion);
                            updateExperience(index, "bullets", nextBullets);
                            setMessage(`AI ${action.value} applied.`);
                          } catch (error) {
                            setMessage(error instanceof Error ? error.message : "Unable to improve bullet.");
                          } finally {
                            setAiLoadingKey(null);
                          }
                        }}
                      >
                        {aiLoadingKey === `${key}-${action.value}` ? <Loader2 className="h-3 w-3 animate-spin" /> : action.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              <Textarea onKeyDown={(e) => e.stopPropagation()}
                className={cn(textareaClass, "min-h-[84px] bg-transparent")}
                value={bullet}
                onChange={(e) => {
                  const nextBullets = [...item.bullets];
                  nextBullets[bulletIndex] = e.target.value;
                  updateExperience(index, "bullets", nextBullets);
                }}
              />
            </div>
          );
        })}

        <div className="pt-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={subtleActionClass}
            onClick={() => updateExperience(index, "bullets", [...item.bullets, ""])}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add bullet
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export function ResumeEditor({ initialData, resumeId }: { initialData: ResumeFormValues; resumeId?: string }) {
  const router = useRouter();
  const [values, setValues] = useState<ResumeFormValues>(initialData);
  const deferredValues = useDeferredValue(values);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [aiLoadingKey, setAiLoadingKey] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(1);
  const [skillsInput, setSkillsInput] = useState(initialData.skills.map((skill) => skill.replace(/\\n/g, "\n")).join("\n"));
  const [referencesInput, setReferencesInput] = useState((initialData.references ?? []).join("\n"));
  const parsedSkills = useMemo(() => parseSkillsInput(skillsInput), [skillsInput]);

  const updateExperience = (index: number, field: keyof ResumeFormValues["experience"][number], value: string | string[]) => {
    setValues((current) => {
      const next = [...current.experience];
      next[index] = { ...next[index], [field]: value };
      return { ...current, experience: next };
    });
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const nextSkills = parseSkillsInput(skillsInput);
      setValues((current) => {
        if (current.skills.length === nextSkills.length && current.skills.every((skill, index) => skill === nextSkills[index])) {
          return current;
        }

        return { ...current, skills: nextSkills };
      });
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [skillsInput]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const nextReferences = parseSkillsInput(referencesInput);
      setValues((current) => {
        if ((current.references ?? []).length === nextReferences.length && (current.references ?? []).every((ref, index) => ref === nextReferences[index])) {
          return current;
        }

        return { ...current, references: nextReferences };
      });
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [referencesInput]);

  const updateEducation = (index: number, field: keyof ResumeFormValues["education"][number], value: string) => {
    setValues((current) => {
      const next = [...current.education];
      next[index] = { ...next[index], [field]: value };
      return { ...current, education: next };
    });
  };

  const updateCertification = (index: number, field: "name" | "issuer" | "startDate" | "endDate", value: string) => {
    setValues((current) => {
      const next = [...(current.certifications ?? [])];
      next[index] = { ...next[index], [field]: value };
      return { ...current, certifications: next };
    });
  };

  const updateProject = (index: number, field: keyof NonNullable<ResumeFormValues["projects"]>[number], value: string) => {
    setValues((current) => {
      const next = [...(current.projects ?? [])];
      next[index] = { ...next[index], [field]: value };
      return { ...current, projects: next };
    });
  };

  const updateReferences = (input: string) => {
    const nextReferences = parseSkillsInput(input);
    setValues((current) => ({ ...current, references: nextReferences }));
  };

  return (
    <>
      <div className="grid gap-6 2xl:grid-cols-[minmax(620px,1.15fr)_minmax(460px,0.85fr)]">
        <div className="min-w-0 space-y-6">
          <section className="rounded-[24px] border border-sky-100 bg-white/90 px-4 py-5 shadow-[0_20px_70px_rgba(14,165,233,0.12)] backdrop-blur-xl dark:border-white/7 dark:bg-slate-950/55 dark:shadow-[0_20px_70px_rgba(2,6,23,0.26)] sm:rounded-[28px] sm:px-6 sm:py-6">
            <div className="space-y-5">
              <div className="min-w-0 max-w-3xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-500 dark:text-sky-300/85">Resume Builder</p>
                <h1 className="mt-2 text-[1.9rem] font-semibold tracking-tight text-slate-950 dark:text-white">Build a cleaner, sharper narrative.</h1>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  Edit the substance here, keep the structure light, and export a recruiter-ready document without dragging the app UI into the final output.
                </p>
              </div>
              <div className="flex min-w-0 flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isExporting || isSaving}
                    className="h-10 rounded-xl border-sky-100 bg-white px-4.5 text-sky-700 hover:bg-sky-50 hover:text-sky-800 dark:border-white/7 dark:bg-white/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.05] dark:hover:text-white"
                    onClick={async () => {
                      setMessage("");
                      setIsExporting(true);
                      try {
                        const result = await saveResumeAction({ id: resumeId, values });
                        if (!resumeId) {
                          router.push(`/dashboard/resumes/${result.id}`);
                        }
                        router.refresh();
                        await exportResumeToPDF(result.id);
                        setMessage("Resume exported successfully.");
                      } catch (error) {
                        setMessage(error instanceof Error ? error.message : "Unable to export resume.");
                      } finally {
                        setIsExporting(false);
                      }
                    }}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Export resume
                  </Button>
                  <Button
                    variant="accent"
                    disabled={isExporting || isSaving}
                    className="h-10 rounded-xl px-4.5 shadow-[0_12px_28px_rgba(14,165,233,0.18)]"
                    onClick={async () => {
                      setMessage("");
                      setIsSaving(true);
                      try {
                        const result = await saveResumeAction({ id: resumeId, values });
                        setMessage("Resume saved successfully.");
                        if (!resumeId) {
                          router.push(`/dashboard/resumes/${result.id}`);
                        }
                        router.refresh();
                      } catch (error) {
                        setMessage(error instanceof Error ? error.message : "Unable to save resume.");
                      } finally {
                        setIsSaving(false);
                      }
                    }}
                  >
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Save resume
                  </Button>
                </div>
                <p className="max-w-md text-xs text-slate-500 dark:text-slate-500">Save keeps your latest edits synced. Export generates the recruiter-ready PDF.</p>
              </div>
            </div>
            {message ? <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">{message}</p> : null}
          </section>

          <div className="rounded-[24px] border border-sky-100 bg-white/80 px-4 py-5 shadow-[0_16px_50px_rgba(14,165,233,0.10)] backdrop-blur-sm dark:border-white/6 dark:bg-white/[0.025] dark:shadow-[0_16px_50px_rgba(2,6,23,0.16)] sm:rounded-[28px] sm:px-6 sm:py-6">
            <div className="space-y-8">
              <EditorSection
                eyebrow="Identity"
                title="Core details"
                description="Keep the top of the resume clear, calm, and instantly scannable."
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Resume title" className="md:col-span-2">
                    <Input onKeyDown={(e) => e.stopPropagation()} className={fieldClass} value={values.title} onChange={(e) => setValues({ ...values, title: e.target.value })} />
                  </Field>
                  <Field label="Full name">
                    <Input onKeyDown={(e) => e.stopPropagation()} className={fieldClass} value={values.personal.fullName} onChange={(e) => setValues({ ...values, personal: { ...values.personal, fullName: e.target.value } })} />
                  </Field>
                  <Field label="Target role">
                    <Input onKeyDown={(e) => e.stopPropagation()} className={fieldClass} value={values.personal.role} onChange={(e) => setValues({ ...values, personal: { ...values.personal, role: e.target.value } })} />
                  </Field>
                  <Field label="Email">
                    <Input onKeyDown={(e) => e.stopPropagation()} className={fieldClass} type="email" value={values.personal.email} onChange={(e) => setValues({ ...values, personal: { ...values.personal, email: e.target.value } })} />
                  </Field>
                  <Field label="Phone">
                    <Input onKeyDown={(e) => e.stopPropagation()} className={fieldClass} value={values.personal.phone} onChange={(e) => setValues({ ...values, personal: { ...values.personal, phone: e.target.value } })} />
                  </Field>
                  <Field label="Location">
                    <Input onKeyDown={(e) => e.stopPropagation()} className={fieldClass} value={values.personal.location} onChange={(e) => setValues({ ...values, personal: { ...values.personal, location: e.target.value } })} />
                  </Field>
                  <Field label="Website / Portfolio">
                    <Input onKeyDown={(e) => e.stopPropagation()} className={fieldClass} value={values.personal.website} onChange={(e) => setValues({ ...values, personal: { ...values.personal, website: e.target.value } })} />
                  </Field>
                  <Field label="GitHub (optional)">
                    <Input onKeyDown={(e) => e.stopPropagation()} className={fieldClass} value={values.personal.github ?? ""} onChange={(e) => setValues({ ...values, personal: { ...values.personal, github: e.target.value } })} />
                  </Field>
                  <Field label="Professional summary" className="md:col-span-2">
                    <Textarea onKeyDown={(e) => e.stopPropagation()} className={cn(textareaClass, "min-h-[128px]")} value={values.summary} onChange={(e) => setValues({ ...values, summary: e.target.value })} />
                  </Field>
                </div>
              </EditorSection>

              <EditorSection
                eyebrow="Narrative"
                title="Experience"
                description="Treat each role like an edited story: compact structure, crisp bullets, and fast AI assistance when you need it."
                actions={
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 rounded-xl border-sky-100 bg-white px-4 text-sky-700 hover:bg-sky-50 hover:text-sky-800 dark:border-white/7 dark:bg-white/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.05] dark:hover:text-white"
                    onClick={() =>
                      setValues((current) => ({
                        ...current,
                        experience: [
                          ...current.experience,
                          { id: crypto.randomUUID(), company: "", role: "", startDate: "", endDate: "", bullets: [""] },
                        ],
                      }))
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add role
                  </Button>
                }
              >
                <div className="space-y-4">
                  {values.experience.map((item, index) => (
                    <ExperienceRole
                      key={item.id}
                      item={item}
                      index={index}
                      values={values}
                      aiLoadingKey={aiLoadingKey}
                      setAiLoadingKey={setAiLoadingKey}
                      setMessage={setMessage}
                      updateExperience={updateExperience}
                      onRemove={() =>
                        setValues((current) => ({
                          ...current,
                          experience: current.experience.filter((entry) => entry.id !== item.id),
                        }))
                      }
                    />
                  ))}
                </div>
              </EditorSection>

              <EditorSection
                eyebrow="Projects"
                title="Projects"
                description="Optional, but helpful when a project shows relevant impact or ownership more clearly than a job entry."
                actions={
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={tertiaryButtonClass}
                    onClick={() =>
                      setValues((current) => ({
                        ...current,
                        projects: [
                          ...(current.projects ?? []),
                          { id: crypto.randomUUID(), name: "", description: "", techStack: "", link: "" },
                        ],
                      }))
                    }
                  >
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Add project
                  </Button>
                }
              >
                {(values.projects ?? []).length ? (
                  <div className="space-y-4">
                    {(values.projects ?? []).map((project, index) => (
                      <div key={project.id} className="rounded-[20px] bg-white/75 px-4 py-4 ring-1 ring-sky-100 dark:bg-white/[0.02] dark:ring-white/5">
                        <div className="flex min-w-0 flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Project {index + 1} (optional)</p>
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Add a focused project only if it strengthens the story of this resume.</p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className={subtleActionClass}
                            onClick={() =>
                              setValues((current) => ({
                                ...current,
                                projects: (current.projects ?? []).filter((item) => item.id !== project.id),
                              }))
                            }
                          >
                            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                            Remove project
                          </Button>
                        </div>

                        <div className="mt-5 space-y-4">
                          <Field label="Project name">
                            <Input onKeyDown={(e) => e.stopPropagation()} className={fieldClass} value={project.name} onChange={(e) => updateProject(index, "name", e.target.value)} />
                          </Field>
                          <div className="grid gap-4 md:grid-cols-2">
                            <Field label="Tech stack (optional)">
                              <Input onKeyDown={(e) => e.stopPropagation()} className={fieldClass} value={project.techStack ?? ""} onChange={(e) => updateProject(index, "techStack", e.target.value)} />
                            </Field>
                            <Field label="Link (optional)">
                              <Input onKeyDown={(e) => e.stopPropagation()} className={fieldClass} value={project.link ?? ""} onChange={(e) => updateProject(index, "link", e.target.value)} />
                            </Field>
                          </div>
                          <div className="space-y-3.5">
                            <div className="flex min-w-0 flex-col gap-1.5 sm:flex-row sm:items-end sm:justify-between">
                              <div className="min-w-0">
                                <Label className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Project description</Label>
                                <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-500">Write the project description as bullets for the preview and PDF.</p>
                              </div>
                            </div>
                            {(() => {
                              const bullets = splitProjectDescription(project.description ?? "");
                              const safeBullets = bullets.length ? bullets : [""];
                              return (
                                <div className="space-y-3.5">
                                  {safeBullets.map((bullet, bulletIndex) => (
                                    <div key={`${project.id}-bullet-${bulletIndex}`} className="space-y-3 rounded-2xl bg-sky-50/70 px-3.5 py-3.5 ring-1 ring-sky-100 dark:bg-slate-950/18 dark:ring-white/4">
                                      <div className="space-y-2">
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Bullet {bulletIndex + 1}</p>
                                        <div className="min-w-0">
                                          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                                            {bulletActions.map((action) => (
                                              <Button
                                                key={action.value}
                                                type="button"
                                                size="sm"
                                                variant="ghost"
                                                className={aiActionClass}
                                                title={action.description}
                                                aria-label={`${action.label}: ${action.description}`}
                                                disabled={aiLoadingKey === `${project.id}-${bulletIndex}-${action.value}`}
                                                onClick={async () => {
                                                  setAiLoadingKey(`${project.id}-${bulletIndex}-${action.value}`);
                                                  setMessage("");
                                                  try {
                                                    const response = await fetch("/api/ai/resume-bullets", {
                                                      method: "POST",
                                                      headers: { "Content-Type": "application/json" },
                                                      body: JSON.stringify({
                                                        bullet,
                                                        action: action.value,
                                                        role: project.name || values.personal.role,
                                                      }),
                                                    });
                                                    const data = await response.json();

                                                    if (!response.ok) {
                                                      setMessage(data.error ?? "Unable to improve bullet.");
                                                      return;
                                                    }

                                                    const nextBullets = [...safeBullets];
                                                    nextBullets[bulletIndex] = cleanAiBulletSuggestion(data.suggestion);
                                                    updateProject(index, "description", joinProjectDescription(nextBullets));
                                                    setMessage(`AI ${action.value} applied.`);
                                                  } catch (error) {
                                                    setMessage(error instanceof Error ? error.message : "Unable to improve bullet.");
                                                  } finally {
                                                    setAiLoadingKey(null);
                                                  }
                                                }}
                                              >
                                                {aiLoadingKey === `${project.id}-${bulletIndex}-${action.value}` ? (
                                                  <Loader2 className="h-3 w-3 animate-spin" />
                                                ) : (
                                                  action.label
                                                )}
                                              </Button>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                      <Textarea
                                        onKeyDown={(e) => e.stopPropagation()}
                                        className={cn(textareaClass, "min-h-[84px] bg-transparent")}
                                        value={bullet}
                                        onChange={(e) => {
                                          const nextBullets = [...safeBullets];
                                          nextBullets[bulletIndex] = e.target.value.replace(/\s*\n+\s*/g, " ");
                                          updateProject(index, "description", joinProjectDescription(nextBullets));
                                        }}
                                      />
                                      {safeBullets.length > 1 ? (
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          className={subtleActionClass}
                                          onClick={() => {
                                            const nextBullets = safeBullets.filter((_, itemIndex) => itemIndex !== bulletIndex);
                                            updateProject(index, "description", joinProjectDescription(nextBullets));
                                          }}
                                        >
                                          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                          Remove
                                        </Button>
                                      ) : null}
                                    </div>
                                  ))}
                                </div>
                              );
                            })()}
                            <div className="pt-1">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className={tertiaryButtonClass}
                                onClick={() => {
                                  const bullets = splitProjectDescription(project.description ?? "");
                                  updateProject(index, "description", joinProjectDescription([...bullets, ""]));
                                }}
                              >
                                <Plus className="mr-1.5 h-3.5 w-3.5" />
                                Add bullet
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[20px] border border-dashed border-sky-200 bg-sky-50/60 px-4 py-5 text-sm text-slate-600 dark:border-white/8 dark:bg-white/[0.02] dark:text-slate-400">
                    No projects added yet. This section is optional.
                  </div>
                )}
              </EditorSection>

              <div className="space-y-8">
                <EditorSection
                  eyebrow="Credentials"
                  title="Education"
                  description="Keep credentials concise and easy to scan at a glance."
                  actions={
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className={tertiaryButtonClass}
                      onClick={() =>
                        setValues((current) => ({
                          ...current,
                          education: [...current.education, { id: crypto.randomUUID(), school: "", degree: "", year: "" }],
                        }))
                      }
                    >
                      <Plus className="mr-1.5 h-3.5 w-3.5" />
                      Add education
                    </Button>
                  }
                  className="border-t-0 pt-0"
                >
                  <div className="space-y-3">
                    {values.education.map((item, index) => (
                      <div key={item.id} className="rounded-[18px] bg-white/75 px-4 py-4 ring-1 ring-sky-100 dark:bg-white/[0.02] dark:ring-white/5">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
                          <Field label="School">
                            <Input onKeyDown={(e) => e.stopPropagation()} className={fieldClass} value={item.school} onChange={(e) => updateEducation(index, "school", e.target.value)} />
                          </Field>
                          <Field label="Degree">
                            <Input onKeyDown={(e) => e.stopPropagation()} className={fieldClass} value={item.degree} onChange={(e) => updateEducation(index, "degree", e.target.value)} />
                          </Field>
                          <Field label="Year">
                            <Input onKeyDown={(e) => e.stopPropagation()} className={fieldClass} value={item.year} onChange={(e) => updateEducation(index, "year", e.target.value)} />
                          </Field>
                        </div>
                      </div>
                    ))}
                  </div>
                </EditorSection>

                <EditorSection
                  eyebrow="Capabilities"
                  title="Core Skills"
                  description="Add the main skills, strengths, or tools that are most relevant to your target role."
                  className="border-t-0 pt-0"
                >
                  <div className="min-w-0 space-y-3.5">
                    <Field
                      label="Skills, strengths, or tools"
                      hint="Use one line per skill group or list, or keep everything on one line if you prefer."
                    >
                      <Textarea onKeyDown={(e) => e.stopPropagation()}
                        className={cn(textareaClass, "min-h-[150px]")}
                        value={skillsInput}
                        placeholder="Communication, Leadership, Project Management, Excel"
                        onChange={(e) => {
                          setSkillsInput(e.target.value);
                        }}
                        onBlur={() => {
                          const normalizedSkills = parseSkillsInput(skillsInput);
                          setValues((current) => ({ ...current, skills: normalizedSkills }));
                        }}
                      />
                    </Field>
                    <p className="text-xs leading-5 text-slate-500 dark:text-slate-500">Examples: Communication, Leadership, Project Management, Excel, Customer Service, CRM, Figma, React</p>
                    {parsedSkills.length ? (
                      <div className="flex flex-wrap gap-2">
                        {parsedSkills.slice(0, 16).map((skill, index) => (
                          <button
                            key={`${skill}-${index}`}
                            type="button"
                            className={cn(skillChipClass, "text-left")}
                            onClick={() => {
                              const nextSkills = parsedSkills.filter((_, itemIndex) => itemIndex !== index);
                              const nextInput = nextSkills.join("\n");
                              setSkillsInput(nextInput);
                              setValues((current) => ({ ...current, skills: nextSkills }));
                            }}
                          >
                            <span className="min-w-0 break-words">{skill}</span>
                            <X className="h-3 w-3 shrink-0 text-sky-600 dark:text-slate-400" />
                          </button>
                        ))}
                        {parsedSkills.length > 16 ? <span className={skillChipClass}>+{parsedSkills.length - 16} more</span> : null}
                      </div>
                    ) : null}
                  </div>
                </EditorSection>
              <EditorSection
                eyebrow="Supporting"
                title="Certifications"
                description="Optional. Add certifications only when they strengthen the role you are targeting."
                actions={
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={tertiaryButtonClass}
                    onClick={() =>
                      setValues((current) => ({
                        ...current,
                        certifications: [
                          ...(current.certifications ?? []),
                          { id: crypto.randomUUID(), name: "", issuer: "", startDate: "", endDate: "" },
                        ],
                      }))
                    }
                  >
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Add certification
                  </Button>
                }
              >
                {(values.certifications ?? []).length ? (
                  <div className="space-y-3">
                    {(values.certifications ?? []).map((cert, index) => (
                      <div key={cert.id} className="rounded-[18px] bg-white/75 px-4 py-4 ring-1 ring-sky-100 dark:bg-white/[0.02] dark:ring-white/5">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                          <Field label="Certification" className="xl:col-span-2">
                            <Input onKeyDown={(e) => e.stopPropagation()} className={fieldClass} value={cert.name} onChange={(e) => updateCertification(index, "name", e.target.value.replace(/\s*\n+\s*/g, " "))} />
                          </Field>
                          <Field label="Issuer (optional)" className="xl:col-span-2">
                            <Input onKeyDown={(e) => e.stopPropagation()} className={fieldClass} value={cert.issuer} onChange={(e) => updateCertification(index, "issuer", e.target.value.replace(/\s*\n+\s*/g, " "))} />
                          </Field>
                          <Field label="Start date" className="xl:col-span-2">
                            <Input onKeyDown={(e) => e.stopPropagation()} className={dateFieldClass} value={cert.startDate} onChange={(e) => updateCertification(index, "startDate", e.target.value.replace(/\s*\n+\s*/g, " "))} />
                          </Field>
                          <Field label="End date" className="xl:col-span-2">
                            <Input onKeyDown={(e) => e.stopPropagation()} className={dateFieldClass} value={cert.endDate} onChange={(e) => updateCertification(index, "endDate", e.target.value.replace(/\s*\n+\s*/g, " "))} />
                          </Field>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-500">Example: Coursera - Google UX Design - 2023</p>

                        <div className="mt-3">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className={subtleActionClass}
                            onClick={() =>
                              setValues((current) => ({
                                ...current,
                                certifications: (current.certifications ?? []).filter((item) => item.id !== cert.id),
                              }))
                            }
                          >
                            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                            Remove certification
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[20px] border border-dashed border-sky-200 bg-sky-50/60 px-4 py-5 text-sm text-slate-600 dark:border-white/8 dark:bg-white/[0.02] dark:text-slate-400">
                    No certifications added yet. This section is optional.
                  </div>
                )}
              </EditorSection>

              <EditorSection
                eyebrow="Supporting"
                title="References"
                description="Optional. Add references only if you specifically want them included on the resume."
              >
                <div className="space-y-3.5">
                  <Field
                    label="References (optional)"
                    hint="Use one reference line per entry, for example: Jane Doe - Engineering Manager - jane@company.com"
                  >
                    <Textarea onKeyDown={(e) => e.stopPropagation()}
                      className={cn(textareaClass, "min-h-[120px]")}
                      value={referencesInput}
                      placeholder="Jane Doe - Engineering Manager - jane@company.com"
                      onChange={(e) => setReferencesInput(e.target.value.replace(/\s*\n+\s*/g, " "))}
                      onBlur={() => updateReferences(referencesInput)}
                      />
                  </Field>
                </div>
              </EditorSection>

              </div>
            </div>
          </div>
        </div>

        <div className="min-w-0 space-y-4 2xl:sticky 2xl:top-4 2xl:self-start">
          <Card className="overflow-hidden border-sky-100 bg-white/85 shadow-[0_18px_60px_rgba(14,165,233,0.12)] dark:border-white/7 dark:bg-slate-950/45 dark:shadow-[0_18px_60px_rgba(2,6,23,0.24)]">
            <CardHeader className="border-b border-sky-100 pb-4 dark:border-white/6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <CardTitle className="text-lg text-slate-950 dark:text-white">Live preview</CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">A larger document surface that stays closely aligned with the exported PDF.</CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 shrink-0 rounded-full border-sky-100 bg-white px-3 text-xs text-sky-700 hover:bg-sky-50 hover:text-sky-800 dark:border-white/7 dark:bg-white/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.05] dark:hover:text-white"
                  onClick={() => setPreviewExpanded(true)}
                >
                  <Expand className="mr-1.5 h-3.5 w-3.5" />
                  Expand
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <ResumePreview values={deferredValues} />
            </CardContent>
          </Card>
        </div>
      </div>

      {previewExpanded ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/88 p-4 backdrop-blur-md sm:p-6">
          <div className="flex h-full w-full max-w-[1600px] flex-col rounded-[32px] border border-white/10 bg-slate-950/92 shadow-[0_30px_120px_rgba(2,6,23,0.5)]">
            <div className="flex flex-col gap-4 border-b border-white/8 px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-white">Focus preview</h2>
                <p className="text-sm text-slate-400">A larger, live-updating view of the same exported resume page.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                <div className="inline-flex items-center gap-1 rounded-full border border-white/8 bg-white/[0.03] p-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full text-slate-300 hover:bg-white/[0.06] hover:text-white"
                    onClick={() => setPreviewZoom((current) => Math.max(0.8, Number((current - 0.1).toFixed(2))))}
                    disabled={previewZoom <= 0.8}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </Button>
                  <span className="min-w-[4.25rem] text-center text-xs font-medium text-slate-300">{Math.round(previewZoom * 100)}%</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full text-slate-300 hover:bg-white/[0.06] hover:text-white"
                    onClick={() => setPreviewZoom((current) => Math.min(1.6, Number((current + 0.1).toFixed(2))))}
                    disabled={previewZoom >= 1.6}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-9 rounded-full px-3 text-slate-300 hover:bg-white/[0.05] hover:text-white"
                  onClick={() => setPreviewZoom(1)}
                >
                  Reset zoom
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-9 shrink-0 rounded-full px-3 text-slate-300 hover:bg-white/[0.05] hover:text-white"
                  onClick={() => setPreviewExpanded(false)}
                >
                  <X className="mr-1.5 h-4 w-4" />
                  Close
                </Button>
              </div>
            </div>
            <div className="min-h-0 flex-1 p-3 sm:p-4 md:p-5">
              <ResumePreview values={deferredValues} mode="focus" previewId="resume-preview-focus" zoomLevel={previewZoom} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}









"use client";

import { Check, ChevronDown, Copy, Loader2, Save, Sparkles, Upload } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";

import { saveCoverLetterAction } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const toneOptions = [
  "Confident and polished",
  "Professional and concise",
  "Warm and thoughtful",
  "Bold and ambitious",
  "Friendly and conversational",
  "Executive and strategic",
];

const COVER_LETTER_DRAFT_KEY = "careerforge:cover-letter-draft:v1";

export function CoverLetterStudio({
  initialLetters,
}: {
  initialLetters: Array<{ id: string; role: string; company: string; tone: string; content: string; jobDetails: string }>;
}) {
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [tone, setTone] = useState("Confident and polished");
  const [toneOpen, setToneOpen] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [resumeContext, setResumeContext] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");
  const [content, setContent] = useState(initialLetters[0]?.content ?? "");
  const [message, setMessage] = useState("");
  const [draftReady, setDraftReady] = useState(false);
  const [isGenerating, startGenerating] = useTransition();
  const [isSaving, startSaving] = useTransition();
  const [isExtractingResume, setIsExtractingResume] = useState(false);
  const toneRef = useRef<HTMLDivElement | null>(null);
  const resumeFileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    try {
      const savedDraft = window.localStorage.getItem(COVER_LETTER_DRAFT_KEY);
      if (!savedDraft) {
        setDraftReady(true);
        return;
      }

      const draft = JSON.parse(savedDraft) as Partial<{
        role: string;
        company: string;
        tone: string;
        jobDescription: string;
        resumeContext: string;
        resumeFileName: string;
        content: string;
      }>;

      if (typeof draft.role === "string") setRole(draft.role);
      if (typeof draft.company === "string") setCompany(draft.company);
      if (typeof draft.tone === "string" && toneOptions.includes(draft.tone)) setTone(draft.tone);
      if (typeof draft.jobDescription === "string") setJobDescription(draft.jobDescription);
      if (typeof draft.resumeContext === "string") setResumeContext(draft.resumeContext);
      if (typeof draft.resumeFileName === "string") setResumeFileName(draft.resumeFileName);
      if (typeof draft.content === "string") setContent(draft.content);
    } catch {
      window.localStorage.removeItem(COVER_LETTER_DRAFT_KEY);
    } finally {
      setDraftReady(true);
    }
  }, []);

  useEffect(() => {
    if (!draftReady) {
      return;
    }

    const draft = {
      role,
      company,
      tone,
      jobDescription,
      resumeContext,
      resumeFileName,
      content,
      updatedAt: new Date().toISOString(),
    };

    window.localStorage.setItem(COVER_LETTER_DRAFT_KEY, JSON.stringify(draft));
  }, [company, content, draftReady, jobDescription, resumeContext, resumeFileName, role, tone]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!toneRef.current?.contains(event.target as Node)) {
        setToneOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setToneOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  async function handleResumeUpload(file: File | undefined) {
    if (!file) {
      return;
    }

    setMessage("");
    setIsExtractingResume(true);

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const response = await fetch("/api/resume/extract", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error ?? "Unable to read that resume PDF.");
        return;
      }

      setResumeContext(String(data.text ?? ""));
      setResumeFileName(String(data.filename ?? file.name));
      setMessage("Resume PDF added to the cover letter context.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to read that resume PDF.");
    } finally {
      setIsExtractingResume(false);
      if (resumeFileRef.current) {
        resumeFileRef.current.value = "";
      }
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <Card>
        <CardHeader>
          <CardTitle>Generate a tailored cover letter</CardTitle>
          <CardDescription>Paste the job brief, set the tone, and let Groq draft a sharper first pass.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2"><Label>Role</Label><Input value={role} onChange={(e) => setRole(e.target.value)} /></div>
            <div className="space-y-2"><Label>Company</Label><Input value={company} onChange={(e) => setCompany(e.target.value)} /></div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 md:items-end">
            <div className="space-y-2">
              <Label htmlFor="cover-letter-tone-button">Tone</Label>
              <div ref={toneRef} className="relative">
                <button
                  id="cover-letter-tone-button"
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={toneOpen}
                  className="flex h-12 w-full items-center justify-between rounded-2xl border border-sky-200 bg-sky-50 px-4 text-sm font-medium text-slate-900 shadow-sm shadow-sky-500/10 outline-none transition hover:border-sky-300 hover:bg-sky-100 focus:border-sky-400/40 focus:ring-2 focus:ring-sky-400/15 dark:border-white/7 dark:bg-slate-950/60 dark:text-slate-100 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] dark:hover:border-white/10 dark:hover:bg-slate-950/70"
                  onClick={() => setToneOpen((current) => !current)}
                >
                  <span className="min-w-0 truncate">{tone}</span>
                  <ChevronDown className={`h-4 w-4 text-sky-600 transition dark:text-slate-400 ${toneOpen ? "rotate-180" : "rotate-0"}`} />
                </button>

                {toneOpen ? (
                  <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-20 overflow-hidden rounded-2xl border border-sky-100 bg-white/95 p-2 shadow-[0_20px_50px_rgba(14,165,233,0.16)] backdrop-blur-xl dark:border-white/8 dark:bg-slate-950/96 dark:shadow-[0_20px_50px_rgba(2,6,23,0.45)]">
                    <div role="listbox" aria-label="Tone options" className="space-y-1">
                      {toneOptions.map((option) => {
                        const selected = option === tone;
                        return (
                          <button
                            key={option}
                            type="button"
                            role="option"
                            aria-selected={selected}
                            className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition ${selected ? "bg-sky-100 text-sky-900 dark:bg-sky-400/12 dark:text-white" : "text-slate-700 hover:bg-sky-50 hover:text-sky-900 dark:text-slate-300 dark:hover:bg-white/[0.05] dark:hover:text-white"}`}
                            onClick={() => {
                              setTone(option);
                              setToneOpen(false);
                            }}
                          >
                            <span>{option}</span>
                            {selected ? <Check className="h-4 w-4 text-sky-600 dark:text-sky-300" /> : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Resume PDF</Label>
              <input
                ref={resumeFileRef}
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={(event) => void handleResumeUpload(event.target.files?.[0])}
              />
              <Button
                type="button"
                variant="outline"
                className="h-12 w-full justify-center rounded-2xl"
                disabled={isExtractingResume}
                onClick={() => resumeFileRef.current?.click()}
              >
                {isExtractingResume ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                {resumeContext ? "Replace resume" : "Insert resume PDF"}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Job description</Label>
            <Textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Drop the role brief here, and we will shape the first draft..." className="min-h-[220px]" />
          </div>
          {resumeContext ? (
            <div className="space-y-2">
              {resumeFileName ? <p className="text-sm text-muted-foreground">{resumeFileName}</p> : null}
              <Textarea
                value={resumeContext}
                onChange={(event) => setResumeContext(event.target.value)}
                className="min-h-[140px]"
              />
            </div>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <Button
              variant="accent"
              disabled={isGenerating}
              onClick={() => {
                setMessage("");
                startGenerating(async () => {
                  const response = await fetch("/api/ai/cover-letter", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ role, company, tone, jobDescription, resumeContext }),
                  });
                  const data = await response.json();
                  if (!response.ok) {
                    setMessage(data.error ?? "Unable to generate cover letter.");
                    return;
                  }
                  setContent(data.content.trim());
                  setMessage("Draft generated. Review, tweak, and save when it feels right.");
                });
              }}
            >
              {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Generate draft
            </Button>
            <Button
              variant="outline"
              onClick={() => navigator.clipboard.writeText(content)}
              disabled={!content}
            >
              <Copy className="mr-2 h-4 w-4" />Copy
            </Button>
          </div>
          {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Letter output</CardTitle>
          <CardDescription>Keep the voice crisp, specific, and aligned to the opportunity.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea value={content} onChange={(e) => setContent(e.target.value)} className="min-h-[480px]" />
          <div className="flex flex-wrap gap-3">
            <Button
              variant="accent"
              className="disabled:bg-sky-300 disabled:text-white dark:disabled:bg-sky-500/60"
              disabled={isSaving || !content}
              onClick={() => {
                setMessage("");
                startSaving(async () => {
                  try {
                    await saveCoverLetterAction({ values: { role, company, tone, jobDescription, resumeContext }, content });
                    window.localStorage.removeItem(COVER_LETTER_DRAFT_KEY);
                    setMessage("Cover letter saved.");
                  } catch (error) {
                    setMessage(error instanceof Error ? error.message : "Unable to save cover letter.");
                  }
                });
              }}
            >
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save letter
            </Button>
          </div>
          <div className="rounded-[28px] border border-border/70 bg-muted/40 p-4">
            <h4 className="font-medium">Recent drafts</h4>
            <div className="mt-4 space-y-3">
              {initialLetters.length ? (
                initialLetters.map((letter) => (
                  <button
                    key={letter.id}
                    type="button"
                    className="w-full rounded-2xl border border-border/70 bg-background/80 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg"
                    onClick={() => {
                      setRole(letter.role);
                      setCompany(letter.company);
                      setTone(letter.tone);
                      setJobDescription(letter.jobDetails);
                      setResumeContext("");
                      setResumeFileName("");
                      setContent(letter.content);
                    }}
                  >
                    <p className="font-medium">{letter.role} at {letter.company}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{letter.tone}</p>
                  </button>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No saved cover letters yet.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}




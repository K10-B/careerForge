import Link from "next/link";
import { ArrowRight, BrainCircuit, FilePlus2, PenSquare, X } from "lucide-react";

import { deleteResumeFormAction } from "@/app/dashboard/actions";
import { EmptyState } from "@/components/dashboard/empty-state";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";
import { getDashboardData, requireUser } from "@/lib/data";

export default async function DashboardPage() {
  const user = await requireUser();
  const { resumes, applications, usage, stats } = await getDashboardData(user.id);

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-border/70 bg-card/70 p-8 backdrop-blur-xl">
        <p className="text-sm font-medium text-accent">Welcome back</p>
        <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Build stronger applications without the scramble.</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">Your search workspace keeps resumes, AI drafts, and application progress moving in one calm system.</p>
          </div>
          <Button asChild variant="accent"><Link href="/dashboard/resumes/new">New resume</Link></Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard label="Resumes" value={stats.resumes} helper="Active resume workspaces" />
        <StatsCard label="Cover letters" value={stats.coverLetters} helper="Saved tailored drafts" />
        <StatsCard label="Active roles" value={stats.activeApplications} helper="Applications currently in progress" />
        <StatsCard label="Interviews" value={stats.interviews} helper="Conversations progressing" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader className="flex-row items-end justify-between">
            <div>
              <CardTitle>Recent resumes</CardTitle>
              <CardDescription>Pick up where you left off and keep iterating fast.</CardDescription>
            </div>
            <Button asChild variant="ghost" className="rounded-full border border-white/8 bg-white/[0.04] px-4 text-slate-200 shadow-[0_8px_24px_rgba(2,6,23,0.18)] hover:bg-white/[0.07] hover:text-white"><Link href="/dashboard/resumes">View all</Link></Button>
          </CardHeader>
          <CardContent>
            {resumes.length ? (
              <div className="space-y-4">
                {resumes.map((resume) => (
                  <div key={resume.id} className="flex items-center justify-between gap-3 rounded-[24px] border border-border/70 bg-background/70 p-4 transition hover:-translate-y-0.5 hover:shadow-lg">
                    <Link href={`/dashboard/resumes/${resume.id}`} className="min-w-0 flex-1">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{resume.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">Updated {new Date(resume.updatedAt).toLocaleDateString()}</p>
                      </div>
                    </Link>
                    <div className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border/70 bg-muted/35 p-1">
                      <Link
                        href={`/dashboard/resumes/${resume.id}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-background/80 hover:text-foreground"
                        aria-label={`Open ${resume.title}`}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                      <form action={deleteResumeFormAction.bind(null, resume.id)}>
                        <Button type="submit" variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label={`Delete ${resume.title}`}>
                          <X className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No resumes yet" description="Create your first resume to unlock live previews, AI bullet tuning, and PDF export." cta="Create resume" href="/dashboard/resumes/new" />
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
              <CardDescription>Jump straight into the highest-leverage workflows.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button asChild variant="outline" className="w-[220px] justify-between bg-slate-950/55 hover:bg-slate-900/80"><Link href="/dashboard/resumes/new"><span className="inline-flex items-center gap-2"><FilePlus2 className="h-4 w-4" />New resume</span><ArrowRight className="h-4 w-4" /></Link></Button>
              <Button asChild variant="outline" className="w-[220px] justify-between bg-slate-950/55 hover:bg-slate-900/80"><Link href="/dashboard/cover-letters"><span className="inline-flex items-center gap-2"><PenSquare className="h-4 w-4" />Generate letter</span><ArrowRight className="h-4 w-4" /></Link></Button>
              <Button asChild variant="outline" className="w-[220px] justify-between bg-slate-950/55 hover:bg-slate-900/80"><Link href="/dashboard/job-tracker"><span className="inline-flex items-center gap-2"><BrainCircuit className="h-4 w-4" />Track applications</span><ArrowRight className="h-4 w-4" /></Link></Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Usage</CardTitle>
              <CardDescription>Your current workspace activity.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div className="flex items-center justify-between"><span>Resumes</span><span className="font-medium text-foreground">{formatNumber(stats.resumes)}</span></div>
              <div className="flex items-center justify-between"><span>Cover letters</span><span className="font-medium text-foreground">{formatNumber(stats.coverLetters)}</span></div>
              <div className="flex items-center justify-between"><span>Bullet improvements</span><span className="font-medium text-foreground">{formatNumber(usage?.bulletImprovements ?? 0)}</span></div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>AI tools panel</CardTitle>
            <CardDescription>Gemini is wired into resume and cover letter workflows with controlled prompts and session-aware access.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[24px] border border-border/70 bg-muted/40 p-4">
              <p className="font-medium">Resume bullet actions</p>
              <p className="mt-2 text-sm text-muted-foreground">Improve, shorten, professionalize, or focus on achievements with one click.</p>
            </div>
            <div className="rounded-[24px] border border-border/70 bg-muted/40 p-4">
              <p className="font-medium">Cover letter generation</p>
              <p className="mt-2 text-sm text-muted-foreground">Create tailored first drafts from pasted job descriptions and chosen tone.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent applications</CardTitle>
            <CardDescription>Keep a quick pulse on the roles currently in flight.</CardDescription>
          </CardHeader>
          <CardContent>
            {applications.length ? (
              <div className="space-y-3">
                {applications.map((application) => (
                  <Link
                    key={application.id}
                    href="/dashboard/job-tracker"
                    className="block rounded-[24px] border border-border/70 bg-background/70 p-4 transition hover:-translate-y-0.5 hover:border-border hover:bg-background/85 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                    aria-label={`Open job tracker for ${application.role} at ${application.company}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{application.role}</p>
                        <p className="text-sm text-muted-foreground">{application.company}</p>
                      </div>
                      <span className="rounded-full border border-border/70 px-3 py-1 text-xs font-medium">{application.status}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState title="No tracked roles yet" description="Add your first application to keep deadlines, links, and notes out of scattered tabs." cta="Open job tracker" href="/dashboard/job-tracker" />
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}



import Link from "next/link";
import { ArrowLeft, X } from "lucide-react";

import { deleteResumeFormAction } from "@/app/dashboard/actions";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResumePreviewDialogTrigger } from "@/components/resume/resume-preview-dialog-trigger";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/data";

export default async function ResumesPage() {
  const user = await requireUser();
  const resumes = await prisma.resume.findMany({ where: { userId: user.id }, orderBy: { updatedAt: "desc" } });

  return (
    <div className="max-w-3xl space-y-6">
      <div className="space-y-4">
        <Button asChild variant="ghost" className="h-9 w-fit rounded-full border border-sky-100 bg-sky-50 px-3 text-sky-700 hover:bg-sky-100 hover:text-sky-800 dark:border-white/8 dark:bg-white/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.06] dark:hover:text-white">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-accent">Resumes</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Your resume workspaces</h1>
          </div>
          <Button asChild variant="accent"><Link href="/dashboard/resumes/new">Create resume</Link></Button>
        </div>
      </div>

      {resumes.length ? (
        <div className="grid gap-4">
          {resumes.map((resume) => (
            <Card key={resume.id}>
              <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
                <div className="min-w-0">
                  <CardTitle className="truncate">{resume.title}</CardTitle>
                  <CardDescription>Updated {new Date(resume.updatedAt).toLocaleDateString()}</CardDescription>
                </div>
                <form action={deleteResumeFormAction.bind(null, resume.id)}>
                  <Button type="submit" variant="ghost" size="icon" className="h-8 w-8 shrink-0 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                    <X className="h-4 w-4" />
                  </Button>
                </form>
              </CardHeader>
              <CardContent className="flex min-h-[170px] flex-col">
                <div className="min-h-[56px]">
                  <p className="line-clamp-2 text-sm text-muted-foreground">{resume.summary || "No summary yet."}</p>
                </div>
                <div className="mt-auto flex flex-wrap items-center gap-2">
                  <Button asChild className="w-fit" variant="outline"><Link href={`/dashboard/resumes/${resume.id}`}>Open editor</Link></Button>
                  <ResumePreviewDialogTrigger resumeId={resume.id} title={resume.title} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="Your workspace is clean" description="Create a resume to start building tailored application assets with AI assistance and export-ready formatting." cta="Create resume" href="/dashboard/resumes/new" />
      )}
    </div>
  );
}




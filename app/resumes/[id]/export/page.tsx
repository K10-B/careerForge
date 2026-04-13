import { notFound } from "next/navigation";

import { ResumePrintDocument } from "@/components/resume/resume-print-document";
import { getResumeById, parseResume, requireUser } from "@/lib/data";

export const dynamic = "force-dynamic";

type ResumeExportPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mode?: string }>;
};

export default async function ResumeExportPage({ params, searchParams }: ResumeExportPageProps) {
  const user = await requireUser();
  const { id } = await params;
  const { mode } = await searchParams;
  const resume = await getResumeById(user.id, id);

  if (!resume) {
    notFound();
  }

  return <ResumePrintDocument values={parseResume(resume)} title={resume.title} autoPrint={mode !== "pdf"} />;
}

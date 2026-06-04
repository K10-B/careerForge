import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { CoverLetterStudio } from "@/components/dashboard/cover-letter-studio";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/data";

export default async function CoverLettersPage() {
  const user = await requireUser();
  const coverLetters = await prisma.coverLetter.findMany({ where: { userId: user.id }, orderBy: { updatedAt: "desc" } });

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Button asChild variant="ghost" className="h-9 w-fit rounded-full border border-sky-100 bg-sky-50 px-3 text-sky-700 hover:bg-sky-100 hover:text-sky-800 dark:border-white/8 dark:bg-white/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.06] dark:hover:text-white">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <div>
          <p className="text-sm font-medium text-accent">Cover letter generator</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Generate tailored drafts in minutes</h1>
        </div>
      </div>
      <CoverLetterStudio initialLetters={coverLetters} />
    </div>
  );
}

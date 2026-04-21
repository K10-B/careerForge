import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { assertCoverLetterGenerationAllowed, ensureUsagePeriod } from "@/lib/billing";
import { generateText } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";
import { coverLetterSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const permission = await assertCoverLetterGenerationAllowed(session.user.id);
    if (!permission.allowed) {
      return NextResponse.json({ error: permission.message }, { status: 403 });
    }

    const body = await request.json();
    const values = coverLetterSchema.parse(body);

    const prompt = `Write a polished, tailored cover letter for the following job application.
Role: ${values.role}
Company: ${values.company}
Tone: ${values.tone}
Job Description:
${values.jobDescription}

Requirements:
- Keep it to 3 short paragraphs.
- Make it credible, specific, and modern.
- Include a clear value proposition.
- Do not use generic filler.
- Return only the cover letter text.`;

    const content = await generateText(prompt);
    await ensureUsagePeriod(session.user.id);
    await prisma.userUsage.upsert({
      where: { userId: session.user.id },
      update: {
        coverLetterGenerations: { increment: 1 },
        lastActiveAt: new Date(),
      },
      create: {
        userId: session.user.id,
        coverLetterGenerations: 1,
      },
    });
    return NextResponse.json({ content });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to generate cover letter." }, { status: 400 });
  }
}

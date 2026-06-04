import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { assertBulletImprovementAllowed, ensureUsagePeriod } from "@/lib/billing";
import { generateText } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";
import { improveBulletSchema } from "@/lib/validations";

function cleanResumeBulletOutput(input: string) {
  return input
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

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const permission = await assertBulletImprovementAllowed(session.user.id);
    if (!permission.allowed) {
      return NextResponse.json({ error: permission.message }, { status: 403 });
    }

    const body = await request.json();
    const values = improveBulletSchema.parse(body);

    const prompt = `You are an expert executive resume writer. Rewrite the following resume bullet with the action "${values.action}". Keep it concise, metric-oriented, and ATS-friendly. Role context: ${values.role ?? "General professional role"}. Return only the rewritten bullet as plain text. Do not use Markdown, bold text, italics, bullets, quotes, or formatting symbols. Bullet: ${values.bullet}`;
    const suggestion = cleanResumeBulletOutput(await generateText(prompt));

    await ensureUsagePeriod(session.user.id);
    await prisma.userUsage.upsert({
      where: { userId: session.user.id },
      update: {
        bulletImprovements: { increment: 1 },
        lastActiveAt: new Date(),
      },
      create: {
        userId: session.user.id,
        bulletImprovements: 1,
      },
    });

    return NextResponse.json({ suggestion });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to improve bullet." }, { status: 400 });
  }
}

import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { assertBulletImprovementAllowed } from "@/lib/billing";
import { generateText } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";
import { improveBulletSchema } from "@/lib/validations";

type BulletAction = "improve" | "shorten" | "professionalize" | "achievement-focused";

const actionInstructions: Record<BulletAction, string> = {
  improve: "Improve clarity, specificity, and impact while preserving the original meaning.",
  shorten: "Shorten the bullet while preserving the core action, subject, and result.",
  professionalize: "Make the wording polished and executive-ready without becoming generic.",
  "achievement-focused": "Emphasize the result or business value. Do not invent metrics.",
};

const keywordStopwords = new Set([
  "about",
  "across",
  "after",
  "along",
  "because",
  "their",
  "there",
  "these",
  "those",
  "through",
  "using",
  "while",
  "with",
  "within",
  "without",
]);

function cleanResumeBulletOutput(input: string) {
  return input
    .trim()
    .replace(/^["'`]+|["'`]+$/g, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/_(.*?)_/g, "$1")
    .replace(/^\s*[-*\u2022]\s+/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function sentenceCase(input: string) {
  const cleaned = cleanResumeBulletOutput(input).replace(/[.]+$/u, "");
  if (!cleaned) {
    return "";
  }

  return `${cleaned.charAt(0).toUpperCase()}${cleaned.slice(1)}.`;
}

function getKeywords(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length >= 5 && !keywordStopwords.has(word));
}

function isIncompleteBullet(input: string) {
  const cleaned = cleanResumeBulletOutput(input);
  const words = cleaned.split(/\s+/).filter(Boolean);

  return (
    words.length < 7 ||
    /\b(by|with|for|to|of|in|on|at|from|through|using|via|and|or|the|a|an)$/i.test(cleaned) ||
    /[:;,]$/.test(cleaned)
  );
}

function isLowQualityBullet(suggestion: string, original: string) {
  const cleanedSuggestion = cleanResumeBulletOutput(suggestion);
  if (
    isIncompleteBullet(cleanedSuggestion) ||
    /gemini is not configured|unable to|sorry/i.test(cleanedSuggestion) ||
    normalizeForComparison(cleanedSuggestion) === normalizeForComparison(original)
  ) {
    return true;
  }

  const originalWords = cleanResumeBulletOutput(original).split(/\s+/).filter(Boolean);
  const suggestionWords = cleanedSuggestion.split(/\s+/).filter(Boolean);
  if (suggestionWords.length < Math.min(7, Math.max(5, originalWords.length - 2))) {
    return true;
  }

  const originalKeywords = Array.from(new Set(getKeywords(original)));
  if (originalKeywords.length < 3) {
    return false;
  }

  const suggestionText = ` ${cleanedSuggestion.toLowerCase()} `;
  const overlap = originalKeywords.filter((word) => suggestionText.includes(word)).length;
  return overlap < Math.min(3, Math.ceil(originalKeywords.length * 0.35));
}

function polishBase(original: string) {
  return cleanResumeBulletOutput(original)
    .replace(/^responsible for\s+/i, "Managed ")
    .replace(/^worked on\s+/i, "Contributed to ")
    .replace(/^helped\s+/i, "Supported ")
    .replace(/^made\s+/i, "Developed ")
    .replace(/^did\s+/i, "Executed ");
}

function normalizeForComparison(input: string) {
  return cleanResumeBulletOutput(input)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function shortenBullet(input: string) {
  const shortened = input
    .replace(/\s*\([^)]*\)\s*/g, " ")
    .replace(/\bsuccessfully\s+/gi, "")
    .replace(/\beffectively\s+/gi, "")
    .replace(/\bprofessionalized\s+/gi, "Improved ")
    .replace(/\bto support\b/gi, "for")
    .replace(/\s+/g, " ")
    .trim();

  const words = shortened
    .split(/\s+/)
    .filter(Boolean);

  if (words.length <= 20) {
    return words.join(" ");
  }

  return words.slice(0, 20).join(" ");
}

function improveConvertedPattern(input: string) {
  return input
    .replace(/^converted\b/i, "Transformed")
    .replace(/\binto structured datasets to support\b/i, "into structured, analysis-ready datasets for")
    .replace(/\binto structured datasets for\b/i, "into structured, analysis-ready datasets for");
}

function professionalizeConvertedPattern(input: string) {
  return input
    .replace(/^converted\b/i, "Structured")
    .replace(/\binto structured datasets to support\b/i, "into analytics-ready datasets for")
    .replace(/\binto structured datasets for\b/i, "into analytics-ready datasets for");
}

function achievementRewrite(input: string) {
  const supportMatch = input.match(/^(.+?)\s+to support\s+(.+?)[.]?$/i);
  if (!supportMatch) {
    return input.replace(/\bto support\b/i, "supporting");
  }

  const actionPhrase = supportMatch[1].replace(/^converted\b/i, "converting");
  const outcome = supportMatch[2];
  return `Enabled ${outcome} by ${actionPhrase}`;
}

function fallbackRewrite(action: BulletAction, original: string) {
  const base = polishBase(original);
  let rewritten = base;

  if (action === "improve") {
    rewritten = improveConvertedPattern(base)
      .replace(/\bfor budget monitoring and reporting\b/i, "to support budget monitoring and reporting")
      .replace(/\bfor reporting\b/i, "to support reporting")
      .replace(/\bfor monitoring\b/i, "to support monitoring");
  }

  if (action === "shorten") {
    rewritten = shortenBullet(base);
  }

  if (action === "professionalize") {
    rewritten = professionalizeConvertedPattern(base)
      .replace(/^analyzed\b/i, "Evaluated")
      .replace(/^improved\b/i, "Strengthened")
      .replace(/^created\b/i, "Developed")
      .replace(/^used\b/i, "Leveraged")
      .replace(/\bfor budget monitoring and reporting\b/i, "to support budget monitoring and reporting");
  }

  if (action === "achievement-focused") {
    rewritten = achievementRewrite(base).replace(/\bfor budget monitoring and reporting\b/i, "to support stronger budget monitoring and reporting");
  }

  if (normalizeForComparison(rewritten) === normalizeForComparison(original)) {
    rewritten = `${rewritten.replace(/[.]+$/u, "")} with clearer structure and business relevance`;
  }

  return sentenceCase(rewritten || base || original);
}

async function generateBulletSuggestion(action: BulletAction, bullet: string, role?: string) {
  const fallback = fallbackRewrite(action, bullet);
  const prompt = `Rewrite one resume bullet.
Action: ${actionInstructions[action]}
Rules:
- Return exactly one complete bullet sentence as plain text.
- Preserve the original subject, context, and truthful facts.
- Do not invent numbers, companies, tools, or outcomes.
- Do not use Markdown, quotes, labels, or bullet symbols.
- Never return a fragment.
Role context: ${role ?? "General professional role"}
Original bullet: ${bullet}`;

  try {
    const suggestion = cleanResumeBulletOutput(await generateText(prompt, {
      generationConfig: {
        maxOutputTokens: 180,
        temperature: 0.2,
      },
      maxRetries: 1,
    }));

    return isLowQualityBullet(suggestion, bullet) ? fallback : sentenceCase(suggestion);
  } catch {
    return fallback;
  }
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
    const suggestion = await generateBulletSuggestion(values.action, values.bullet, values.role);

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

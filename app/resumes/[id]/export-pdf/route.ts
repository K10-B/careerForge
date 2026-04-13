import { NextResponse, type NextRequest } from "next/server";
import { chromium } from "playwright";

import { auth } from "@/lib/auth";
import { getResumeById } from "@/lib/data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function toSafeFilename(input: string) {
  const cleaned = input
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, " ")
    .slice(0, 120);

  return cleaned || "resume";
}

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await context.params;
  const resume = await getResumeById(session.user.id, id);

  if (!resume) {
    return new NextResponse("Resume not found.", { status: 404 });
  }

  const browser = await chromium.launch({ headless: true });

  try {
    const origin = request.nextUrl.origin;
    const context = await browser.newContext({
      viewport: { width: 860, height: 1400 },
      deviceScaleFactor: 1,
      colorScheme: "light",
    });

    const cookies = request.cookies.getAll().map((cookie) => ({
      name: cookie.name,
      value: cookie.value,
      url: origin,
    }));

    if (cookies.length) {
      await context.addCookies(cookies);
    }

    const page = await context.newPage();
    const exportUrl = new URL(`/resumes/${id}/export?mode=pdf`, origin).toString();

    await page.goto(exportUrl, { waitUntil: "networkidle" });
    await page.waitForSelector("#resume-print-document", { state: "visible" });
    await page.evaluate(async () => {
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }
    });
    await page.emulateMedia({ media: "print" });

    const pdf = await page.pdf({
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });

    await context.close();

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${toSafeFilename(resume.title)}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } finally {
    await browser.close();
  }
}






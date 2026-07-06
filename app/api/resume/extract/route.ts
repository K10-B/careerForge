import { NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";

import { auth } from "@/lib/auth";

const MAX_PDF_BYTES = 5 * 1024 * 1024;

export const runtime = "nodejs";

function normalizeExtractedText(input: string) {
  return input
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("resume");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Upload a resume PDF first." }, { status: 400 });
  }

  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return NextResponse.json({ error: "Only PDF resume files are supported." }, { status: 400 });
  }

  if (file.size > MAX_PDF_BYTES) {
    return NextResponse.json({ error: "Resume PDF must be 5MB or smaller." }, { status: 400 });
  }

  const data = new Uint8Array(await file.arrayBuffer());
  const parser = new PDFParse({ data });

  try {
    const result = await parser.getText();
    const text = normalizeExtractedText(result.text);

    if (!text) {
      return NextResponse.json({ error: "No readable text was found in that PDF." }, { status: 400 });
    }

    return NextResponse.json({ text, filename: file.name });
  } catch {
    return NextResponse.json({ error: "Unable to read text from that PDF." }, { status: 400 });
  } finally {
    await parser.destroy();
  }
}

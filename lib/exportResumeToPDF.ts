"use client";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { createElement } from "react";
import { createRoot, type Root } from "react-dom/client";

import {
  ResumeDocument,
  RESUME_DOCUMENT_MIN_HEIGHT,
  RESUME_DOCUMENT_WIDTH,
  RESUME_FIT_LEVELS,
  type ResumeFitLevel,
} from "@/components/resume/ResumeDocument";
import type { ResumeFormValues } from "@/types";

const PDF_WIDTH = 595.28;
const PDF_HEIGHT = 841.89;
const MAX_RESUME_FIT_LEVEL = RESUME_FIT_LEVELS[RESUME_FIT_LEVELS.length - 1];

function waitForNextPaint() {
  return new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
}

function getMeasuredHeight(element: HTMLElement | null) {
  if (!element) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.max(Math.ceil(element.getBoundingClientRect().height), element.scrollHeight, RESUME_DOCUMENT_MIN_HEIGHT);
}

function createExportMount() {
  const mount = document.createElement("div");
  mount.style.position = "fixed";
  mount.style.left = "-10000px";
  mount.style.top = "0";
  mount.style.width = `${RESUME_DOCUMENT_WIDTH}px`;
  mount.style.background = "#ffffff";
  mount.style.zIndex = "-1";
  mount.style.pointerEvents = "none";
  document.body.appendChild(mount);
  const root = createRoot(mount);

  return {
    mount,
    root,
    cleanup: () => {
      root.unmount();
      mount.remove();
    },
  };
}

async function resolveFitLevel(root: Root, mount: HTMLDivElement, values: ResumeFormValues) {
  root.render(
    createElement(
      "div",
      null,
      ...RESUME_FIT_LEVELS.map((level) =>
        createElement(
          "div",
          {
            key: `resume-fit-measure-${level}`,
            "data-fit-level": String(level),
            style: { width: `${RESUME_DOCUMENT_WIDTH}px` },
          },
          createElement(ResumeDocument, {
            values,
            documentId: `resume-fit-measure-document-${level}`,
            fitLevel: level,
          })
        )
      )
    )
  );

  if (document.fonts?.ready) {
    await document.fonts.ready;
  }
  await waitForNextPaint();

  const heights = RESUME_FIT_LEVELS.map((level) => {
    const element = mount.querySelector(`[data-fit-level="${level}"]`) as HTMLElement | null;
    return getMeasuredHeight(element);
  });
  const matchedIndex = heights.findIndex((height) => height <= RESUME_DOCUMENT_MIN_HEIGHT);
  const fitLevel = (matchedIndex === -1 ? MAX_RESUME_FIT_LEVEL : RESUME_FIT_LEVELS[matchedIndex]) as ResumeFitLevel;

  return { fitLevel };
}

export async function exportResumeToPDF(values: ResumeFormValues, filename: string, fitLevelOverride?: ResumeFitLevel) {
  if (typeof window === "undefined") {
    throw new Error("Resume export is only available in the browser.");
  }

  const exportMount = createExportMount();

  try {
    const fitLevel = fitLevelOverride ?? (await resolveFitLevel(exportMount.root, exportMount.mount, values)).fitLevel;
    exportMount.root.render(createElement(ResumeDocument, { values, documentId: "resume-export-document", fitLevel }));

    if (document.fonts?.ready) {
      await document.fonts.ready;
    }
    await waitForNextPaint();

    const element = exportMount.mount.querySelector("#resume-export-document") as HTMLElement | null;
    if (!element) {
      throw new Error("Unable to render resume for export.");
    }

    const canvas = await html2canvas(element, {
      backgroundColor: "#ffffff",
      scale: 3,
      useCORS: true,
      logging: false,
      windowWidth: RESUME_DOCUMENT_WIDTH,
      width: element.scrollWidth,
      height: element.scrollHeight,
    });

    const imageData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4", compress: true });
    const imageWidth = PDF_WIDTH;
    const imageHeight = (canvas.height * imageWidth) / canvas.width;
    const overflowTolerance = 2;
    const pageCount = Math.max(1, Math.ceil((imageHeight - overflowTolerance) / PDF_HEIGHT));

    for (let pageIndex = 0; pageIndex < pageCount; pageIndex += 1) {
      const position = -pageIndex * PDF_HEIGHT;
      if (pageIndex > 0) {
        pdf.addPage();
      }
      pdf.addImage(imageData, "PNG", 0, position, imageWidth, imageHeight, undefined, "FAST");
    }

    pdf.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
  } catch (error) {
    console.error("Resume export failed", error);
    throw error instanceof Error ? error : new Error("Unable to export resume.");
  } finally {
    exportMount.cleanup();
  }
}

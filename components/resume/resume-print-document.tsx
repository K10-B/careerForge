"use client";

import { useEffect, useRef, useState } from "react";

import {
  ResumeDocument,
  RESUME_DOCUMENT_MIN_HEIGHT,
  RESUME_DOCUMENT_WIDTH,
  RESUME_FIT_LEVELS,
  type ResumeFitLevel,
} from "@/components/resume/ResumeDocument";
import type { ResumeFormValues } from "@/types";

const MAX_RESUME_FIT_LEVEL = RESUME_FIT_LEVELS[RESUME_FIT_LEVELS.length - 1];
const PAGE_WIDTH_INCHES = RESUME_DOCUMENT_WIDTH / 96;
const PAGE_HEIGHT_INCHES = RESUME_DOCUMENT_MIN_HEIGHT / 96;

function waitForNextPaint() {
  return new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
}

function getMeasuredHeight(element: HTMLElement | null) {
  if (!element) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.max(Math.ceil(element.getBoundingClientRect().height), element.scrollHeight, RESUME_DOCUMENT_MIN_HEIGHT);
}

export function ResumePrintDocument({
  values,
  title,
  autoPrint = true,
}: {
  values: ResumeFormValues;
  title: string;
  autoPrint?: boolean;
}) {
  const measureRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const [fitLevel, setFitLevel] = useState<ResumeFitLevel>(0);
  const [readyToPrint, setReadyToPrint] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const measureFit = async () => {
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }
      await waitForNextPaint();

      const heights = RESUME_FIT_LEVELS.map((level) => getMeasuredHeight(measureRefs.current[level] ?? null));
      const matchedIndex = heights.findIndex((height) => height <= RESUME_DOCUMENT_MIN_HEIGHT);
      const nextFitLevel = (matchedIndex === -1 ? MAX_RESUME_FIT_LEVEL : RESUME_FIT_LEVELS[matchedIndex]) as ResumeFitLevel;

      if (!cancelled) {
        setFitLevel(nextFitLevel);
        setReadyToPrint(true);
      }
    };

    void measureFit();

    return () => {
      cancelled = true;
    };
  }, [values]);

  useEffect(() => {
    document.title = title;
  }, [title]);

  useEffect(() => {
    if (!autoPrint || !readyToPrint) {
      return;
    }

    let cancelled = false;

    const handleAfterPrint = () => {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: "careerforge-resume-export-finished" }, window.location.origin);
        return;
      }

      if (window.opener) {
        window.close();
      }
    };

    const triggerPrint = async () => {
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }
      await waitForNextPaint();

      if (cancelled) {
        return;
      }

      window.addEventListener("afterprint", handleAfterPrint, { once: true });
      window.print();
    };

    void triggerPrint();

    return () => {
      cancelled = true;
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, [autoPrint, fitLevel, readyToPrint]);

  return (
    <>
      <style>{`
        @page {
          size: ${PAGE_WIDTH_INCHES}in ${PAGE_HEIGHT_INCHES}in;
          margin: 0;
        }

        html, body {
          margin: 0;
          padding: 0;
          background: #ffffff;
        }

        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        @media print {
          html, body {
            width: ${RESUME_DOCUMENT_WIDTH}px;
            min-width: ${RESUME_DOCUMENT_WIDTH}px;
            max-width: ${RESUME_DOCUMENT_WIDTH}px;
            overflow: hidden;
          }

          [data-resume-print-measurements] {
            display: none !important;
          }

          main[data-resume-print-root] {
            min-height: auto !important;
            height: auto !important;
            display: block !important;
          }
        }
      `}</style>

      <div data-resume-print-measurements aria-hidden="true" style={{ pointerEvents: "none", position: "absolute", left: "-20000px", top: 0, opacity: 0 }}>
        {RESUME_FIT_LEVELS.map((level) => (
          <div
            key={`resume-print-measure-${level}`}
            ref={(element) => {
              measureRefs.current[level] = element;
            }}
            style={{ width: `${RESUME_DOCUMENT_WIDTH}px` }}
          >
            <ResumeDocument values={values} documentId={`resume-print-measure-document-${level}`} fitLevel={level} />
          </div>
        ))}
      </div>

      <main data-resume-print-root style={{ background: "#ffffff", display: "flex", justifyContent: "center" }}>
        <ResumeDocument values={values} documentId="resume-print-document" fitLevel={fitLevel} />
      </main>
    </>
  );
}



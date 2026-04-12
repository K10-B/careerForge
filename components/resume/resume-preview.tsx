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

const PREVIEW_STAGE_PADDING = 16;
const PREVIEW_MIN_SCALE = 0.4;
const PREVIEW_MAX_SCALE = 1.6;
const PREVIEW_FALLBACK_HEIGHT = 860;

const MAX_RESUME_FIT_LEVEL = RESUME_FIT_LEVELS[RESUME_FIT_LEVELS.length - 1];

type ResumePreviewProps = {
  values: ResumeFormValues;
  previewId?: string;
  mode?: "panel" | "focus";
  zoomLevel?: number;
  onFitLevelChange?: (fitLevel: ResumeFitLevel) => void;
};

function waitForNextPaint() {
  return new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
}

function getMeasuredHeight(element: HTMLElement | null) {
  if (!element) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.max(Math.ceil(element.getBoundingClientRect().height), element.scrollHeight, RESUME_DOCUMENT_MIN_HEIGHT);
}

export function ResumePreview({ values, previewId = "resume-preview", zoomLevel = 1, onFitLevelChange }: ResumePreviewProps) {
  const shellRef = useRef<HTMLDivElement | null>(null);
  const measureRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const [viewportHeight, setViewportHeight] = useState(PREVIEW_FALLBACK_HEIGHT);
  const [scale, setScale] = useState(1);
  const [fitLevel, setFitLevel] = useState<ResumeFitLevel>(0);
  const [documentHeight, setDocumentHeight] = useState(RESUME_DOCUMENT_MIN_HEIGHT);

  useEffect(() => {
    let cancelled = false;

    const measureFit = async () => {
      if (typeof window === "undefined") {
        return;
      }

      if (document.fonts?.ready) {
        await document.fonts.ready;
      }
      await waitForNextPaint();

      const heights = RESUME_FIT_LEVELS.map((level) => getMeasuredHeight(measureRefs.current[level] ?? null));
      const matchedIndex = heights.findIndex((height) => height <= RESUME_DOCUMENT_MIN_HEIGHT);
      const nextFitLevel = (matchedIndex === -1 ? MAX_RESUME_FIT_LEVEL : RESUME_FIT_LEVELS[matchedIndex]) as ResumeFitLevel;
      const nextHeight = heights[nextFitLevel] ?? RESUME_DOCUMENT_MIN_HEIGHT;

      if (!cancelled) {
        setFitLevel(nextFitLevel);
        setDocumentHeight(nextHeight);
      }
    };

    void measureFit();

    return () => {
      cancelled = true;
    };
  }, [values]);


  useEffect(() => {
    onFitLevelChange?.(fitLevel);
  }, [fitLevel, onFitLevelChange]);

  useEffect(() => {
    const element = shellRef.current;
    if (!element || typeof ResizeObserver === "undefined" || typeof window === "undefined") {
      return;
    }

    const updateLayout = () => {
      const width = Math.max(element.clientWidth, 320);
      const height = Math.max(element.clientHeight || PREVIEW_FALLBACK_HEIGHT, 420);
      const usableWidth = Math.max(width - PREVIEW_STAGE_PADDING * 2, 320);
      const usableHeight = Math.max(height - PREVIEW_STAGE_PADDING * 2, 360);
      const widthScale = usableWidth / RESUME_DOCUMENT_WIDTH;
      const heightScale = usableHeight / documentHeight;
      const fitScale = Math.min(widthScale, heightScale);
      const nextScale = Math.max(PREVIEW_MIN_SCALE, Math.min(fitScale * zoomLevel, PREVIEW_MAX_SCALE));

      setViewportHeight(height);
      setScale(nextScale);
    };

    updateLayout();

    const observer = new ResizeObserver(updateLayout);
    observer.observe(element);
    window.addEventListener("resize", updateLayout);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateLayout);
    };
  }, [documentHeight, zoomLevel]);

  const scaledWidth = RESUME_DOCUMENT_WIDTH * scale;
  const scaledHeight = documentHeight * scale;
  const stageHeight = Math.max(viewportHeight, scaledHeight + PREVIEW_STAGE_PADDING * 2);

  return (
    <div id={previewId} ref={shellRef} className="relative h-full w-full">
      <div aria-hidden="true" className="pointer-events-none absolute left-[-20000px] top-0 opacity-0">
        {RESUME_FIT_LEVELS.map((level) => (
          <div
            key={`${previewId}-measure-${level}`}
            ref={(element) => {
              measureRefs.current[level] = element;
            }}
            style={{ width: `${RESUME_DOCUMENT_WIDTH}px` }}
          >
            <ResumeDocument values={values} documentId={`${previewId}-measure-document-${level}`} fitLevel={level} />
          </div>
        ))}
      </div>

      <div className="relative h-full w-full overflow-auto bg-transparent">
        <div className="flex w-full justify-center" style={{ minHeight: `${stageHeight}px`, padding: `${PREVIEW_STAGE_PADDING}px` }}>
          <div className="shrink-0" style={{ width: `${scaledWidth}px`, height: `${scaledHeight}px` }}>
            <div
              className="origin-top-left"
              style={{
                width: `${RESUME_DOCUMENT_WIDTH}px`,
                minHeight: `${documentHeight}px`,
                boxShadow: "0 6px 18px rgba(2, 6, 23, 0.08)",
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
            >
              <ResumeDocument values={values} documentId={`${previewId}-document`} fitLevel={fitLevel} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

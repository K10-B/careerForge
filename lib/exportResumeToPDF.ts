"use client";

export async function exportResumeToPDF(resumeId: string) {
  if (typeof window === "undefined") {
    throw new Error("Resume export is only available in the browser.");
  }

  if (!resumeId) {
    throw new Error("Save the resume before exporting.");
  }

  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.position = "fixed";
  iframe.style.width = "1px";
  iframe.style.height = "1px";
  iframe.style.opacity = "0";
  iframe.style.pointerEvents = "none";
  iframe.style.border = "0";
  iframe.style.left = "-9999px";
  iframe.src = `/resumes/${resumeId}/export-pdf?download=${Date.now()}`;

  document.body.appendChild(iframe);

  window.setTimeout(() => {
    iframe.remove();
  }, 45000);
}

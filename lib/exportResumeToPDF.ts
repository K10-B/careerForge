"use client";

function getFilenameFromDisposition(header: string | null) {
  if (!header) {
    return "resume.pdf";
  }

  const utf8Match = header.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const plainMatch = header.match(/filename="([^"]+)"/i) ?? header.match(/filename=([^;]+)/i);
  return plainMatch?.[1]?.trim() || "resume.pdf";
}

export async function exportResumeToPDF(resumeId: string) {
  if (typeof window === "undefined") {
    throw new Error("Resume export is only available in the browser.");
  }

  if (!resumeId) {
    throw new Error("Save the resume before exporting.");
  }

  const response = await fetch(`/resumes/${resumeId}/export-pdf?download=${Date.now()}`, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    const message = (await response.text()).trim();
    throw new Error(message || "Unable to export resume.");
  }

  const blob = await response.blob();
  const filename = getFilenameFromDisposition(response.headers.get("Content-Disposition"));
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => {
    window.URL.revokeObjectURL(url);
  }, 1000);
}

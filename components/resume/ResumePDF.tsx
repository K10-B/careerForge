import { ResumeDocument } from "@/components/resume/ResumeDocument";
import type { ResumeFormValues } from "@/types";

type ResumePDFProps = {
  values: ResumeFormValues;
};

export function ResumePDF({ values }: ResumePDFProps) {
  return <ResumeDocument values={values} documentId="resume-pdf-document" className="resume-pdf-page" />;
}

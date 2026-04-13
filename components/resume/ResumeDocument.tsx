import type { CSSProperties } from "react";

import { splitProjectDescription } from "@/lib/projectBullets";
import { normalizeResumeForPDF } from "@/lib/resume-pdf";
import type { ResumeFormValues } from "@/types";

export const RESUME_DOCUMENT_WIDTH = 794;
export const RESUME_DOCUMENT_MIN_HEIGHT = 1123;
export const RESUME_FIT_LEVELS = [0, 1, 2, 3] as const;

export type ResumeFitLevel = (typeof RESUME_FIT_LEVELS)[number];

type ResumeDocumentProps = {
  values: ResumeFormValues;
  documentId?: string;
  className?: string;
  fitLevel?: ResumeFitLevel;
};

type ResumeFitStyles = {
  documentPadding: number;
  documentGap: number;
  sectionContentGap: number;
  sectionTitleSize: number;
  sectionTitleGap: number;
  dividerGap: number;
  nameSize: number;
  roleSize: number;
  contactSize: number;
  bodySize: number;
  bodyLineHeight: number;
  detailLineHeight: number;
  itemGap: number;
  entryGap: number;
  roleToCompany: number;
  bulletsMargin: number;
  bulletGap: number;
  skillsGap: number;
  educationGap: number;
  certificationGap: number;
};

const RESUME_FIT_STYLES: Record<ResumeFitLevel, ResumeFitStyles> = {
  0: {
    documentPadding: 32,
    documentGap: 16,
    sectionContentGap: 10,
    sectionTitleSize: 14,
    sectionTitleGap: 6,
    dividerGap: 12,
    nameSize: 26,
    roleSize: 14,
    contactSize: 11,
    bodySize: 11,
    bodyLineHeight: 1.4,
    detailLineHeight: 1.35,
    itemGap: 12,
    entryGap: 2,
    roleToCompany: 2,
    bulletsMargin: 6,
    bulletGap: 4,
    skillsGap: 2,
    educationGap: 8,
    certificationGap: 6,
  },
  1: {
    documentPadding: 31,
    documentGap: 14,
    sectionContentGap: 9,
    sectionTitleSize: 14,
    sectionTitleGap: 6,
    dividerGap: 11,
    nameSize: 25.5,
    roleSize: 13.8,
    contactSize: 10.85,
    bodySize: 10.9,
    bodyLineHeight: 1.38,
    detailLineHeight: 1.34,
    itemGap: 11,
    entryGap: 2,
    roleToCompany: 2,
    bulletsMargin: 5,
    bulletGap: 4,
    skillsGap: 2,
    educationGap: 7,
    certificationGap: 5,
  },
  2: {
    documentPadding: 30,
    documentGap: 13,
    sectionContentGap: 8,
    sectionTitleSize: 13.5,
    sectionTitleGap: 5,
    dividerGap: 10,
    nameSize: 25,
    roleSize: 13.5,
    contactSize: 10.7,
    bodySize: 10.7,
    bodyLineHeight: 1.35,
    detailLineHeight: 1.33,
    itemGap: 10,
    entryGap: 1.5,
    roleToCompany: 2,
    bulletsMargin: 4,
    bulletGap: 3.5,
    skillsGap: 1.5,
    educationGap: 6,
    certificationGap: 4,
  },
  3: {
    documentPadding: 28,
    documentGap: 12,
    sectionContentGap: 8,
    sectionTitleSize: 13,
    sectionTitleGap: 5,
    dividerGap: 10,
    nameSize: 24.5,
    roleSize: 13.25,
    contactSize: 10.5,
    bodySize: 10.5,
    bodyLineHeight: 1.32,
    detailLineHeight: 1.3,
    itemGap: 9,
    entryGap: 1.5,
    roleToCompany: 1.5,
    bulletsMargin: 4,
    bulletGap: 3,
    skillsGap: 1.5,
    educationGap: 6,
    certificationGap: 4,
  },
};

function Section({ title, children, fit }: { title: string; children: React.ReactNode; fit: ResumeFitStyles }) {
  return (
    <section
      style={{
        display: "block",
      }}
    >
      <h2
        style={{
          color: "#000000",
          fontSize: `${fit.sectionTitleSize}px`,
          fontWeight: 600,
          lineHeight: 1.2,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          marginBottom: `${fit.sectionTitleGap}px`,
        }}
      >
        {title}
      </h2>
      <div
        className="h-px"
        style={{
          display: "block",
          marginTop: "0px",
          marginBottom: `${fit.dividerGap}px`,
          backgroundColor: "#000000",
        }}
      />
      <div style={{ marginTop: "0px" }}>{children}</div>
    </section>
  );
}

function hasText(value?: string | null) {
  return Boolean(value?.trim());
}

function normalizeInline(input: string) {
  return input.replace(/\s*\n+\s*/g, " ").trim();
}

function getBulletItemStyle(fit: ResumeFitStyles, isLast: boolean): CSSProperties {
  return {
    color: "#000000",
    fontSize: `${fit.bodySize}px`,
    lineHeight: fit.bodyLineHeight,
    marginBottom: isLast ? "0px" : `${fit.bulletGap}px`,
    listStyle: "none",
  };
}

function getBulletMarkerStyle(fit: ResumeFitStyles): CSSProperties {
  return {
    flex: "0 0 auto",
    width: "11px",
    display: "inline-block",
    fontSize: `${fit.bodySize + 2}px`,
    lineHeight: 1,
    textAlign: "center",
    fontFamily: "Arial, Helvetica, sans-serif",
    paddingTop: "1px",
  };
}

export function ResumeDocument({ values, documentId = "resume-document", className, fitLevel = 0 }: ResumeDocumentProps) {
  const fit = RESUME_FIT_STYLES[fitLevel];
  const resume = normalizeResumeForPDF(values);
  const contact = [resume.email, resume.phone, resume.location, resume.website, resume.github, resume.linkedin].filter((item) => hasText(item));

  const summary = resume.summary?.trim() ?? "";
  const skills = resume.skills.filter((skill) => hasText(skill));
  const experience = resume.experience
    .map((item) => ({
      ...item,
      role: item.role?.trim() ?? "",
      company: item.company?.trim() ?? "",
      startDate: item.startDate?.trim() ?? "",
      endDate: item.endDate?.trim() ?? "",
      bullets: item.bullets.filter((bullet) => hasText(bullet)),
    }))
    .filter((item) => item.role || item.company || item.startDate || item.endDate || item.bullets.length);
  const projects = resume.projects
    .map((project) => ({
      ...project,
      name: project.name?.trim() ?? "",
      description: project.description?.trim() ?? "",
      techStack: project.techStack?.trim() ?? "",
      link: project.link?.trim() ?? "",
    }))
    .filter((project) => project.name || project.description || project.techStack || project.link);
  const education = resume.education
    .map((item) => ({
      ...item,
      degree: item.degree?.trim() ?? "",
      school: item.school?.trim() ?? "",
      year: item.year?.trim() ?? "",
    }))
    .filter((item) => item.degree || item.school || item.year);
  const certifications = resume.certifications
    .map((item) => ({
      name: item.name?.trim() ?? "",
      issuer: item.issuer?.trim() ?? "",
      startDate: item.startDate?.trim() ?? "",
      endDate: item.endDate?.trim() ?? "",
    }))
    .filter((item) => item.name || item.issuer || item.startDate || item.endDate);
  const references = resume.references.filter((item) => hasText(item));
  const hasHeader = hasText(resume.name) || hasText(resume.role) || contact.length;
  const hasContent = hasHeader || summary || skills.length || experience.length || projects.length || education.length || certifications.length || references.length;

  return (
    <div
      id={documentId}
      className={className}
      style={{
        width: `${RESUME_DOCUMENT_WIDTH}px`,
        minHeight: `${RESUME_DOCUMENT_MIN_HEIGHT}px`,
        backgroundColor: "#ffffff",
        color: "#000000",
        padding: `${fit.documentPadding}px`,
        fontFamily: "Inter, Arial, Helvetica, sans-serif",
      }}
    >
      {hasContent ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            rowGap: `${fit.documentGap}px`,
          }}
        >
          {hasHeader ? (
            <header className="text-center">
              {hasText(resume.name) ? (
                <h1 style={{ fontSize: `${fit.nameSize}px`, fontWeight: 700, lineHeight: 1, letterSpacing: "-0.02em" }}>{resume.name}</h1>
              ) : null}
              {hasText(resume.role) ? (
                <p style={{ marginTop: "4px", fontSize: `${fit.roleSize}px`, fontWeight: 500, lineHeight: fit.bodyLineHeight }}>{resume.role}</p>
              ) : null}
              {contact.length ? (
                <p style={{ marginTop: "6px", fontSize: `${fit.contactSize}px`, lineHeight: fit.bodyLineHeight }}>{contact.join(" | ")}</p>
              ) : null}
            </header>
          ) : null}

          {summary ? (
            <Section title="Summary" fit={fit}>
              <p style={{ fontSize: `${fit.bodySize}px`, lineHeight: fit.bodyLineHeight }}>{summary}</p>
            </Section>
          ) : null}

          {skills.length ? (
            <Section title="Core Skills" fit={fit}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  rowGap: `${fit.skillsGap}px`,
                }}
              >
                {skills.map((skill) => (
                  <p key={skill} style={{ fontSize: `${fit.bodySize}px`, lineHeight: fit.bodyLineHeight }}>
                    {skill}
                  </p>
                ))}
              </div>
            </Section>
          ) : null}

          {experience.length ? (
            <Section title="Experience" fit={fit}>
              <div style={{ display: "flex", flexDirection: "column", rowGap: `${fit.itemGap}px` }}>
                {experience.map((item) => (
                  <article key={item.id} style={{ display: "flex", flexDirection: "column", rowGap: `${fit.entryGap}px` }}>
                    <div className="flex items-baseline justify-between gap-4">
                      <div>
                        {item.role ? <h3 style={{ fontSize: "11.5px", fontWeight: 600, lineHeight: 1.3 }}>{item.role}</h3> : null}
                        {item.company ? (
                          <p style={{ marginTop: `${fit.roleToCompany}px`, fontSize: `${fit.bodySize}px`, lineHeight: fit.detailLineHeight }}>{item.company}</p>
                        ) : null}
                      </div>
                      {item.startDate || item.endDate ? (
                        <p className="shrink-0 whitespace-nowrap" style={{ fontSize: `${fit.bodySize}px`, fontWeight: 600, lineHeight: 1.3 }}>
                          {[item.startDate, item.endDate].filter(Boolean).join(" - ")}
                        </p>
                      ) : null}
                    </div>
                    {item.bullets.length ? (
                      <ul
                        style={{
                          paddingLeft: "0px",
                          marginTop: `${fit.bulletsMargin}px`,
                          marginBottom: `${fit.bulletsMargin}px`,
                          marginLeft: "0px",
                          listStyle: "none",
                        }}
                      >
                        {item.bullets.map((bullet, index) => (
                          <li key={`${item.id}-${index}`} style={getBulletItemStyle(fit, index === item.bullets.length - 1)}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "flex-start",
                                columnGap: "5px",
                              }}
                            >
                              <span
                                aria-hidden="true"
                                style={getBulletMarkerStyle(fit)}
                              >
                                &bull;
                              </span>
                              <span style={{ flex: 1, minWidth: 0, lineHeight: fit.bodyLineHeight }}>{bullet}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </article>
                ))}
              </div>
            </Section>
          ) : null}

          {projects.length ? (
            <Section title="Projects" fit={fit}>
              <div style={{ display: "flex", flexDirection: "column", rowGap: `${fit.itemGap}px` }}>
                {projects.map((project) => {
                  const projectBullets = splitProjectDescription(project.description);
                  return (
                    <article key={project.id} style={{ display: "flex", flexDirection: "column", rowGap: `${fit.entryGap}px` }}>
                      <div className="flex items-baseline justify-between gap-4">
                        {project.name ? <h3 style={{ fontSize: "11.5px", fontWeight: 600, lineHeight: 1.3 }}>{project.name}</h3> : <span />}
                        {project.link ? (
                          <p className="shrink-0 whitespace-nowrap" style={{ fontSize: `${fit.bodySize}px`, lineHeight: 1.3 }}>
                            {project.link}
                          </p>
                        ) : null}
                      </div>
                      {project.techStack ? (
                        <p style={{ fontSize: `${fit.bodySize}px`, lineHeight: fit.detailLineHeight }}>
                          <span style={{ fontWeight: 600 }}>Tech stack:</span> {project.techStack}
                        </p>
                      ) : null}
                      {projectBullets.length ? (
                        <ul
                          style={{
                            paddingLeft: "0px",
                            marginTop: `${fit.bulletsMargin}px`,
                            marginBottom: `${fit.bulletsMargin}px`,
                            marginLeft: "0px",
                            listStyle: "none",
                          }}
                        >
                          {projectBullets.map((line, index) => (
                            <li key={`${project.id}-desc-${index}`} style={getBulletItemStyle(fit, index === projectBullets.length - 1)}>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "flex-start",
                                  columnGap: "5px",
                                }}
                              >
                                <span
                                  aria-hidden="true"
                                  style={getBulletMarkerStyle(fit)}
                                >
                                  &bull;
                                </span>
                                <span style={{ flex: 1, minWidth: 0, lineHeight: fit.bodyLineHeight }}>{line}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </Section>
          ) : null}

          {education.length ? (
            <Section title="Education" fit={fit}>
              <div style={{ display: "flex", flexDirection: "column", rowGap: `${fit.educationGap}px` }}>
                {education.map((item) => (
                  <article key={item.id} className="flex items-baseline justify-between gap-4">
                    <div>
                      {item.degree ? <h3 style={{ fontSize: "11.5px", fontWeight: 600, lineHeight: 1.3 }}>{item.degree}</h3> : null}
                      {item.school ? (
                        <p style={{ marginTop: `${fit.roleToCompany}px`, fontSize: `${fit.bodySize}px`, lineHeight: fit.detailLineHeight }}>{item.school}</p>
                      ) : null}
                    </div>
                    {item.year ? (
                      <p className="shrink-0 whitespace-nowrap" style={{ fontSize: `${fit.bodySize}px`, fontWeight: 700, lineHeight: 1.3 }}>
                        {item.year}
                      </p>
                    ) : null}
                  </article>
                ))}
              </div>
            </Section>
          ) : null}

          {certifications.length ? (
            <Section title="Certifications" fit={fit}>
              <div style={{ display: "flex", flexDirection: "column", rowGap: `${fit.certificationGap}px` }}>
                {certifications.map((cert) => {
                  const left = normalizeInline([cert.name, cert.issuer].filter(Boolean).join(" - "));
                  const right = normalizeInline([cert.startDate, cert.endDate].filter(Boolean).join(" - "));
                  return (
                    <div key={`${cert.name}-${cert.issuer}-${cert.startDate}-${cert.endDate}`} className="flex items-baseline justify-between gap-4">
                      <p style={{ fontSize: `${fit.bodySize}px`, lineHeight: fit.detailLineHeight }}>{left}</p>
                      {right ? (
                        <p className="shrink-0 whitespace-nowrap" style={{ fontSize: `${fit.bodySize}px`, fontWeight: 600, lineHeight: 1.3 }}>
                          {right}
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </Section>
          ) : null}

          {references.length ? (
            <Section title="References" fit={fit}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  rowGap: `${fit.skillsGap}px`,
                }}
              >
                {references.map((reference) => (
                  <p key={reference} style={{ fontSize: `${fit.bodySize}px`, lineHeight: fit.bodyLineHeight }}>
                    {reference}
                  </p>
                ))}
              </div>
            </Section>
          ) : null}
        </div>
      ) : (
        <div className="flex min-h-[calc(1123px-64px)] items-center justify-center text-center">
          <div className="max-w-sm space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.16em]">Live Preview</p>
            <p className="text-[15px] leading-7">Start filling in your resume details and the document preview will update here in real time.</p>
          </div>
        </div>
      )}
    </div>
  );
}

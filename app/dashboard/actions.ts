"use server";

import { ApplicationStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { assertResumeCreationAllowed, ensureUsagePeriod } from "@/lib/billing";
import { prisma } from "@/lib/prisma";
import { coverLetterSchema, jobApplicationSchema, resumeDraftSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";

async function getActionUserId() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}

async function ensureUsage(userId: string) {
  return ensureUsagePeriod(userId);
}

export async function saveResumeAction(input: { id?: string; values: unknown }) {
  const userId = await getActionUserId();
  if (!input.id) {
    const permission = await assertResumeCreationAllowed(userId);
    if (!permission.allowed) {
      throw new Error(permission.message);
    }
  }
  const values = resumeDraftSchema.parse(input.values);
  const normalizedTitle = values.title.trim() || "Untitled resume";
  const slugBase = slugify(normalizedTitle);
  const slug = input.id ? slugBase : `${slugBase}-${Date.now()}`;
  const normalizedCertifications = (values.certifications ?? [])
    .map((certification) => ({
      ...certification,
      name: certification.name?.trim() ?? "",
      startDate: certification.startDate?.trim() ?? "",
      endDate: certification.endDate?.trim() ?? "",
      issuer: certification.issuer?.trim() ?? "",
    }))
    .filter((certification) => certification.name || certification.startDate || certification.endDate);
  const normalizedProjects = (values.projects ?? [])
    .map((project) => ({
      ...project,
      name: project.name?.trim() ?? "",
      description: project.description?.trim() ?? "",
      techStack: project.techStack?.trim() ?? "",
      link: project.link?.trim() ?? "",
    }))
    .filter((project) => project.name || project.description || project.techStack || project.link);
  const skillsPayload = {
    items: values.skills.map((skill) => skill.trim()).filter(Boolean),
    projects: normalizedProjects,
    certifications: normalizedCertifications,
    references: values.references ?? [],
  };

  const resume = input.id
    ? await prisma.resume.update({
        where: { id: input.id },
        data: {
          title: normalizedTitle,
          slug,
          summary: values.summary.trim(),
          personal: {
            ...values.personal,
            fullName: values.personal.fullName.trim(),
            role: values.personal.role.trim(),
            email: values.personal.email.trim(),
            phone: values.personal.phone.trim(),
            location: values.personal.location.trim(),
            website: values.personal.website?.trim() ?? "",
            github: values.personal.github?.trim() ?? "",
            linkedin: values.personal.linkedin?.trim() ?? "",
          },
          experience: values.experience.map((item) => ({
            ...item,
            id: item.id || crypto.randomUUID(),
            company: item.company.trim(),
            role: item.role.trim(),
            startDate: item.startDate.trim(),
            endDate: item.endDate.trim(),
            bullets: item.bullets.map((bullet) => bullet.trim()),
          })),
          education: values.education.map((item) => ({
            ...item,
            id: item.id || crypto.randomUUID(),
            school: item.school.trim(),
            degree: item.degree.trim(),
            year: item.year.trim(),
          })),
          skills: skillsPayload,
        },
      })
    : await prisma.resume.create({
        data: {
          title: normalizedTitle,
          slug,
          summary: values.summary.trim(),
          personal: {
            ...values.personal,
            fullName: values.personal.fullName.trim(),
            role: values.personal.role.trim(),
            email: values.personal.email.trim(),
            phone: values.personal.phone.trim(),
            location: values.personal.location.trim(),
            website: values.personal.website?.trim() ?? "",
            github: values.personal.github?.trim() ?? "",
            linkedin: values.personal.linkedin?.trim() ?? "",
          },
          experience: values.experience.map((item) => ({
            ...item,
            id: item.id || crypto.randomUUID(),
            company: item.company.trim(),
            role: item.role.trim(),
            startDate: item.startDate.trim(),
            endDate: item.endDate.trim(),
            bullets: item.bullets.map((bullet) => bullet.trim()),
          })),
          education: values.education.map((item) => ({
            ...item,
            id: item.id || crypto.randomUUID(),
            school: item.school.trim(),
            degree: item.degree.trim(),
            year: item.year.trim(),
          })),
          skills: skillsPayload,
          userId,
        },
      });

  await ensureUsage(userId);
  if (!input.id) {
    await prisma.userUsage.update({ where: { userId }, data: { resumesCreated: { increment: 1 } } });
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/resumes");
  revalidatePath(`/dashboard/resumes/${resume.id}`);
  return { success: true, id: resume.id };
}

export async function deleteResumeAction(id: string) {
  const userId = await getActionUserId();
  await prisma.resume.deleteMany({ where: { id, userId } });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/resumes");
  return { success: true };
}

export async function deleteResumeFormAction(id: string): Promise<void> {
  await deleteResumeAction(id);
}

export async function saveCoverLetterAction(input: { id?: string; values: unknown; content: string }) {
  const userId = await getActionUserId();
  const values = coverLetterSchema.parse(input.values);

  const coverLetter = input.id
    ? await prisma.coverLetter.update({
        where: { id: input.id },
        data: {
          role: values.role,
          company: values.company,
          tone: values.tone,
          jobDetails: values.jobDescription,
          content: input.content,
        },
      })
    : await prisma.coverLetter.create({
        data: {
          role: values.role,
          company: values.company,
          tone: values.tone,
          jobDetails: values.jobDescription,
          content: input.content,
          userId,
        },
      });

  await ensureUsage(userId);
  if (!input.id) {
    await prisma.userUsage.update({ where: { userId }, data: { coverLettersCreated: { increment: 1 } } });
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/cover-letters");
  return { success: true, id: coverLetter.id };
}

export async function saveJobApplicationAction(input: { id?: string; values: unknown }) {
  const userId = await getActionUserId();
  const values = jobApplicationSchema.parse(input.values);

  await prisma.jobApplication.upsert({
    where: {
      id: input.id ?? "",
    },
    update: {
      company: values.company,
      role: values.role,
      status: values.status as ApplicationStatus,
      appliedDate: values.appliedDate ? new Date(values.appliedDate) : null,
      link: values.link || null,
      notes: values.notes || null,
    },
    create: {
      company: values.company,
      role: values.role,
      status: values.status as ApplicationStatus,
      appliedDate: values.appliedDate ? new Date(values.appliedDate) : null,
      link: values.link || null,
      notes: values.notes || null,
      userId,
    },
  }).catch(async () => {
    await prisma.jobApplication.create({
      data: {
        company: values.company,
        role: values.role,
        status: values.status as ApplicationStatus,
        appliedDate: values.appliedDate ? new Date(values.appliedDate) : null,
        link: values.link || null,
        notes: values.notes || null,
        userId,
      },
    });
  });

  await ensureUsage(userId);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/job-tracker");
  return { success: true };
}

export async function deleteJobApplicationAction(id: string) {
  const userId = await getActionUserId();
  await prisma.jobApplication.deleteMany({ where: { id, userId } });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/job-tracker");
  return { success: true };
}

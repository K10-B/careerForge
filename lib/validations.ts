import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().min(2, "Name is too short."),
  email: z.string().email("Enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

const personalSchema = z.object({
  fullName: z.string().min(2),
  role: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(6),
  location: z.string().min(2),
  website: z.string().optional().default(""),
  github: z.string().optional().default(""),
  linkedin: z.string().optional().default(""),
});

const experienceSchema = z.object({
  id: z.string(),
  company: z.string().min(2),
  role: z.string().min(2),
  startDate: z.string().min(2),
  endDate: z.string().min(2),
  bullets: z.array(z.string().min(4)).min(1),
});

const educationSchema = z.object({
  id: z.string(),
  school: z.string().min(2),
  degree: z.string().min(2),
  year: z.string().min(2),
});

const projectSchema = z.object({
  id: z.string(),
  name: z.string().optional().default(""),
  description: z.string().optional().default(""),
  techStack: z.string().optional().default(""),
  link: z.string().optional().default(""),
});
const certificationSchema = z.object({
  id: z.string(),
  name: z.string().optional().default(""),
  startDate: z.string().optional().default(""),
  endDate: z.string().optional().default(""),
  issuer: z.string().optional().default(""),
});

export const resumeSchema = z.object({
  title: z.string().min(3, "Resume title is required."),
  summary: z.string().min(20, "Add a short professional summary."),
  personal: personalSchema,
  experience: z.array(experienceSchema).min(1, "Add at least one experience entry."),
  education: z.array(educationSchema).min(1, "Add at least one education entry."),
  skills: z.array(z.string().min(2)).min(1, "Add at least one skill."),
  projects: z.array(projectSchema).optional().default([]),
  certifications: z.array(certificationSchema).optional().default([]),
  references: z.array(z.string().min(2)).optional().default([]),
});

export const jobApplicationSchema = z.object({
  company: z.string().min(2, "Company is required."),
  role: z.string().min(2, "Role is required."),
  status: z.enum(["WISHLIST", "APPLIED", "INTERVIEW", "OFFER", "REJECTED"]),
  appliedDate: z.string().optional().nullable(),
  link: z.string().url("Enter a valid URL.").or(z.literal("")).optional(),
  notes: z.string().optional(),
});

export const coverLetterSchema = z.object({
  role: z.string().min(2, "Role is required."),
  company: z.string().min(2, "Company is required."),
  tone: z.string().min(2, "Tone is required."),
  jobDescription: z.string().min(30, "Paste enough context from the job description."),
});

export const improveBulletSchema = z.object({
  bullet: z.string().min(8, "Add a fuller resume bullet."),
  action: z.enum(["improve", "shorten", "professionalize", "achievement-focused"]),
  role: z.string().optional(),
});
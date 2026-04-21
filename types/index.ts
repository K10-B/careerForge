export type ResumePersonal = {
  fullName: string;
  role: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  github?: string;
  linkedin?: string;
};

export type ResumeExperienceItem = {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  bullets: string[];
};

export type ResumeEducationItem = {
  id: string;
  school: string;
  degree: string;
  year: string;
};

export type ResumeProjectItem = {
  id: string;
  name: string;
  description: string;
  techStack: string;
  link?: string;
};

export type ResumeCertificationItem = {
  id: string;
  name: string;
  issuer: string;
  startDate: string;
  endDate: string;
};

export type ResumeSkillGroup = {
  category: string;
  items: string[];
};

export type ResumeFormValues = {
  title: string;
  summary: string;
  personal: ResumePersonal;
  experience: ResumeExperienceItem[];
  education: ResumeEducationItem[];
  skills: string[];
  projects?: ResumeProjectItem[];
  certifications?: ResumeCertificationItem[];
  references?: string[];
  skillGroups?: ResumeSkillGroup[];
};

export type DashboardStats = {
  resumes: number;
  coverLetters: number;
  activeApplications: number;
  interviews: number;
};

export type DashboardBilling = {
  planTier: "FREE" | "PRO";
  status: "NONE" | "PENDING" | "ACTIVE" | "EXPIRED" | "CANCELED";
  billingInterval: "MONTHLY" | "YEARLY" | null;
  currentPeriodEnd: Date | null;
  limits: {
    resumeWorkspaces: number | null;
    coverLetterGenerationsPerMonth: number | null;
    bulletImprovementsPerMonth: number | null;
  };
};

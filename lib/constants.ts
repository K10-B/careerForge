import type { ResumeFormValues } from "@/types";

export const appConfig = {
  name: "CareerForge AI",
  tagline: "Land better opportunities with AI-crafted resumes, cover letters, and job tracking.",
};

export const applicationStatuses = [
  "WISHLIST",
  "APPLIED",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
] as const;

export const pricingPlans = [
  {
    name: "Free",
    monthly: 0,
    yearly: 0,
    description: "Get started with structured job search essentials.",
    cta: "Start Free",
    features: [
      "1 resume workspace",
      "5 AI bullet improvements / month",
      "3 cover letters / month",
      "Basic job tracker",
    ],
  },
  {
    name: "Pro",
    monthly: 19,
    yearly: 15,
    description: "For ambitious candidates running a serious search.",
    cta: "Upgrade to Pro",
    features: [
      "Unlimited resumes",
      "Unlimited AI bullet improvements",
      "Unlimited cover letters",
      "Advanced job tracking insights",
      "Priority support",
    ],
  },
];

export const featureComparison = [
  ["Resume builder", "1 resume", "Unlimited"],
  ["Cover letters", "3 generations / month", "Unlimited"],
  ["AI bullet rewriting", "5 / month", "Unlimited"],
  ["Job tracker", "Basic", "Advanced"],
  ["PDF export", "Yes", "Yes"],
];

export const freePlanLimits = {
  resumeWorkspaces: 1,
  coverLetterGenerationsPerMonth: 3,
  bulletImprovementsPerMonth: 5,
} as const;

export const defaultResume: ResumeFormValues = {
  title: "",
  summary: "",
  personal: {
    fullName: "",
    role: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    github: "",
    linkedin: "",
  },
  experience: [
    {
      id: "exp-1",
      company: "",
      role: "",
      startDate: "",
      endDate: "",
      bullets: [""],
    },
  ],
  education: [
    {
      id: "edu-1",
      school: "",
      degree: "",
      year: "",
    },
  ],
  skills: [],
  projects: [],
  certifications: [],
  references: [],
};

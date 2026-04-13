# CareerForge AI

CareerForge AI is a production-ready SaaS application for modern job seekers who want better resumes, tailored cover letters, and a cleaner application workflow.

## Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-style component architecture
- Framer Motion
- Auth.js with credentials auth
- Prisma ORM
- PostgreSQL
- Gemini API
- Playwright for direct PDF generation
- Vercel-ready deployment

## Features

- Premium marketing landing page with pricing
- Sign up and sign in with Auth.js
- Protected dashboard with usage insights
- Resume builder with live preview and focus preview
- Shared resume document renderer for preview and PDF export
- Direct resume PDF download powered by Playwright from the shared export route
- AI resume bullet rewriting actions
- Cover letter generator powered by Gemini
- Job application tracker with CRUD flows
- PDF resume export with one-page fit handling, cleaner pagination, and blank-page cleanup
- Light and dark mode support
- Responsive layouts, polished empty states, and loading states

## Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/careerforge?sslmode=require"
AUTH_SECRET="replace-with-a-long-random-secret"
GEMINI_API_KEY="your-gemini-api-key"
GEMINI_MODEL="gemini-2.5-flash"
NEXTAUTH_URL="http://localhost:3000"
```

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Generate Prisma client:

```bash
npx prisma generate
```

3. Push the schema to your PostgreSQL database:

```bash
npx prisma db push
```

4. Start the development server:

```bash
npm run dev
```

5. Open `http://localhost:3000`.

## Auth Notes

- Auth.js is configured with credentials authentication.
- Users are created through `POST /api/auth/register`.
- Protected routes live under `/dashboard`.
- The app now passes the server session into the client `SessionProvider` to reduce session refetch noise and hydration issues.

## AI Notes

- Resume bullet actions call `POST /api/ai/resume-bullets`.
- Cover letter generation calls `POST /api/ai/cover-letter`.
- If `GEMINI_API_KEY` is missing, the app returns a safe fallback message instead of breaking.
- You can override the default Gemini model with `GEMINI_MODEL` when needed.

## Resume Builder Notes

- The live preview and PDF export both use the shared `ResumeDocument` component.
- The preview calculates a fit level so dense resumes can stay closer to one page without aggressive compression.
- Resume PDF export is generated from the shared HTML/CSS document path through `/resumes/[id]/export` and `/resumes/[id]/export-pdf`.
- Export now downloads directly without opening a visible print popup or export tab.
- PDF export uses the same fit level as the preview to keep spacing and line breaks more consistent.
- The resume builder supports optional sections such as projects, certifications, references, GitHub, and LinkedIn.
- Experience and project bullets are rendered with explicit bullet markers to keep alignment stable in exported PDFs.
- Core Skills line breaks are preserved on save/reload, including recovery for older flattened skill-group entries and literal `\n` data.

## UI Notes

- Save and export buttons in the resume editor use separate loading states.
- The theme toggle waits for client mount before swapping icons to avoid hydration mismatches.

## Database Models

- `User`
- `Resume`
- `CoverLetter`
- `JobApplication`
- `UserUsage`
- Auth.js support models: `Account`, `Session`, `VerificationToken`

## Deployment

The app is ready for Vercel deployment.

1. Create a PostgreSQL database.
2. Add all environment variables in Vercel.
3. Run `npx prisma db push` against production.
4. Deploy.

## Verification

Production build completed successfully with:

```bash
npm run build
```

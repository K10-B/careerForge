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
- Xendit-backed Pro upgrade flow in test mode
- Automatic Pro plan sync after paid Xendit checkout returns to Settings
- Sign up and sign in with Auth.js
- Protected dashboard with usage insights
- Free vs Pro plan state surfaced across dashboard and settings
- Resume builder with live preview and focus preview
- Shared resume document renderer for preview and PDF export
- Direct resume PDF download powered by Playwright from the shared export route
- Resume cards include an in-app preview modal with dark-theme loading skeletons
- AI resume bullet rewriting actions
- Cover letter generator powered by Gemini
- Free-tier usage enforcement for resumes, AI bullet improvements, and cover letter generations
- Job application tracker with CRUD flows
- PDF resume export with one-page fit handling, cleaner pagination, and blank-page cleanup
- Light and dark mode support
- Unified `CJ` account menu across dashboard and landing page, including theme switching
- Responsive layouts, polished empty states, and loading states

## Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/careerforge?sslmode=require"
AUTH_SECRET="replace-with-a-long-random-secret"
GEMINI_API_KEY="your-gemini-api-key"
GEMINI_MODEL="gemini-2.5-flash"
NEXTAUTH_URL="http://localhost:3000"
XENDIT_SECRET_KEY="your-xendit-test-secret-key"
XENDIT_WEBHOOK_TOKEN="your-xendit-callback-token"
```

## Runtime Requirement

- Use Node.js `22` locally when possible.
- The project is tested primarily on Node `20`, `22`, and `24` LTS-style runtimes.
- Node `25` is allowed with a warning instead of a hard block, but it may still trigger native Next.js/V8 crashes on some Windows setups.
- The repo includes `.nvmrc` set to `22`.

If you use `nvm`, switch first:

```bash
nvm use 22
node -v
```
## Local Setup

1. Switch to Node `22` if needed:

```bash
nvm use 22
node -v
```

2. Install dependencies:

```bash
npm install
```

3. Generate Prisma client:

```bash
npx prisma generate
```

4. Push the schema to your PostgreSQL database:

```bash
npx prisma db push
```

5. Start the development server:

```bash
npm run dev
```

6. Open `http://localhost:3000`.

7. If you want to demo billing, add your Xendit test credentials and point your Xendit webhook to `/api/billing/xendit/webhook`.

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

## Billing Notes

- Pricing now supports a real Xendit-powered upgrade flow in **test mode**.
- `POST /api/billing/xendit/checkout` creates a hosted Xendit invoice checkout for the Pro plan.
- `POST /api/billing/xendit/webhook` activates or expires local plan state based on Xendit webhook events.
- `GET /api/billing/status` lets the settings screen poll billing state after checkout returns.
- The billing flow is currently best suited for demo/showcase use while business verification is still pending.
- If a paid Xendit invoice already exists, the Settings page can auto-promote the workspace to Pro without a manual reload.
- Settings includes:
  - `Manage plan` modal for active Pro workspaces
  - in-app cancel confirmation instead of native browser alerts
  - immediate fallback to `Upgrade to Pro` after canceling
- Free tier limits are enforced in-app:
  - `1` resume workspace
  - `3` cover letter generations per month
  - `5` AI bullet improvements per month
- Pro removes those limits and updates the dashboard/settings plan state.

## Resume Builder Notes

- The live preview and PDF export both use the shared `ResumeDocument` component.
- The preview calculates a fit level so dense resumes can stay closer to one page without aggressive compression.
- Resume PDF export is generated from the shared HTML/CSS document path through `/resumes/[id]/export` and `/resumes/[id]/export-pdf`.
- Export now downloads directly without opening a visible print popup or export tab.
- Resume workspaces include a `View details` popup that opens the shared resume preview in a centered modal.
- PDF export uses the same fit level as the preview to keep spacing and line breaks more consistent.
- The resume builder supports optional sections such as projects, certifications, references, GitHub, and LinkedIn.
- Experience and project bullets are rendered with explicit bullet markers to keep alignment stable in exported PDFs.
- Core Skills line breaks are preserved on save/reload, including recovery for older flattened skill-group entries and literal `\n` data.

## UI Notes

- Save and export buttons in the resume editor use separate loading states.
- Theme switching now lives inside the shared `CJ` account menu and uses custom light/dark icon assets.
- The theme toggle waits for client mount before swapping icons to avoid hydration mismatches.
- The landing page and dashboard now share the same floating `CJ` profile menu behavior.

## Database Models

- `User`
- `Resume`
- `CoverLetter`
- `JobApplication`
- `UserUsage`
- `BillingSubscription`
- Auth.js support models: `Account`, `Session`, `VerificationToken`

## Deployment

The app is ready for Vercel deployment.

1. Create a PostgreSQL database.
2. Add all environment variables in Vercel, including the Xendit billing keys if you want the upgrade flow enabled.
3. Run `npx prisma db push` against production.
4. Deploy.

## Verification

Production build completes successfully on supported Node LTS runtimes with:

```bash
npm run build
```




# Applicant Tracking System (ATS) for Content Writer Hiring

### TL;DR

A lightweight, open-source ATS purpose-built to track, vet, and hire content writers. It streamlines public job postings, candidate applications, assessments, automated AI review, messaging, and shortlisting—ending in hiring or assignment handoff. Built for marketing teams and agencies seeking a fast, self-hosted, white-labeled solution with bring-your-own integrations and API keys.

---

## Goals

### Business Goals

* Reduce average time-to-hire for content writers to less than a week.

* Decrease manual screening workload via automated AI review and scoring.

* Improve candidate quality by increasing AI shortlist precision to ≥75% agreement with manual reviewers.

* Increase application completion rate to ≥70% by optimizing candidate UX and reducing friction.

* Enable open-source adoption: ≥20 external self-hosted deployments within 6 months.

### User Goals

* Candidates: Apply quickly, track status transparently, and receive timely feedback.

* Admins: Post roles, review at scale with AI-assisted scoring, message candidates, and move to paid/live assignments or hire with minimal clicks.

* Teams: Tailor branding, integrate with existing hiring/payment tools, and automate lifecycle alerts.

### Non-Goals

* Multi-level admin roles or complex org hierarchies (single Admin role only for v1).

* Full HRIS/payroll functionality (only integrations and handoffs to tools like Deel, Wise, PayPal).

* Non-writer roles (Designer and others) beyond basic placeholders in v1.

---

## User Stories

Personas:

* Admin (Recruiter/Hiring Manager at Olli Social or similar team)

* Writer (Candidate applying for roles)

Admin

* As an Admin, I want to create and publish job postings, so that applicants can discover and apply.

* As an Admin, I want to define a custom assessment prompt per role, so that I can evaluate candidates on real writing tasks.

* As an Admin, I want automated AI scoring (reading level, writing quality, SEO, English, AI-generated likelihood), so that I can quickly shortlist candidates.

* As an Admin, I want to filter candidates by pipeline stage, score, and tags, so that I can prioritize my review.

* As an Admin, I want to view candidate profiles and resumes/portfolios, so that I can assess fit.

* As an Admin, I want to message candidates and send lifecycle updates, so that I can coordinate assessments and next steps.

* As an Admin, I want to approve/deny applications and move candidates to paid/live assignments, so that I can progress them to production workflows.

* As an Admin, I want to hire or terminate candidates and hand off to payment/contracting tools, so that I can complete the process.

* As an Admin, I want to white-label branding and custom domains, so that the site matches my brand.

* As an Admin, I want to configure webhooks/API, so that I can integrate postings and candidate events with Upwork, Fiverr, ProBlogger, OnlineJobs, HRLab, Slack, or internal systems.

Writer

* As a Writer, I want to browse the job board without logging in, so that I can quickly find relevant roles.

* As a Writer, I want to see a clear job description and requirements, so that I can assess fit before applying.

* As a Writer, I want to create an account and apply seamlessly, so that I can submit my materials without friction.

* As a Writer, I want to complete a role-specific assessment prompt, so that I can showcase my skills.

* As a Writer, I want to receive confirmation and status updates, so that I know where I stand.

* As a Writer, I want to access a message center, so that I can communicate with the hiring team and share additional information.

* As a Writer, I want to see my application steps and current status, so that I have transparency in the process.

* As a Writer, I want to manage my profile (name, location, resume, portfolio, references, compensation expectations), so that my application is complete and accurate.

---

## Functional Requirements

* Job Board & Roles (Priority: P0) -- Public job board: List open roles with search/filter (role type, seniority, location, compensation). -- Job detail page: Full JD, responsibilities, requirements, compensation range/structure, “Apply” CTA. -- Role management (Admin): CRUD roles, set status (Draft/Published/Closed), define assessment prompt, auto-reply templates.

* Candidate Application & Profile (Priority: P0) -- Candidate sign-up/sign-in: Pluggable auth (default Clerk; alternative Supabase Auth), email-first flow. -- Application form: Personal info (First, Last, Email), location (City/Region/Country), resume upload, portfolio link, references upload(s), desired rate (Amount, Per: word/article/hour, Currency). -- Multi-role applications: Candidate can apply to multiple roles; deduplicate profile data. -- Steps & Status: Track pipeline stage per application; display a stepper to candidates.

* Assessment & Submission (Priority: P0) -- Admin-configurable prompt: Rich-text prompt per role; optional word count and submission guidelines. -- Assessment page: Timeless by default; Admin can set soft time expectations; candidate attestation checkbox (“No AI, no plagiarism”). -- Submission: Rich-text editor with headings/links; optional file upload; autosave; final submit with confirmation.

* AI Review & Scoring (Priority: P0) -- Automated scoring on submission: Generate composite score and sub-scores. -- Components:

  * Reading Level (e.g., Flesch, SMOG).

  * Writing Quality (grammar, spelling, clarity).

  * SEO Heuristics (headings, meta, keyword use, link structure).

  * English Proficiency (language detection, fluency indicators).

  * AI-Generation Likelihood (stylometry & perplexity-based). 

  * Threshold-based Shortlisting: If Score ≥ X, mark as “Shortlisted for manual review.”

  * Admin override: Approve/Deny regardless of score; store reason codes.

* Candidate Management (Priority: P0) -- Pipeline: Applied → Assessment Submitted → AI Reviewed → Shortlisted → Manual Review → Paid/Live Assignment → Hired → Terminated/Rejected. -- Candidate table: Email, role, stage, score, tags; bulk actions; filters by stage/score/date. -- Candidate profile: Application details, assessment, attachments, history, messages.

* Messaging & Alerts (Priority: P1) -- In-app messaging: Threads per application (Admin ↔ Candidate); attachments; read receipts. -- Email notifications via Resend: Application received, assessment assigned, reminders, decision updates. -- Templates: Admin-manageable email/message templates per stage.

* Admin Controls & White-Labeling (Priority: P1) -- Branding: Logo, colors, favicon, email sender name; optional custom domain mapping. -- Access: Single Admin role; invite additional Admins (same permissions). -- Content pages: Configurable homepage copy; privacy and terms links. -- Audit log: Key admin actions (create/update/delete role, status change, decisions).

* Integrations & API (Priority: P1) -- API: REST endpoints and webhooks for role published, application created, assessment submitted, decision changed. -- Distribution: Job RSS/JSON feed; Zapier/Make-friendly webhooks to Upwork, Fiverr, ProBlogger, OnlineJobs.ph, HRLab.rs (manual/automated posting where possible). -- Hiring/Payment: Handoff links and metadata capture for Deel, Wise, PayPal (store external IDs, not payment processing). -- Production workflow: Optional webhook to create tasks/issues in tools like GitHub, Notion, Asana.

* Compliance, Security, & Ops (Priority: P0) -- Data protection: RLS, least privilege, encryption at rest/in transit. -- File scanning: Antivirus for uploads (e.g., ClamAV); file type/size limits. -- Accessibility: WCAG 2.1 AA baseline. -- Rate limiting & anti-spam: Bot protection on application and messaging. -- BYO keys: Secure storage for third-party API keys; per-tenant isolation for white-label.

* Analytics & Reporting (Priority: P2) -- Funnel: Views → Apply → Submit → Shortlist → Hire. -- Ops: Time-to-hire, average review time, AI-manual agreement, rejection reasons. -- Export: CSV export for roles and candidates.

---

## User Experience

Entry Point & First-Time User Experience

* Discovery:

  * Public job board indexed by search engines; shareable role URLs.

  * Admins can link to job board from company site.

* Onboarding:

  * Candidate clicks Apply → lightweight account creation (email + magic link or OAuth).

  * No mandatory phone number; minimal friction; privacy and terms acceptance.

Core Experience

* Step 1: Browse roles (Candidate)

  * Clear filters; responsive cards; each role shows title, type, compensation, posted date.

  * Accessibility: Semantic headings; keyboard navigable; visible focus states.

  * Error handling: Empty state for no roles; retry for network errors.

* Step 2: View Job Description (Candidate)

  * Detailed JD with responsibilities, requirements, sample topics, compensation model, and assessment preview.

  * Prominent Apply CTA; contextual FAQs about process.

* Step 3: Create Account & Profile (Candidate)

  * Simple form: Name, Email, Location, Resume Upload, Portfolio Link, References Upload(s), Desired Rate (Amount + Per + Currency).

  * Validation: File types (PDF/Doc ≤ 10MB), URL format, required fields; privacy consent.

  * Success: “Profile saved” toast; proceed to assessment.

* Step 4: Assessment (Candidate)

  * Assessment page with prompt, guidance, word count target, “No AI/plagiarism” attestation.

  * Rich-text editor: H1/H2, bold/italic, links; autosave; live word count.

  * Submission confirmation: “Thank you, we will be in touch”; surface expected timelines.

* Step 5: AI Review (System)

  * Background job computes sub-scores and composite; stores artifacts and explanations.

  * If Score ≥ threshold: Auto-tag as Shortlisted; trigger Admin alert; candidate notified.

* Step 6: Manual Review (Admin)

  * Candidate table with filters: Stage, Score, Role, Date.

  * Candidate profile view: Assessment content, sub-scores with justifications, resume, portfolio, timeline of events.

  * Actions: Shortlist, Reject (with reason), Request revision, Send message, Move to Paid/Live Assignment.

* Step 7: Messaging & Assignment (Admin ↔ Candidate)

  * Threaded messages with email notifications via Resend; attachments allowed.

  * Admin can send Paid/Live Assignment details and external payment link (Wise/PayPal/Deel).

  * Assignment status reflected in application; webhook to production workflow if configured.

* Step 8: Hire/Terminate (Admin)

  * “Hire” action records decision, start date, compensation model, and external system IDs.

  * “Terminate/Reject” records reason and sends templated message.

  * Post-decision surveys optional; archive and export options.

Advanced Features & Edge Cases

* Duplicate applications: System merges by email; surfaces prompt to update existing profile.

* Late/missing assessment: Automated reminder at 24/72 hours; admin override to extend deadline.

* AI false positives: Admin can mark “False Positive” to improve model calibration logs (no auto-learning in v1).

* File upload failures: Resume to draft; prompt retry; virus scan errors handled with clear guidance.

* Spam/bots: Rate limiting, honeypot fields, optional CAPTCHA toggle.

* Reopening closed roles: Preserve URL; display “Closed” state with similar roles suggestion.

* Multi-tenant white-label: Separate branding and custom domain per tenant; data isolation enforced.

UI/UX Highlights

* Consistent, responsive layout with clear hierarchy; mobile-first.

* WCAG 2.1 AA: Sufficient color contrast, keyboard navigation, ARIA roles/labels, skip links.

* Clear stage badges and progress timelines; status always visible.

* Inline validations and helpful error messages; non-blocking saves.

* Dark/light theme support; tenant-configurable brand colors and logo.

* Accessible rich-text editor; semantic output for SEO analysis.

---

## Narrative

Maya, a freelance content writer, finds a compelling “B2B SaaS Blog Writer” listing on a marketing agency’s public job board. The role page is clear: responsibilities, rate expectations, and a short assessment prompt. She creates an account, uploads her resume, adds her portfolio, and completes the prompt in the in-app editor. After submitting, she receives a friendly confirmation and can track her status on her dashboard.

Behind the scenes, the ATS evaluates her submission. It verifies English proficiency, calculates readability, checks grammar and structure, and runs SEO heuristics. The system estimates the likelihood of AI-generated content using stylometry and perplexity measures. Maya’s piece scores above the configured threshold, so she’s automatically shortlisted. The hiring manager opens her profile, sees a neat breakdown of scores with explanations, quickly scans her portfolio, and messages her to discuss a paid trial assignment.

Maya receives an email notification and replies in the message center. The manager sends a paid assignment brief and links payment via their preferred tool. With one click, they create a production task. After a strong delivery, the manager presses “Hire,” records the external contract ID, and welcomes Maya aboard. For the team, time-to-hire shrinks from weeks to days; for Maya, the process is transparent and respectful. Both sides get a streamlined, fair, and consistent hiring experience.

---

## Success Metrics

* Application completion rate ≥ 70%.

* Shortlist precision ≥ 75% agreement with manual reviewers.

* Time-to-first-response to candidates ≤ 48 hours (median).

* Time-to-hire reduced by ≥ 40% compared to baseline.

* System uptime ≥ 99.9%; p95 API latency ≤ 300 ms for standard operations.

### User-Centric Metrics

* Candidate NPS ≥ 40 after decision.

* Admin satisfaction (CSAT) ≥ 4.3/5.

* Message response SLA: 90% within 24 hours.

* Assessment submission rate ≥ 60% of started applications.

### Business Metrics

* Hiring throughput: ≥ 2x more candidates reviewed per week without additional headcount.

* Cost avoidance from tool consolidation/open-source: ≥ $X/month vs commercial ATS.

* Organic traffic growth to job board: +30% in 3 months.

### Technical Metrics

* Uptime ≥ 99.9% monthly.

* Error rate (5xx) ≤ 0.2% of requests.

* File upload success ≥ 99.5%.

* Background job success ≥ 99%; retries with exponential backoff.

### Tracking Plan

* Page viewed: Job Board, Job Detail, Apply, Assessment, Dashboard.

* Auth events: Sign-up started/completed, Sign-in success/failure.

* Application events: Application created/submitted, Files uploaded, Profile updated.

* Assessment events: Editor opened, Autosave, Submission, AI review completed, Scores generated.

* Pipeline events: Stage changed, Shortlisted, Rejected, Hired, Terminated.

* Messaging events: Thread created, Message sent/received, Email delivered/opened (where possible).

* Admin actions: Role created/updated/published/closed, Templates edited, Branding updated, Webhook configured.

---

## Technical Considerations

### Technical Needs

* Front-end: Next.js app (app router), server actions, SSR for public pages, client components for forms/editor. Theming system for white-label.

* Back-end: Supabase (Postgres) for relational data and RLS; Supabase Storage for resumes/attachments; Supabase Realtime for messaging and status updates.

* Authentication: Pluggable provider—default Clerk; optional Supabase Auth. Single Admin role type.

* Email: Resend for transactional emails (BYO domain/sender).

* Background processing: Queue/cron via Supabase functions/Edge functions or Next.js background tasks for AI scoring and notifications.

* API/Webhooks: REST API for roles, applications, messages; outbound webhooks for key events; token-based auth.

* Rich-text editor: Accessible editor with semantic HTML output to feed SEO analysis.

Data Models (high level)

* tenants, branding_settings

* users (candidate/admin), roles (admin, writer)

* jobs (role), job_settings (assessment prompt, thresholds)

* applications (status, score, timestamps)

* assessments (content, files, metrics)

* messages (thread_id, sender_id, content, attachments)

* references (files/links)

* webhooks (endpoints, secrets), api_keys

* audit_logs

### Integration Points

* Job distribution: RSS/JSON feeds; webhooks to Zapier/Make; guidance for posting to Upwork, Fiverr, ProBlogger, OnlineJobs.ph, HRLab.rs.

* Hiring/payments: Handoff metadata to Deel, Wise, PayPal (store external IDs, links).

* Production workflow: Webhooks to GitHub Issues, Notion, Asana, or Slack for assignment notifications.

* Optional plagiarism services: Plugin architecture for Copyleaks, Turnitin, or open-source winnowing/simhash (BYO keys if SaaS).

### Data Storage & Privacy

* PII stored in Supabase Postgres with RLS per tenant; minimal retention of sensitive fields.

* Files (resumes/attachments) in Supabase Storage; signed URLs; AV scanning before persist.

* Secrets (API keys, webhook secrets) stored encrypted; scoped per tenant.

* Compliance: GDPR-ready (DSR export/delete), CCPA considerations; cookie consent for analytics; clear privacy policy and ToS.

* Logging: Audit logs for admin decisions and data access; IP and user agent captured for security events.

### Scalability & Performance

* Expected load: 10–50k monthly visitors; 1–5k applications/month; bursty traffic on role launches.

* Caching: CDN/ISR for public job pages; query caching for job board.

* Async: All AI scoring and emails via background jobs; retry with backoff.

* p95 latency target ≤ 300 ms for reads/writes; background jobs processed within 1–5 minutes.

### Potential Challenges

* AI-generated-text detection reliability: False positives/negatives; mitigate by showing evidence and allowing manual override.

* Platform posting APIs: Limited/closed APIs (e.g., Fiverr); mitigate with feeds, webhooks, and manual workflows.

* Security of file uploads: Ensure strict validation and AV scanning; limit executable content.

* Multi-tenant white-labeling: Domain mapping and brand isolation; SSL automation; per-tenant config loading.

* Open-source deployment friction: Provide templates, seeds, and CI examples; minimal environment variables.

Open-Source AI Review Components (default, all open-source or self-hostable)

* Reading Level: Readability formulas (Flesch-Kincaid, SMOG, Gunning Fog) via Node libraries or custom implementation.

* Writing Quality: LanguageTool (self-hostable server) for grammar/spelling/style; aggregate alerts into a score.

* SEO Heuristics: Rule-based analysis (headings presence, link ratio, keyword coverage, meta description length, passive voice flags).

* English Proficiency: fastText language id (lid.176) to confirm English; fallback heuristics for fluency (rare word ratio, sentence variety).

* AI-Generation Likelihood:

  * Perplexity using GPT-2 small or GPT-Neo (self-hosted) to compute log-perplexity.

  * Stylometry vs candidate’s other samples (if available) via character/word n-grams and a simple classifier.

  * GLTR-like feature extraction (top-k token probability ranks). Scoring: Weighted composite with configurable thresholds; store sub-scores and rationales.

---

## Milestones & Sequencing

### Project Estimate

* Medium: 3–5 weeks to MVP with core flows, plus 1–2 weeks of hardening based on feedback.

### Team Size & Composition

* Small Team (2 people):

  * Full-Stack Engineer (leads implementation, infra, integrations)

  * Product Designer/PM (UX, copy, QA, and project management)

* Optional part-time contributor: DevOps for CI/CD and security review.

### Suggested Phases

**Phase 1: Core MVP (2 weeks)**

* Key Deliverables:

  * Public job board and job detail pages (Engineer).

  * Candidate auth (Clerk default), profile, application, resume/portfolio uploads (Engineer).

  * Assessment prompt per role; submission flow with attestation (Engineer).

  * AI scoring pipeline with open-source components; threshold-based shortlisting (Engineer).

  * Basic Admin dashboard: candidate table, profile view, approve/deny, stage changes (Engineer).

  * Email via Resend: application receipt, assessment confirmation (Engineer).

* Dependencies: Supabase setup, Resend keys, optional Clerk keys.

**Phase 2: Messaging & White-Label (1 week)**

* Key Deliverables:

  * In-app messaging with email notifications; attachments (Engineer).

  * Branding settings (logo, colors), basic custom domain support (Engineer).

  * Accessibility pass for forms and lists (Designer/PM).

* Dependencies: DNS/SSL config for domains; email domain verification.

**Phase 3: Integrations & Webhooks (1 week)**

* Key Deliverables:

  * Outbound webhooks for major events; API tokens (Engineer).

  * RSS/JSON feeds for roles; Zapier/Make recipes (Engineer).

  * Handoff hooks for Paid/Live Assignment and Hire to Deel/Wise/PayPal (metadata only) (Engineer).

* Dependencies: Partner accounts and webhook endpoints.

**Phase 4: Analytics, Reporting, and Hardening (1 week)**

* Key Deliverables:

  * Funnel and ops dashboards; CSV export (Engineer).

  * Audit logs; rate limiting; AV scanning; RLS verification (Engineer).

  * Documentation: Self-hosting guide, env templates, deployment scripts (PM/Engineer).

* Dependencies: Analytics provider (self-hosted or privacy-compliant), CI/CD pipeline.

Optional Post-MVP Enhancements (ongoing)

* Plagiarism plugin options (winnowing/simhash; SaaS connectors via BYO keys).

* Improved AI detection ensemble; model calibration tools.

* Multi-language UI; additional role types (Designer) and pipelines.

* Advanced domain mapping automation and per-tenant email sending domains.
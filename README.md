# Samudaay — Fully-Fledged Community Investment Platform

A complete, commercial-grade React/TypeScript web application connecting local business vendors, community investors, and job seekers.

## 🚀 Quick Start

```bash
npm install
npm run dev
```
Open http://localhost:5173

## 🔑 Login Credentials (Demo)

| Role         | Email                      | Password   |
|--------------|----------------------------|------------|
| Admin        | admin@samudaay.com         | admin123   |
| Investor     | investor@samudaay.com      | invest123  |
| Vendor       | vendor@samudaay.com        | vendor123  |
| Job Seeker   | jobs@samudaay.com          | jobs123    |

## 📁 Project Structure

```
src/
├── lib/
│   └── db.ts                  ← Central database (localStorage, all types)
├── pages/
│   ├── Index.tsx              ← Full landing page
│   ├── Login.tsx / Register.tsx
│   ├── HowItWorks.tsx
│   ├── AboutUs.tsx
│   ├── Contact.tsx
│   ├── FAQ.tsx
│   ├── PrivacyPolicy.tsx
│   ├── Terms.tsx
│   ├── InvestorDashboard.tsx  ← Portfolio, Discover+Invest, Transactions, Agreements
│   ├── VendorDashboard.tsx    ← Funding, Investors, Jobs, Applicants, Documents
│   ├── JobSeekerDashboard.tsx ← Find Jobs, Apply, Profile, Notifications
│   └── AdminDashboard.tsx     ← Full admin panel + DB Inspector
└── components/
    ├── DashboardLayout.tsx
    └── ui/                    ← shadcn/ui components
```

## ✅ Features

### Landing Website
- Full homepage with hero, stats, featured businesses, testimonials, CTA
- How It Works page
- About Us page
- Contact form
- FAQ with accordion
- Privacy Policy & Terms of Service
- Mobile responsive navbar

### Investor Dashboard
- **Portfolio** — real-time stats from DB investments
- **Discover** — browse verified vendors, full investment cards
- **💳 Payment Gateway** — UPI (QR + ID), Credit/Debit Card, Net Banking with OTP simulation
- **Invest** — updates vendor raised amount + investor count in DB instantly
- **My Investments** — live portfolio table from DB
- **Transactions** — full history, CSV export
- **Agreements** — downloadable agreement per investment
- **Notifications** — real-time alerts for investments, returns, KYC
- **Settings** — edit profile, switch plan

### Vendor Dashboard
- **Overview** — live funding progress from DB
- **Funding** — edit campaign (goal, returns, tenure, description) → saves to DB
- **Investors** — shows real investors from DB investments
- **Job Posts** — full CRUD: add, edit, pause/resume jobs → saved to DB
- **Applicants** — view and update application status from DB
- **Documents** — upload PDFs/images, store in DB as base64, download
- **Payments** — investor payout schedule
- **Analytics** — charts, funding progress
- **Settings** — edit business profile → DB sync

### Job Seeker Dashboard
- **Find Jobs** — live jobs from DB with Quick Apply modal
- **Apply** — creates JobApplication record in DB, updates job app count, sends notification
- **Applications** — tracks real applications from DB, withdraw feature
- **Saved Jobs** — bookmark jobs
- **Profile** — edit all fields, upload resume (stored in DB)
- **Notifications** — application confirmations
- **Community** — post, like, reply

### Admin Panel
- Full CRUD for Vendors, Investors, Job Seekers, Jobs, Support, Team, Subscriptions
- Soft delete (is_active flag) — data never truly deleted
- PDF/document uploads for all entities
- **DB Inspector** — view all 10 tables raw, export JSON, reset DB
- Overview with live stats from DB

## 🗄️ Database Architecture

All data in `localStorage` under key `samudaay_db_v2`.

**Tables:** vendors, investors, investments, transactions, jobSeekers, jobApplications, jobs, tickets, team, plans, notifications

**Key principle:** Every action (invest, apply, edit profile, post job) writes to the DB immediately. Changes are broadcast via `window.dispatchEvent` so all components reflect updates instantly.

**Soft Delete:** "Delete" sets `is_active: false`. Records remain in DB, hidden from UI. Admin can restore.

## 💳 Payment Flow

1. Investor clicks "Invest Now" on a vendor card
2. Enters amount → sees projected returns
3. Chooses UPI / Card / Net Banking
4. Simulates OTP verification
5. On success:
   - `investments` table gets new record
   - `transactions` table gets debit entry
   - `vendors` table: `raised += amount`, `investors += 1`
   - `investors` table: `totalInvested += amount`, `portfolio += 1`
   - `notifications` table gets confirmation
   - All dashboards update instantly

## 🛠️ Tech Stack

- **React 18** + **TypeScript**
- **Vite** (build tool)
- **React Router v6**
- **TailwindCSS** + custom design tokens
- **shadcn/ui** components
- **Framer Motion** animations
- **Lucide React** icons
- **localStorage** persistence (no backend needed)

## 📦 Build for Production

```bash
npm run build
# Output in dist/ — deploy to Vercel, Netlify, or any static host
```

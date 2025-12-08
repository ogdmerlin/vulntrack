# VulnTrack

**Open Source Vulnerability Management Platform**

VulnTrack is a modern, privacy-focused vulnerability management dashboard designed for security teams who value precision and improved workflows. It goes beyond simple CVE tracking by integrating **DREAD**, **STRIDE**, and **CVSS** frameworks into a unified remediation workflow.

## 🚀 Features

### Core Capabilities
- **Unified Risk Scoring**: Calculate and compare risks using multiple frameworks:
  - **DREAD**: Quantitative scoring for internal triage (Damage, Reproducibility, Exploitability, Affected Users, Discoverability).
  - **STRIDE**: Threat modeling identification (Spoofing, Tampering, Repudiation, etc.).
  - **CVSS v3.1**: Industry standard scoring for external compliance and reporting.
- **CVE Import Engine**: Auto-fetch and parses vulnerability data (NIST NVD/VulnCheck integration).
- **Team Collaboration**: Team-based workspaces with granular role-based access control (RBAC).

### Research & Knowledge
- **VulnTrack Research**: A built-in, professional-grade blog system hosting deep technical guides.
  - **OWASP Top 10 2024** Analysis.
  - **DREAD vs CVSS** Strategy Guides.
  - **Formatting**: Engineering-grade markdown support with strict professional typography.

### Operations
- **Reporting Engine**: Generate executive-ready PDF and CSV reports with one click.
- **Secure Onboarding**: Invitation-only registration system to maintain comprehensive access control.
- **Modern UI**: A "dark-mode first" aesthetic designed for long operational sessions, built with **Radix UI** and **Tailwind CSS**.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server Actions)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (via [Prisma ORM](https://www.prisma.io/))
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Auth**: [NextAuth.js](https://next-auth.js.org/)
- **Content**: MDX / React Markdown with GFM

---

## 📦 Getting Started

### 1. Installation

```bash
git clone https://github.com/ogdmerlin/vulntrack.git
cd vulntrack
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Ensure the following variables are set:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/vulntrack"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="openssl rand -base64 32"
```

### 3. Database Initialization

```bash
npx prisma generate
npx prisma db push
```

*(Optional) Seed the database with initial data:*
```bash
npx prisma db seed
```

### 4. Running Locally

```bash
npm run dev
```
Visit `http://localhost:3000` to start.

---

## 🔐 User Management

VulnTrack uses a strict **Invitation System** for security.

1. **Initial Setup**: The first registered user (or the user created via `seed.js`) is the **System Administrator**.
2. **Inviting Teams**: Admins can generate single-use invitation links from the `Dashboard > Settings` panel.
3. **Role Assignment**: Assign users as **Admin**, **Analyst**, or **Viewer** to control their access to sensitive vulnerability data.

---

## License

This project is licensed under the **MIT License**.

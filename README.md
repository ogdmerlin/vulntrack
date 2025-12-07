# VulnTrack

VulnTrack is a modern, open-source vulnerability management dashboard designed to help teams track, score, and remediate security threats. It supports DREAD and STRIDE scoring models and provides a clean, intuitive interface for security professionals.

## Features

- **Vulnerability Tracking**: Centralized dashboard for managing CVEs and internal findings.
- **Scoring Frameworks**: Built-in support for DREAD and STRIDE threat modeling.
- **Admin Control Panel**: Manage users, roles, and system settings.
- **Secure Onboarding**: Invitation-based user registration system.
- **Reporting**: Generate comprehensive security reports.
- **Modern UI**: specialized dark-mode interface built with Tailwind CSS and shadcn/ui.

## Self-Hosting Guide

You can easily self-host VulnTrack on your own infrastructure. Follow these steps to get up and running.

### Prerequisites

- **Node.js**: v18.17.0 or higher
- **Database**: PostgreSQL (recommended) or SQLite (for local testing)
- **PackageManager**: npm, yarn, or pnpm

### 1. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/yourusername/vulntrack.git
cd vulntrack
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Define the following variables:

```env
# Database Connection
DATABASE_URL="file:./dev.db" # Or your PostgreSQL connection string

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000" # Update for production (e.g., https://vulntrack.yourdomain.com)
NEXTAUTH_SECRET="your-super-secret-key-change-this"

# (Optional) SMTP Settings for Emails (Coming Soon)
# SMTP_HOST=smtp.example.com
# SMTP_PORT=587
# SMTP_USER=user
# SMTP_PASSWORD=password
```

### 3. Database Setup

Initialize the database schema:

```bash
npx prisma db push
```

### 4. Running the Application

Start the production server:

```bash
npm run build
npm start
```

The application will be available at `http://localhost:3000`.

## User Management & Security

VulnTrack uses a secure, invitation-based onboarding system to prevent unauthorized access.

### First Run: Creating the Admin
When you first deploy the application, the database will be empty.
1. Navigate to `/register`.
2. The **First User** to register will automatically be granted **Administrator** privileges.
3. No invitation code is required for this initial account.

### Onboarding Your Team
For security reasons, public registration is **disabled**. New users can only join via invitation:
1. Log in as an **Administrator**.
2. Go to `Dashboard > Admin > User Management`.
3. Click **"Invite User"**.
4. Select the role (Viewer, Analyst, or Admin) and enter their email.
5. Share the generated **Invitation Link** with your team member.
6. They can use this link to create their own account and set their own secure password.

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Database**: [Prisma ORM](https://www.prisma.io/)
- **Icons**: [Lucide React](https://lucide.dev/)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

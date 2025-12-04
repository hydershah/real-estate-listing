# Real Estate Listing Platform

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL + Prisma
- **Auth**: NextAuth.js v5
- **UI**: Tailwind CSS + shadcn/ui

## Getting Started

1. **Environment Setup**
   Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```
   - `DATABASE_URL`: Your PostgreSQL connection string.
   - `AUTH_SECRET`: Generate one using `openssl rand -base64 32`.

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Database Setup**
   Push the schema to your database:
   ```bash
   npx prisma db push
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## Features
- User Authentication (Login/Signup)
- Role-based access (User/Admin)
- Comprehensive Listing Form
- User Dashboard
- Admin Dashboard

## Project Structure
- `prisma/schema.prisma`: Database models
- `src/app/(auth)`: Authentication pages
- `src/lib/auth.ts`: NextAuth configuration
- `src/components/ui`: UI components

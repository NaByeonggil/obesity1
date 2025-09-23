# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Korean medical platform built with Next.js 14, featuring role-based access for patients, doctors, pharmacies, and administrators. The application provides appointment booking, prescription management, and healthcare services coordination.

## Technology Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Radix UI
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: MySQL/MariaDB via Docker
- **Authentication**: NextAuth.js with custom JWT implementation
- **State Management**: Zustand
- **Styling**: Tailwind CSS with custom components
- **Development**: TypeScript, ESLint

## Development Commands

```bash
# Development
npm run dev          # Start Next.js development server
npm run build        # Build the application
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking

# Database operations
npm run db:seed      # Seed database with sample data
npx prisma generate  # Generate Prisma client
npx prisma migrate dev  # Run database migrations
npx prisma studio    # Open Prisma Studio GUI

# Docker operations
docker-compose up -d # Start MariaDB container
docker-compose down  # Stop containers
```

## Application Architecture

### App Router Structure
- **Role-based pages**: `/patient`, `/doctor`, `/pharmacy`, `/admin`
- **API routes**: All backend logic in `/src/app/api`
- **Authentication**: Custom login system with role-based routing
- **Components**: Modular UI components in `/src/components`

### Database Schema (Prisma)
- **Users**: Multi-role user system (patient/doctor/pharmacy/admin)
- **Appointments**: Booking system with department-based scheduling
- **Prescriptions**: Digital prescription management with pharmacy fulfillment
- **Medications**: Drug catalog with pharmacy inventory tracking
- **Departments**: Medical specialties and consultation types

### Key Features
- **Multi-role authentication** with role-specific dashboards
- **Appointment booking** with department selection and symptom input
- **Prescription management** from doctor issuance to pharmacy fulfillment
- **Inventory tracking** for pharmacy medication stock
- **Admin dashboard** with system-wide statistics and alerts

## Database Setup

1. Start MariaDB: `docker-compose up -d`
2. Run migrations: `npx prisma migrate dev`
3. Seed data: `npm run db:seed`
4. Access GUI: `npx prisma studio`

The database runs on `localhost:3307` with credentials in `.env`

## Test Scripts

Several test scripts are available in the root directory:
- `test-*.ts` files for testing various API endpoints and functionality
- `add-*.ts` files for adding sample data to specific modules
- Use `npx ts-node <script-name>.ts` to run test scripts

## Role-Based Routes

- `/patient/*` - Patient booking, prescriptions, appointments
- `/doctor/*` - Doctor dashboard, patient management, prescriptions
- `/pharmacy/*` - Prescription fulfillment, inventory management
- `/admin/*` - System administration and statistics
- `/auth/*` - Authentication pages

## Environment Variables

Copy and configure `.env` with:
- Database connection (`DATABASE_URL`)
- JWT secrets (`JWT_SECRET`, `NEXTAUTH_SECRET`)
- Optional: Social login credentials (Kakao, Naver)
- Optional: Email configuration for notifications
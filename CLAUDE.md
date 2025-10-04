# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
```bash
# Development server (accessible on all network interfaces)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Linting
npm run lint

# Type checking (recommended before commits)
npm run type-check
```

### Database Operations
```bash
# Seed database with initial data
npm run db:seed

# Run Prisma migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Open Prisma Studio (database GUI)
npx prisma studio
```

### Testing & Verification
```bash
# Run test scripts (development only)
npx ts-node tests/auth/check-user-role.ts
npx ts-node tests/api/test-patient-flow.ts

# Run utility scripts
npx ts-node scripts/check-doctors.ts
```

## Architecture Overview

### Multi-Role Healthcare Platform
This is a Korean healthcare platform with four distinct user roles, each with separate dashboards and permissions:
- **PATIENT**: Book appointments, view prescriptions, find doctors
- **DOCTOR**: Manage appointments, issue prescriptions, view patient records
- **PHARMACY**: Process prescriptions, manage inventory, handle settlements
- **ADMIN**: System management and analytics

### Authentication System
**Dual Authentication**: The platform uses both NextAuth.js (for web sessions) and JWT tokens (for API authentication):
- NextAuth handles session-based authentication with support for:
  - Credentials (email/password)
  - Social login (Kakao, Naver)
  - Email magic links
- JWT tokens (`src/lib/auth.ts`) authenticate API requests
- Token verification middleware checks role-based access control

**Important**: When calling APIs from client components, include credentials and proper authorization headers:
```typescript
fetch('/api/endpoint', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Authorization': `Bearer ${token}` }
})
```

### Database Architecture (Prisma + MySQL)
**Core Models**:
- `users`: Multi-role user table with role-specific fields (specialization for doctors, pharmacyName for pharmacies)
- `appointments`: Links patients, doctors, and departments with status tracking
- `prescriptions`: Links appointments, prescriptions, and prescription_medications
- `clinic_fees`: Stores consultation fees by doctor, department, and type
- `pharmacy_inventory`: Tracks medication stock levels per pharmacy

**Key Relationships**:
- Appointments have bidirectional relations: `appointments_doctorIdTousers` and `appointments_patientIdTousers`
- Prescriptions support optional pharmacy assignment for pharmacy workflow integration
- Department-based consultation types: "OFFLINE" or "ONLINE"

### Project Structure
```
src/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes organized by domain
│   │   ├── auth/          # Authentication endpoints
│   │   ├── appointments/  # Appointment CRUD
│   │   ├── patient/       # Patient-specific APIs
│   │   ├── doctor/        # Doctor-specific APIs
│   │   └── pharmacy/      # Pharmacy-specific APIs
│   ├── patient/           # Patient dashboard pages
│   ├── doctor/            # Doctor dashboard pages
│   ├── pharmacy/          # Pharmacy dashboard pages
│   └── admin/             # Admin dashboard pages
├── components/
│   ├── dashboard/         # DashboardLayout - role-aware navigation
│   ├── appointments/      # Appointment booking components
│   ├── prescription/      # Prescription PDF generation
│   └── ui/                # Radix UI + shadcn/ui components
└── lib/
    ├── auth.ts           # JWT utilities (generateToken, verifyToken)
    ├── api-client.ts     # Centralized API client
    └── utils.ts          # Tailwind utilities

prisma/
└── schema.prisma         # Database schema with all models

scripts/                  # Database utility scripts
tests/                    # Development test files
```

### API Route Patterns
**Role-Based Routes**: APIs are organized by user role with strict access control:
- `/api/patient/*` - Patient-specific endpoints (view appointments, prescriptions)
- `/api/doctor/*` - Doctor-specific endpoints (manage appointments, issue prescriptions)
- `/api/pharmacy/*` - Pharmacy-specific endpoints (process prescriptions, inventory)
- `/api/admin/*` - Admin-only endpoints (stats, system management)

**Authentication Pattern**: Most API routes follow this structure:
```typescript
// 1. Extract and verify token
const authHeader = req.headers.get('authorization')
const token = getTokenFromAuthHeader(authHeader)
const payload = verifyToken(token)

// 2. Check role authorization
if (payload.role !== 'EXPECTED_ROLE') {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
}

// 3. Perform operation with user context
```

### Component Architecture
**DashboardLayout Component**: Central layout component that adapts navigation and styling based on user role. Each role has:
- Custom navigation items
- Role-specific color schemes (bg-patient, bg-doctor, bg-pharmacy, bg-admin)
- Role-aware logout redirect

**Shared Components**:
- All UI components use Radix UI primitives with Tailwind styling
- PDF generation uses `@react-pdf/renderer` for prescriptions
- Form components leverage Radix Select, Label, and custom components

### Key Implementation Details
**Consultation Types**: The platform supports both offline and online consultations:
- Each doctor's `clinic_fees` specifies pricing for "OFFLINE" and "ONLINE" types
- Doctors have `hasOfflineConsultation` and `hasOnlineConsultation` boolean flags
- Department's `consultationType` field determines availability

**Prescription Workflow**:
1. Doctor creates prescription linked to appointment
2. `prescriptionNumber` is auto-generated unique identifier
3. `prescription_medications` stores individual medication items
4. Status flows: ISSUED → (optional) assigned to pharmacy → FILLED
5. PDF generation available for both patients and pharmacies

**Korean Localization**: UI text is primarily in Korean - maintain this when adding features.

## Environment Variables
Required in `.env`:
```
DATABASE_URL="mysql://..."
NEXTAUTH_SECRET="..."
JWT_SECRET="..."
KAKAO_CLIENT_ID="..."
KAKAO_CLIENT_SECRET="..."
NAVER_CLIENT_ID="..."
NAVER_CLIENT_SECRET="..."
```

## Common Development Patterns

### Adding a New API Route
1. Create route file in appropriate role directory: `src/app/api/{role}/{feature}/route.ts`
2. Implement JWT authentication and role verification
3. Use Prisma client for database operations
4. Return proper NextResponse with error handling

### Adding a New Page
1. Create page in role directory: `src/app/{role}/{feature}/page.tsx`
2. Use `"use client"` directive if client-side features needed
3. Fetch data using role-specific API routes
4. Wrap with DashboardLayout or create custom layout

### Working with Prisma
- Always regenerate Prisma client after schema changes: `npx prisma generate`
- Use relation names exactly as defined in schema (e.g., `appointments_doctorIdTousers`)
- Include all required fields when creating records (id, timestamps, foreign keys)

### Testing Changes
- Type-check before committing: `npm run type-check`
- Test role-based access control by logging in as different user types
- Verify API endpoints with test scripts in `tests/` directory
- Check database state with Prisma Studio: `npx prisma studio`

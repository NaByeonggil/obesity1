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

# Create admin account
npx ts-node scripts/create-admin.ts
```

## Architecture Overview

### Multi-Role Healthcare Platform
This is a Korean healthcare platform with four distinct user roles, each with separate dashboards and permissions:
- **PATIENT**: Book appointments, view prescriptions, find doctors
- **DOCTOR**: Manage appointments, issue prescriptions, view patient records
- **PHARMACY**: Process prescriptions, manage inventory, handle settlements
- **ADMIN**: System management and analytics

### Authentication System
**Dual Authentication**: The platform uses both NextAuth.js (primary) and JWT tokens (secondary for Flutter app):

**NextAuth.js (Primary - Web)**:
- Session-based authentication using `getServerSession(authOptions)`
- Supports multiple providers:
  - Credentials (email/password)
  - Social login (Kakao, Naver)
  - Email magic links
- Most API routes use this pattern for authentication

**JWT Tokens (Secondary - Mobile App)**:
- Some routes (e.g., `/api/patient/appointments`) support both NextAuth sessions AND JWT tokens
- JWT utilities in `src/lib/auth.ts`: `generateToken`, `verifyToken`, `getTokenFromAuthHeader`
- Enables Flutter/mobile app integration alongside web sessions

**Important**: When calling APIs:
- **From web components**: Use `credentials: 'include'` to send session cookies
- **From mobile apps**: Include JWT in Authorization header: `Bearer ${token}`
- Some routes accept both authentication methods

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

**Authentication Patterns**:

Most API routes use NextAuth session-based authentication:
```typescript
// 1. Get server session
const session = await getServerSession(authOptions)

// 2. Verify user is logged in
if (!session || !session.user) {
  return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
}

// 3. Check role authorization
if (session.user.role?.toLowerCase() !== 'expected_role') {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
}

// 4. Perform operation with session.user.id
```

Some routes support dual authentication (NextAuth + JWT):
```typescript
// 1. Check both auth methods
const session = await getServerSession(authOptions)
const tokenUser = getUserFromToken(request) // JWT fallback

// 2. Use either authentication source
const user = session?.user || tokenUser
const userId = session?.user?.id || tokenUser?.userId
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

**Admin Features**: Comprehensive admin panel for system management:
- Dashboard with real-time statistics (users, appointments, prescriptions, growth trends)
- User management (list, search, filter, edit, delete)
- Role-based access control (only ADMIN role can access)
- System monitoring and alerts
- See `ADMIN-FEATURES.md` for detailed documentation

## Environment Variables
Required in `.env`:
```bash
# Database
DATABASE_URL="mysql://user:password@host:3306/database"

# Authentication
NEXTAUTH_SECRET="..."
JWT_SECRET="..."
NEXTAUTH_URL="https://obesity.ai.kr" # or http://localhost:3000 for dev

# Social Login
KAKAO_CLIENT_ID="..."
KAKAO_CLIENT_SECRET="..."
NAVER_CLIENT_ID="..."
NAVER_CLIENT_SECRET="..."
```

Production environment (`.env.production`):
```bash
DATABASE_URL="mysql://root:password@obesity1-mysql-1:3306/medical_db"
NEXTAUTH_URL="https://obesity.ai.kr"
```

## Common Development Patterns

### Adding a New API Route
1. Create route file in appropriate role directory: `src/app/api/{role}/{feature}/route.ts`
2. Import and use NextAuth session: `import { getServerSession } from 'next-auth'`
3. Verify authentication with `getServerSession(authOptions)`
4. Check role authorization: `session.user.role?.toLowerCase() === 'expected_role'`
5. Use Prisma client for database operations
6. Always call `await prisma.$disconnect()` in `finally` block
7. Return proper NextResponse with Korean error messages for consistency

### Adding a New Page
1. Create page in role directory: `src/app/{role}/{feature}/page.tsx`
2. Use `"use client"` directive if client-side features needed
3. Fetch data using role-specific API routes
4. Wrap with DashboardLayout or create custom layout

### Working with Prisma
- Always regenerate Prisma client after schema changes: `npx prisma generate`
- Use relation names exactly as defined in schema (e.g., `appointments_doctorIdTousers`)
- Include all required fields when creating records (id, timestamps, foreign keys)
- Generate unique IDs using pattern: `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
- Always disconnect in finally block: `await prisma.$disconnect()`
- Use `PrismaClient` or import from `@/lib/prisma` depending on existing pattern in similar routes

### Testing Changes
- Type-check before committing: `npm run type-check`
- Test role-based access control by logging in as different user types
- Verify API endpoints with test scripts in `tests/` directory
- Check database state with Prisma Studio: `npx prisma studio`

## Deployment

### Docker Production Deployment
The platform is deployed using Docker with the following services:
- **App**: Next.js application (port 3000 internal, 443 external via nginx)
- **MySQL**: Database service (port 3306 internal)
- **Nginx**: Reverse proxy with SSL/TLS (port 80, 443)

```bash
# Full deployment
./deploy.sh

# Manual deployment
docker-compose -f docker-compose.production.yml up -d --build

# SSL certificate setup
./setup-ssl.sh
```

**Important**: The platform is deployed at `https://obesity.ai.kr` with Let's Encrypt SSL certificates. See `docs/deployment/` for detailed deployment guides.

### Systemd Auto-start (Optional)
Use `install-service.sh` or `setup-autostart.sh` to configure automatic startup on system boot. See `AUTO-START-SETUP.md` for details.

## Additional Features

### Notifications System
- User notifications stored in `user_notifications` table
- System alerts in `system_alerts` table
- `NotificationBell` component displays real-time notifications in dashboard header
- API endpoints at `/api/notifications/`

### Prescription PDF Generation
- Uses `@react-pdf/renderer` for PDF creation
- Component: `src/components/prescription/PrescriptionPDF.tsx`
- PDFs stored in `public/prescriptions/` directory
- Naming pattern: `presc_{timestamp}_{uniqueId}_{patientName}_{date}.pdf`

### Geolocation Features
- Pharmacies have `latitude` and `longitude` fields for location-based features
- Medication pharmacy finder feature in patient dashboard
- Scripts available in `scripts/` for updating pharmacy coordinates

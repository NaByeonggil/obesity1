# 의료 앱 모노리식 아키텍처 추천 방식

## 목차
1. [전체 프로젝트 구조](#1-전체-프로젝트-구조-모노레포)
2. [웹 애플리케이션 구조](#2-웹-애플리케이션-구조-nextjs)
3. [비즈니스 로직 계층 구조](#3-비즈니스-로직-계층-구조)
4. [상태 관리 및 데이터 페칭](#4-상태-관리-및-데이터-페칭)
5. [컴포넌트 구조](#5-컴포넌트-구조)
6. [인증 및 권한 관리](#6-인증-및-권한-관리)
7. [배포 및 인프라](#7-배포-및-인프라)
8. [개발 환경 설정](#8-개발-환경-설정)
9. [핵심 장점 요약](#9-핵심-장점-요약)

## 1. 전체 프로젝트 구조 (모노레포)

### 1.1 최적화된 폴더 구조

```
medical-platform/
├── apps/
│   ├── web/                    # Next.js 웹 애플리케이션
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── (auth)/     # 인증 관련 페이지
│   │   │   │   │   ├── login/
│   │   │   │   │   └── register/
│   │   │   │   ├── patient/    # 일반인 페이지
│   │   │   │   ├── doctor/     # 의사 페이지  
│   │   │   │   ├── pharmacy/   # 약국 페이지
│   │   │   │   └── api/        # API 라우트
│   │   │   ├── components/     # 컴포넌트
│   │   │   ├── lib/           # 유틸리티
│   │   │   └── types/         # 타입 정의
│   │   ├── package.json
│   │   └── next.config.js
│   │
│   └── mobile/                 # Flutter 모바일 앱
│       ├── lib/
│       ├── android/
│       ├── ios/
│       └── pubspec.yaml
│
├── packages/                   # 공유 패키지
│   ├── ui/                    # 공통 UI 컴포넌트
│   ├── database/              # DB 스키마 & 마이그레이션
│   ├── types/                 # 공통 타입 정의
│   ├── utils/                 # 공통 유틸리티
│   └── constants/             # 상수 정의
│
├── infrastructure/            # 인프라 설정
│   ├── docker/
│   ├── nginx/
│   └── ssl/
│
├── package.json              # 루트 패키지 관리
├── turbo.json               # Turborepo 설정
├── docker-compose.yml       # 개발/배포 환경
└── README.md
```

### 1.2 루트 패키지 설정

```json
// package.json
{
  "name": "medical-platform",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "deploy": "docker-compose up -d",
    "db:migrate": "cd packages/database && npm run migrate",
    "db:seed": "cd packages/database && npm run seed"
  },
  "devDependencies": {
    "turbo": "^1.10.0",
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0"
  }
}
```

## 2. 웹 애플리케이션 구조 (Next.js)

### 2.1 앱 라우터 구조

```typescript
// apps/web/src/app/layout.tsx
import { Inter } from 'next/font/google'
import { Providers } from '@/providers'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
```

### 2.2 역할별 레이아웃

```typescript
// apps/web/src/app/patient/layout.tsx
import { PatientNavigation } from '@/components/patient/Navigation'
import { checkUserRole } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function PatientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await checkUserRole()
  
  if (!user || user.role !== 'patient') {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <PatientNavigation user={user} />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
```

### 2.3 통합 API 구조

```typescript
// apps/web/src/app/api/appointments/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { validateToken } from '@/lib/auth'
import { AppointmentService } from '@/lib/services/appointment'

export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const user = await validateToken(request)
    if (!user) {
      return NextResponse.json({ error: '인증 필요' }, { status: 401 })
    }

    // 요청 데이터 파싱
    const appointmentData = await request.json()

    // 비즈니스 로직 실행
    const appointmentService = new AppointmentService()
    const appointment = await appointmentService.create({
      ...appointmentData,
      patientId: user.id
    })

    return NextResponse.json({ 
      success: true, 
      data: appointment 
    })

  } catch (error) {
    console.error('예약 생성 오류:', error)
    return NextResponse.json(
      { error: '예약 생성에 실패했습니다' }, 
      { status: 500 }
    )
  }
}
```

## 3. 비즈니스 로직 계층 구조

### 3.1 서비스 레이어 패턴

```typescript
// apps/web/src/lib/services/appointment.ts
import { db } from '@medical-platform/database'
import { NotificationService } from './notification'
import { UserService } from './user'

export class AppointmentService {
  private notificationService = new NotificationService()
  private userService = new UserService()

  async create(appointmentData: CreateAppointmentData) {
    // 1. 데이터 검증
    await this.validateAppointmentData(appointmentData)

    // 2. 의사 가용성 확인
    const isAvailable = await this.checkDoctorAvailability(
      appointmentData.doctorId,
      appointmentData.date,
      appointmentData.time
    )

    if (!isAvailable) {
      throw new Error('선택한 시간에 예약이 불가능합니다')
    }

    // 3. 데이터베이스 트랜잭션
    const appointment = await db.transaction(async (tx) => {
      // 예약 생성
      const newAppointment = await tx.appointment.create({
        data: appointmentData
      })

      // 의사 스케줄 업데이트
      await tx.doctorSchedule.update({
        where: {
          doctorId: appointmentData.doctorId,
          date: appointmentData.date,
          time: appointmentData.time
        },
        data: { isBooked: true }
      })

      return newAppointment
    })

    // 4. 후속 작업 (알림 등)
    await this.handlePostCreation(appointment)

    return appointment
  }

  private async handlePostCreation(appointment: Appointment) {
    try {
      // 환자에게 알림
      const patient = await this.userService.findById(appointment.patientId)
      await this.notificationService.sendAppointmentConfirmation(
        patient.email,
        appointment
      )

      // 의사에게 알림
      const doctor = await this.userService.findById(appointment.doctorId)
      await this.notificationService.sendNewAppointmentAlert(
        doctor.email,
        appointment
      )
    } catch (error) {
      // 알림 실패는 전체 프로세스를 중단시키지 않음
      console.error('알림 발송 실패:', error)
    }
  }
}
```

### 3.2 데이터베이스 스키마

```prisma
// packages/database/prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String   @map("password_hash")
  role          UserRole
  status        UserStatus @default(ACTIVE)
  emailVerified Boolean  @default(false) @map("email_verified")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  // 관계
  patientProfile PatientProfile?
  doctorProfile  DoctorProfile?
  pharmacyProfile PharmacyProfile?
  appointments   Appointment[]
  prescriptions  Prescription[]

  @@map("users")
}

model Appointment {
  id          String            @id @default(cuid())
  patientId   String           @map("patient_id")
  doctorId    String           @map("doctor_id")
  clinicId    String           @map("clinic_id")
  date        DateTime
  time        String
  type        AppointmentType  // ONLINE, OFFLINE
  status      AppointmentStatus @default(PENDING)
  symptoms    String?
  notes       String?
  createdAt   DateTime         @default(now()) @map("created_at")
  updatedAt   DateTime         @updatedAt @map("updated_at")

  @@map("appointments")
}

enum UserRole {
  PATIENT
  DOCTOR
  PHARMACY
  ADMIN
}

enum AppointmentType {
  ONLINE
  OFFLINE
}

enum AppointmentStatus {
  PENDING
  CONFIRMED
  CANCELLED
  COMPLETED
}
```

## 4. 상태 관리 및 데이터 페칭

### 4.1 React Query + Zustand 조합

```typescript
// apps/web/src/lib/stores/auth.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  role: 'patient' | 'doctor' | 'pharmacy' | 'admin'
  profile: any
}

interface AuthState {
  user: User | null
  token: string | null
  login: (user: User, token: string) => void
  logout: () => void
  updateProfile: (profile: any) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      login: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
      updateProfile: (profile) => set(state => ({
        user: state.user ? { ...state.user, profile } : null
      })),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
)
```

### 4.2 API 훅스

```typescript
// apps/web/src/lib/hooks/useAppointments.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/lib/stores/auth'

export function useAppointments() {
  const { token } = useAuthStore()
  
  return useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const response = await fetch('/api/appointments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) throw new Error('예약 조회 실패')
      return response.json()
    },
    enabled: !!token
  })
}

export function useCreateAppointment() {
  const { token } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateAppointmentData) => {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || '예약 생성 실패')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      queryClient.invalidateQueries({ queryKey: ['doctor-schedule'] })
    }
  })
}
```

## 5. 컴포넌트 구조

### 5.1 공통 UI 컴포넌트

```typescript
// packages/ui/src/Button.tsx
import { cn } from '@medical-platform/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        patient: "bg-blue-600 text-white hover:bg-blue-700",
        doctor: "bg-green-600 text-white hover:bg-green-700",
        pharmacy: "bg-orange-600 text-white hover:bg-orange-700",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export const Button = ({ className, variant, size, ...props }) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}
```

## 6. 인증 및 권한 관리

### 6.1 미들웨어 설정

```typescript
// apps/web/middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 보호된 경로 정의
  const protectedPaths = ['/patient', '/doctor', '/pharmacy', '/admin']
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))
  
  if (!isProtectedPath) {
    return NextResponse.next()
  }

  // 토큰 확인
  const token = request.cookies.get('auth-token')?.value
  
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const payload = await verifyToken(token)
  
  if (!payload) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 역할 기반 접근 제어
  const userRole = payload.role as string
  const requiredRole = pathname.split('/')[1]
  
  if (userRole !== requiredRole && requiredRole !== 'api') {
    return NextResponse.redirect(new URL(`/${userRole}/dashboard`, request.url))
  }

  return NextResponse.next()
}
```

## 7. 배포 및 인프라

### 7.1 Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=mysql://root:password@database:3306/medical_platform
      - JWT_SECRET=${JWT_SECRET}
      - NEXT_PUBLIC_APP_URL=http://localhost:3000
    depends_on:
      - database
    restart: unless-stopped

  database:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=password
      - MYSQL_DATABASE=medical_platform
      - MYSQL_USER=app_user
      - MYSQL_PASSWORD=app_password
    volumes:
      - mysql_data:/var/lib/mysql
      - ./packages/database/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "3306:3306"
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./infrastructure/nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./infrastructure/ssl:/etc/nginx/ssl
    depends_on:
      - web
    restart: unless-stopped

volumes:
  mysql_data:
```

## 8. 개발 환경 설정

### 8.1 환경 변수

```bash
# .env.local
DATABASE_URL="mysql://root:password@localhost:3306/medical_platform"
JWT_SECRET="your-super-secret-jwt-key"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# 소셜 로그인
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
KAKAO_CLIENT_ID="your-kakao-client-id"
KAKAO_CLIENT_SECRET="your-kakao-client-secret"

# 파일 업로드
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE="10485760" # 10MB

# 알림 설정
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# 결제 (토스페이먼츠)
TOSS_CLIENT_KEY="your-toss-client-key"
TOSS_SECRET_KEY="your-toss-secret-key"
```

### 8.2 개발 스크립트

```json
{
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "start": "turbo run start",
    "lint": "turbo run lint",
    "test": "turbo run test",
    
    "db:generate": "cd packages/database && npx prisma generate",
    "db:migrate": "cd packages/database && npx prisma migrate dev",
    "db:seed": "cd packages/database && npx prisma db seed",
    "db:studio": "cd packages/database && npx prisma studio",
    
    "docker:dev": "docker-compose -f docker-compose.dev.yml up",
    "docker:prod": "docker-compose up -d",
    "docker:logs": "docker-compose logs -f"
  }
}
```

## 9. 핵심 장점 요약

### 9.1 개발 효율성

- ✅ **모든 기능이 한 프로젝트에** → 빠른 개발
- ✅ **공통 컴포넌트 재사용** → 중복 코드 최소화
- ✅ **타입 안정성** → TypeScript로 전체 일관성
- ✅ **통합 테스트 용이** → 전체 플로우 테스트 가능

### 9.2 운영 효율성

- ✅ **단일 배포** → docker-compose up 한 명령
- ✅ **단일 모니터링** → 하나의 로그 파일
- ✅ **단일 데이터베이스** → 트랜잭션 보장
- ✅ **간단한 스케일링** → 서버 수만 늘리면 됨

### 9.3 비용 효율성

- ✅ **최소 인프라** → 서버 1대 + DB 1개
- ✅ **적은 인력** → 풀스택 개발자 2-3명으로 충분
- ✅ **빠른 출시** → 3개월 내 MVP 완성 가능

### 9.4 확장 전략

```
1단계: 모노리식으로 시작 (현재)
  ↓
2단계: 사용자 증가 시 수평 확장
  ↓  
3단계: 병목 지점 식별
  ↓
4단계: 핵심 서비스만 분리 (선택적)
  ↓
5단계: 완전한 마이크로서비스 (필요시)
```

## 결론

이 모노리식 아키텍처는 **의료 앱 프로젝트에 최적화**되어 있으며, 다음과 같은 이점을 제공합니다:

- **빠른 개발 및 출시**: 3개월 내 MVP 완성 가능
- **낮은 운영 복잡성**: 단순한 배포 및 모니터링
- **비용 효율성**: 최소 인프라로 시작
- **확장 가능성**: 필요에 따라 점진적으로 마이크로서비스 전환 가능

**추천 시작 방식**: 먼저 모노리식으로 빠르게 출시하고, 사용자 피드백을 받으며 성장한 후 필요에 따라 서비스를 분리하는 것이 가장 현실적이고 효율적인 접근법입니다.

---

## 추가 참고 자료

### 기술 스택 상세 정보

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: MySQL 8.0 / MariaDB
- **State Management**: Zustand + React Query
- **Authentication**: NextAuth.js + JWT
- **Deployment**: Docker + Docker Compose
- **Mobile**: Flutter (별도 개발)

### 권장 개발 순서

1. **1주차**: 프로젝트 세팅 및 기본 구조 구성
2. **2-3주차**: 인증 시스템 및 사용자 관리
3. **4-6주차**: 예약 시스템 구현
4. **7-8주차**: 처방전 관리 시스템
5. **9-10주차**: 알림 및 결제 시스템
6. **11-12주차**: 테스트 및 배포 준비

이 가이드를 따라 개발하시면 안정적이고 확장 가능한 의료 플랫폼을 구축할 수 있습니다.

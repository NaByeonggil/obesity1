import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    // 관리자 권한 확인
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다." },
        { status: 403 }
      )
    }

    // 1. 전체 사용자 통계
    const totalUsers = await prisma.user.count()

    // 2. 역할별 사용자 수
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        role: true
      }
    })

    const roleStats = usersByRole.reduce((acc, group) => {
      acc[group.role.toLowerCase()] = group._count.role
      return acc
    }, {} as Record<string, number>)

    // 3. 최근 가입 통계
    const today = new Date()
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const oneMonthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    const [weeklySignups, monthlySignups, todaySignups] = await Promise.all([
      prisma.user.count({
        where: {
          createdAt: { gte: oneWeekAgo }
        }
      }),
      prisma.user.count({
        where: {
          createdAt: { gte: oneMonthAgo }
        }
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(today.getFullYear(), today.getMonth(), today.getDate())
          }
        }
      })
    ])

    // 4. 활동 통계
    const [totalAppointments, totalPrescriptions] = await Promise.all([
      prisma.appointment.count(),
      prisma.prescription.count()
    ])

    // 5. 시스템 알림 수
    const systemAlerts = await prisma.systemAlert.count({
      where: {
        resolved: false
      }
    })

    // 6. 일일 거래 수 (오늘의 예약 + 처방전)
    const todayTransactions = await Promise.all([
      prisma.appointment.count({
        where: {
          createdAt: {
            gte: new Date(today.getFullYear(), today.getMonth(), today.getDate())
          }
        }
      }),
      prisma.prescription.count({
        where: {
          createdAt: {
            gte: new Date(today.getFullYear(), today.getMonth(), today.getDate())
          }
        }
      })
    ])

    const dailyTransactions = todayTransactions[0] + todayTransactions[1]

    // 7. 활성 사용자 (최근 30일 내 활동)
    const activeUsers = await prisma.user.count({
      where: {
        OR: [
          {
            patientAppointments: {
              some: {
                createdAt: { gte: oneMonthAgo }
              }
            }
          },
          {
            doctorAppointments: {
              some: {
                createdAt: { gte: oneMonthAgo }
              }
            }
          }
        ]
      }
    })

    // 8. 소셜 로그인 통계
    const socialAccounts = await prisma.account.groupBy({
      by: ['provider'],
      _count: {
        provider: true
      }
    })

    const socialLoginStats = socialAccounts.reduce((acc, group) => {
      acc[group.provider] = group._count.provider
      return acc
    }, {} as Record<string, number>)

    // 응답 데이터 구성
    const stats = {
      // 기본 통계
      totalUsers,
      activeUsers,
      systemAlerts,
      dailyTransactions,

      // 역할별 통계
      usersByRole: {
        patients: roleStats.patient || 0,
        doctors: roleStats.doctor || 0,
        pharmacies: roleStats.pharmacy || 0,
        admins: roleStats.admin || 0
      },

      // 가입 통계
      signupStats: {
        today: todaySignups,
        thisWeek: weeklySignups,
        thisMonth: monthlySignups
      },

      // 활동 통계
      activityStats: {
        totalAppointments,
        totalPrescriptions,
        dailyTransactions
      },

      // 소셜 로그인 통계
      socialLoginStats,

      // 성장률 계산 (임시로 랜덤값, 실제로는 이전 기간과 비교)
      trends: {
        usersGrowth: Math.floor(Math.random() * 20) + 5, // 5-25%
        appointmentsGrowth: Math.floor(Math.random() * 15) + 3, // 3-18%
        prescriptionsGrowth: Math.floor(Math.random() * 12) + 2 // 2-14%
      }
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error("Admin stats error:", error)
    return NextResponse.json(
      { error: "통계 정보를 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
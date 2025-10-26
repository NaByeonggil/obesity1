import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const prisma = new PrismaClient()

// 알림 조회
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const user = await prisma.users.findUnique({
      where: { email: session.user.email! }
    })

    if (!user) {
      return NextResponse.json(
        { error: '사용자 정보를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 사용자의 알림 조회
    const notifications = await prisma.user_notifications.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50 // 최근 50개
    })

    // 읽지 않은 알림 개수
    const unreadCount = await prisma.user_notifications.count({
      where: {
        userId: user.id,
        read: false
      }
    })

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount
    })
  } catch (error) {
    console.error('알림 조회 오류:', error)
    return NextResponse.json(
      { error: '알림 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 알림 읽음 처리
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { notificationId, markAllAsRead } = body

    const user = await prisma.users.findUnique({
      where: { email: session.user.email! }
    })

    if (!user) {
      return NextResponse.json(
        { error: '사용자 정보를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (markAllAsRead) {
      // 모든 알림 읽음 처리
      await prisma.user_notifications.updateMany({
        where: {
          userId: user.id,
          read: false
        },
        data: {
          read: true
        }
      })

      return NextResponse.json({
        success: true,
        message: '모든 알림을 읽음 처리했습니다.'
      })
    } else if (notificationId) {
      // 특정 알림 읽음 처리
      const notification = await prisma.user_notifications.findUnique({
        where: { id: notificationId }
      })

      if (!notification || notification.userId !== user.id) {
        return NextResponse.json(
          { error: '알림을 찾을 수 없습니다.' },
          { status: 404 }
        )
      }

      await prisma.user_notifications.update({
        where: { id: notificationId },
        data: { read: true }
      })

      return NextResponse.json({
        success: true,
        message: '알림을 읽음 처리했습니다.'
      })
    }

    return NextResponse.json(
      { error: '잘못된 요청입니다.' },
      { status: 400 }
    )
  } catch (error) {
    console.error('알림 업데이트 오류:', error)
    return NextResponse.json(
      { error: '알림 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      orderBy: [
        { featured: 'desc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json({ departments })

  } catch (error) {
    console.error('Get departments error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
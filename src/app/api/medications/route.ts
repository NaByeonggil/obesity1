import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const medications = await prisma.medication.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({ medications })

  } catch (error) {
    console.error('Get medications error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
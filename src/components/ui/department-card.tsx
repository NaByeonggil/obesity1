"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface DepartmentCardProps {
  title: string
  subtitle?: string
  description: string
  icon: LucideIcon
  available: 'online' | 'offline' | 'both'
  color: string
  href: string
  featured?: boolean
  requireLogin?: boolean
}

export function DepartmentCard({
  title,
  subtitle,
  description,
  icon: Icon,
  available,
  color,
  href,
  featured = false,
  requireLogin = false
}: DepartmentCardProps) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // localStorage에서 토큰 확인
    const token = localStorage.getItem('auth-token')
    setIsAuthenticated(!!token)
  }, [])

  const handleClick = (e: React.MouseEvent) => {
    console.log('Card clicked:', { requireLogin, isAuthenticated, href })
    if (requireLogin && !isAuthenticated) {
      e.preventDefault()
      console.log('Redirecting to login:', '/auth/login?callbackUrl=' + encodeURIComponent(href))
      router.push('/auth/login?callbackUrl=' + encodeURIComponent(href))
      return
    }
    // 로그인이 되어있으면 일반적인 링크 동작
    if (requireLogin && isAuthenticated) {
      e.preventDefault()
      router.push(href)
      return
    }
  }

  const CardComponent = (
    <Card className={cn(
      "group relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer h-full",
      featured && "ring-2 ring-blue-500 shadow-lg"
    )}>
      {featured && (
        <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-500 to-green-500 text-white text-xs px-2 py-0.5 md:px-3 md:py-1 rounded-bl-lg z-10">
          추천
        </div>
      )}

      <CardContent className="p-3 md:p-6 h-full flex flex-col">
        <div className="flex flex-col items-center text-center space-y-2 md:space-y-4">
          {/* Icon Container - 모바일에서 크기 축소 */}
          <div className={cn(
            "w-12 h-12 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110",
            color
          )}>
            <Icon className="h-6 w-6 md:h-10 md:w-10 text-white" />
          </div>

          {/* Title and Subtitle - 모바일에서 폰트 크기 조정 */}
          <div className="min-h-[2.5rem] md:min-h-[3rem]">
            <h3 className="text-sm md:text-lg font-bold text-gray-900 leading-tight">{title}</h3>
            {subtitle && (
              <p className="text-xs md:text-sm text-gray-600 mt-0.5 md:mt-1">{subtitle}</p>
            )}
          </div>

          {/* Description - 모바일에서는 숨김 또는 축소 */}
          <p className="text-xs md:text-sm text-gray-600 line-clamp-2 hidden md:block">
            {description}
          </p>

          {/* Available Badge - 모바일에서 크기 축소 */}
          <Badge
            className="text-xs md:text-sm px-2 py-0.5 md:px-2.5 md:py-0.5"
            variant={available === 'both' ? 'default' : available === 'online' ? 'secondary' : 'outline'}
          >
            {available === 'both' ? '대면/비대면' : available === 'online' ? '비대면' : '대면'}
          </Badge>

          {/* 로그인 필요 시 로그인 버튼 표시 */}
          {requireLogin && !isAuthenticated && (
            <div className="mt-2">
              <button className="bg-blue-500 hover:bg-blue-600 text-white text-xs md:text-sm px-3 py-1.5 md:px-4 md:py-2 rounded-full transition-colors duration-200">
                로그인 후 이용
              </button>
            </div>
          )}
        </div>
      </CardContent>

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </Card>
  )

  return requireLogin ? (
    <div onClick={handleClick}>
      {CardComponent}
    </div>
  ) : (
    <Link href={href}>
      {CardComponent}
    </Link>
  )
}
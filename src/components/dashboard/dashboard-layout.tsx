"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn, getRoleColor } from "@/lib/utils"
import { UserRole } from "@/types"
import {
  Heart,
  Home,
  Calendar,
  Users,
  FileText,
  Settings,
  Bell,
  Menu,
  X,
  LogOut,
  Stethoscope,
  Pill,
  Shield,
  UserCheck,
  User
} from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
  userRole: UserRole
  user: {
    name: string
    email: string
    avatar?: string
  } | null
}

export function DashboardLayout({ children, userRole, user }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const navigation = getNavigationItems(userRole)
  const roleConfig = getRoleConfig(userRole)

  // 역할별 로그아웃 후 리다이렉트 URL 결정
  const getRedirectUrl = (role: UserRole) => {
    switch (role) {
      case 'doctor':
        return '/auth/login?role=doctor'
      case 'pharmacy':
        return '/auth/login?role=pharmacy'
      case 'admin':
        return '/auth/login?role=admin'
      case 'patient':
      default:
        return '/'
    }
  }

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })

      const redirectUrl = getRedirectUrl(userRole)

      if (response.ok) {
        console.log(`로그아웃 성공 - ${userRole} → ${redirectUrl}`)
        router.push(redirectUrl)
      } else {
        console.error('Logout failed')
        // 실패해도 적절한 페이지로 리다이렉트
        router.push(redirectUrl)
      }
    } catch (error) {
      console.error('Logout error:', error)
      // 오류가 발생해도 적절한 페이지로 리다이렉트
      const redirectUrl = getRedirectUrl(userRole)
      router.push(redirectUrl)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b">
            <button
              onClick={() => router.push('/')}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className={cn("p-2 rounded-lg text-white", roleConfig.bgColor)}>
                <Heart className="h-6 w-6" />
              </div>
              <span className="text-lg font-semibold text-gray-900">
                헬스케어
              </span>
            </button>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User Info */}
          <div className="p-4 border-b">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className={cn("text-white", roleConfig.bgColor)}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name || "사용자"}
                </p>
                <div className="flex items-center space-x-2">
                  <Badge variant={userRole as any} className="text-xs">
                    {roleConfig.label}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? cn("text-white", roleConfig.bgColor)
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5 flex-shrink-0",
                      isActive ? "text-white" : "text-gray-400 group-hover:text-gray-500"
                    )}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-600 hover:text-gray-900"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              로그아웃
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="ml-2 text-lg font-semibold text-gray-900 lg:ml-0">
                {roleConfig.dashboardTitle}
              </h1>
            </div>

            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
              </Button>
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className={cn("text-white text-xs", roleConfig.bgColor)}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

function getNavigationItems(role: UserRole) {
  const baseItems = [
    { name: "대시보드", href: `/${role}`, icon: Home },
    { name: "일정 관리", href: `/${role}/calendar`, icon: Calendar },
    { name: "설정", href: `/${role}/settings`, icon: Settings },
  ]

  switch (role) {
    case 'patient':
      return [
        { name: "대시보드", href: "/patient", icon: Home },
        { name: "예약 내역", href: "/patient/appointments", icon: Calendar },
        { name: "처방전", href: "/patient/prescriptions", icon: FileText },
        { name: "의원 찾기", href: "/patient/clinics", icon: Stethoscope },
        { name: "예약 하기", href: "/patient/booking", icon: UserCheck }
      ]
    case 'doctor':
      return [
        { name: "대시보드", href: "/doctor", icon: Home },
        { name: "예약 관리", href: "/doctor/appointments", icon: Calendar },
        { name: "일정 관리", href: "/doctor/calendar", icon: Calendar },
        { name: "처방전 관리", href: "/doctor/prescriptions", icon: Pill },
        { name: "프로필 설정", href: "/doctor/profile", icon: User },
        { name: "설정", href: "/doctor/settings", icon: Settings }
      ]
    case 'pharmacy':
      return [
        baseItems[0],
        { name: "처방전 조제", href: "/pharmacy/prescriptions", icon: Pill },
        { name: "비급여 의약품 가격", href: "/pharmacy/medication-pricing", icon: FileText },
        { name: "고객 관리", href: "/pharmacy/customers", icon: Users },
        { name: "일일 정산", href: "/pharmacy/daily-settlement", icon: Calendar },
        { name: "프로필 설정", href: "/pharmacy/profile", icon: User }
      ]
    case 'admin':
      return [
        ...baseItems.slice(0, 2),
        { name: "사용자 관리", href: "/admin/users", icon: Users },
        { name: "시스템 관리", href: "/admin/system", icon: Settings },
        { name: "통계 및 분석", href: "/admin/analytics", icon: FileText },
        baseItems[2]
      ]
    default:
      return baseItems
  }
}

function getRoleConfig(role: UserRole) {
  switch (role) {
    case 'patient':
      return {
        label: "일반 사용자",
        bgColor: "bg-patient",
        textColor: "text-patient",
        dashboardTitle: "환자 대시보드"
      }
    case 'doctor':
      return {
        label: "의료진",
        bgColor: "bg-doctor",
        textColor: "text-doctor",
        dashboardTitle: "의료진 대시보드"
      }
    case 'pharmacy':
      return {
        label: "약사",
        bgColor: "bg-pharmacy",
        textColor: "text-pharmacy",
        dashboardTitle: "약사 대시보드"
      }
    case 'admin':
      return {
        label: "관리자",
        bgColor: "bg-admin",
        textColor: "text-admin",
        dashboardTitle: "관리자 대시보드"
      }
    default:
      return {
        label: "사용자",
        bgColor: "bg-gray-500",
        textColor: "text-gray-500",
        dashboardTitle: "대시보드"
      }
  }
}
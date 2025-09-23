"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Heart,
  Menu,
  X,
  Stethoscope,
  Calendar,
  Pill,
  Users
} from "lucide-react"

interface NavigationProps {
  className?: string
}

export function Navigation({ className }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)

  const navItems = [
    { href: "/about", label: "서비스 소개" },
    { href: "/doctors", label: "의료진 찾기" },
    { href: "/pharmacy", label: "약국 찾기" },
    { href: "/support", label: "고객지원" },
  ]

  return (
    <nav className={cn("bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg group-hover:scale-105 transition-transform">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              헬스케어
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                로그인
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="default" size="sm">
                회원가입
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-100 transition-colors"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 py-2 text-gray-600 hover:text-blue-600 transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="flex flex-col space-y-2 pt-3 border-t border-gray-200">
                <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    로그인
                  </Button>
                </Link>
                <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="default" size="sm" className="w-full justify-start">
                    회원가입
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

interface RoleCardProps {
  icon: React.ReactNode
  title: string
  description: string
  color: string
  href: string
}

export function RoleCard({ icon, title, description, color, href }: RoleCardProps) {
  return (
    <Link href={href} className="group">
      <div className={cn(
        "p-6 rounded-xl border-2 border-transparent hover:border-current transition-all duration-300 hover:shadow-lg hover:scale-105 bg-white/50 backdrop-blur-sm",
        color
      )}>
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-4 rounded-full bg-current/10 group-hover:bg-current/20 transition-colors">
            {icon}
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-sm opacity-80">{description}</p>
          </div>
        </div>
      </div>
    </Link>
  )
}
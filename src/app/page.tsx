"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navigation, RoleCard } from "@/components/ui/navigation"
import { DepartmentCard } from "@/components/ui/department-card"
import {
  Heart,
  Stethoscope,
  Calendar,
  Pill,
  Users,
  Shield,
  Clock,
  Star,
  ChevronRight,
  Play,
  ArrowRight,
  Syringe,
  Thermometer,
  Eye,
  Baby,
  Activity,
  Brain,
  Bone,
  Sparkles
} from "lucide-react"

export default function HomePage() {
  const departments = [
    {
      title: "마운자로 · 위고비",
      subtitle: "비만 치료",
      description: "GLP-1 기반 최신 비만 치료제로 체중 감량을 도와드립니다",
      icon: Syringe,
      available: 'offline' as const,
      color: "bg-gradient-to-r from-purple-500 to-pink-500",
      href: "/appointments/obesity-treatment",
      featured: true
    },
    {
      title: "비만 관련 처방",
      subtitle: "체중 관리",
      description: "전문 의료진과 함께 건강한 체중 감량 프로그램",
      icon: Activity,
      available: 'offline' as const,
      color: "bg-gradient-to-r from-orange-500 to-red-500",
      href: "/appointments/obesity",
      featured: true
    },
    {
      title: "인공눈물",
      subtitle: "안구 건조",
      description: "안구 건조증 치료를 위한 인공눈물 처방",
      icon: Eye,
      available: 'online' as const,
      color: "bg-gradient-to-r from-blue-500 to-cyan-500",
      href: "/appointments/eye-care"
    },
    {
      title: "감기 관련",
      subtitle: "일반 감기",
      description: "감기 증상 완화를 위한 처방 및 상담",
      icon: Thermometer,
      available: 'online' as const,
      color: "bg-gradient-to-r from-green-500 to-emerald-500",
      href: "/appointments/cold"
    },
    {
      title: "내과",
      subtitle: "일반 내과",
      description: "소화기, 호흡기, 순환기 등 내과 진료",
      icon: Stethoscope,
      available: 'online' as const,
      color: "bg-gradient-to-r from-indigo-500 to-purple-500",
      href: "/appointments/internal-medicine"
    },
    {
      title: "소아과",
      subtitle: "어린이 진료",
      description: "영유아 및 어린이 전문 진료 서비스",
      icon: Baby,
      available: 'online' as const,
      color: "bg-gradient-to-r from-pink-500 to-rose-500",
      href: "/appointments/pediatrics"
    },
    {
      title: "피부과",
      subtitle: "피부 질환",
      description: "여드름, 아토피, 두드러기 등 피부 질환 진료",
      icon: Sparkles,
      available: 'online' as const,
      color: "bg-gradient-to-r from-yellow-500 to-orange-500",
      href: "/appointments/dermatology"
    },
    {
      title: "정형외과",
      subtitle: "근골격계",
      description: "관절, 척추, 근육 통증 진료 및 재활 상담",
      icon: Bone,
      available: 'online' as const,
      color: "bg-gradient-to-r from-gray-600 to-gray-800",
      href: "/appointments/orthopedics"
    },
    {
      title: "신경외과",
      subtitle: "신경계 질환",
      description: "두통, 어지럼증, 신경통 등 신경계 질환 진료",
      icon: Brain,
      available: 'online' as const,
      color: "bg-gradient-to-r from-purple-600 to-indigo-600",
      href: "/appointments/neurosurgery"
    }
  ]

  const features = [
    {
      icon: <Calendar className="h-8 w-8" />,
      title: "간편한 예약",
      description: "24시간 언제든지 온라인으로 의료진 예약이 가능합니다."
    },
    {
      icon: <Pill className="h-8 w-8" />,
      title: "처방전 관리",
      description: "디지털 처방전으로 약국에서 빠르게 약을 받아보세요."
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "안전한 진료",
      description: "검증된 의료진과 안전한 온라인 진료 시스템을 제공합니다."
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "실시간 알림",
      description: "예약 확인, 진료 시간 등 중요한 정보를 실시간으로 알려드립니다."
    }
  ]

  const testimonials = [
    {
      name: "김민지",
      role: "직장인",
      content: "바쁜 일상 속에서도 쉽게 병원 예약을 할 수 있어서 정말 편리해요.",
      rating: 5
    },
    {
      name: "박성호",
      role: "의사",
      content: "환자 관리가 체계적으로 되어서 진료에 더 집중할 수 있습니다.",
      rating: 5
    },
    {
      name: "이영희",
      role: "약사",
      content: "처방전 관리가 디지털화되어 업무 효율성이 크게 향상되었습니다.",
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-green-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 animate-fade-in">
              <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                더 쉽고 안전한
              </span>
              <br />
              <span>의료 서비스의 시작</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              온라인 예약부터 처방전 관리까지, 모든 의료 서비스를 하나의 플랫폼에서 경험하세요.
              <br />
              환자, 의료진, 약사 모두를 위한 통합 헬스케어 솔루션입니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="xl" className="group">
                지금 시작하기
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="xl" className="group">
                <Play className="mr-2 h-5 w-5" />
                서비스 소개 영상
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Department Selection Section - 진료 과목 선택 */}
      <section className="py-10 md:py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 md:mb-4">
              원하시는 진료를 선택하세요
            </h2>
            <p className="text-sm md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              다양한 진료 과목을 온라인/오프라인으로 편리하게 이용할 수 있습니다
            </p>
          </div>

          {/* 모바일: 3x3 그리드, 태블릿: 3x3 그리드, 데스크톱: 3x3 그리드 */}
          <div className="grid grid-cols-3 gap-2 md:gap-4 lg:gap-6">
            {departments.map((dept, index) => (
              <DepartmentCard
                key={index}
                title={dept.title}
                subtitle={dept.subtitle}
                description={dept.description}
                icon={dept.icon}
                available={dept.available}
                color={dept.color}
                href={dept.href}
                featured={dept.featured}
              />
            ))}
          </div>

          <div className="mt-8 md:mt-12 text-center">
            <Button size="default" variant="outline" className="text-sm md:text-base">
              모든 진료 과목 보기
              <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Role Selection Section - 회원 유형 선택 */}
      <section className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              회원 유형을 선택하세요
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              각 역할에 맞는 전문 서비스를 제공합니다. 회원가입 시 선택한 유형에 따라 접근 권한이 설정됩니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 일반 회원 카드 */}
            <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-patient">
              <CardHeader className="pb-6">
                <div className="mx-auto p-4 bg-patient/10 rounded-full text-patient w-fit mb-4">
                  <Users className="h-10 w-10" />
                </div>
                <CardTitle className="text-2xl text-center">일반 회원</CardTitle>
                <CardDescription className="text-center text-base">
                  병원 예약 및 건강 관리 서비스
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-5 w-5 text-patient mt-0.5" />
                    <span className="text-sm">온라인/오프라인 진료 예약</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-5 w-5 text-patient mt-0.5" />
                    <span className="text-sm">전자 처방전 관리</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-5 w-5 text-patient mt-0.5" />
                    <span className="text-sm">진료 기록 조회</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-5 w-5 text-patient mt-0.5" />
                    <span className="text-sm">약국 찾기 및 약품 정보</span>
                  </li>
                </ul>
                <div className="flex gap-2">
                  <Link href="/auth/register?role=patient" className="flex-1">
                    <Button className="w-full bg-patient hover:bg-patient/90">
                      일반 회원으로 가입
                    </Button>
                  </Link>
                  <Link href="/patient">
                    <Button variant="outline">
                      둘러보기
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* 의사 회원 카드 */}
            <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-doctor">
              <CardHeader className="pb-6">
                <div className="mx-auto p-4 bg-doctor/10 rounded-full text-doctor w-fit mb-4">
                  <Stethoscope className="h-10 w-10" />
                </div>
                <CardTitle className="text-2xl text-center">의사 회원</CardTitle>
                <CardDescription className="text-center text-base">
                  환자 진료 및 의원 관리 서비스
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-5 w-5 text-doctor mt-0.5" />
                    <span className="text-sm">환자 예약 및 일정 관리</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-5 w-5 text-doctor mt-0.5" />
                    <span className="text-sm">비대면 진료 시스템</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-5 w-5 text-doctor mt-0.5" />
                    <span className="text-sm">전자 처방전 발급</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-5 w-5 text-doctor mt-0.5" />
                    <span className="text-sm">의원 프로필 관리</span>
                  </li>
                </ul>
                <div className="flex gap-2">
                  <Link href="/auth/register?role=doctor" className="flex-1">
                    <Button className="w-full bg-doctor hover:bg-doctor/90">
                      의사 회원으로 가입
                    </Button>
                  </Link>
                  <Link href="/doctor">
                    <Button variant="outline">
                      둘러보기
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* 약사 회원 카드 */}
            <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-pharmacy">
              <CardHeader className="pb-6">
                <div className="mx-auto p-4 bg-pharmacy/10 rounded-full text-pharmacy w-fit mb-4">
                  <Pill className="h-10 w-10" />
                </div>
                <CardTitle className="text-2xl text-center">약사 회원</CardTitle>
                <CardDescription className="text-center text-base">
                  처방전 조제 및 약국 관리 서비스
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-5 w-5 text-pharmacy mt-0.5" />
                    <span className="text-sm">전자 처방전 수령</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-5 w-5 text-pharmacy mt-0.5" />
                    <span className="text-sm">의약품 재고 관리</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-5 w-5 text-pharmacy mt-0.5" />
                    <span className="text-sm">복약 지도 및 상담</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-5 w-5 text-pharmacy mt-0.5" />
                    <span className="text-sm">보험 청구 관리</span>
                  </li>
                </ul>
                <div className="flex gap-2">
                  <Link href="/auth/register?role=pharmacy" className="flex-1">
                    <Button className="w-full bg-pharmacy hover:bg-pharmacy/90">
                      약사 회원으로 가입
                    </Button>
                  </Link>
                  <Link href="/pharmacy">
                    <Button variant="outline">
                      둘러보기
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 로그인 섹션 */}
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">이미 회원이신가요?</p>
            <Link href="/auth/login">
              <Button size="lg" variant="outline">
                로그인하기
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              왜 저희 플랫폼을 선택해야 할까요?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              현대적이고 안전한 기술로 최고의 의료 서비스 경험을 제공합니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardHeader>
                  <div className="mx-auto p-3 bg-gradient-to-r from-blue-500 to-green-500 rounded-full text-white w-fit">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              사용자들의 생생한 후기
            </h2>
            <p className="text-lg text-gray-600">
              이미 많은 분들이 만족하며 사용하고 있습니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                      <CardDescription>{testimonial.role}</CardDescription>
                    </div>
                    <div className="flex">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 italic">"{testimonial.content}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            지금 바로 시작해보세요
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            회원가입하고 더 편리한 의료 서비스를 경험해보세요
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/login">
              <Button size="xl" variant="secondary" className="group">
                무료 회원가입
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/pharmacy/search">
              <Button size="xl" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                비급여 의약품 검색
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">헬스케어</span>
              </div>
              <p className="text-gray-400 max-w-md">
                더 나은 의료 서비스를 위한 디지털 혁신을 이끌어가고 있습니다.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">서비스</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white">서비스 소개</Link></li>
                <li><Link href="/doctors" className="hover:text-white">의료진 찾기</Link></li>
                <li><Link href="/pharmacy" className="hover:text-white">약국 찾기</Link></li>
                <li><Link href="/support" className="hover:text-white">고객지원</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">고객지원</h3>
              <ul className="space-y-2 text-gray-400">
                <li>이메일: support@healthcare.com</li>
                <li>전화: 1588-1234</li>
                <li>운영시간: 평일 9:00-18:00</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 헬스케어 플랫폼. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
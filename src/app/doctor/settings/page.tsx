"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
  User,
  Mail,
  Phone,
  Lock,
  Save,
  Eye,
  EyeOff,
  Stethoscope,
  Calendar,
  Clock,
  MapPin
} from "lucide-react"

interface DoctorProfile {
  id: string
  name: string
  email: string
  phone: string | null
  avatar: string | null
  department: string | null
  specialization: string | null
  experience: number | null
  description: string | null
  workingHours: {
    start: string
    end: string
    daysOfWeek: string[]
  } | null
}

export default function DoctorSettings() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<DoctorProfile | null>(null)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // 프로필 폼 상태
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    specialization: "",
    experience: "",
    description: "",
    workingHours: {
      start: "09:00",
      end: "18:00",
      daysOfWeek: ["월", "화", "수", "목", "금"]
    }
  })

  // 비밀번호 변경 폼 상태
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  // 프로필 로드
  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      })

      if (response.ok) {
        const userData = await response.json()
        const user = userData.user
        setProfile(user)
        setProfileForm({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          department: user.department || "",
          specialization: user.specialization || "",
          experience: user.experience?.toString() || "",
          description: user.description || "",
          workingHours: user.workingHours || {
            start: "09:00",
            end: "18:00",
            daysOfWeek: ["월", "화", "수", "목", "금"]
          }
        })
      } else {
        router.push('/auth/login')
      }
    } catch (error) {
      console.error('프로필 로드 오류:', error)
      toast.error('프로필을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 프로필 업데이트
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: profileForm.name,
          phone: profileForm.phone,
          department: profileForm.department,
          specialization: profileForm.specialization,
          experience: profileForm.experience ? parseInt(profileForm.experience) : null,
          description: profileForm.description,
          workingHours: profileForm.workingHours
        }),
      })

      if (response.ok) {
        toast.success('프로필이 성공적으로 업데이트되었습니다.')
        fetchProfile() // 프로필 새로고침
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || '프로필 업데이트에 실패했습니다.')
      }
    } catch (error) {
      console.error('프로필 업데이트 오류:', error)
      toast.error('프로필 업데이트 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 비밀번호 변경
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('새 비밀번호가 일치하지 않습니다.')
      return
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error('비밀번호는 최소 8자 이상이어야 합니다.')
      return
    }

    try {
      setLoading(true)

      const response = await fetch('/api/user/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        }),
      })

      if (response.ok) {
        toast.success('비밀번호가 성공적으로 변경되었습니다.')
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        })
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || '비밀번호 변경에 실패했습니다.')
      }
    } catch (error) {
      console.error('비밀번호 변경 오류:', error)
      toast.error('비밀번호 변경 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">프로필을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">설정</h1>
        <p className="text-gray-600">계정 정보 및 프로필을 관리합니다.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">프로필 정보</TabsTrigger>
          <TabsTrigger value="security">보안 설정</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile.avatar || undefined} alt={profile.name} />
                  <AvatarFallback className="bg-doctor text-white text-xl">
                    {profile.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{profile.name}</CardTitle>
                  <CardDescription>{profile.email}</CardDescription>
                  <Badge variant="doctor" className="mt-1">의료진</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">이름</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="name"
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">이메일</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={profileForm.email}
                        className="pl-10 bg-gray-50"
                        disabled
                      />
                    </div>
                    <p className="text-xs text-gray-500">이메일은 변경할 수 없습니다.</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">연락처</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="pl-10"
                        placeholder="010-0000-0000"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">진료과</Label>
                    <div className="relative">
                      <Stethoscope className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="department"
                        type="text"
                        value={profileForm.department}
                        onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                        className="pl-10"
                        placeholder="예: 내과, 외과, 소아과"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialization">전문 분야</Label>
                    <Input
                      id="specialization"
                      type="text"
                      value={profileForm.specialization}
                      onChange={(e) => setProfileForm({ ...profileForm, specialization: e.target.value })}
                      placeholder="예: 심장내과, 소화기내과"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience">경력 (년)</Label>
                    <Input
                      id="experience"
                      type="number"
                      value={profileForm.experience}
                      onChange={(e) => setProfileForm({ ...profileForm, experience: e.target.value })}
                      min="0"
                      max="50"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">소개</Label>
                  <Textarea
                    id="description"
                    value={profileForm.description}
                    onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
                    placeholder="환자들에게 보여질 의사 소개를 작성해주세요."
                    rows={4}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">진료 시간</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startTime">시작 시간</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="startTime"
                          type="time"
                          value={profileForm.workingHours.start}
                          onChange={(e) => setProfileForm({
                            ...profileForm,
                            workingHours: { ...profileForm.workingHours, start: e.target.value }
                          })}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endTime">종료 시간</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="endTime"
                          type="time"
                          value={profileForm.workingHours.end}
                          onChange={(e) => setProfileForm({
                            ...profileForm,
                            workingHours: { ...profileForm.workingHours, end: e.target.value }
                          })}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>진료 요일</Label>
                    <div className="flex flex-wrap gap-2">
                      {["월", "화", "수", "목", "금", "토", "일"].map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            const currentDays = profileForm.workingHours.daysOfWeek
                            const newDays = currentDays.includes(day)
                              ? currentDays.filter(d => d !== day)
                              : [...currentDays, day]
                            setProfileForm({
                              ...profileForm,
                              workingHours: { ...profileForm.workingHours, daysOfWeek: newDays }
                            })
                          }}
                          className={`px-3 py-1 rounded-md border transition-colors ${
                            profileForm.workingHours.daysOfWeek.includes(day)
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={loading}>
                    <Save className="mr-2 h-4 w-4" />
                    {loading ? "저장 중..." : "변경사항 저장"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>비밀번호 변경</CardTitle>
              <CardDescription>
                보안을 위해 정기적으로 비밀번호를 변경하는 것을 권장합니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">현재 비밀번호</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">새 비밀번호</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="pl-10 pr-10"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">최소 8자 이상 입력해주세요.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={loading}>
                    <Lock className="mr-2 h-4 w-4" />
                    {loading ? "변경 중..." : "비밀번호 변경"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  User,
  MapPin,
  Camera,
  Save,
  Loader2,
  Check,
  Map,
  Video,
  Building2,
  Clock,
  CreditCard,
  Car
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AddressSearchInput } from '@/components/ui/address-search-input'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

interface WorkingHours {
  [key: string]: { start: string; end: string; isOpen: boolean }
}

interface DoctorProfile {
  name: string
  email: string
  phone: string
  specialization: string
  license: string
  clinic: string
  address: string
  clinicPhone: string
  faxNumber: string
  businessRegistration: string
  latitude: number | null
  longitude: number | null
  description: string
  avatar: string
  hasOnlineConsultation: boolean
  hasOfflineConsultation: boolean
  workingHours: WorkingHours
  insuranceAccepted: boolean
  parkingAvailable: boolean
}

function DoctorProfileContent() {
  const { data: session, status } = useSession()
  const user = session?.user
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const [profile, setProfile] = useState<DoctorProfile>({
    name: user?.name || '김의사',
    email: user?.email || 'doctor@naver.com',
    phone: '010-1234-5678',
    specialization: '내과',
    license: 'MD-123456',
    clinic: '서울의원',
    address: '서울시 강남구 역삼동 123',
    clinicPhone: '02-1234-5678',
    faxNumber: '02-1234-5679',
    businessRegistration: '123-45-67890',
    latitude: 37.5665,
    longitude: 126.9780,
    description: '10년 이상 경력의 내과 전문의입니다.',
    avatar: user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || '김의사')}&background=3B82F6&color=fff`,
    hasOnlineConsultation: true,
    hasOfflineConsultation: true,
    workingHours: {
      monday: { start: '09:00', end: '18:00', isOpen: true },
      tuesday: { start: '09:00', end: '18:00', isOpen: true },
      wednesday: { start: '09:00', end: '18:00', isOpen: true },
      thursday: { start: '09:00', end: '18:00', isOpen: true },
      friday: { start: '09:00', end: '18:00', isOpen: true },
      saturday: { start: '09:00', end: '13:00', isOpen: true },
      sunday: { start: '09:00', end: '18:00', isOpen: false }
    },
    insuranceAccepted: false,
    parkingAvailable: false
  })

  const [editedProfile, setEditedProfile] = useState<DoctorProfile>(profile)

  // 프로필 데이터 로드
  useEffect(() => {
    const fetchProfile = async () => {
      if (status !== 'authenticated' || !session?.user) return

      try {
        const response = await fetch('/api/doctor/profile', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()

          // workingHours가 문자열로 저장되어 있으면 파싱
          let parsedWorkingHours = profile.workingHours
          if (data.workingHours) {
            try {
              parsedWorkingHours = typeof data.workingHours === 'string'
                ? JSON.parse(data.workingHours)
                : data.workingHours
            } catch (e) {
              console.error('Failed to parse working hours:', e)
            }
          }

          const updatedProfile = {
            ...profile,
            name: data.name || profile.name,
            email: data.email || profile.email,
            phone: data.phone || profile.phone,
            specialization: data.specialization || profile.specialization,
            license: data.license || profile.license,
            clinic: data.clinic || profile.clinic,
            address: data.address || profile.address,
            hasOnlineConsultation: data.hasOnlineConsultation ?? profile.hasOnlineConsultation,
            hasOfflineConsultation: data.hasOfflineConsultation ?? profile.hasOfflineConsultation,
            workingHours: parsedWorkingHours,
            insuranceAccepted: data.insuranceAccepted ?? profile.insuranceAccepted,
            parkingAvailable: data.parkingAvailable ?? profile.parkingAvailable
          }
          setProfile(updatedProfile)
          setEditedProfile(updatedProfile)
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      }
    }

    fetchProfile()
  }, [status, session])

  // 현재 위치 가져오기
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setEditedProfile({
            ...editedProfile,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
          alert(`위치가 설정되었습니다.\n위도: ${position.coords.latitude.toFixed(4)}\n경도: ${position.coords.longitude.toFixed(4)}`)
        },
        (error) => {
          alert('위치 정보를 가져올 수 없습니다.')
        }
      )
    } else {
      alert('브라우저가 위치 정보를 지원하지 않습니다.')
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    setEditedProfile(profile)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedProfile(profile)
  }

  const handleSave = async () => {
    setIsSaving(true)

    try {
      if (!session?.user) {
        throw new Error('로그인이 필요합니다. 다시 로그인해주세요.')
      }

      // 진료 방식 검증
      if (!editedProfile.hasOnlineConsultation && !editedProfile.hasOfflineConsultation) {
        alert('최소 하나의 진료 방식을 선택해야 합니다.')
        setIsSaving(false)
        return
      }

      const response = await fetch('/api/doctor/profile', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editedProfile),
      })

      if (!response.ok) {
        throw new Error('프로필 업데이트 실패')
      }

      const data = await response.json()
      console.log('Profile updated:', data)

      setProfile(editedProfile)
      setIsEditing(false)
      setShowSuccess(true)

      // 3초 후 성공 메시지 숨김
      setTimeout(() => {
        setShowSuccess(false)
      }, 3000)
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('프로필 업데이트 중 오류가 발생했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setEditedProfile({
          ...editedProfile,
          avatar: reader.result as string
        })
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">프로필 설정</h1>
          <p className="text-gray-600 mt-2">
            의료진 정보와 의원 정보를 관리하세요
          </p>
        </div>
        {!isEditing ? (
          <Button onClick={handleEdit}>
            <User className="h-4 w-4 mr-2" />
            프로필 수정
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              취소
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  저장 중...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  저장
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {showSuccess && (
        <Alert className="bg-green-50 border-green-200">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            프로필이 성공적으로 업데이트되었습니다.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 프로필 사진 카드 */}
        <Card>
          <CardHeader>
            <CardTitle>프로필 사진</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <Avatar className="h-32 w-32">
              <AvatarImage
                src={isEditing ? editedProfile.avatar : profile.avatar}
                alt={profile.name}
              />
              <AvatarFallback className="bg-doctor text-white text-3xl">
                {profile.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <>
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  사진 변경
                </Button>
              </>
            )}
            <Badge variant="doctor" className="text-sm">
              의료진
            </Badge>
          </CardContent>
        </Card>

        {/* 개인 정보 카드 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>개인 정보</CardTitle>
            <CardDescription>가입 시 등록한 정보입니다</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  value={isEditing ? editedProfile.name : profile.name}
                  onChange={(e) => setEditedProfile({
                    ...editedProfile,
                    name: e.target.value
                  })}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">연락처</Label>
                <Input
                  id="phone"
                  value={isEditing ? editedProfile.phone : profile.phone}
                  onChange={(e) => setEditedProfile({
                    ...editedProfile,
                    phone: e.target.value
                  })}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialization">전문 분야</Label>
                <Input
                  id="specialization"
                  value={isEditing ? editedProfile.specialization : profile.specialization}
                  onChange={(e) => setEditedProfile({
                    ...editedProfile,
                    specialization: e.target.value
                  })}
                  disabled={!isEditing}
                  placeholder="예: 내과, 외과, 소아과"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="license">의료 면허번호</Label>
                <Input
                  id="license"
                  value={isEditing ? editedProfile.license : profile.license}
                  onChange={(e) => setEditedProfile({
                    ...editedProfile,
                    license: e.target.value
                  })}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessRegistration">사업자 등록번호</Label>
                <Input
                  id="businessRegistration"
                  value={isEditing ? editedProfile.businessRegistration : profile.businessRegistration}
                  onChange={(e) => setEditedProfile({
                    ...editedProfile,
                    businessRegistration: e.target.value
                  })}
                  disabled={!isEditing}
                  placeholder="000-00-00000"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 의원 정보 카드 */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>의원 정보</CardTitle>
            <CardDescription>의원 관련 정보를 입력하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="clinic">의원명</Label>
                <Input
                  id="clinic"
                  value={isEditing ? editedProfile.clinic : profile.clinic}
                  onChange={(e) => setEditedProfile({
                    ...editedProfile,
                    clinic: e.target.value
                  })}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clinicPhone">병원 대표번호</Label>
                <Input
                  id="clinicPhone"
                  value={isEditing ? editedProfile.clinicPhone : profile.clinicPhone}
                  onChange={(e) => setEditedProfile({
                    ...editedProfile,
                    clinicPhone: e.target.value
                  })}
                  disabled={!isEditing}
                  placeholder="02-0000-0000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="faxNumber">팩스번호</Label>
                <Input
                  id="faxNumber"
                  value={isEditing ? editedProfile.faxNumber : profile.faxNumber}
                  onChange={(e) => setEditedProfile({
                    ...editedProfile,
                    faxNumber: e.target.value
                  })}
                  disabled={!isEditing}
                  placeholder="02-0000-0001"
                />
              </div>
              <AddressSearchInput
                value={isEditing ? editedProfile.address : profile.address}
                onChange={(address, coordinates) => {
                  setEditedProfile({
                    ...editedProfile,
                    address: address,
                    latitude: coordinates?.lat || editedProfile.latitude,
                    longitude: coordinates?.lng || editedProfile.longitude
                  })
                }}
                disabled={!isEditing}
                label="의원 주소"
                placeholder="주소를 검색하거나 직접 입력하세요"
              />
            </div>

            {/* 위치 정보 섹션 */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Map className="h-5 w-5 text-gray-600" />
                  <h3 className="font-semibold">위치 정보</h3>
                </div>
                {isEditing && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={getCurrentLocation}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    현재 위치 가져오기
                  </Button>
                )}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="latitude">위도</Label>
                  <Input
                    id="latitude"
                    type="number"
                    value={isEditing ? editedProfile.latitude || '' : profile.latitude || ''}
                    onChange={(e) => setEditedProfile({
                      ...editedProfile,
                      latitude: e.target.value ? parseFloat(e.target.value) : null
                    })}
                    disabled={!isEditing}
                    placeholder="37.5665"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">경도</Label>
                  <Input
                    id="longitude"
                    type="number"
                    value={isEditing ? editedProfile.longitude || '' : profile.longitude || ''}
                    onChange={(e) => setEditedProfile({
                      ...editedProfile,
                      longitude: e.target.value ? parseFloat(e.target.value) : null
                    })}
                    disabled={!isEditing}
                    placeholder="126.9780"
                  />
                </div>
              </div>
            </div>

            {/* 소개 섹션 */}
            <div className="mt-6">
              <Label htmlFor="description">의료진 소개</Label>
              <Textarea
                id="description"
                value={isEditing ? editedProfile.description : profile.description}
                onChange={(e) => setEditedProfile({
                  ...editedProfile,
                  description: e.target.value
                })}
                disabled={!isEditing}
                rows={4}
                placeholder="의료진의 경력 및 소개 내용을 입력하세요"
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* 진료 방식 설정 카드 */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>진료 방식 설정</CardTitle>
            <CardDescription>제공하는 진료 방식을 선택하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    id="hasOfflineConsultation"
                    checked={isEditing ? editedProfile.hasOfflineConsultation : profile.hasOfflineConsultation}
                    onChange={(e) => setEditedProfile({
                      ...editedProfile,
                      hasOfflineConsultation: e.target.checked
                    })}
                    disabled={!isEditing}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <div className="flex items-center gap-3">
                    <Building2 className="h-6 w-6 text-blue-600" />
                    <div>
                      <Label htmlFor="hasOfflineConsultation" className="text-sm font-semibold cursor-pointer">
                        대면 진료
                      </Label>
                      <p className="text-xs text-gray-500">의원에서 직접 진료</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    id="hasOnlineConsultation"
                    checked={isEditing ? editedProfile.hasOnlineConsultation : profile.hasOnlineConsultation}
                    onChange={(e) => setEditedProfile({
                      ...editedProfile,
                      hasOnlineConsultation: e.target.checked
                    })}
                    disabled={!isEditing}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500 h-4 w-4"
                  />
                  <div className="flex items-center gap-3">
                    <Video className="h-6 w-6 text-green-600" />
                    <div>
                      <Label htmlFor="hasOnlineConsultation" className="text-sm font-semibold cursor-pointer">
                        비대면 진료
                      </Label>
                      <p className="text-xs text-gray-500">화상 또는 전화 진료</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-yellow-800 mb-1">진료 방식 안내</p>
                    <ul className="space-y-1 text-yellow-700">
                      <li>• 최소 하나의 진료 방식은 반드시 선택해야 합니다</li>
                      <li>• 비대면 진료는 의료법에 따라 재진 환자 대상으로 제공됩니다</li>
                      <li>• 설정 변경 시 기존 예약에는 영향을 주지 않습니다</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 현재 설정 상태 표시 */}
              <div className="flex gap-2">
                {(isEditing ? editedProfile.hasOfflineConsultation : profile.hasOfflineConsultation) && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    대면 진료 가능
                  </Badge>
                )}
                {(isEditing ? editedProfile.hasOnlineConsultation : profile.hasOnlineConsultation) && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Video className="h-3 w-3" />
                    비대면 진료 가능
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 진료 시간 설정 카드 */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              진료 시간 설정
            </CardTitle>
            <CardDescription>요일별 진료 시간을 설정하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { key: 'monday', label: '월요일' },
                { key: 'tuesday', label: '화요일' },
                { key: 'wednesday', label: '수요일' },
                { key: 'thursday', label: '목요일' },
                { key: 'friday', label: '금요일' },
                { key: 'saturday', label: '토요일' },
                { key: 'sunday', label: '일요일' }
              ].map(({ key, label }) => {
                const daySchedule = (isEditing ? editedProfile : profile).workingHours[key]
                return (
                  <div key={key} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="flex items-center gap-3 w-24">
                      <input
                        type="checkbox"
                        id={`working-${key}`}
                        checked={daySchedule?.isOpen ?? false}
                        onChange={(e) => {
                          if (!isEditing) return
                          setEditedProfile({
                            ...editedProfile,
                            workingHours: {
                              ...editedProfile.workingHours,
                              [key]: {
                                ...editedProfile.workingHours[key],
                                isOpen: e.target.checked
                              }
                            }
                          })
                        }}
                        disabled={!isEditing}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                      />
                      <Label htmlFor={`working-${key}`} className="font-semibold cursor-pointer">
                        {label}
                      </Label>
                    </div>

                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        type="time"
                        value={daySchedule?.start || '09:00'}
                        onChange={(e) => {
                          if (!isEditing) return
                          setEditedProfile({
                            ...editedProfile,
                            workingHours: {
                              ...editedProfile.workingHours,
                              [key]: {
                                ...editedProfile.workingHours[key],
                                start: e.target.value
                              }
                            }
                          })
                        }}
                        disabled={!isEditing || !daySchedule?.isOpen}
                        className="w-32"
                      />
                      <span className="text-gray-500">~</span>
                      <Input
                        type="time"
                        value={daySchedule?.end || '18:00'}
                        onChange={(e) => {
                          if (!isEditing) return
                          setEditedProfile({
                            ...editedProfile,
                            workingHours: {
                              ...editedProfile.workingHours,
                              [key]: {
                                ...editedProfile.workingHours[key],
                                end: e.target.value
                              }
                            }
                          })
                        }}
                        disabled={!isEditing || !daySchedule?.isOpen}
                        className="w-32"
                      />
                    </div>

                    {!daySchedule?.isOpen && (
                      <Badge variant="secondary" className="ml-auto">휴진</Badge>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* 추가 정보 카드 */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>추가 정보</CardTitle>
            <CardDescription>의원의 추가 편의 정보를 설정하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    id="insuranceAccepted"
                    checked={isEditing ? editedProfile.insuranceAccepted : profile.insuranceAccepted}
                    onChange={(e) => setEditedProfile({
                      ...editedProfile,
                      insuranceAccepted: e.target.checked
                    })}
                    disabled={!isEditing}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                    <div>
                      <Label htmlFor="insuranceAccepted" className="text-sm font-semibold cursor-pointer">
                        보험 적용 가능
                      </Label>
                      <p className="text-xs text-gray-500">대면 진료 시 건강보험 적용</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    id="parkingAvailable"
                    checked={isEditing ? editedProfile.parkingAvailable : profile.parkingAvailable}
                    onChange={(e) => setEditedProfile({
                      ...editedProfile,
                      parkingAvailable: e.target.checked
                    })}
                    disabled={!isEditing}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500 h-4 w-4"
                  />
                  <div className="flex items-center gap-3">
                    <Car className="h-6 w-6 text-green-600" />
                    <div>
                      <Label htmlFor="parkingAvailable" className="text-sm font-semibold cursor-pointer">
                        주차 가능
                      </Label>
                      <p className="text-xs text-gray-500">주차 공간 이용 가능</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 현재 설정 상태 표시 */}
              <div className="flex gap-2">
                {(isEditing ? editedProfile.insuranceAccepted : profile.insuranceAccepted) && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <CreditCard className="h-3 w-3" />
                    보험 적용 가능
                  </Badge>
                )}
                {(isEditing ? editedProfile.parkingAvailable : profile.parkingAvailable) && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Car className="h-3 w-3" />
                    주차 가능
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function DoctorProfilePage() {
  return (
    <ProtectedRoute requiredRole="doctor">
      <DoctorProfileContent />
    </ProtectedRoute>
  )
}
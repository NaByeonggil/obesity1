'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Calendar,
  Clock,
  User,
  Video,
  UserCheck,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  AlertCircle,
  Check
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Schedule {
  id: string
  date: string
  time: string
  endTime: string
  type: 'appointment' | 'break' | 'meeting' | 'personal'
  title: string
  description?: string
  patientName?: string
  appointmentType?: 'in-person' | 'telehealth'
  status?: 'scheduled' | 'completed' | 'cancelled'
  location?: string
}

export default function DoctorCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month')
  const [isAddingSchedule, setIsAddingSchedule] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null)

  const [schedules, setSchedules] = useState<Schedule[]>([
    {
      id: '1',
      date: '2025-01-24',
      time: '09:00',
      endTime: '09:30',
      type: 'appointment',
      title: '김환자님 진료',
      patientName: '김환자',
      appointmentType: 'in-person',
      status: 'scheduled',
      location: '진료실 1'
    },
    {
      id: '2',
      date: '2025-01-24',
      time: '10:00',
      endTime: '10:30',
      type: 'appointment',
      title: '이환자님 비대면진료',
      patientName: '이환자',
      appointmentType: 'telehealth',
      status: 'scheduled'
    },
    {
      id: '3',
      date: '2025-01-24',
      time: '12:00',
      endTime: '13:00',
      type: 'break',
      title: '점심시간',
      description: '휴식'
    },
    {
      id: '4',
      date: '2025-01-24',
      time: '14:00',
      endTime: '15:00',
      type: 'meeting',
      title: '의료진 회의',
      description: '월간 미팅',
      location: '회의실'
    },
    {
      id: '5',
      date: '2025-01-25',
      time: '09:30',
      endTime: '10:00',
      type: 'appointment',
      title: '박환자님 진료',
      patientName: '박환자',
      appointmentType: 'in-person',
      status: 'scheduled',
      location: '진료실 1'
    }
  ])

  const [newSchedule, setNewSchedule] = useState({
    date: '',
    time: '',
    endTime: '',
    type: 'appointment',
    title: '',
    description: '',
    patientName: '',
    appointmentType: 'in-person',
    location: ''
  })

  // 월간 캘린더 날짜 생성
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // 이전 달 날짜들
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i)
      days.push({
        date: prevDate.getDate(),
        fullDate: prevDate.toISOString().split('T')[0],
        isCurrentMonth: false
      })
    }

    // 현재 달 날짜들
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDay = new Date(year, month, i)
      days.push({
        date: i,
        fullDate: currentDay.toISOString().split('T')[0],
        isCurrentMonth: true,
        isToday: currentDay.toDateString() === new Date().toDateString()
      })
    }

    return days
  }

  // 날짜별 일정 가져오기
  const getSchedulesForDate = (date: string) => {
    return schedules.filter(schedule => schedule.date === date)
  }

  // 일정 추가
  const handleAddSchedule = () => {
    if (!newSchedule.date || !newSchedule.time || !newSchedule.title) {
      alert('날짜, 시간, 제목은 필수 입력 항목입니다.')
      return
    }

    const schedule: Schedule = {
      id: Date.now().toString(),
      date: newSchedule.date,
      time: newSchedule.time,
      endTime: newSchedule.endTime || newSchedule.time,
      type: newSchedule.type as Schedule['type'],
      title: newSchedule.title,
      description: newSchedule.description,
      patientName: newSchedule.patientName,
      appointmentType: newSchedule.appointmentType as 'in-person' | 'telehealth',
      status: 'scheduled',
      location: newSchedule.location
    }

    setSchedules([...schedules, schedule])
    setIsAddingSchedule(false)
    setNewSchedule({
      date: '',
      time: '',
      endTime: '',
      type: 'appointment',
      title: '',
      description: '',
      patientName: '',
      appointmentType: 'in-person',
      location: ''
    })
    alert('일정이 추가되었습니다.')
  }

  // 일정 삭제
  const handleDeleteSchedule = (id: string) => {
    if (confirm('일정을 삭제하시겠습니까?')) {
      setSchedules(schedules.filter(s => s.id !== id))
      setSelectedSchedule(null)
    }
  }

  // 일정 상태 변경
  const handleStatusChange = (id: string, status: string) => {
    setSchedules(schedules.map(s =>
      s.id === id ? { ...s, status: status as Schedule['status'] } : s
    ))
  }

  // 월 변경
  const changeMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1))
  }

  const getScheduleTypeColor = (type: string) => {
    switch(type) {
      case 'appointment': return 'bg-blue-100 text-blue-800'
      case 'break': return 'bg-green-100 text-green-800'
      case 'meeting': return 'bg-purple-100 text-purple-800'
      case 'personal': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const weekDays = ['일', '월', '화', '수', '목', '금', '토']
  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">일정 관리</h1>
          <p className="text-gray-600 mt-2">
            진료 일정과 개인 일정을 관리하세요
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsAddingSchedule(true)}>
            <Plus className="h-4 w-4 mr-2" />
            일정 추가
          </Button>
        </div>
      </div>

      {/* 캘린더 네비게이션 */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => changeMonth(-1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold">
                {currentDate.getFullYear()}년 {monthNames[currentDate.getMonth()]}
              </h2>
              <Button
                variant="outline"
                size="icon"
                onClick={() => changeMonth(1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('month')}
              >
                월간
              </Button>
              <Button
                variant={viewMode === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('week')}
              >
                주간
              </Button>
              <Button
                variant={viewMode === 'day' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('day')}
              >
                일간
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* 월간 캘린더 뷰 */}
          {viewMode === 'month' && (
            <div>
              {/* 요일 헤더 */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {weekDays.map(day => (
                  <div key={day} className="text-center font-semibold text-sm py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* 날짜 그리드 */}
              <div className="grid grid-cols-7 gap-2">
                {getDaysInMonth().map((day, index) => {
                  const daySchedules = getSchedulesForDate(day.fullDate)
                  return (
                    <div
                      key={index}
                      className={`min-h-[100px] p-2 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                        day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                      } ${day.isToday ? 'border-blue-500 border-2' : ''}`}
                      onClick={() => setSelectedDate(new Date(day.fullDate))}
                    >
                      <div className={`text-sm font-semibold mb-1 ${
                        day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                      } ${day.isToday ? 'text-blue-600' : ''}`}>
                        {day.date}
                      </div>
                      <div className="space-y-1">
                        {daySchedules.slice(0, 2).map(schedule => (
                          <div
                            key={schedule.id}
                            className={`text-xs p-1 rounded truncate ${getScheduleTypeColor(schedule.type)}`}
                          >
                            {schedule.time} {schedule.title}
                          </div>
                        ))}
                        {daySchedules.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{daySchedules.length - 2} 더보기
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 오늘의 일정 */}
      <Card>
        <CardHeader>
          <CardTitle>오늘의 일정</CardTitle>
          <CardDescription>
            {new Date().toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long'
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {getSchedulesForDate(new Date().toISOString().split('T')[0]).length === 0 ? (
              <p className="text-gray-500 text-center py-4">오늘 예정된 일정이 없습니다.</p>
            ) : (
              getSchedulesForDate(new Date().toISOString().split('T')[0]).map(schedule => (
                <div key={schedule.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-semibold">
                      {schedule.time} - {schedule.endTime}
                    </div>
                    <Badge className={getScheduleTypeColor(schedule.type)}>
                      {schedule.type === 'appointment' && '진료'}
                      {schedule.type === 'break' && '휴식'}
                      {schedule.type === 'meeting' && '회의'}
                      {schedule.type === 'personal' && '개인'}
                    </Badge>
                    <div>
                      <p className="font-medium">{schedule.title}</p>
                      {schedule.location && (
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {schedule.location}
                        </p>
                      )}
                    </div>
                    {schedule.appointmentType === 'telehealth' && (
                      <Badge variant="secondary">
                        <Video className="h-3 w-3 mr-1" />
                        비대면
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteSchedule(schedule.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* 일정 추가 모달 */}
      {isAddingSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">새 일정 추가</h2>
              <p className="text-sm text-gray-600 mt-1">
                진료, 회의, 개인 일정을 추가하세요
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">날짜 *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newSchedule.date}
                    onChange={(e) => setNewSchedule({
                      ...newSchedule,
                      date: e.target.value
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">일정 유형 *</Label>
                  <Select
                    value={newSchedule.type}
                    onValueChange={(value) => setNewSchedule({
                      ...newSchedule,
                      type: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="appointment">진료</SelectItem>
                      <SelectItem value="break">휴식</SelectItem>
                      <SelectItem value="meeting">회의</SelectItem>
                      <SelectItem value="personal">개인</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="time">시작 시간 *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newSchedule.time}
                    onChange={(e) => setNewSchedule({
                      ...newSchedule,
                      time: e.target.value
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">종료 시간</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={newSchedule.endTime}
                    onChange={(e) => setNewSchedule({
                      ...newSchedule,
                      endTime: e.target.value
                    })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">제목 *</Label>
                <Input
                  id="title"
                  value={newSchedule.title}
                  onChange={(e) => setNewSchedule({
                    ...newSchedule,
                    title: e.target.value
                  })}
                  placeholder="일정 제목을 입력하세요"
                />
              </div>

              {newSchedule.type === 'appointment' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="patientName">환자명</Label>
                      <Input
                        id="patientName"
                        value={newSchedule.patientName}
                        onChange={(e) => setNewSchedule({
                          ...newSchedule,
                          patientName: e.target.value
                        })}
                        placeholder="환자 이름"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="appointmentType">진료 유형</Label>
                      <Select
                        value={newSchedule.appointmentType}
                        onValueChange={(value) => setNewSchedule({
                          ...newSchedule,
                          appointmentType: value
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="in-person">대면진료</SelectItem>
                          <SelectItem value="telehealth">비대면진료</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="location">장소</Label>
                <Input
                  id="location"
                  value={newSchedule.location}
                  onChange={(e) => setNewSchedule({
                    ...newSchedule,
                    location: e.target.value
                  })}
                  placeholder="진료실, 회의실 등"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  value={newSchedule.description}
                  onChange={(e) => setNewSchedule({
                    ...newSchedule,
                    description: e.target.value
                  })}
                  placeholder="일정에 대한 메모를 입력하세요"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 p-6 border-t">
              <Button variant="outline" onClick={() => setIsAddingSchedule(false)}>
                취소
              </Button>
              <Button onClick={handleAddSchedule}>
                일정 추가
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
  Video,
  Phone,
  Clock,
  Calendar as CalendarIcon,
  User,
  FileText,
  CreditCard,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface TimeSlot {
  time: string;
  available: boolean;
}

interface ClinicInfo {
  id: string;
  name: string;
  doctorName: string;
  doctorId: string;
  specialties: string[];
  price: number;
  rating: number;
  availability: string;
  hasVideo: boolean;
  hasPhone: boolean;
  address?: string;
  phone?: string;
}

export default function TelemedicineBookingPage() {
  const params = useParams();
  const router = useRouter();
  const clinicId = params.id as string;

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [consultationType, setConsultationType] = useState<'video' | 'phone'>('video');
  const [symptoms, setSymptoms] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [clinicInfo, setClinicInfo] = useState<ClinicInfo | null>(null);
  const [loadingClinic, setLoadingClinic] = useState(true);

  // 실시간 데이터베이스에서 의사 정보 가져오기
  useEffect(() => {
    async function fetchDoctorInfo() {
      try {
        setLoadingClinic(true);

        // clinicId를 기반으로 의사 ID 추출 (예: zella-clinic -> 젤라의원 검색)
        let searchQuery = '';
        if (clinicId === 'zella-clinic') {
          searchQuery = '젤라의원';
        } else {
          searchQuery = clinicId;
        }

        const response = await fetch('/api/doctors');
        const data = await response.json();

        if (data.success && data.doctors) {
          // clinic 이름으로 의사 찾기
          const doctor = data.doctors.find((doc: any) =>
            doc.clinic?.includes(searchQuery) ||
            doc.id === clinicId
          );

          if (doctor) {
            setClinicInfo({
              id: clinicId,
              name: doctor.clinic || '병원명 미지정',
              doctorName: doctor.name,
              doctorId: doctor.id,
              specialties: [doctor.specialization || '전문분야 미지정'],
              price: doctor.consultationFee || 30000,
              rating: doctor.rating || 4.5,
              availability: '09:00 - 18:00',
              hasVideo: doctor.hasOnlineConsultation ?? true,
              hasPhone: doctor.hasOnlineConsultation ?? true,
              address: doctor.location || '주소 정보 없음',
              phone: doctor.phone || '전화번호 정보 없음'
            });
          } else {
            // 의사를 찾지 못한 경우 첫 번째 의사 사용
            const firstDoctor = data.doctors[0];
            if (firstDoctor) {
              setClinicInfo({
                id: clinicId,
                name: firstDoctor.clinic || '병원명 미지정',
                doctorName: firstDoctor.name,
                doctorId: firstDoctor.id,
                specialties: [firstDoctor.specialization || '전문분야 미지정'],
                price: firstDoctor.consultationFee || 30000,
                rating: firstDoctor.rating || 4.5,
                availability: '09:00 - 18:00',
                hasVideo: firstDoctor.hasOnlineConsultation ?? true,
                hasPhone: firstDoctor.hasOnlineConsultation ?? true,
                address: firstDoctor.location || '주소 정보 없음',
                phone: firstDoctor.phone || '전화번호 정보 없음'
              });
            }
          }
        }
      } catch (error) {
        console.error('의사 정보 조회 오류:', error);
      } finally {
        setLoadingClinic(false);
      }
    }

    fetchDoctorInfo();
  }, [clinicId]);

  // 시간대별 예약 가능 슬롯 (실제로는 API에서 가져옴)
  const timeSlots: TimeSlot[] = [
    { time: '09:00', available: true },
    { time: '09:30', available: true },
    { time: '10:00', available: false },
    { time: '10:30', available: true },
    { time: '11:00', available: true },
    { time: '11:30', available: false },
    { time: '14:00', available: true },
    { time: '14:30', available: true },
    { time: '15:00', available: true },
    { time: '15:30', available: false },
    { time: '16:00', available: true },
    { time: '16:30', available: true },
    { time: '17:00', available: true },
    { time: '17:30', available: false },
    { time: '18:00', available: true },
    { time: '18:30', available: true },
    { time: '19:00', available: true },
    { time: '19:30', available: true },
    { time: '20:00', available: true },
    { time: '20:30', available: true },
    { time: '21:00', available: true },
    { time: '21:30', available: true }
  ];

  const handleNextStep = () => {
    if (step === 1 && selectedDate && selectedTime) {
      setStep(2);
    } else if (step === 2 && symptoms && patientName && patientPhone) {
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      // 날짜 포맷팅 (YYYY-MM-DD)
      const formattedDate = selectedDate ? selectedDate.toISOString().split('T')[0] : '';

      // 진료 방식 텍스트
      const consultationTypeText = consultationType === 'video' ? '화상 진료' : '전화 진료';

      // 예약 데이터 준비
      const appointmentData = {
        doctorId: clinicInfo.doctorId || 'user-1759218534856-68a57e05', // 실제 의사 ID 사용
        date: formattedDate,
        time: selectedTime,
        type: 'online', // 비대면 진료 메뉴에서는 항상 'online'
        symptoms: symptoms,
        department: clinicInfo.specialties[0] || '내과',
        notes: `비대면 진료 (${consultationTypeText})\n의료 이력: ${medicalHistory}\n환자명: ${patientName}\n연락처: ${patientPhone}\n이메일: ${patientEmail}`
      };

      console.log('📤 [비대면 예약] 전송 데이터:', {
        ...appointmentData,
        clinicId,
        clinicName: clinicInfo.name,
        consultationType,
        consultationTypeText,
        typeExplanation: '비대면(온라인) 진료'
      });

      // API 호출
      const response = await fetch('/api/patient/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(appointmentData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('예약 성공:', result);
        setLoading(false);
        setStep(4); // 완료 단계
      } else {
        const error = await response.json();
        console.error('예약 실패:', error);
        alert(`예약에 실패했습니다: ${error.error || '알 수 없는 오류'}`);
        setLoading(false);
      }
    } catch (error) {
      console.error('예약 오류:', error);
      alert('예약 처리 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  // 로딩 중일 때
  if (loadingClinic) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">의사 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  // 의사 정보를 찾지 못했을 때
  if (!clinicInfo) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">의사 정보를 찾을 수 없습니다</h3>
          <p className="text-gray-600 mb-6">
            요청하신 의원 정보를 찾을 수 없습니다.
          </p>
          <Button onClick={() => router.push('/patient/clinics')}>
            병원 목록으로 돌아가기
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 진행 상태 표시 */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((num) => (
            <div
              key={num}
              className={`flex items-center ${num < 4 ? 'flex-1' : ''}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold
                  ${step >= num
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-500'}`}
              >
                {step > num ? <CheckCircle className="h-6 w-6" /> : num}
              </div>
              {num < 4 && (
                <div
                  className={`flex-1 h-1 mx-2
                    ${step > num ? 'bg-blue-600' : 'bg-gray-200'}`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs">날짜/시간</span>
          <span className="text-xs">증상입력</span>
          <span className="text-xs">결제확인</span>
          <span className="text-xs">예약완료</span>
        </div>
      </div>

      {/* 의원 정보 카드 */}
      <Card className="mb-6 p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold mb-1">{clinicInfo.name}</h2>
            <p className="text-gray-600">{clinicInfo.doctorName}</p>
            <div className="flex gap-2 mt-2">
              {clinicInfo.specialties.map((specialty) => (
                <Badge key={specialty} variant="secondary">
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">
              {clinicInfo.price.toLocaleString()}원
            </p>
            <p className="text-sm text-gray-500">진료비</p>
          </div>
        </div>
      </Card>

      {/* Step 1: 날짜 및 시간 선택 */}
      {step === 1 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">진료 일정 선택</h3>

          {/* 진료 방식 선택 */}
          <div className="mb-6">
            <Label className="mb-2 block">진료 방식</Label>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={consultationType === 'video' ? 'default' : 'outline'}
                onClick={() => setConsultationType('video')}
                className="flex items-center justify-center gap-2"
                disabled={!clinicInfo.hasVideo}
              >
                <Video className="h-4 w-4" />
                화상 진료
              </Button>
              <Button
                variant={consultationType === 'phone' ? 'default' : 'outline'}
                onClick={() => setConsultationType('phone')}
                className="flex items-center justify-center gap-2"
                disabled={!clinicInfo.hasPhone}
              >
                <Phone className="h-4 w-4" />
                전화 진료
              </Button>
            </div>
          </div>

          {/* 날짜 선택 */}
          <div className="mb-6">
            <Label className="mb-2 block">진료 날짜</Label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              disabled={(date) =>
                date < new Date() || date > new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              }
            />
          </div>

          {/* 시간 선택 */}
          <div className="mb-6">
            <Label className="mb-2 block">진료 시간</Label>
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map((slot) => (
                <Button
                  key={slot.time}
                  variant={selectedTime === slot.time ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTime(slot.time)}
                  disabled={!slot.available}
                >
                  {slot.time}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleNextStep}
              disabled={!selectedDate || !selectedTime}
            >
              다음 단계
            </Button>
          </div>
        </Card>
      )}

      {/* Step 2: 증상 및 환자 정보 */}
      {step === 2 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">환자 정보 및 증상</h3>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">이름 *</Label>
              <Input
                id="name"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="홍길동"
                required
              />
            </div>

            <div>
              <Label htmlFor="phone">연락처 *</Label>
              <Input
                id="phone"
                type="tel"
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                placeholder="010-0000-0000"
                required
              />
            </div>

            <div>
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={patientEmail}
                onChange={(e) => setPatientEmail(e.target.value)}
                placeholder="example@email.com"
              />
            </div>

            <div>
              <Label htmlFor="symptoms">증상 설명 *</Label>
              <Textarea
                id="symptoms"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="현재 겪고 있는 증상을 자세히 설명해주세요"
                rows={4}
                required
              />
            </div>

            <div>
              <Label htmlFor="history">과거 병력 및 복용 중인 약</Label>
              <Textarea
                id="history"
                value={medicalHistory}
                onChange={(e) => setMedicalHistory(e.target.value)}
                placeholder="과거 병력이나 현재 복용 중인 약이 있다면 적어주세요"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={handlePrevStep}>
              이전
            </Button>
            <Button
              onClick={handleNextStep}
              disabled={!symptoms || !patientName || !patientPhone}
            >
              다음 단계
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: 결제 확인 */}
      {step === 3 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">예약 확인 및 결제</h3>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold mb-3">예약 정보</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">진료일시</span>
                <span>
                  {selectedDate && formatDate(selectedDate)} {selectedTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">진료방식</span>
                <span>{consultationType === 'video' ? '화상 진료' : '전화 진료'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">의료진</span>
                <span>{clinicInfo.doctorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">환자명</span>
                <span>{patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">연락처</span>
                <span>{patientPhone}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold mb-3">결제 정보</h4>
            <div className="flex justify-between items-center">
              <span>진료비</span>
              <span className="text-2xl font-bold text-blue-600">
                {clinicInfo.price.toLocaleString()}원
              </span>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-semibold mb-1">예약 전 확인사항</p>
                <ul className="space-y-1 text-gray-600">
                  <li>• 예약 시간 10분 전까지 접속 준비를 완료해주세요</li>
                  <li>• 화상 진료 시 카메라와 마이크가 정상 작동하는지 확인해주세요</li>
                  <li>• 진료 취소는 24시간 전까지 가능합니다</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-6">
            <input type="checkbox" id="agree" className="rounded" />
            <Label htmlFor="agree" className="text-sm cursor-pointer">
              위 내용을 확인했으며, 개인정보 수집 및 이용에 동의합니다
            </Label>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={handlePrevStep}>
              이전
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  처리중...
                </span>
              ) : (
                '결제 및 예약 완료'
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* Step 4: 완료 */}
      {step === 4 && (
        <Card className="p-6 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">예약이 완료되었습니다!</h3>
          <p className="text-gray-600 mb-6">
            예약 확인 메시지가 {patientPhone}로 발송되었습니다.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h4 className="font-semibold mb-3">예약 정보</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">예약번호</span>
                <span className="font-mono">TMD-2024-{Math.floor(Math.random() * 100000)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">진료일시</span>
                <span>
                  {selectedDate && formatDate(selectedDate)} {selectedTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">진료방식</span>
                <span>{consultationType === 'video' ? '화상 진료' : '전화 진료'}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
            <h4 className="font-semibold mb-2">진료 접속 방법</h4>
            <p className="text-sm text-gray-600">
              예약 시간 10분 전에 문자로 접속 링크를 보내드립니다.
              링크를 클릭하여 대기실로 입장해주세요.
            </p>
          </div>

          <div className="flex gap-2 justify-center">
            <Button onClick={() => router.push('/patient/appointments')}>
              예약 현황 보기
            </Button>
            <Button variant="outline" onClick={() => router.push('/patient/clinics?department=obesity-treatment')}>
              다른 진료 예약
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
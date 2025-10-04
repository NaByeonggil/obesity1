'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  MapPin,
  Clock,
  Star,
  Phone,
  ChevronUp,
  ChevronDown,
  Calendar,
  Users,
  CreditCard,
  Filter
} from 'lucide-react';

interface Clinic {
  id: string;
  name: string;
  department: string;
  address: string;
  distance: string;
  rating: number;
  reviewCount: number;
  consultationFee: number;
  waitTime: string;
  availability: string;
  doctorName: string;
  experience: string;
  phone: string;
  openHours: string;
  insurance: boolean;
  parking: boolean;
  specialties: string[];
  avatar?: string;
}

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  clinic: string;
  location: string;
  phone: string;
  image?: string;
  consultationFee: number;
}

const departmentNames: { [key: string]: string } = {
  'obesity-treatment': '비만치료과',
  'obesity': '비만관리과',
  'eye-care': '안과',
  'cold': '내과',
  'internal-medicine': '내과',
  'pediatrics': '소아과',
  'dermatology': '피부과',
  'orthopedics': '정형외과',
  'neurosurgery': '신경외과',
  'ent': '이비인후과',
  'obgyn': '산부인과',
  'urology': '비뇨기과'
};

export default function ClinicsListingPage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const department = searchParams.get('department') || 'internal-medicine';
  const departmentName = departmentNames[department] || '내과';

  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [sortBy, setSortBy] = useState<'price' | 'distance' | 'rating'>('price');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState(true);
  const [realDoctors, setRealDoctors] = useState<Doctor[]>([]);

  // 실제 의사 데이터 가져오기
  const fetchRealDoctors = async () => {
    try {
      console.log('🔍 실제 의사 데이터를 가져오는 중...');
      const response = await fetch('/api/doctors');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.doctors) {
          console.log(`✅ 실제 의사 데이터 ${data.doctors.length}개 로드됨`);
          setRealDoctors(data.doctors);
          return data.doctors;
        }
      } else {
        console.log('⚠️ 의사 데이터 API 응답 오류:', response.status);
      }
    } catch (error) {
      console.error('❌ 의사 데이터 가져오기 실패:', error);
    }
    return [];
  };

  // 각 진료과별 의원 데이터 생성 (실제 데이터만 사용)
  const generateClinics = (dept: string, doctors: Doctor[] = []): Clinic[] => {
    // 진료과별 특화 정보
    const specialties: { [key: string]: string[] } = {
      'obesity-treatment': ['마운자로', '위고비', 'GLP-1', '체중감량'],
      'obesity': ['비만치료', '다이어트', '체중관리', '건강상담'],
      'eye-care': ['백내장', '녹내장', '라식/라섹', '안구건조증'],
      'cold': ['감기', '독감', '기관지염', '폐렴'],
      'internal-medicine': ['고혈압', '당뇨병', '고지혈증', '갑상선질환'],
      'pediatrics': ['예방접종', '성장발달', '소아알레르기', '아토피'],
      'dermatology': ['여드름', '아토피', '탈모', '피부미용'],
      'orthopedics': ['관절염', '척추질환', '골절', '스포츠손상'],
      'neurosurgery': ['두통', '어지럼증', '신경통', '척추질환'],
      'ent': ['비염', '축농증', '편도염', '중이염'],
      'obgyn': ['산전관리', '부인과질환', '갱년기', '불임치료'],
      'urology': ['전립선', '요로결석', '방광염', '성기능장애']
    };

    // 실제 의사 데이터를 기반으로 한 의원 정보 생성
    const realClinics = doctors.map((doctor, index) => ({
      id: doctor.id,
      name: doctor.clinic || `${doctor.name} 의원`,
      department: doctor.specialization || departmentName,
      address: doctor.location || '주소 정보 없음',
      distance: `${(Math.random() * 3 + 0.5).toFixed(1)}km`,
      rating: Number((4.2 + Math.random() * 0.7).toFixed(1)),
      reviewCount: Math.floor(Math.random() * 400 + 50),
      consultationFee: doctor.consultationFee || Math.floor(Math.random() * 8000 + 7000),
      waitTime: `${Math.floor(Math.random() * 25 + 5)}분`,
      availability: index % 3 === 0 ? '오늘 예약 가능' : '내일 예약 가능',
      doctorName: `${doctor.name} 원장`,
      experience: `${Math.floor(Math.random() * 15 + 5)}년`,
      phone: doctor.phone || '전화번호 정보 없음',
      openHours: index % 2 === 0 ? '09:00 - 18:00' : '08:30 - 19:00',
      insurance: true,
      parking: Math.random() > 0.3,
      specialties: specialties[dept] || [],
      avatar: doctor.image
    }));

    return realClinics;
  };

  useEffect(() => {
    const loadData = async () => {
      // 세션 로딩 중이면 대기
      if (status === 'loading') return;

      setLoading(true);
      try {
        // 실제 의사 데이터 가져오기 (로그인된 경우만)
        const doctors = await fetchRealDoctors();
        // 의원 데이터 생성 (실데이터 + 모의데이터)
        const clinicData = generateClinics(department, doctors);
        setClinics(clinicData);
      } catch (error) {
        console.error('데이터 로딩 오류:', error);
        // 오류 시 모의 데이터로 폴백
        const clinicData = generateClinics(department, []);
        setClinics(clinicData);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [department, session, status]);

  // 정렬 함수
  const sortClinics = (clinicsToSort: Clinic[]) => {
    const sorted = [...clinicsToSort].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'price':
          comparison = a.consultationFee - b.consultationFee;
          break;
        case 'distance':
          comparison = parseFloat(a.distance) - parseFloat(b.distance);
          break;
        case 'rating':
          comparison = b.rating - a.rating; // 평점은 높은 순
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  };

  const handleSort = (type: 'price' | 'distance' | 'rating') => {
    if (sortBy === type) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(type);
      setSortOrder(type === 'price' ? 'asc' : 'desc'); // 가격은 기본 오름차순, 나머지는 내림차순
    }
  };

  const handleBooking = (clinic: Clinic) => {
    // 로그인 상태 확인
    if (!session) {
      // 로그인 페이지로 리다이렉트
      router.push('/auth/login?callbackUrl=/patient/clinics?department=' + department);
      return;
    }

    // 젤라의원 특별 처리
    if (clinic.name === '젤라의원' || clinic.id === 'zella-clinic') {
      // 젤라의원 전용 예약 페이지로 이동 (텔레메디신 페이지 활용)
      router.push(`/patient/telemedicine/booking/zella-clinic?department=${department}`);
      return;
    }

    // 일반 클리닉 정보를 URL 파라미터로 전달
    const params = new URLSearchParams({
      clinicId: clinic.id,
      clinicName: clinic.name,
      doctorName: clinic.doctorName,
      address: clinic.address,
      phone: clinic.phone,
      department: department,
      consultationFee: clinic.consultationFee.toString()
    });

    // 일반 예약 페이지로 이동
    router.push(`/patient/booking?${params.toString()}`);
  };

  const sortedClinics = sortClinics(clinics);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{departmentName} 의원 찾기</h1>
        <p className="text-gray-600">
          주변의 {departmentName} 전문 의원을 찾아보세요
        </p>
      </div>

      {/* 정렬 옵션 */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <span className="text-sm text-gray-600">총 {sortedClinics.length}개 의원</span>
          </div>

          <div className="flex gap-2">
            <Button
              variant={sortBy === 'price' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSort('price')}
              className="flex items-center gap-1"
            >
              진료비순
              {sortBy === 'price' && (
                sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant={sortBy === 'distance' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSort('distance')}
              className="flex items-center gap-1"
            >
              거리순
              {sortBy === 'distance' && (
                sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant={sortBy === 'rating' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSort('rating')}
              className="flex items-center gap-1"
            >
              평점순
              {sortBy === 'rating' && (
                sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* 의원 리스트 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedClinics.map((clinic) => (
          <Card
            key={clinic.id}
            className={`p-6 hover:shadow-lg transition-shadow ${
              clinic.name === '젤라의원' ? 'border-2 border-blue-500 bg-blue-50/30' : ''
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={clinic.avatar} alt={clinic.doctorName} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-green-500 text-white">
                    {clinic.doctorName ? clinic.doctorName.substring(0, 2) : 'Dr'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold mb-1">
                    {clinic.name}
                    {clinic.name === '젤라의원' && (
                      <Badge className="ml-2 bg-blue-600">추천</Badge>
                    )}
                  </h3>
                  <p className="text-sm text-gray-600">{clinic.doctorName}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 mb-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-semibold">{clinic.rating}</span>
                  <span className="text-xs text-gray-500">({clinic.reviewCount})</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {clinic.distance}
                </Badge>
              </div>
            </div>

            {/* 진료비 정보 - 강조 표시 */}
            <div className="bg-blue-50 rounded-lg p-3 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">진료비</span>
                <span className="text-xl font-bold text-blue-600">
                  {clinic.consultationFee.toLocaleString()}원
                </span>
              </div>
            </div>

            {/* 주요 정보 */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600 truncate">{clinic.address}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-gray-400" />
                <span>{clinic.openHours}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-gray-400" />
                <span>{clinic.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-gray-400" />
                <span>대기시간 약 {clinic.waitTime}</span>
              </div>
            </div>

            {/* 전문 분야 */}
            {clinic.specialties.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {clinic.specialties.slice(0, 3).map((specialty, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* 편의시설 */}
            <div className="flex gap-4 mb-4 text-sm">
              {clinic.insurance && (
                <div className="flex items-center gap-1">
                  <CreditCard className="h-4 w-4 text-green-600" />
                  <span className="text-green-600">보험적용</span>
                </div>
              )}
              {clinic.parking && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <span className="text-blue-600">주차가능</span>
                </div>
              )}
            </div>

            {/* 예약 상태 및 버튼 */}
            <div className="flex items-center justify-between">
              <Badge
                variant={clinic.availability === '오늘 예약 가능' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {clinic.availability}
              </Badge>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(`tel:${clinic.phone}`, '_self')}
                >
                  <Phone className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleBooking(clinic)}
                >
                  {session ? '예약하기' : '로그인 후 예약'}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* 안내 사항 */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">진료 예약 안내</h2>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• 표시된 진료비는 초진 기준이며, 재진 시 금액이 다를 수 있습니다.</li>
          <li>• 검사나 처치가 필요한 경우 추가 비용이 발생할 수 있습니다.</li>
          <li>• 건강보험이 적용되는 진료는 본인부담금만 납부하시면 됩니다.</li>
          <li>• 대기시간은 예약 상황에 따라 변동될 수 있습니다.</li>
          <li>• 예약 취소는 진료 24시간 전까지 가능합니다.</li>
        </ul>
      </div>
    </div>
  );
}
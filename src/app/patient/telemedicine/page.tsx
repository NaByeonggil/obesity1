'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Video,
  Clock,
  MapPin,
  Star,
  Filter,
  ChevronUp,
  ChevronDown,
  Phone,
  Calendar
} from 'lucide-react';

interface TelemedicineClinic {
  id: string;
  name: string;
  specialties: string[];
  price: number;
  rating: number;
  availableSlots: number;
  waitTime: string;
  doctorName: string;
  experience: string;
  languages: string[];
  availability: string;
  hasVideo: boolean;
  hasPhone: boolean;
  responseTime: string;
}

export default function TelemedicineListingPage() {
  const [clinics, setClinics] = useState<TelemedicineClinic[]>([]);
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'availability'>('price');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // 더미 데이터 - 실제로는 API에서 가져옴
  const mockClinics: TelemedicineClinic[] = [
    {
      id: '1',
      name: '서울 비대면 내과',
      specialties: ['내과', '가정의학과'],
      price: 15000,
      rating: 4.8,
      availableSlots: 8,
      waitTime: '즉시 가능',
      doctorName: '김민수 원장',
      experience: '15년',
      languages: ['한국어', '영어'],
      availability: '09:00 - 22:00',
      hasVideo: true,
      hasPhone: true,
      responseTime: '5분 이내'
    },
    {
      id: '2',
      name: '온라인 가정의학과',
      specialties: ['가정의학과', '내과'],
      price: 12000,
      rating: 4.6,
      availableSlots: 5,
      waitTime: '10분 대기',
      doctorName: '이정희 원장',
      experience: '10년',
      languages: ['한국어'],
      availability: '08:00 - 20:00',
      hasVideo: true,
      hasPhone: false,
      responseTime: '10분 이내'
    },
    {
      id: '3',
      name: '디지털 헬스케어 센터',
      specialties: ['내과', '피부과', '정신건강의학과'],
      price: 20000,
      rating: 4.9,
      availableSlots: 12,
      waitTime: '즉시 가능',
      doctorName: '박준영 원장',
      experience: '20년',
      languages: ['한국어', '영어', '중국어'],
      availability: '24시간',
      hasVideo: true,
      hasPhone: true,
      responseTime: '3분 이내'
    },
    {
      id: '4',
      name: '스마트 원격진료 클리닉',
      specialties: ['피부과', '성형외과'],
      price: 25000,
      rating: 4.7,
      availableSlots: 3,
      waitTime: '30분 대기',
      doctorName: '최서연 원장',
      experience: '12년',
      languages: ['한국어', '영어'],
      availability: '10:00 - 19:00',
      hasVideo: true,
      hasPhone: true,
      responseTime: '15분 이내'
    },
    {
      id: '5',
      name: '마음편한 정신건강 클리닉',
      specialties: ['정신건강의학과'],
      price: 35000,
      rating: 4.9,
      availableSlots: 6,
      waitTime: '예약 필요',
      doctorName: '정현우 원장',
      experience: '18년',
      languages: ['한국어'],
      availability: '09:00 - 18:00',
      hasVideo: true,
      hasPhone: false,
      responseTime: '예약제'
    },
    {
      id: '6',
      name: '365 온라인 진료',
      specialties: ['내과', '가정의학과', '소아과'],
      price: 10000,
      rating: 4.5,
      availableSlots: 15,
      waitTime: '즉시 가능',
      doctorName: '강지민 원장',
      experience: '8년',
      languages: ['한국어'],
      availability: '24시간',
      hasVideo: true,
      hasPhone: true,
      responseTime: '5분 이내'
    }
  ];

  const specialties = ['all', '내과', '가정의학과', '피부과', '정신건강의학과', '소아과', '성형외과'];

  useEffect(() => {
    // 초기 데이터 로드
    setLoading(true);
    setTimeout(() => {
      setClinics(mockClinics);
      setLoading(false);
    }, 500);
  }, []);

  // 정렬 함수
  const sortClinics = (clinicsToSort: TelemedicineClinic[]) => {
    const sorted = [...clinicsToSort].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'rating':
          comparison = b.rating - a.rating; // 평점은 높은 순
          break;
        case 'availability':
          comparison = b.availableSlots - a.availableSlots; // 가능 슬롯 많은 순
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  };

  // 필터링 함수
  const filterClinics = () => {
    let filtered = [...mockClinics];

    if (selectedSpecialty !== 'all') {
      filtered = filtered.filter(clinic =>
        clinic.specialties.includes(selectedSpecialty)
      );
    }

    return sortClinics(filtered);
  };

  const handleSort = (type: 'price' | 'rating' | 'availability') => {
    if (sortBy === type) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(type);
      setSortOrder('asc');
    }
  };

  const handleBooking = (clinicId: string) => {
    // 예약 페이지로 이동
    window.location.href = `/patient/telemedicine/booking/${clinicId}`;
  };

  const filteredAndSortedClinics = filterClinics();

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
        <h1 className="text-3xl font-bold mb-2">비대면 진료</h1>
        <p className="text-gray-600">
          집에서 편하게 받는 온라인 진료 서비스
        </p>
      </div>

      {/* 필터 및 정렬 */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          {/* 진료과 필터 */}
          <div className="flex flex-wrap gap-2">
            {specialties.map((specialty) => (
              <Button
                key={specialty}
                variant={selectedSpecialty === specialty ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedSpecialty(specialty)}
              >
                {specialty === 'all' ? '전체' : specialty}
              </Button>
            ))}
          </div>

          {/* 정렬 옵션 */}
          <div className="flex gap-2">
            <Button
              variant={sortBy === 'price' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSort('price')}
              className="flex items-center gap-1"
            >
              가격순
              {sortBy === 'price' && (
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
            <Button
              variant={sortBy === 'availability' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSort('availability')}
              className="flex items-center gap-1"
            >
              예약가능순
              {sortBy === 'availability' && (
                sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* 결과 수 */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          총 {filteredAndSortedClinics.length}개의 비대면 진료 가능 의원
        </p>
      </div>

      {/* 의원 리스트 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedClinics.map((clinic) => (
          <Card key={clinic.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">{clinic.name}</h3>
                <p className="text-sm text-gray-600">{clinic.doctorName}</p>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-semibold">{clinic.rating}</span>
              </div>
            </div>

            {/* 진료과 태그 */}
            <div className="flex flex-wrap gap-1 mb-3">
              {clinic.specialties.map((specialty) => (
                <Badge key={specialty} variant="secondary" className="text-xs">
                  {specialty}
                </Badge>
              ))}
            </div>

            {/* 가격 정보 */}
            <div className="bg-blue-50 rounded-lg p-3 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">진료비</span>
                <span className="text-xl font-bold text-blue-600">
                  {clinic.price.toLocaleString()}원
                </span>
              </div>
            </div>

            {/* 상세 정보 */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-gray-400" />
                <span>{clinic.availability}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">대기시간:</span>
                <Badge variant={clinic.waitTime === '즉시 가능' ? 'default' : 'secondary'} className="text-xs">
                  {clinic.waitTime}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">응답시간:</span>
                <span>{clinic.responseTime}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">경력:</span>
                <span>{clinic.experience}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">언어:</span>
                <span>{clinic.languages.join(', ')}</span>
              </div>
            </div>

            {/* 진료 방식 */}
            <div className="flex gap-2 mb-4">
              {clinic.hasVideo && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Video className="h-3 w-3" />
                  화상진료
                </Badge>
              )}
              {clinic.hasPhone && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  전화진료
                </Badge>
              )}
            </div>

            {/* 예약 버튼 */}
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={() => handleBooking(clinic.id)}
                disabled={clinic.availableSlots === 0}
              >
                {clinic.availableSlots > 0
                  ? `예약하기 (${clinic.availableSlots}개 슬롯)`
                  : '예약 마감'}
              </Button>
              <Button variant="outline" size="icon">
                <Calendar className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* 빈 결과 */}
      {filteredAndSortedClinics.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">해당 조건에 맞는 의원이 없습니다.</p>
          <Button
            variant="outline"
            onClick={() => setSelectedSpecialty('all')}
          >
            전체 보기
          </Button>
        </div>
      )}

      {/* 안내 사항 */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">비대면 진료 안내</h2>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• 비대면 진료는 의료법에 따라 재진 환자 또는 의료 취약 지역 거주자에 한해 가능합니다.</li>
          <li>• 첫 진료는 대면 진료를 권장하며, 의사 판단에 따라 대면 진료가 필요할 수 있습니다.</li>
          <li>• 처방전은 전자처방전으로 발급되며, 가까운 약국에서 수령 가능합니다.</li>
          <li>• 진료비는 예약 시 사전 결제되며, 취소 시 규정에 따라 환불됩니다.</li>
          <li>• 안정적인 인터넷 환경과 카메라가 있는 기기가 필요합니다.</li>
        </ul>
      </div>
    </div>
  );
}
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow rounded-lg p-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost">← 홈으로 돌아가기</Button>
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-8">개인정보 처리방침</h1>

        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. 개인정보의 수집 및 이용 목적</h2>
            <p className="leading-relaxed mb-2">
              회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보 보호법에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
            </p>
            <ul className="list-disc list-inside space-y-2 leading-relaxed">
              <li>회원 가입 및 관리</li>
              <li>의료 상담 및 예약 서비스 제공</li>
              <li>처방전 발급 및 관리</li>
              <li>서비스 개선 및 맞춤형 서비스 제공</li>
              <li>법령 및 이용약관을 위반하는 회원에 대한 이용 제한 조치</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. 수집하는 개인정보 항목</h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold mb-2">필수 항목:</h3>
                <ul className="list-disc list-inside space-y-1 leading-relaxed">
                  <li>이름, 이메일, 전화번호</li>
                  <li>주민등록번호 (의료법에 따른 본인 확인용)</li>
                  <li>주소 (처방전 배송 등)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">선택 항목:</h3>
                <ul className="list-disc list-inside space-y-1 leading-relaxed">
                  <li>프로필 사진</li>
                  <li>건강 정보 (알레르기, 복용 중인 약 등)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">자동 수집 항목:</h3>
                <ul className="list-disc list-inside space-y-1 leading-relaxed">
                  <li>서비스 이용 기록, 접속 로그, 쿠키, 접속 IP 정보</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. 개인정보의 보유 및 이용 기간</h2>
            <p className="leading-relaxed mb-2">
              회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의 받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
            </p>
            <ul className="list-disc list-inside space-y-2 leading-relaxed">
              <li>회원 탈퇴 시까지 (단, 관계 법령에 따라 보존 필요 시 해당 기간)</li>
              <li>의료법에 따른 진료기록: 10년</li>
              <li>처방전 기록: 3년</li>
              <li>결제 관련 정보: 5년 (전자상거래법)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. 개인정보의 제3자 제공</h2>
            <p className="leading-relaxed mb-2">
              회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 다만, 아래의 경우에는 예외로 합니다:
            </p>
            <ul className="list-disc list-inside space-y-2 leading-relaxed">
              <li>이용자가 사전에 동의한 경우</li>
              <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
              <li>의료 서비스 제공을 위해 협력 병원/약국에 필요 최소한의 정보 제공</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. 개인정보 처리의 위탁</h2>
            <p className="leading-relaxed mb-2">
              회사는 서비스 제공을 위하여 필요한 경우 개인정보 처리 업무를 외부 전문업체에 위탁할 수 있습니다.
            </p>
            <div className="bg-gray-50 p-4 rounded">
              <p className="font-semibold mb-2">현재 위탁 업무:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>SMS 발송: (주)문자 서비스 - 예약 확인 및 알림</li>
                <li>결제 처리: (주)결제 대행사 - 결제 및 환불 처리</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. 정보주체의 권리·의무 및 행사 방법</h2>
            <p className="leading-relaxed mb-2">
              정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다:
            </p>
            <ul className="list-disc list-inside space-y-2 leading-relaxed">
              <li>개인정보 열람 요구</li>
              <li>오류 등이 있을 경우 정정 요구</li>
              <li>삭제 요구</li>
              <li>처리정지 요구</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. 개인정보의 파기</h2>
            <p className="leading-relaxed">
              회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.
              전자적 파일 형태는 복구 불가능한 방법으로 영구 삭제하며, 종이 문서는 분쇄하거나 소각합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. 개인정보 보호책임자</h2>
            <div className="bg-gray-50 p-4 rounded space-y-2">
              <p><strong>개인정보 보호책임자:</strong> 홍길동</p>
              <p><strong>이메일:</strong> privacy@healthcare.com</p>
              <p><strong>전화:</strong> 02-1234-5678</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. 개인정보 자동 수집 장치의 설치·운영 및 거부</h2>
            <p className="leading-relaxed">
              회사는 이용자에게 개별적인 맞춤서비스를 제공하기 위해 이용 정보를 저장하고 수시로 불러오는 '쿠키(cookie)'를 사용합니다.
              쿠키 설정 거부 방법은 웹 브라우저의 옵션을 선택함으로써 거부할 수 있습니다.
            </p>
          </section>

          <section className="pt-6 border-t">
            <p className="text-sm text-gray-600 mb-2">
              <strong>시행일자:</strong> 2025년 10월 4일
            </p>
            <p className="text-sm text-gray-600">
              본 개인정보 처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

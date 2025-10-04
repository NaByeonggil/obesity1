import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow rounded-lg p-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost">← 홈으로 돌아가기</Button>
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-8">이용약관</h1>

        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold mb-3">제1조 (목적)</h2>
            <p className="leading-relaxed">
              본 약관은 헬스케어 플랫폼(이하 "서비스")의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">제2조 (정의)</h2>
            <ul className="list-disc list-inside space-y-2 leading-relaxed">
              <li>"서비스"란 회사가 제공하는 온라인 의료 상담 및 예약 서비스를 의미합니다.</li>
              <li>"회원"이란 본 약관에 동의하고 서비스를 이용하는 자를 의미합니다.</li>
              <li>"의료진"이란 서비스에 등록된 의사, 간호사 등 의료 전문가를 의미합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">제3조 (약관의 효력 및 변경)</h2>
            <p className="leading-relaxed">
              본 약관은 서비스를 이용하고자 하는 모든 회원에 대하여 그 효력이 발생합니다.
              회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">제4조 (회원가입)</h2>
            <p className="leading-relaxed mb-2">
              회원가입은 이용자가 본 약관에 동의하고 회사가 정한 가입 절차를 완료함으로써 이루어집니다.
            </p>
            <ul className="list-disc list-inside space-y-2 leading-relaxed">
              <li>허위 정보를 기재한 경우</li>
              <li>타인의 명의를 도용한 경우</li>
              <li>회원 자격을 상실한 적이 있는 경우</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">제5조 (서비스의 제공)</h2>
            <p className="leading-relaxed mb-2">회사는 다음과 같은 서비스를 제공합니다:</p>
            <ul className="list-disc list-inside space-y-2 leading-relaxed">
              <li>온라인/오프라인 의료 상담 예약</li>
              <li>처방전 관리 및 조회</li>
              <li>의료진 검색 및 정보 제공</li>
              <li>약국 검색 및 처방전 전송</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">제6조 (개인정보 보호)</h2>
            <p className="leading-relaxed">
              회사는 회원의 개인정보를 보호하기 위하여 개인정보 처리방침을 수립하고 이를 준수합니다.
              자세한 사항은 개인정보 처리방침을 참조하시기 바랍니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">제7조 (회원의 의무)</h2>
            <p className="leading-relaxed mb-2">회원은 다음 행위를 하여서는 안 됩니다:</p>
            <ul className="list-disc list-inside space-y-2 leading-relaxed">
              <li>허위 정보의 기재</li>
              <li>타인의 정보 도용</li>
              <li>서비스의 부정 이용</li>
              <li>의료법 등 관련 법령 위반 행위</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">제8조 (책임 제한)</h2>
            <p className="leading-relaxed">
              회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 책임이 면제됩니다.
              회사는 회원의 귀책사유로 인한 서비스 이용 장애에 대하여 책임을 지지 않습니다.
            </p>
          </section>

          <section className="pt-6 border-t">
            <p className="text-sm text-gray-600">
              최종 업데이트: 2025년 10월 4일
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

import { useEffect, useState } from "react"
import QRFlow from "../QRFlow"
import { verifyStudent, type StudentInfo } from "../api/studentApi"
import { getStudentVisits, type StudentVisit, type VisitStatus } from "../api/visitApi"

type Tab = "home" | "hospitals" | "history" | "profile"
type Screen = "home" | "detail" | "how" | "qrflow" | "hospitals"
type AuthStep = "login" | "consent" | "app"

interface LeaveRecord {
  id: string
  date: string
  hospital: string
  diagnosis: string
  status: "완료" | "처리중" | "거절"
  submittedAt: string
}

const records: LeaveRecord[] = [
  {
    id: "1",
    date: "2026.08.22",
    hospital: "연세세브란스병원",
    diagnosis: "급성 인후염",
    status: "완료",
    submittedAt: "2026.08.22 14:32",
  },
  {
    id: "2",
    date: "2026.08.15",
    hospital: "서울대학교병원",
    diagnosis: "위장염",
    status: "완료",
    submittedAt: "2026.08.15 11:18",
  },
  {
    id: "3",
    date: "2026.07.30",
    hospital: "가톨릭대학교서울성모병원",
    diagnosis: "독감 (인플루엔자)",
    status: "완료",
    submittedAt: "2026.07.30 09:55",
  },
  {
    id: "4",
    date: "2026.07.10",
    hospital: "고려대학교안암병원",
    diagnosis: "급성 기관지염",
    status: "완료",
    submittedAt: "2026.07.10 16:40",
  },
]

const hospitals = [
  {
    name: "연세세브란스병원",
    area: "서대문구",
    distance: "2.1km",
    code: "H001",
  },
  {
    name: "서울대학교병원",
    area: "종로구",
    distance: "3.4km",
    code: "H002",
  },
  {
    name: "가톨릭대학교서울성모병원",
    area: "서초구",
    distance: "5.8km",
    code: "H003",
  },
  {
    name: "고려대학교안암병원",
    area: "성북구",
    distance: "1.9km",
    code: "H004",
  },
  {
    name: "삼성서울병원",
    area: "강남구",
    distance: "8.2km",
    code: "H005",
  },
  {
    name: "아산서울병원",
    area: "송파구",
    distance: "9.1km",
    code: "H006",
  },
]

function StatusBadge({ status }: { status: LeaveRecord["status"] }) {
  const styles = {
    완료: "bg-mint-50 text-mint-700 border border-mint-200",
    처리중: "bg-blue-50 text-brand-700 border border-brand-200",
    거절: "bg-red-50 text-red-600 border border-red-200",
  }

  const dots = {
    완료: "bg-mint-500",
    처리중: "bg-brand-500",
    거절: "bg-red-500",
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[status]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status]}`} />
      {status}
    </span>
  )
}

function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

/* ─── 최초 1회 로그인 (앱 진입 시) ─── */
function AppLoginScreen({ onNext }: { onNext: (student: StudentInfo) => void }) {
  const [studentId, setStudentId] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const valid = studentId.length >= 8 && name.length >= 2

  const handleSubmit = async () => {
    if (!valid) return
    setLoading(true)
    setError("")
    try {
      const student = await verifyStudent(import.meta.env.VITE_UNIVERSITY_CODE || "SSU", studentId, name)
      onNext(student)
    } catch (cause) {
      console.error("학생 인증 실패", cause)
      setError(cause instanceof Error ? cause.message : "학생 인증에 실패했습니다.")
    } finally { setLoading(false) }
  }

  return (
    <div className="flex flex-col min-h-full bg-[#f7f9fc]">
      <div className="flex-1 overflow-y-auto px-6 pt-16 pb-8">
        <div className="flex items-center gap-3 mb-8 p-4 bg-white rounded-2xl border border-gray-100">
          <div className="w-11 h-11 rounded-xl bg-brand-600 flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">숭</span>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">연동 학교</p>
            <p className="text-sm font-bold text-gray-900">숭실대학교</p>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-mint-500" />
            <span className="text-xs font-semibold text-mint-600">연동</span>
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          학교 계정으로
          <br />
          로그인
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          학번과 이름을 입력해 본인인증을 진행합니다. 한 번 인증하면 이후 병원
          방문 시 다시 로그인하지 않아도 됩니다.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5 pl-1">
              학번
            </label>
            <input
              type="text"
              placeholder="20230000"
              maxLength={10}
              value={studentId}
              onChange={(e) => setStudentId(e.target.value.replace(/\D/g, ""))}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5 pl-1">
              이름
            </label>
            <input
              type="text"
              placeholder="홍길동"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all"
            />
          </div>
        </div>

        <div className="mt-6 p-4 bg-brand-50 border border-brand-100 rounded-xl">
          <p className="text-xs text-brand-700 leading-relaxed">
            <span className="font-bold">개인정보 안내 —</span> 입력하신 정보는
            본인인증 목적으로만 사용되며 서버에 저장되지 않습니다.
          </p>
        </div>
      </div>

      <div className="px-6 pb-10 pt-4 bg-white border-t border-gray-100">
        <button
          onClick={handleSubmit}
          disabled={!valid || loading}
          className={`w-full font-bold text-base py-4 rounded-2xl transition-all duration-150 ${
            valid && !loading
              ? "bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white shadow-lg shadow-brand-200"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="w-4 h-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              인증 중…
            </span>
          ) : (
            "인증하고 계속하기"
          )}
        </button>
      </div>
    </div>
  )
}

/* ─── 최초 1회 개인정보 제공 동의 (앱 진입 시) ─── */
function AppConsentScreen({ onNext }: { onNext: () => void }) {
  const [checked, setChecked] = useState(false)

  const shared = [
    { label: "진료일자", desc: "제휴 병원 방문 날짜" },
    { label: "병원명", desc: "진료받은 제휴 병원" },
    { label: "인증 여부", desc: "진료 완료 여부 (코드)" },
  ]

  return (
    <div className="flex flex-col min-h-full bg-[#f7f9fc]">
      <div className="flex-1 overflow-y-auto px-6 pt-16 pb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          개인정보
          <br />
          제공 동의
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          앞으로 제휴 병원에서 진료받을 때마다, 별도 서류 제출 없이 아래 정보가
          학교로 자동 전달됩니다.
        </p>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-5">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
            <span className="text-xs font-bold text-gray-500">전달 항목</span>
          </div>
          {shared.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50 last:border-0"
            >
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  {item.label}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-100">
                <svg
                  className="w-3 h-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                전달
              </div>
            </div>
          ))}
        </div>

        <div className="bg-mint-50 border border-mint-200 rounded-2xl p-4 mb-5">
          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-mint-500 flex items-center justify-center shrink-0 mt-0.5">
              <svg
                className="w-3 h-3 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="text-xs text-mint-800 leading-relaxed font-medium">
              <span className="font-bold">
                진단명·처방전 등 상세 진료 내용은 전달되지 않습니다.
              </span>{" "}
              병원 방문 사실과 날짜만 암호화된 코드로 전달됩니다.
            </p>
          </div>
        </div>

        <button
          onClick={() => setChecked(!checked)}
          className="w-full flex items-start gap-3 bg-white border-2 rounded-2xl p-4 transition-all"
          style={{ borderColor: checked ? "#0170bf" : "#e5e7eb" }}
        >
          <div
            className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
              checked ? "bg-brand-600" : "bg-gray-100"
            }`}
          >
            {checked && (
              <svg
                className="w-3.5 h-3.5 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
          <p className="text-sm font-semibold text-gray-800 text-left leading-relaxed">
            진료 사실을 학교에 자동 전달하는 것에 동의합니다.
            <span className="block text-xs text-gray-400 font-normal mt-0.5">
              마이페이지에서 언제든 동의를 철회할 수 있습니다.
            </span>
          </p>
        </button>
      </div>

      <div className="px-6 pb-10 pt-4 bg-white border-t border-gray-100">
        <button
          onClick={onNext}
          disabled={!checked}
          className={`w-full font-bold text-base py-4 rounded-2xl transition-all duration-150 ${
            checked
              ? "bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white shadow-lg shadow-brand-200"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          동의하고 계속하기
        </button>
      </div>
    </div>
  )
}

function HomeScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [showNotif, setShowNotif] = useState(false)

  return (
    <div className="flex flex-col min-h-full bg-[#f7f9fc]">
      <div className="bg-white px-5 pt-12 pb-5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium tracking-wide">
              숭실대학교 · 소프트웨어학부 3학년
            </p>
            <h1 className="text-lg font-bold text-gray-900 mt-0.5">
              안녕하세요, 정유채님 👋
            </h1>
          </div>

          <button
            onClick={() => setShowNotif(!showNotif)}
            className="relative w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>

            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-mint-500 rounded-full border-2 border-white" />
          </button>
        </div>

        {showNotif && (
          <div className="mt-4 bg-mint-50 border border-mint-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-mint-100 flex items-center justify-center shrink-0">
                <CheckIcon className="w-4 h-4 text-mint-600" />
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-900">
                  보건결석 처리 완료
                </p>

                <p className="text-xs text-gray-500 mt-0.5">
                  연세세브란스병원 진료 기록이 학교에 자동 전달되어 결석 처리가
                  완료되었습니다.
                </p>

                <p className="text-xs text-mint-600 font-medium mt-1">
                  2026.08.22 · 오늘
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-5">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 p-6 text-white shadow-lg shadow-brand-200">
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5" />
          <div className="absolute -bottom-12 -right-4 w-48 h-48 rounded-full bg-white/5" />

          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-mint-400 flex items-center justify-center">
                <CheckIcon className="w-3.5 h-3.5 text-white" />
              </div>

              <span className="text-sm font-semibold text-brand-100">
                서비스 연동 중
              </span>
            </div>

            <p className="text-white/70 text-sm mb-1">
              이번 학기 보건결석 현황
            </p>

            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">4</span>
              <span className="text-brand-200 text-lg">회 자동 처리됨</span>
            </div>

            <div className="mt-5 pt-4 border-t border-white/15 flex items-center justify-between">
              <div>
                <p className="text-xs text-white/60">마지막 처리</p>
                <p className="text-sm font-semibold text-white mt-0.5">
                  2026.08.22 · 연세세브란스
                </p>
              </div>

              <button
                onClick={() => onNavigate("detail")}
                className="flex items-center gap-1 text-xs font-semibold text-brand-100 hover:text-white transition-colors"
              >
                자세히 보기
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={() => onNavigate("qrflow")}
          className="w-full flex items-center gap-4 bg-white border-2 border-dashed border-brand-200 rounded-2xl p-4 hover:border-brand-400 hover:shadow-sm transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center shrink-0">
            QR
          </div>

          <div className="flex-1 text-left">
            <p className="text-sm font-bold text-gray-900">병원 QR 스캔</p>

            <p className="text-xs text-gray-400 mt-0.5">
              접수부터 처리 완료까지 한 번에
            </p>
          </div>
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onNavigate("how")}
            className="bg-white rounded-2xl p-4 text-left border border-gray-100"
          >
            <p className="text-sm font-semibold text-gray-900">이용 방법</p>

            <p className="text-xs text-gray-400 mt-0.5">서비스 안내 보기</p>
          </button>

          <button
            onClick={() => onNavigate("hospitals")}
            className="bg-white rounded-2xl p-4 text-left border border-gray-100"
          >
            <p className="text-sm font-semibold text-gray-900">
              제휴 병원 찾기
            </p>

            <p className="text-xs text-gray-400 mt-0.5">내 주변 병원 보기</p>
          </button>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-900">
              최근 처리 내역
            </h2>

            <button
              onClick={() => onNavigate("detail")}
              className="text-xs text-brand-600 font-semibold"
            >
              전체보기
            </button>
          </div>

          <div className="space-y-2.5">
            {records.slice(0, 3).map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-4"
              >
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">
                    {r.hospital}
                  </p>

                  <p className="text-xs text-gray-400 mt-0.5">
                    {r.date} · {r.diagnosis}
                  </p>
                </div>

                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function BackButton({ onBack }: { onBack: () => void }) {
  return (
    <button
      onClick={onBack}
      className="flex items-center gap-1.5 text-brand-600 text-sm font-semibold mb-4 hover:text-brand-800 transition-colors"
    >
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="15 18 9 12 15 6" />
      </svg>
      돌아가기
    </button>
  )
}

function HistoryScreen({ onBack, studentId }: { onBack?: () => void; studentId: number }) {
  const [filter, setFilter] = useState<"전체" | "완료" | "처리중">("전체")
  const [visits, setVisits] = useState<StudentVisit[]>([])
  const [error, setError] = useState("")

  useEffect(() => {
    getStudentVisits(studentId).then(setVisits).catch((cause) => {
      console.error("학생 Visit 목록 조회 실패", cause)
      setError(cause instanceof Error ? cause.message : "처리 내역을 불러오지 못했습니다.")
    })
  }, [studentId])

  const filters: Array<"전체" | "완료" | "처리중"> = ["전체", "완료", "처리중"]

  const statusLabel = (status: VisitStatus): LeaveRecord["status"] => status === "COMPLETED" ? "완료" : "처리중"
  const apiRecords: LeaveRecord[] = visits.map((visit) => ({ id: visit.visitId, date: new Date(visit.createdAt).toLocaleDateString("ko-KR"), hospital: visit.hospitalName, diagnosis: "상세 의료정보 미수집", status: statusLabel(visit.status), submittedAt: new Date(visit.createdAt).toLocaleString("ko-KR") }))
  const filtered = filter === "전체" ? apiRecords : apiRecords.filter((r) => r.status === filter)

  return (
    <div className="flex flex-col min-h-full bg-[#f7f9fc]">
      <div className="bg-white px-5 pt-12 pb-4 border-b border-gray-100">
        {onBack && <BackButton onBack={onBack} />}
        <h1 className="text-xl font-bold text-gray-900">처리 내역</h1>

        <p className="text-sm text-gray-400 mt-1">보건결석 자동 처리 기록</p>

        <div className="flex gap-2 mt-4">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                filter === f
                  ? "bg-brand-600 text-white"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3">
        {error && <p className="text-sm text-red-600">{error}</p>}
        {filtered.map((r) => (
          <div
            key={r.id}
            className="bg-white rounded-2xl p-5 border border-gray-100"
          >
            <div className="flex justify-between mb-3">
              <div>
                <p className="text-sm font-bold text-gray-900">{r.hospital}</p>

                <p className="text-xs text-gray-400 mt-0.5">{r.date}</p>
              </div>

              <StatusBadge status={r.status} />
            </div>

            <div className="bg-gray-50 rounded-xl p-3 space-y-2">
              <p className="text-xs text-gray-600">진단명: {r.diagnosis}</p>

              <p className="text-xs text-gray-600">
                전달 시각: {r.submittedAt}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function HospitalsScreen({ onBack }: { onBack?: () => void }) {
  const [search, setSearch] = useState("")

  const filtered = hospitals.filter(
    (h) => h.name.includes(search) || h.area.includes(search),
  )

  return (
    <div className="flex flex-col min-h-full bg-[#f7f9fc]">
      <div className="bg-white px-5 pt-12 pb-4 border-b border-gray-100">
        {onBack && <BackButton onBack={onBack} />}
        <h1 className="text-xl font-bold text-gray-900">제휴 병원</h1>

        <p className="text-sm text-gray-400 mt-1">
          {hospitals.length}개 병원과 연동 중
        </p>

        <input
          type="text"
          placeholder="병원명 또는 지역 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mt-4 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-2.5">
        {filtered.map((h) => (
          <div
            key={h.code}
            className="bg-white rounded-2xl p-4 border border-gray-100 flex justify-between"
          >
            <div>
              <p className="text-sm font-bold text-gray-900">{h.name}</p>

              <p className="text-xs text-gray-400 mt-0.5">
                {h.area} · {h.distance}
              </p>
            </div>

            <span className="text-xs font-semibold text-mint-600">연동</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function HowItWorksScreen({ onBack }: { onBack: () => void }) {
  const steps = [
    ["01", "제휴 병원 방문"],
    ["02", "진료 기록 자동 전송"],
    ["03", "학교 시스템 자동 처리"],
    ["04", "처리 완료 알림"],
  ]

  return (
    <div className="flex flex-col min-h-full bg-[#f7f9fc]">
      <div className="bg-white px-5 pt-12 pb-5 border-b border-gray-100">
        <BackButton onBack={onBack} />
        <h1 className="text-xl font-bold text-gray-900">이용 방법</h1>

        <p className="text-sm text-gray-400 mt-1">
          진료부터 처리 완료까지, 아무것도 안 해도 됩니다.
        </p>
      </div>

      <div className="flex-1 px-5 py-6 space-y-4">
        {steps.map(([num, title]) => (
          <div
            key={num}
            className="bg-white rounded-2xl p-5 border border-gray-100"
          >
            <p className="text-xs text-brand-500 font-bold">{num}</p>

            <h3 className="text-sm font-bold text-gray-900 mt-1">{title}</h3>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProfileScreen({ onBack }: { onBack?: () => void }) {
  const [consent, setConsent] = useState(true)
  const [pushNotif, setPushNotif] = useState(true)

  return (
    <div className="flex flex-col min-h-full bg-[#f7f9fc]">
      <div className="bg-white px-5 pt-12 pb-5 border-b border-gray-100">
        {onBack && <BackButton onBack={onBack} />}
        <h1 className="text-xl font-bold text-gray-900">내 정보</h1>
      </div>

      <div className="flex-1 px-5 py-5 space-y-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <p className="font-bold text-gray-900">김지수</p>

          <p className="text-xs text-gray-400 mt-1">
            2023123456 · 컴퓨터공학과
          </p>

          <p className="text-xs text-gray-400">한국대학교</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm font-semibold">자동 전달 동의</p>

              <p className="text-xs text-gray-400">진료 기록 자동 전달 허용</p>
            </div>

            <button
              onClick={() => setConsent(!consent)}
              className={`w-12 h-6 rounded-full ${
                consent ? "bg-mint-500" : "bg-gray-200"
              }`}
            />
          </div>

          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-semibold">푸시 알림</p>

              <p className="text-xs text-gray-400">처리 완료 시 알림 수신</p>
            </div>

            <button
              onClick={() => setPushNotif(!pushNotif)}
              className={`w-12 h-6 rounded-full ${
                pushNotif ? "bg-mint-500" : "bg-gray-200"
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function StudentPage() {
  const [authStep, setAuthStep] = useState<AuthStep>("login")
  const [tab, setTab] = useState<Tab>("home")
  const [screen, setScreen] = useState<Screen>("home")
  const [student, setStudent] = useState<StudentInfo | null>(null)

  const navItems: {
    id: Tab
    label: string
  }[] = [
    { id: "home", label: "홈" },
    { id: "hospitals", label: "병원" },
    { id: "history", label: "내역" },
    { id: "profile", label: "내 정보" },
  ]

  const handleNavigate = (s: Screen) => {
    setScreen(s)

    if (s !== "home") {
      setTab("home")
    }
  }

  const renderContent = () => {
    if (authStep === "login") {
      return <AppLoginScreen onNext={(verified) => { setStudent(verified); setAuthStep("consent") }} />
    }

    if (authStep === "consent") {
      return <AppConsentScreen onNext={() => setAuthStep("app")} />
    }

    if (screen === "qrflow") {
      return (
        <QRFlow
          studentId={student!.studentId}
          onClose={() => {
            setScreen("home")
            setTab("home")
          }}
        />
      )
    }

    if (screen === "how") {
      return <HowItWorksScreen onBack={() => setScreen("home")} />
    }

    if (screen === "detail") {
      return <HistoryScreen studentId={student!.studentId} onBack={() => setScreen("home")} />
    }

    if (screen === "hospitals") {
      return <HospitalsScreen onBack={() => setScreen("home")} />
    }

    const goHome = () => {
      setTab("home")
      setScreen("home")
    }

    switch (tab) {
      case "home":
        return <HomeScreen onNavigate={handleNavigate} />

      case "hospitals":
        return <HospitalsScreen onBack={goHome} />

      case "history":
        return <HistoryScreen studentId={student!.studentId} onBack={goHome} />

      case "profile":
        return <ProfileScreen onBack={goHome} />
    }
  }

  return (
    <div className="size-full flex items-center justify-center bg-gray-200 font-sans">
      <div className="relative w-full max-w-[390px] h-full max-h-[844px] bg-[#f7f9fc] overflow-hidden flex flex-col shadow-2xl rounded-[40px] border border-gray-300">
        <div className="flex-1 overflow-hidden">{renderContent()}</div>

        {authStep === "app" && (screen === "home" || screen === "detail") && (
          <div className="bg-white border-t border-gray-100 px-2 pt-2 pb-4 flex items-center">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setTab(item.id)
                  setScreen("home")
                }}
                className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-colors ${
                  tab === item.id && screen === "home"
                    ? "text-brand-600"
                    : "text-gray-400"
                }`}
              >
                <span className="text-[10px] font-semibold">{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

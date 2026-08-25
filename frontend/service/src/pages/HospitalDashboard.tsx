import { useEffect, useMemo, useState } from "react"
import { confirmHospitalVisit, createQrToken, getHospitalVisits } from "../api/hospitalApi"
import { sendToUniversity, type VisitStatus as ApiVisitStatus } from "../api/visitApi"

type VisitStatus = "대기중" | "진료완료" | "전송완료"
type Period = "오늘" | "이번주"
type Tab = "sessions" | "qr"

const HOSPITAL_ID = Number(import.meta.env.VITE_HOSPITAL_ID || 1)

function toUiStatus(status: ApiVisitStatus): VisitStatus {
  if (status === "WAITING_HOSPITAL_CONFIRMATION") return "대기중"
  if (status === "VISIT_CONFIRMED") return "진료완료"
  return "전송완료"
}

interface VisitSession {
  id: string
  studentName: string
  studentId: string
  school: string
  checkInTime: string
  date: string
  status: VisitStatus
}

// 실제 서비스에서는 'qrcode.react' 같은 라이브러리로 실제 QR을 생성하되,
// 여기서는 데모용으로 고정 시드 기반의 QR 모양 패턴을 SVG로 그립니다.
function generateModules(seed: string, size = 21) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }

  const modules: boolean[][] = []
  for (let row = 0; row < size; row++) {
    const rowModules: boolean[] = []
    for (let col = 0; col < size; col++) {
      hash = (hash * 1103515245 + 12345) >>> 0
      rowModules.push((hash >> 16) % 3 === 0)
    }
    modules.push(rowModules)
  }
  return modules
}

function QRCode({ value, size = 220 }: { value: string; size?: number }) {
  const gridSize = 21
  const modules = useMemo(() => generateModules(value, gridSize), [value])
  const cell = size / gridSize

  const isFinderZone = (row: number, col: number) => {
    const inTopLeft = row < 7 && col < 7
    const inTopRight = row < 7 && col >= gridSize - 7
    const inBottomLeft = row >= gridSize - 7 && col < 7
    return inTopLeft || inTopRight || inBottomLeft
  }

  const Finder = ({ x, y }: { x: number; y: number }) => (
    <g transform={`translate(${x}, ${y})`}>
      <rect width={cell * 7} height={cell * 7} fill="#1e293b" rx={cell * 0.8} />
      <rect
        x={cell}
        y={cell}
        width={cell * 5}
        height={cell * 5}
        fill="white"
        rx={cell * 0.5}
      />
      <rect
        x={cell * 2}
        y={cell * 2}
        width={cell * 3}
        height={cell * 3}
        fill="#1e293b"
        rx={cell * 0.3}
      />
    </g>
  )

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
      <rect width={size} height={size} fill="white" />
      {modules.map((rowModules, row) =>
        rowModules.map((filled, col) => {
          if (!filled || isFinderZone(row, col)) return null
          return (
            <rect
              key={`${row}-${col}`}
              x={col * cell}
              y={row * cell}
              width={cell * 0.9}
              height={cell * 0.9}
              fill="#1e293b"
              rx={cell * 0.15}
            />
          )
        }),
      )}
      <Finder x={0} y={0} />
      <Finder x={size - cell * 7} y={0} />
      <Finder x={0} y={size - cell * 7} />
    </svg>
  )
}

export default function HospitalDashboard({ onClose }: { onClose?: () => void }) {
  const [activeTab, setActiveTab] = useState<Tab>("sessions")

  const [sessions, setSessions] = useState<VisitSession[]>([])

  const [selectedSession, setSelectedSession] = useState<VisitSession | null>(
    null,
  )

  const [period, setPeriod] = useState<Period>("오늘")

  const [search, setSearch] = useState("")

  const [qrToken, setQrToken] = useState("")
  const [hospitalName, setHospitalName] = useState("유니톤의원")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadVisits = async () => {
    setLoading(true)
    try {
      const visits = await getHospitalVisits(HOSPITAL_ID)
      setSessions(visits.map((visit) => ({
        id: visit.visitId,
        studentName: visit.studentName,
        studentId: visit.studentNumber,
        school: visit.universityName,
        checkInTime: new Date(visit.createdAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
        date: new Date(visit.createdAt).toISOString().slice(0, 10),
        status: toUiStatus(visit.status),
      })))
      setError("")
    } catch (cause) {
      console.error("병원 Visit 목록 조회 실패", cause)
      setError(cause instanceof Error ? cause.message : "방문 목록을 불러오지 못했습니다.")
    } finally { setLoading(false) }
  }

  useEffect(() => { void loadVisits() }, [])

  const issueQr = async () => {
    try {
      const qr = await createQrToken(HOSPITAL_ID)
      setQrToken(qr.token)
      setHospitalName(qr.hospitalName)
      localStorage.setItem("unwork.latestQrToken", qr.token)
      setError("")
    } catch (cause) {
      console.error("QR Token 발급 실패", cause)
      setError(cause instanceof Error ? cause.message : "QR Token을 발급하지 못했습니다.")
    }
  }

  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      const matchesPeriod =
        period === "오늘" ? session.date === new Date().toISOString().slice(0, 10) : true

      const keyword = search.toLowerCase()

      const matchesSearch =
        session.studentName.toLowerCase().includes(keyword) ||
        session.studentId.toLowerCase().includes(keyword)

      return matchesPeriod && matchesSearch
    })
  }, [sessions, period, search])

  const getStatusStyle = (status: VisitStatus) => {
    switch (status) {
      case "대기중":
        return "bg-gray-100 text-gray-600"

      case "진료완료":
        return "bg-blue-50 text-blue-700"

      case "전송완료":
        return "bg-green-50 text-green-700"
    }
  }

  const handleCompleteTreatment = async () => {
    if (!selectedSession) return
    try {
      await confirmHospitalVisit(HOSPITAL_ID, selectedSession.id)
      await sendToUniversity(selectedSession.id)
      await loadVisits()
      setSelectedSession(null)
    } catch (cause) {
      console.error("진료 완료 처리 실패", cause)
      setError(cause instanceof Error ? cause.message : "진료 완료 처리에 실패했습니다.")
    }
  }

  const waitingCount = sessions.filter(
    (session) => session.status === "대기중",
  ).length

  const completedCount = sessions.filter(
    (session) => session.status === "진료완료",
  ).length

  const sentCount = sessions.filter(
    (session) => session.status === "전송완료",
  ).length

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-gray-800">
      {/* Header */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-slate-700 text-white rounded-lg flex items-center justify-center font-bold">
            H
          </div>

          <div>
            <h1 className="text-base font-semibold">병원 연계 관리 시스템</h1>

            <p className="text-xs text-gray-400">보건결석 진료 인증 관리</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{hospitalName} · 접수 담당자</span>
          {onClose && (
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              나가기
            </button>
          )}
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-8">
        <div className="max-w-[1400px] mx-auto flex gap-1">
          <button
            onClick={() => setActiveTab("sessions")}
            className={`relative px-4 py-3.5 text-sm font-medium transition-colors ${
              activeTab === "sessions"
                ? "text-slate-800"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            방문 세션 관리
            {activeTab === "sessions" && (
              <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-slate-700 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("qr")}
            className={`relative px-4 py-3.5 text-sm font-medium transition-colors ${
              activeTab === "qr"
                ? "text-slate-800"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            접수 QR
            {activeTab === "qr" && (
              <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-slate-700 rounded-full" />
            )}
          </button>
        </div>
      </div>

      {activeTab === "sessions" ? (
        <main className="max-w-[1400px] mx-auto px-8 py-8">
          {/* Page Title */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              방문 세션 관리
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              QR 연계를 통해 접수된 학생의 방문 세션을 관리합니다.
            </p>
          </div>

          {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          {loading && <div className="mb-4 text-sm text-gray-500">방문 목록을 불러오는 중입니다…</div>}

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-xl px-5 py-4">
              <p className="text-sm text-gray-500">대기중</p>

              <p className="text-2xl font-semibold mt-2">{waitingCount}</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl px-5 py-4">
              <p className="text-sm text-gray-500">진료완료</p>

              <p className="text-2xl font-semibold mt-2">{completedCount}</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl px-5 py-4">
              <p className="text-sm text-gray-500">전송완료</p>

              <p className="text-2xl font-semibold mt-2">{sentCount}</p>
            </div>
          </div>

          {/* Main Layout */}
          <div className="grid grid-cols-[1fr_380px] gap-6">
            {/* Left: Table */}
            <section className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {/* Filter */}
              <div className="p-5 border-b border-gray-200 flex items-center justify-between gap-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setPeriod("오늘")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      period === "오늘"
                        ? "bg-slate-700 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    오늘
                  </button>

                  <button
                    onClick={() => setPeriod("이번주")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      period === "이번주"
                        ? "bg-slate-700 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    이번주
                  </button>
                </div>

                <div className="relative w-64">
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="학생명 또는 연계 ID 검색"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm outline-none focus:border-slate-500"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr className="text-left text-gray-500">
                      <th className="px-6 py-4 font-medium">학생</th>

                      <th className="px-6 py-4 font-medium">연계 ID</th>

                      <th className="px-6 py-4 font-medium">접수 시각</th>

                      <th className="px-6 py-4 font-medium">상태</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredSessions.map((session) => (
                      <tr
                        key={session.id}
                        onClick={() => setSelectedSession(session)}
                        className={`border-b border-gray-100 cursor-pointer hover:bg-slate-50 ${
                          selectedSession?.id === session.id ? "bg-slate-50" : ""
                        }`}
                      >
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {session.studentName}
                        </td>

                        <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                          {session.studentId}
                        </td>

                        <td className="px-6 py-4 text-gray-600">
                          {session.checkInTime}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium ${getStatusStyle(
                              session.status,
                            )}`}
                          >
                            {session.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredSessions.length === 0 && (
                  <div className="py-16 text-center text-sm text-gray-400">
                    검색 결과가 없습니다.
                  </div>
                )}
              </div>
            </section>

            {/* Right: Detail */}
            <aside className="bg-white border border-gray-200 rounded-xl p-6 h-fit">
              {!selectedSession ? (
                <div className="py-16 text-center">
                  <div className="w-12 h-12 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <span className="text-gray-400">○</span>
                  </div>

                  <p className="text-sm font-medium text-gray-700">
                    방문 세션을 선택하세요
                  </p>

                  <p className="text-xs text-gray-400 mt-2">
                    목록에서 학생을 선택하면 상세 정보를 확인할 수 있습니다.
                  </p>
                </div>
              ) : (
                <>
                  <div className="border-b border-gray-100 pb-5">
                    <p className="text-xs text-gray-400 mb-2">방문 세션</p>

                    <h3 className="text-xl font-semibold text-gray-900">
                      {selectedSession.studentName}
                    </h3>

                    <p className="text-sm text-gray-400 mt-1">
                      {selectedSession.studentId}
                    </p>
                  </div>

                  <div className="py-5 space-y-5">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">접수 시각</p>

                      <p className="text-sm font-medium">
                        {selectedSession.date} {selectedSession.checkInTime}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400 mb-1">학교</p>

                      <p className="text-sm font-medium">
                        {selectedSession.school}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400 mb-2">현재 상태</p>

                      <span
                        className={`inline-flex px-3 py-1.5 rounded-md text-sm font-medium ${getStatusStyle(
                          selectedSession.status,
                        )}`}
                      >
                        {selectedSession.status}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-5">
                    {selectedSession.status === "전송완료" ? (
                      <div className="bg-green-50 border border-green-100 rounded-lg px-4 py-3">
                        <p className="text-sm font-medium text-green-700">
                          ✓ 전송 완료
                        </p>

                        <p className="text-xs text-green-600 mt-1">
                          인증 데이터가 학교 시스템으로 정상적으로 전송되었습니다.
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={handleCompleteTreatment}
                        className="w-full bg-slate-700 hover:bg-slate-800 text-white py-3 rounded-lg text-sm font-medium transition-colors"
                      >
                        진료 완료
                      </button>
                    )}

                    {selectedSession.status !== "전송완료" && (
                      <p className="text-xs text-gray-400 text-center mt-3">
                        진료 완료 시 인증 데이터가 자동 생성되어 학교 시스템으로
                        전송됩니다.
                      </p>
                    )}
                  </div>
                </>
              )}
            </aside>
          </div>
        </main>
      ) : (
        <main className="flex items-center justify-center px-8 py-16">
          <div className="w-full max-w-3xl">
            <div className="text-center mb-8">
              <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 text-xs font-medium px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                연계 서비스 정상 연결됨
              </span>

              <h2 className="text-3xl font-semibold text-gray-900 mt-5">
                {hospitalName} 방문 접수 QR
              </h2>

              <p className="text-sm text-gray-500 mt-2">
                아래 QR코드를 스캔하면 보건결석 자동 처리 접수가 시작됩니다.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl px-10 py-10 flex flex-col items-center">
              <div className="p-6 bg-white border border-gray-100 rounded-xl shadow-sm">
                {qrToken ? <QRCode value={qrToken} size={240} /> : (
                  <div className="w-[240px] h-[240px] flex items-center justify-center bg-gray-50 text-sm text-gray-400">QR을 발급해 주세요</div>
                )}
              </div>

              <p className="text-xs text-gray-400 mt-6 font-mono tracking-wide">
                연계 ID · {qrToken}
              </p>

              <div className="w-full border-t border-gray-100 mt-8 pt-8 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="w-8 h-8 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-600">
                    1
                  </div>
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                    학교 계정으로
                    <br />
                    로그인합니다
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-8 h-8 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-600">
                    2
                  </div>
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                    QR코드를
                    <br />
                    스캔 합니다
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-8 h-8 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-600">
                    3
                  </div>
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                    정보 전달에
                    <br />
                    동의하고 진료받습니다
                  </p>
                </div>
              </div>
            </div>

            <p className="text-center text-xs text-gray-400 mt-6">
              QR Token은 한 번만 사용할 수 있으며 만료 전에 학생이 스캔해야 합니다.
            </p>
            <button onClick={() => void issueQr()} className="mt-4 bg-slate-700 hover:bg-slate-800 text-white px-5 py-3 rounded-lg text-sm font-semibold">
              {qrToken ? "새 QR Token 발급" : "QR Token 발급"}
            </button>
            {qrToken && <p className="mt-3 max-w-xl break-all text-xs text-gray-400 font-mono">{qrToken}</p>}
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          </div>
        </main>
      )}
    </div>
  )
}

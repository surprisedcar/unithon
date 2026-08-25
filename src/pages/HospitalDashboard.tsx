import { useMemo, useState } from "react"

type VisitStatus = "대기중" | "진료완료" | "전송완료"
type Period = "오늘" | "이번주"

interface VisitSession {
  id: string
  studentName: string
  studentId: string
  school: string
  checkInTime: string
  date: string
  status: VisitStatus
}

const initialSessions: VisitSession[] = [
  {
    id: "VS-001",
    studentName: "김지수",
    studentId: "STU-8F3A",
    school: "숭실대학교",
    checkInTime: "09:12",
    date: "2026-08-24",
    status: "대기중",
  },
  {
    id: "VS-002",
    studentName: "이민준",
    studentId: "STU-2K9D",
    school: "숭실대학교",
    checkInTime: "09:40",
    date: "2026-08-24",
    status: "대기중",
  },
  {
    id: "VS-003",
    studentName: "박서연",
    studentId: "STU-7M1Q",
    school: "숭실대학교",
    checkInTime: "10:05",
    date: "2026-08-24",
    status: "진료완료",
  },
  {
    id: "VS-004",
    studentName: "최현우",
    studentId: "STU-4P8B",
    school: "숭실대학교",
    checkInTime: "10:32",
    date: "2026-08-24",
    status: "전송완료",
  },
  {
    id: "VS-005",
    studentName: "정하린",
    studentId: "STU-9C2L",
    school: "숭실대학교",
    checkInTime: "14:10",
    date: "2026-08-23",
    status: "전송완료",
  },
]

export default function HospitalDashboard({ onClose }: { onClose?: () => void }) {
  const [sessions, setSessions] = useState<VisitSession[]>(initialSessions)

  const [selectedSession, setSelectedSession] = useState<VisitSession | null>(
    null,
  )

  const [period, setPeriod] = useState<Period>("오늘")

  const [search, setSearch] = useState("")

  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      const matchesPeriod =
        period === "오늘" ? session.date === "2026-08-24" : true

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

  const handleCompleteTreatment = () => {
    if (!selectedSession) return

    const updatedSession = {
      ...selectedSession,
      status: "전송완료" as VisitStatus,
    }

    setSessions((prev) =>
      prev.map((session) =>
        session.id === selectedSession.id ? updatedSession : session,
      ),
    )

    setSelectedSession(updatedSession)
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
          <span className="text-sm text-gray-500">OO병원 · 접수 담당자</span>
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
    </div>
  )
}

import { useCallback, useEffect, useMemo, useState } from "react"
import QRCode from "qrcode"
import {
  completeTreatment,
  createQrToken,
  getHospitalVisits,
  type AuthSession,
  type QrTokenResponse,
  type Visit,
  type VisitStatus,
} from "../api"

type Period = "오늘" | "이번주"

const statusLabel: Record<VisitStatus, string> = {
  WAITING: "대기중",
  TREATMENT_COMPLETED: "진료완료",
  SENT: "전송완료",
}

const statusStyle: Record<VisitStatus, string> = {
  WAITING: "bg-gray-100 text-gray-600",
  TREATMENT_COMPLETED: "bg-blue-50 text-blue-700",
  SENT: "bg-green-50 text-green-700",
}

function formatDateTime(value: string) {
  const date = new Date(value)
  return {
    date: new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium" }).format(date),
    time: new Intl.DateTimeFormat("ko-KR", { hour: "2-digit", minute: "2-digit" }).format(date),
  }
}

export default function HospitalDashboard({
  session,
  onClose,
}: {
  session: AuthSession
  onClose?: () => void
}) {
  const [visits, setVisits] = useState<Visit[]>([])
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null)
  const [period, setPeriod] = useState<Period>("오늘")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [qr, setQr] = useState<QrTokenResponse | null>(null)
  const [qrImage, setQrImage] = useState("")
  const [creatingQr, setCreatingQr] = useState(false)

  const loadVisits = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true)
    try {
      const response = await getHospitalVisits(
        session.accessToken,
        period === "오늘" ? "TODAY" : "WEEK",
        search,
      )
      setVisits(response.items)
      setSelectedVisit((current) =>
        current ? response.items.find((visit) => visit.visitId === current.visitId) ?? null : null,
      )
      setError("")
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "방문 목록을 불러오지 못했습니다.")
    } finally {
      setLoading(false)
    }
  }, [period, search, session.accessToken])

  useEffect(() => {
    void loadVisits(true)
    const timer = window.setInterval(() => void loadVisits(), 3000)
    return () => window.clearInterval(timer)
  }, [loadVisits])

  const counts = useMemo(() => ({
    WAITING: visits.filter((visit) => visit.status === "WAITING").length,
    TREATMENT_COMPLETED: visits.filter((visit) => visit.status === "TREATMENT_COMPLETED").length,
    SENT: visits.filter((visit) => visit.status === "SENT").length,
  }), [visits])

  const handleCreateQr = async () => {
    setCreatingQr(true)
    setError("")
    try {
      const response = await createQrToken(session.accessToken, session.user.id)
      const scanUrl = new URL("/", window.location.origin)
      scanUrl.searchParams.set("qrToken", response.token)
      setQrImage(await QRCode.toDataURL(scanUrl.toString(), { width: 320, margin: 2, errorCorrectionLevel: "M" }))
      setQr(response)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "QR을 생성하지 못했습니다.")
    } finally {
      setCreatingQr(false)
    }
  }

  const handleCompleteTreatment = async () => {
    if (!selectedVisit || selectedVisit.status !== "WAITING") return
    try {
      const updated = await completeTreatment(session.accessToken, selectedVisit.visitId)
      setSelectedVisit(updated)
      setVisits((current) => current.map((visit) => visit.visitId === updated.visitId ? updated : visit))
      setError("")
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "진료 완료 처리에 실패했습니다.")
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-gray-800">
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-slate-700 text-white rounded-lg flex items-center justify-center font-bold">H</div>
          <div>
            <h1 className="text-base font-semibold">병원 연계 관리 시스템</h1>
            <p className="text-xs text-gray-400">보건결석 진료 인증 관리</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{session.user.name}</span>
          <button onClick={handleCreateQr} disabled={creatingQr} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:bg-gray-300">
            {creatingQr ? "생성 중…" : "+ 접수 QR 생성"}
          </button>
          {onClose && <button onClick={onClose} className="px-3 py-2 text-sm text-gray-500 hover:text-gray-900">로그아웃</button>}
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-8 py-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">방문 세션 관리</h2>
            <p className="text-sm text-gray-500 mt-1">QR로 접수된 학생의 방문 세션이 3초마다 갱신됩니다.</p>
          </div>
          <button onClick={() => void loadVisits(true)} className="text-sm font-medium text-brand-600 hover:text-brand-700">새로고침</button>
        </div>

        {error && <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <div className="grid grid-cols-3 gap-4 mb-6">
          {(["WAITING", "TREATMENT_COMPLETED", "SENT"] as const).map((status) => (
            <div key={status} className="bg-white border border-gray-200 rounded-xl px-5 py-4">
              <p className="text-sm text-gray-500">{statusLabel[status]}</p>
              <p className="text-2xl font-semibold mt-2">{counts[status]}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-[1fr_380px] gap-6">
          <section className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between gap-4">
              <div className="flex gap-2">
                {(["오늘", "이번주"] as const).map((value) => (
                  <button key={value} onClick={() => setPeriod(value)} className={`px-4 py-2 rounded-lg text-sm font-medium ${period === value ? "bg-slate-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                    {value}
                  </button>
                ))}
              </div>
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="학생명 또는 연계 ID 검색" className="w-64 border border-gray-300 rounded-lg px-4 py-2 text-sm outline-none focus:border-slate-500" />
            </div>

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
                  {visits.map((visit) => {
                    const time = formatDateTime(visit.checkedInAt)
                    return (
                      <tr key={visit.visitId} onClick={() => setSelectedVisit(visit)} className={`border-b border-gray-100 cursor-pointer hover:bg-slate-50 ${selectedVisit?.visitId === visit.visitId ? "bg-slate-50" : ""}`}>
                        <td className="px-6 py-4 font-medium text-gray-900">{visit.studentName}</td>
                        <td className="px-6 py-4 text-gray-500 font-mono text-xs">{visit.linkId}</td>
                        <td className="px-6 py-4 text-gray-600">{time.time}</td>
                        <td className="px-6 py-4"><span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium ${statusStyle[visit.status]}`}>{statusLabel[visit.status]}</span></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {!loading && visits.length === 0 && <div className="py-16 text-center text-sm text-gray-400">접수된 방문이 없습니다. QR을 생성해 접수를 시작하세요.</div>}
              {loading && <div className="py-16 text-center text-sm text-gray-400">방문 목록을 불러오는 중…</div>}
            </div>
          </section>

          <aside className="bg-white border border-gray-200 rounded-xl p-6 h-fit">
            {!selectedVisit ? (
              <div className="py-16 text-center text-sm text-gray-500">목록에서 방문 세션을 선택하세요.</div>
            ) : (
              <>
                <div className="border-b border-gray-100 pb-5">
                  <p className="text-xs text-gray-400 mb-2">방문 세션</p>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedVisit.studentName}</h3>
                  <p className="text-sm text-gray-400 mt-1">{selectedVisit.linkId}</p>
                </div>
                <div className="py-5 space-y-5">
                  <div><p className="text-xs text-gray-400 mb-1">접수 시각</p><p className="text-sm font-medium">{formatDateTime(selectedVisit.checkedInAt).date} {formatDateTime(selectedVisit.checkedInAt).time}</p></div>
                  <div><p className="text-xs text-gray-400 mb-2">현재 상태</p><span className={`inline-flex px-3 py-1.5 rounded-md text-sm font-medium ${statusStyle[selectedVisit.status]}`}>{statusLabel[selectedVisit.status]}</span></div>
                </div>
                <div className="border-t border-gray-100 pt-5">
                  {selectedVisit.status === "WAITING" ? (
                    <button onClick={() => void handleCompleteTreatment()} className="w-full bg-slate-700 hover:bg-slate-800 text-white py-3 rounded-lg text-sm font-medium">진료 완료</button>
                  ) : (
                    <div className="bg-green-50 border border-green-100 rounded-lg px-4 py-3 text-sm font-medium text-green-700">✓ 학교 전송 완료</div>
                  )}
                </div>
              </>
            )}
          </aside>
        </div>
      </main>

      {qr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-6" onClick={() => setQr(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-7 text-center shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between text-left">
              <div><p className="text-xs font-semibold text-brand-600">학생 접수용</p><h3 className="mt-1 text-xl font-bold text-gray-900">{qr.hospitalName} QR</h3></div>
              <button onClick={() => setQr(null)} className="text-2xl text-gray-400 hover:text-gray-700">×</button>
            </div>
            <img src={qrImage} alt="학생 접수 QR 코드" className="mx-auto my-5 h-72 w-72" />
            <p className="text-sm font-medium text-gray-700">학생이 휴대폰 카메라로 스캔하면 접수가 시작됩니다.</p>
            <p className="mt-2 text-xs text-gray-400">유효시간: {new Date(qr.expiresAt).toLocaleTimeString("ko-KR")}까지 · 1회 사용</p>
            <button onClick={() => void handleCreateQr()} disabled={creatingQr} className="mt-5 w-full rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50">새 QR 발급</button>
          </div>
        </div>
      )}
    </div>
  )
}

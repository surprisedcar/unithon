import { useState } from "react"
import StudentPage from "./pages/StudentPage"
import HospitalDashboard from "./pages/HospitalDashboard"
import { login, type AuthSession } from "./api"

function App() {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [id, setId] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const params = new URLSearchParams(window.location.search)
  const qrToken = params.get("qrToken") ?? params.get("token") ?? undefined

  const handleLogin = async () => {
    setError("")
    setLoading(true)
    try {
      setSession(await login(id, password))
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "로그인에 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setSession(null)
    setPassword("")
  }

  if (session?.user.role === "STUDENT") {
    return <StudentPage initialQrToken={qrToken} />
  }

  if (session?.user.role === "HOSPITAL") {
    return <HospitalDashboard session={session} onClose={logout} />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f6f8]">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-md p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">AutoMedi</h1>

          <p className="text-sm text-gray-500 mt-2">의료 증빙 자동 전달 서비스</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              아이디
            </label>

            <input
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="아이디를 입력하세요"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              비밀번호
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-slate-500"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            onClick={handleLogin}
            disabled={loading || !id || !password}
            className="w-full bg-slate-700 hover:bg-slate-800 disabled:bg-gray-300 text-white py-3 rounded-lg font-medium"
          >
            {loading ? "로그인 중…" : "로그인"}
          </button>
        </div>

        {/* 해커톤 시연용 계정 안내 */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4 text-xs text-gray-500">
          <p className="font-medium text-gray-600 mb-2">테스트 계정</p>

          <p>학생: student / 1234</p>
          <p className="mt-1">병원: hospital / 1234</p>
        </div>
      </div>
    </div>
  )
}

export default App

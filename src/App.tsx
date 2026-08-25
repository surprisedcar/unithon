import { useState } from "react"
import StudentPage from "./pages/StudentPage"
import HospitalDashboard from "./pages/HospitalDashboard"

type UserRole = "student" | "hospital" | null

function App() {
  const [role, setRole] = useState<UserRole>(null)
  const [id, setId] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleLogin = () => {
    setError("")

    // 학생 계정
    if (id === "student" && password === "1234") {
      setRole("student")
      return
    }

    // 병원 계정
    if (id === "hospital" && password === "1234") {
      setRole("hospital")
      return
    }

    setError("아이디 또는 비밀번호가 올바르지 않습니다.")
  }

  if (role === "student") {
    return <StudentPage />
  }

  if (role === "hospital") {
    return <HospitalDashboard />
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
            className="w-full bg-slate-700 hover:bg-slate-800 text-white py-3 rounded-lg font-medium"
          >
            로그인
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

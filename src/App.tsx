import { useState } from "react";
import StudentPage from "./pages/StudentPage";
import HospitalDashboard from "./pages/HospitalDashboard";

type UserRole = "student" | "hospital" | null;

function App() {
  const [role, setRole] = useState<UserRole>(null);
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    setError("");

    // 학생 로그인
    if (id === "student" && password === "1234") {
      setRole("student");
      return;
    }

    // 병원 로그인
    if (id === "hospital" && password === "1234") {
      setRole("hospital");
      return;
    }

    setError("아이디 또는 비밀번호가 올바르지 않습니다.");
  };

  // 학생용 AutoMedi 앱
  if (role === "student") {
    return <StudentPage />;
  }

  // 병원용 AutoMedi 시스템
  if (role === "hospital") {
    return <HospitalDashboard />;
  }

  // 로그인 화면
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f6f8]">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-md p-8 shadow-sm">
        
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            AutoMedi
          </h1>

          <p className="text-sm text-gray-500 mt-2">
            보건결석 증빙 자동 연계 서비스
          </p>
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
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleLogin();
                }
              }}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-slate-500"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">
              {error}
            </p>
          )}

          <button
            onClick={handleLogin}
            className="w-full bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-lg font-medium transition-colors"
          >
            로그인
          </button>

        </div>

        {/* 해커톤 시연용 테스트 계정 */}
        <div className="mt-6 bg-gray-50 rounded-xl p-4 text-xs text-gray-500">
          <p className="font-medium text-gray-700 mb-2">
            테스트 계정
          </p>

          <div className="space-y-1">
            <p>
              학생:{" "}
              <span className="font-mono text-gray-700">
                student / 1234
              </span>
            </p>

            <p>
              병원:{" "}
              <span className="font-mono text-gray-700">
                hospital / 1234
              </span>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;

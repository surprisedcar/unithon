import { useEffect, useState } from "react";
import TimetablePage from "@/components/TimetablePage";
import GradesPage from "@/components/GradesPage";
import TuitionPage from "@/components/TuitionPage";
import { completeUniversityVisit, getUniversityVisits, type UniversityVisit } from "@/api/universityApi";

type Tab = "timetable" | "absence" | "grades" | "tuition";

const NAV = [
  {
    section: "수업 / 출석",
    items: [
      { id: "timetable" as Tab, label: "시간표 조회" },
      { id: "absence" as Tab, label: "결석 신청 및 조회" },
    ],
  },
  {
    section: "학사정보",
    items: [
      { id: "grades" as Tab, label: "성적 조회" },
      { id: "tuition" as Tab, label: "등록금 조회" },
    ],
  },
];

function Sidebar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <aside className="w-64 min-h-[calc(100vh-64px)] bg-white border-r border-gray-200 shrink-0">
      <div className="p-5 border-b border-gray-100">
        <p className="text-sm font-semibold text-gray-700">학사관리</p>
      </div>
      <nav className="py-3">
        {NAV.map((group) => (
          <div key={group.section}>
            <div className="px-5 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mt-2">
              {group.section}
            </div>
            {group.items.map((item) => (
              <button
                key={item.id}
                onClick={() => onChange(item.id)}
                className={`w-full text-left px-8 py-3 text-sm transition-colors ${
                  active === item.id
                    ? "font-medium bg-blue-50 text-[#1f3a5f] border-r-4 border-[#1f3a5f]"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}

export default function App() {
  const [tab, setTab] = useState<Tab>("absence");

  return (
    <div className="min-h-screen bg-[#f5f6f8] text-gray-800">
      {/* Header */}
      <header className="h-16 bg-[#1f3a5f] text-white flex items-center px-8 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white text-[#1f3a5f] rounded flex items-center justify-center font-bold text-lg">
            S
          </div>
          <div>
            <h1 className="font-semibold tracking-wide">SOONGSIL UNIVERSITY</h1>
            <p className="text-[11px] text-blue-200 tracking-widest uppercase">u-SAINT 학사정보시스템</p>
          </div>
        </div>

        {/* Header nav pills */}
        <div className="ml-12 hidden md:flex gap-1">
          {(["timetable", "absence", "grades", "tuition"] as Tab[]).map((t) => {
            const label: Record<Tab, string> = {
              timetable: "시간표",
              absence: "결석신청",
              grades: "성적",
              tuition: "등록금",
            };
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  tab === t ? "bg-white/20 text-white" : "text-blue-200 hover:bg-white/10"
                }`}
              >
                {label[t]}
              </button>
            );
          })}
        </div>

        <div className="ml-auto text-sm text-blue-200 flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-semibold">
            정
          </div>
          <span>정유채 · 2023123456</span>
        </div>
      </header>

      <div className="flex">
        <Sidebar active={tab} onChange={setTab} />

        {tab === "timetable" && <TimetablePage />}
        {tab === "absence" && <AbsenceWrapper />}
        {tab === "grades" && <GradesPage />}
        {tab === "tuition" && <TuitionPage />}
      </div>
    </div>
  );
}

// SchoolPage has its own layout — strip its outer shell and embed the inner content
function AbsenceWrapper() {
  return (
    <main className="flex-1 p-8 max-w-[1200px]">
      <p className="text-xs text-gray-400 mb-4">학사관리 &gt; 수업 / 출석 &gt; 결석 신청 및 조회</p>
      <SchoolPageContent />
    </main>
  );
}

// Re-implement SchoolPage content without its outer shell to avoid layout duplication

interface Course {
  id: number;
  name: string;
  professor: string;
  time: string;
  eligible: boolean;
}

const courses: Course[] = [
  { id: 1, name: "데이터베이스", professor: "김민수", time: "13:00 - 14:15", eligible: true },
  { id: 2, name: "소프트웨어공학", professor: "이서준", time: "14:30 - 15:45", eligible: true },
  { id: 3, name: "웹프로그래밍", professor: "박지현", time: "16:00 - 17:15", eligible: true },
];

function SchoolPageContent() {
  const [selected, setSelected] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [visits, setVisits] = useState<UniversityVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const universityId = Number(import.meta.env.VITE_UNIVERSITY_ID || 1);
  const visit = visits.find((item) => item.status === "SENT_TO_UNIVERSITY") || visits[0];

  const loadVisits = async () => {
    setLoading(true);
    try { setVisits(await getUniversityVisits(universityId)); setError(""); }
    catch (cause) { console.error("학교 Visit 목록 조회 실패", cause); setError(cause instanceof Error ? cause.message : "진료 인증 정보를 불러오지 못했습니다."); }
    finally { setLoading(false); }
  };

  useEffect(() => { void loadVisits(); }, []);

  const toggle = (id: number) =>
    setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const submit = async () => {
    if (selected.length === 0) { alert("결석 처리할 과목을 선택해주세요."); return; }
    if (!visit || visit.status !== "SENT_TO_UNIVERSITY") { setError("학교로 전달되어 처리 대기 중인 진료 인증이 없습니다."); return; }
    try { await completeUniversityVisit(universityId, visit.visitId); setSubmitted(true); await loadVisits(); }
    catch (cause) { console.error("학교 처리 완료 실패", cause); setError(cause instanceof Error ? cause.message : "결석 처리에 실패했습니다."); }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="px-7 py-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">결석 신청</h2>
        <p className="text-sm text-gray-500 mt-2">
          의료기관에서 전달된 진료 인증 정보를 확인하고 결석 처리할 수업을 선택하세요.
        </p>
      </div>

      {loading && <p className="px-7 pt-5 text-sm text-gray-500">진료 인증 정보를 불러오는 중입니다…</p>}
      {error && <p className="px-7 pt-5 text-sm text-red-600">{error}</p>}

      {!submitted ? (
        <>
          <div className="p-7">
            <div className="border border-blue-100 bg-blue-50 rounded-lg p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 text-lg">✓</span>
                    <p className="font-semibold text-gray-900">{visit ? "의료기관 진료 인증 도착" : "진료 인증 대기 중"}</p>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    제휴 의료기관으로부터 진료 인증 데이터가 전달되었습니다.
                  </p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">인증 완료</span>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-6">
                {[
                  { label: "진료 일시", lines: [visit ? new Date(visit.createdAt).toLocaleString("ko-KR") : "-" ] },
                  { label: "의료기관", lines: [visit?.hospitalName || "-"] },
                  { label: "인증 번호", lines: [visit?.visitId || "-"] },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-xs text-gray-400">{item.label}</p>
                    {item.lines.map((l, i) => (
                      <p key={i} className={`text-sm mt-1 ${i === 0 ? "font-semibold" : "text-gray-700"} ${item.label === "인증 번호" ? "font-mono" : ""}`}>{l}</p>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="px-7 pb-5">
            <h3 className="font-semibold text-gray-900">결석 인정 가능 수업</h3>
            <p className="text-sm text-gray-500 mt-1">
              2026년 9월 1일 화요일 수업 중 결석 처리할 과목을 선택하세요.
            </p>
          </div>

          <div className="px-7 pb-7">
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr className="text-left text-gray-500">
                    <th className="px-5 py-4 w-16">선택</th>
                    <th className="px-5 py-4">수업 시간</th>
                    <th className="px-5 py-4">과목명</th>
                    <th className="px-5 py-4">담당 교수</th>
                    <th className="px-5 py-4">인정 여부</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((c) => (
                    <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <input type="checkbox" checked={selected.includes(c.id)} onChange={() => toggle(c.id)} className="w-4 h-4 accent-[#1f3a5f]" />
                      </td>
                      <td className="px-5 py-4 text-gray-600 font-mono text-xs">{c.time}</td>
                      <td className="px-5 py-4 font-medium text-gray-900">{c.name}</td>
                      <td className="px-5 py-4 text-gray-600">{c.professor}</td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 bg-green-50 text-green-700 rounded text-xs font-medium">신청 가능</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-500">
                선택한 과목 <span className="font-semibold text-gray-800">{selected.length}</span>개
              </p>
              <button onClick={submit} className="bg-[#1f3a5f] hover:bg-[#162d4a] text-white px-6 py-3 rounded-md text-sm font-medium transition-colors">
                결석 신청
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="p-16 text-center">
          <div className="w-16 h-16 mx-auto bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl">✓</div>
          <h3 className="text-xl font-semibold text-gray-900 mt-6">결석 신청이 완료되었습니다.</h3>
          <p className="text-sm text-gray-500 mt-3">
            의료기관에서 전달된 인증 정보를 기반으로 선택한 수업의 결석 신청이 처리되었습니다.
          </p>
          <div className="mt-8 bg-gray-50 rounded-lg p-5 text-left max-w-md mx-auto">
            <p className="text-xs text-gray-400">신청 과목</p>
            <div className="mt-3 space-y-2">
              {courses.filter((c) => selected.includes(c.id)).map((c) => (
                <div key={c.id} className="flex justify-between text-sm">
                  <span className="text-gray-700">{c.name}</span>
                  <span className="text-gray-400 font-mono text-xs">{c.time}</span>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => { setSubmitted(false); setSelected([]); }}
            className="mt-8 border border-gray-300 px-5 py-2.5 rounded-md text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            목록으로 돌아가기
          </button>
        </div>
      )}
    </div>
  );
}

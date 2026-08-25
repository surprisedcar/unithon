interface Grade {
  code: string;
  name: string;
  credits: number;
  score: number;
  grade: string;
  professor: string;
}

const semesterData: { semester: string; gpa: number; credits: number; grades: Grade[] }[] = [
  {
    semester: "2026학년도 1학기",
    gpa: 4.05,
    credits: 18,
    grades: [
      { code: "CSE301", name: "알고리즘", credits: 3, score: 97, grade: "A+", professor: "최준혁" },
      { code: "CSE315", name: "운영체제", credits: 3, score: 91, grade: "A0", professor: "오세윤" },
      { code: "CSE322", name: "데이터베이스", credits: 3, score: 88, grade: "B+", professor: "김민수" },
      { code: "CSE207", name: "자료구조", credits: 3, score: 95, grade: "A+", professor: "한지수" },
      { code: "GEN101", name: "영어커뮤니케이션", credits: 3, score: 82, grade: "B0", professor: "James Park" },
      { code: "GEN205", name: "공학윤리", credits: 3, score: 90, grade: "A0", professor: "이미래" },
    ],
  },
  {
    semester: "2025학년도 2학기",
    gpa: 3.85,
    credits: 15,
    grades: [
      { code: "CSE201", name: "이산수학", credits: 3, score: 90, grade: "A0", professor: "정현우" },
      { code: "CSE211", name: "컴퓨터구조", credits: 3, score: 84, grade: "B+", professor: "유강민" },
      { code: "MAT102", name: "선형대수학", credits: 3, score: 78, grade: "B0", professor: "김준혁" },
      { code: "CSE225", name: "프로그래밍언어론", credits: 3, score: 92, grade: "A+", professor: "신세라" },
      { code: "GEN110", name: "창의적사고", credits: 3, score: 85, grade: "B+", professor: "박다인" },
    ],
  },
];

const gradeColor: Record<string, string> = {
  "A+": "text-blue-700 bg-blue-50",
  "A0": "text-blue-600 bg-blue-50",
  "B+": "text-green-700 bg-green-50",
  "B0": "text-green-600 bg-green-50",
  "C+": "text-yellow-700 bg-yellow-50",
  "C0": "text-yellow-600 bg-yellow-50",
};

import { useState } from "react";

export default function GradesPage() {
  const [activeSem, setActiveSem] = useState(0);
  const sem = semesterData[activeSem];

  const totalCredits = semesterData.reduce((s, d) => s + d.credits, 0);
  const cumulativeGpa =
    semesterData.reduce((s, d) => s + d.gpa * d.credits, 0) / totalCredits;

  return (
    <main className="flex-1 p-8 max-w-[1200px]">
      <p className="text-xs text-gray-400 mb-4">학사관리 &gt; 학사정보 &gt; 성적 조회</p>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: "누적 평점", value: cumulativeGpa.toFixed(2), sub: "/ 4.50" },
          { label: "취득 학점", value: `${totalCredits}`, sub: "학점" },
          { label: "이수 학기", value: `${semesterData.length}`, sub: "학기" },
        ].map((item) => (
          <div key={item.label} className="bg-white border border-gray-200 rounded-lg px-6 py-5">
            <p className="text-xs text-gray-400 mb-1">{item.label}</p>
            <p className="text-2xl font-bold text-[#1f3a5f] font-mono">
              {item.value}
              <span className="text-sm font-normal text-gray-400 ml-1">{item.sub}</span>
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg">
        {/* Semester tabs */}
        <div className="flex border-b border-gray-200 px-6 pt-4 gap-1">
          {semesterData.map((d, i) => (
            <button
              key={i}
              onClick={() => setActiveSem(i)}
              className={`px-4 py-2.5 text-sm font-medium rounded-t transition-colors ${
                activeSem === i
                  ? "bg-[#1f3a5f] text-white"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              {d.semester}
            </button>
          ))}
        </div>

        <div className="px-7 py-5 flex items-center justify-between border-b border-gray-100">
          <div>
            <p className="text-sm font-semibold text-gray-700">{sem.semester}</p>
            <p className="text-xs text-gray-400 mt-0.5">{sem.grades.length}과목 · {sem.credits}학점 이수</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">학기 평점</span>
            <span className="text-lg font-bold font-mono text-[#1f3a5f]">{sem.gpa.toFixed(2)}</span>
          </div>
        </div>

        <div className="px-7 pb-7 pt-3">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                <th className="py-3 pr-4 font-medium">교과목코드</th>
                <th className="py-3 pr-4 font-medium">과목명</th>
                <th className="py-3 pr-4 font-medium">학점</th>
                <th className="py-3 pr-4 font-medium">점수</th>
                <th className="py-3 pr-4 font-medium">등급</th>
                <th className="py-3 font-medium">담당교수</th>
              </tr>
            </thead>
            <tbody>
              {sem.grades.map((g) => (
                <tr key={g.code} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3.5 pr-4 font-mono text-xs text-gray-400">{g.code}</td>
                  <td className="py-3.5 pr-4 font-medium text-gray-900">{g.name}</td>
                  <td className="py-3.5 pr-4 text-gray-600">{g.credits}학점</td>
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#1f3a5f] rounded-full"
                          style={{ width: `${g.score}%` }}
                        />
                      </div>
                      <span className="text-gray-700 font-mono text-xs">{g.score}</span>
                    </div>
                  </td>
                  <td className="py-3.5 pr-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${gradeColor[g.grade] ?? "text-gray-600 bg-gray-100"}`}>
                      {g.grade}
                    </span>
                  </td>
                  <td className="py-3.5 text-gray-500 text-xs">{g.professor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

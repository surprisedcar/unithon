
import React, { useState } from "react";
import schoolLogo from "./schoollogo.png"; // 본인의 실제 이미지 경로로 수정
interface Course {
  id: number;
  name: string;
  professor: string;
  time: string;
  startTime: string;
  eligible: boolean;
}

const courses: Course[] = [
  {
    id: 1,
    name: "데이터베이스",
    professor: "김민수",
    time: "13:00 - 14:15",
    startTime: "13:00",
    eligible: true,
  },
  {
    id: 2,
    name: "소프트웨어공학",
    professor: "이서준",
    time: "14:30 - 15:45",
    startTime: "14:30",
    eligible: true,
  },
  {
    id: 3,
    name: "웹프로그래밍",
    professor: "박지현",
    time: "16:00 - 17:15",
    startTime: "16:00",
    eligible: true,
  },
];

/* 실제 u-SAINT와 동일하게, 로고 이미지를 이 경로에 넣어주세요.
   public/school-logo.png (또는 src/assets/school-logo.png 후 import) */

const SCHOOL_LOGO_SRC = schoolLogo;

const TOP_MENU = [
  { label: "홈", active: false },
  { label: "등록/장학", active: false },
  { label: "학사관리", active: true },
  { label: "공학인증", active: false },
  { label: "상담관리", active: false },
  { label: "사회봉사", active: false },
  { label: "국제교류", active: false },
  { label: "시설사용", active: false },
  { label: "연구관리", active: false },
];

const SUB_MENU = [
  { label: "학적정보", active: false },
  { label: "수강신청/교과과정", active: false },
  { label: "수업/출석", active: true },
  { label: "성적/졸업", active: false },
  { label: "학적변동", active: false },
  { label: "교직/평생교육", active: false },
];

const SIDEBAR_ITEMS = [
  { label: "강의평가 실시", active: false },
  { label: "강의평가 결과조회", active: false },
  { label: "결석신청 및 조회", active: true },
  { label: "채플정보조회", active: false },
  { label: "보충채플신청및조회", active: false },
  { label: "조기취업 출석인정", active: false },
];

export default function SchoolPage() {
  const [selectedCourses, setSelectedCourses] =
    useState<number[]>([]);

  const [submitted, setSubmitted] =
    useState(false);

  const toggleCourse = (id: number) => {
    setSelectedCourses((prev) =>
      prev.includes(id)
        ? prev.filter((courseId) => courseId !== id)
        : [...prev, id]
    );
  };

  const handleSubmit = () => {
    if (selectedCourses.length === 0) {
      alert("결석 처리할 과목을 선택해주세요.");
      return;
    }

    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white text-gray-800">

      {/* Top utility bar */}
      <div className="h-14 bg-white flex items-center px-8 border-b border-gray-100">

        <div className="flex items-center gap-2.5">
          <img
            src={SCHOOL_LOGO_SRC}
            alt="숭실대학교"
            className="h-9 w-auto"
            onError={(e) => {
              // 로고 이미지를 아직 못 찾으면 텍스트로 대체 표시
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <span className="text-gray-300 font-light text-lg">/</span>
          <span className="text-[#1f3a5f] font-bold text-lg tracking-tight">
            u-SAINT Portal
          </span>
        </div>

        <div className="ml-auto flex items-center gap-5 text-sm text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center text-xs">
              👤
            </span>
            정유채님 접속을 환영합니다.
          </span>
          <button className="hover:text-gray-700" disabled>
            비밀번호변경
          </button>
          <button className="hover:text-gray-700" disabled>
            개인정보 이용동의
          </button>
          <button className="hover:text-gray-700" disabled>
            사이트맵
          </button>
          <button
            className="border border-gray-300 rounded px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
            disabled
          >
            English
          </button>
          <button className="bg-[#1f3a5f] text-white rounded px-4 py-1.5 text-xs font-medium hover:bg-[#162d4a]">
            로그아웃
          </button>
        </div>

      </div>

      {/* Primary nav */}
      <nav className="h-14 bg-[#1a8fd1] flex items-center px-8 gap-8">
        {TOP_MENU.map((item) => (
          <button
            key={item.label}
            disabled={!item.active}
            className={`text-sm h-full ${
              item.active
                ? "text-white font-bold border-b-[3px] border-white"
                : "text-white/70 font-medium cursor-default"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Sub nav */}
      <div className="h-11 bg-[#f4f6f8] border-b border-gray-200 flex items-center px-8 gap-7">
        {SUB_MENU.map((item) => (
          <button
            key={item.label}
            disabled={!item.active}
            className={`text-sm ${
              item.active
                ? "text-[#1a8fd1] font-semibold"
                : "text-gray-500 cursor-default hover:text-gray-500"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="flex">

        {/* Sidebar */}
        <aside className="w-64 min-h-[calc(100vh-152px)] bg-white border-r border-gray-100">

          <div className="px-5 py-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#1a8fd1]">
              수업/출석
            </h2>
            <span className="text-gray-300 text-lg">‹</span>
          </div>

          <nav className="pb-3">
            {SIDEBAR_ITEMS.map((item) => (
              <button
                key={item.label}
                disabled={!item.active}
                className={`w-full text-left px-5 py-3.5 text-sm border-b border-gray-50 ${
                  item.active
                    ? "text-[#1a8fd1] font-semibold"
                    : "text-gray-600 cursor-default hover:bg-transparent"
                }`}
              >
                · {item.label}
              </button>
            ))}
          </nav>

        </aside>

        {/* Main */}
        <main className="flex-1 p-8 max-w-[1200px]">

          <div className="bg-white border border-gray-200 rounded-lg">

            {/* Title */}
            <div className="px-7 py-6 border-b border-gray-200">

              <h2 className="text-xl font-semibold text-gray-900">
                결석 신청
              </h2>

              <p className="text-sm text-gray-500 mt-2">
                의료기관에서 전달된 진료 인증 정보를 확인하고
                결석 처리할 수업을 선택하세요.
              </p>

            </div>

            {!submitted ? (
              <>

                {/* Hospital Verification */}
                <div className="p-7">

                  <div className="border border-blue-100 bg-blue-50 rounded-lg p-5">

                    <div className="flex items-start justify-between">

                      <div>

                        <div className="flex items-center gap-2">

                          <span className="text-green-600 text-lg">
                            ✓
                          </span>

                          <p className="font-semibold text-gray-900">
                            의료기관 진료 인증 완료
                          </p>

                        </div>

                        <p className="text-sm text-gray-500 mt-2">
                          제휴 의료기관으로부터
                          진료 인증 데이터가 전달되었습니다.
                        </p>

                      </div>

                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                        인증 완료
                      </span>

                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-6">

                      <div>

                        <p className="text-xs text-gray-400">
                          진료 일시
                        </p>

                        <p className="text-sm font-semibold mt-1">
                          2026.09.01 (화)
                        </p>

                        <p className="text-sm text-gray-700">
                          14:00
                        </p>

                      </div>

                      <div>

                        <p className="text-xs text-gray-400">
                          의료기관
                        </p>

                        <p className="text-sm font-semibold mt-1">
                          OO대학교병원
                        </p>

                      </div>

                      <div>

                        <p className="text-xs text-gray-400">
                          인증 번호
                        </p>

                        <p className="text-sm font-mono mt-1">
                          MED-20260901-001
                        </p>

                      </div>

                    </div>

                  </div>

                </div>

                {/* Date */}
                <div className="px-7 pb-5">

                  <h3 className="font-semibold text-gray-900">
                    결석 인정 가능 수업
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    2026년 9월 1일 화요일 수업 중
                    결석 처리할 과목을 선택하세요.
                  </p>

                </div>

                {/* Course Table */}
                <div className="px-7 pb-7">

                  <div className="border border-gray-200 rounded-lg overflow-hidden">

                    <table className="w-full text-sm">

                      <thead className="bg-gray-50 border-b border-gray-200">

                        <tr className="text-left text-gray-500">

                          <th className="px-5 py-4 w-16">
                            선택
                          </th>

                          <th className="px-5 py-4">
                            수업 시간
                          </th>

                          <th className="px-5 py-4">
                            과목명
                          </th>

                          <th className="px-5 py-4">
                            담당 교수
                          </th>

                          <th className="px-5 py-4">
                            인정 여부
                          </th>

                        </tr>

                      </thead>

                      <tbody>

                        {courses.map((course) => (

                          <tr
                            key={course.id}
                            className="border-b border-gray-100 hover:bg-gray-50"
                          >

                            <td className="px-5 py-4">

                              <input
                                type="checkbox"
                                checked={selectedCourses.includes(
                                  course.id
                                )}
                                onChange={() =>
                                  toggleCourse(course.id)
                                }
                                className="w-4 h-4"
                              />

                            </td>

                            <td className="px-5 py-4 text-gray-600">
                              {course.time}
                            </td>

                            <td className="px-5 py-4 font-medium text-gray-900">
                              {course.name}
                            </td>

                            <td className="px-5 py-4 text-gray-600">
                              {course.professor}
                            </td>

                            <td className="px-5 py-4">

                              <span className="px-2.5 py-1 bg-green-50 text-green-700 rounded text-xs font-medium">
                                신청 가능
                              </span>

                            </td>

                          </tr>

                        ))}

                      </tbody>

                    </table>

                  </div>

                  <div className="flex items-center justify-between mt-6">

                    <p className="text-sm text-gray-500">
                      선택한 과목{" "}
                      <span className="font-semibold text-gray-800">
                        {selectedCourses.length}
                      </span>
                      개
                    </p>

                    <button
                      onClick={handleSubmit}
                      className="bg-[#1f3a5f] hover:bg-[#162d4a] text-white px-6 py-3 rounded-md text-sm font-medium"
                    >
                      결석 신청
                    </button>

                  </div>

                </div>

              </>
            ) : (

              /* Complete */
              <div className="p-16 text-center">

                <div className="w-16 h-16 mx-auto bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl">
                  ✓
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mt-6">
                  결석 신청이 완료되었습니다.
                </h3>

                <p className="text-sm text-gray-500 mt-3">
                  의료기관에서 전달된 인증 정보를 기반으로
                  선택한 수업의 결석 신청이 처리되었습니다.
                </p>

                <div className="mt-8 bg-gray-50 rounded-lg p-5 text-left max-w-md mx-auto">

                  <p className="text-xs text-gray-400">
                    신청 과목
                  </p>

                  <div className="mt-3 space-y-2">

                    {courses
                      .filter((course) =>
                        selectedCourses.includes(course.id)
                      )
                      .map((course) => (

                        <div
                          key={course.id}
                          className="flex justify-between text-sm"
                        >

                          <span className="text-gray-700">
                            {course.name}
                          </span>

                          <span className="text-gray-400">
                            {course.time}
                          </span>

                        </div>

                      ))}

                  </div>

                </div>

                <button
                  onClick={() => {
                    setSubmitted(false);
                    setSelectedCourses([]);
                  }}
                  className="mt-8 border border-gray-300 px-5 py-2.5 rounded-md text-sm text-gray-600"
                >
                  목록으로 돌아가기
                </button>

              </div>

            )}

          </div>

        </main>

      </div>

    </div>
  );
}
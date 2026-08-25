const days = ["월", "화", "수", "목", "금"];
const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

interface ClassBlock {
  day: number; // 0=월 ... 4=금
  startHour: number;
  duration: number; // in hours
  name: string;
  room: string;
  professor: string;
  color: string;
}

const classes: ClassBlock[] = [
  { day: 0, startHour: 9, duration: 1.5, name: "알고리즘", room: "정보관 301", professor: "최준혁", color: "#dbeafe" },
  { day: 0, startHour: 14, duration: 1.5, name: "운영체제", room: "정보관 502", professor: "오세윤", color: "#fef9c3" },
  { day: 1, startHour: 13, duration: 1.25, name: "데이터베이스", room: "정보관 401", professor: "김민수", color: "#dcfce7" },
  { day: 1, startHour: 14, duration: 1.25, name: "소프트웨어공학", room: "정보관 201", professor: "이서준", color: "#fce7f3" },
  { day: 1, startHour: 16, duration: 1.25, name: "웹프로그래밍", room: "IT관 102", professor: "박지현", color: "#ede9fe" },
  { day: 2, startHour: 9, duration: 1.5, name: "알고리즘", room: "정보관 301", professor: "최준혁", color: "#dbeafe" },
  { day: 2, startHour: 14, duration: 1.5, name: "운영체제", room: "정보관 502", professor: "오세윤", color: "#fef9c3" },
  { day: 3, startHour: 13, duration: 1.25, name: "데이터베이스", room: "정보관 401", professor: "김민수", color: "#dcfce7" },
  { day: 3, startHour: 14, duration: 1.25, name: "소프트웨어공학", room: "정보관 201", professor: "이서준", color: "#fce7f3" },
  { day: 4, startHour: 16, duration: 1.25, name: "웹프로그래밍", room: "IT관 102", professor: "박지현", color: "#ede9fe" },
];

const CELL_HEIGHT = 56; // px per hour
const START_HOUR = 9;

export default function TimetablePage() {
  return (
    <main className="flex-1 p-8 max-w-[1200px]">
      <p className="text-xs text-gray-400 mb-4">학사관리 &gt; 수업 / 출석 &gt; 시간표 조회</p>

      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-7 py-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">시간표 조회</h2>
            <p className="text-sm text-gray-500 mt-1">2026학년도 2학기 수강 시간표</p>
          </div>
          <span className="text-sm text-gray-500 bg-gray-50 border border-gray-200 px-4 py-2 rounded">
            총 <strong className="text-gray-800">18</strong>학점
          </span>
        </div>

        <div className="p-6 overflow-x-auto">
          <div className="min-w-[640px]">
            {/* Header */}
            <div className="grid grid-cols-[56px_repeat(5,1fr)] mb-1">
              <div />
              {days.map((d) => (
                <div key={d} className="text-center text-sm font-semibold text-gray-700 py-2 bg-gray-50 border border-gray-200 first:rounded-tl last:rounded-tr mx-0.5">
                  {d}
                </div>
              ))}
            </div>

            {/* Grid body */}
            <div className="grid grid-cols-[56px_repeat(5,1fr)] relative">
              {/* Time labels */}
              <div>
                {hours.map((h) => (
                  <div key={h} style={{ height: CELL_HEIGHT }} className="flex items-start justify-end pr-3 pt-1">
                    <span className="text-xs text-gray-400 font-mono">{h}:00</span>
                  </div>
                ))}
              </div>

              {/* Day columns */}
              {days.map((_, di) => (
                <div key={di} className="relative mx-0.5 border-l border-gray-100">
                  {/* Hour lines */}
                  {hours.map((h) => (
                    <div key={h} style={{ height: CELL_HEIGHT }} className="border-t border-gray-100" />
                  ))}
                  {/* Class blocks */}
                  {classes
                    .filter((c) => c.day === di)
                    .map((c, i) => {
                      const top = (c.startHour - START_HOUR) * CELL_HEIGHT;
                      const height = c.duration * CELL_HEIGHT - 4;
                      return (
                        <div
                          key={i}
                          style={{ top, height, backgroundColor: c.color }}
                          className="absolute inset-x-1 rounded p-2 overflow-hidden cursor-pointer hover:brightness-95 transition-all"
                        >
                          <p className="text-xs font-semibold text-gray-800 leading-tight">{c.name}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">{c.room}</p>
                          <p className="text-[10px] text-gray-400">{c.professor}</p>
                        </div>
                      );
                    })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

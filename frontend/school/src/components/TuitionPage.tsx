const tuition = {
  year: "2026학년도 2학기",
  dueDate: "2026년 08월 31일 (월)",
  status: "미납",
  items: [
    { label: "입학금", amount: 0, note: "입학 시 납부 완료" },
    { label: "수업료", amount: 2_580_000, note: "18학점 기준" },
    { label: "학생회비", amount: 30_000, note: "자율 납부" },
    { label: "실험실습비", amount: 120_000, note: "" },
    { label: "도서관운영비", amount: 15_000, note: "" },
  ],
  scholarships: [
    { label: "성적우수 장학금", amount: -600_000 },
    { label: "국가장학금 (I유형)", amount: -900_000 },
  ],
};

const fmt = (n: number) =>
  Math.abs(n).toLocaleString("ko-KR") + "원";

export default function TuitionPage() {
  const subtotal = tuition.items.reduce((s, i) => s + i.amount, 0);
  const scholarshipTotal = tuition.scholarships.reduce((s, i) => s + i.amount, 0);
  const total = subtotal + scholarshipTotal;

  return (
    <main className="flex-1 p-8 max-w-[1200px]">
      <p className="text-xs text-gray-400 mb-4">학사관리 &gt; 학사정보 &gt; 등록금 조회</p>

      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: "납부 기한", value: tuition.dueDate, mono: false },
          { label: "납부 금액", value: fmt(total), mono: true },
          {
            label: "납부 상태",
            value: tuition.status,
            mono: false,
            highlight: tuition.status === "미납",
          },
        ].map((item) => (
          <div key={item.label} className="bg-white border border-gray-200 rounded-lg px-6 py-5">
            <p className="text-xs text-gray-400 mb-1">{item.label}</p>
            <p
              className={`text-lg font-semibold ${item.highlight ? "text-red-600" : "text-[#1f3a5f]"} ${item.mono ? "font-mono" : ""}`}
            >
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-7 py-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">등록금 고지 내역</h2>
          <p className="text-sm text-gray-500 mt-1">{tuition.year}</p>
        </div>

        <div className="px-7 py-6">
          {/* Items */}
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            등록금 항목
          </p>
          <div className="border border-gray-100 rounded-lg overflow-hidden mb-6">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs text-gray-400">
                  <th className="px-5 py-3 font-medium">항목</th>
                  <th className="px-5 py-3 font-medium text-right">금액</th>
                  <th className="px-5 py-3 font-medium text-gray-300">비고</th>
                </tr>
              </thead>
              <tbody>
                {tuition.items.map((item) => (
                  <tr key={item.label} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 text-gray-700">{item.label}</td>
                    <td className="px-5 py-3.5 text-right font-mono text-gray-900">
                      {item.amount === 0 ? (
                        <span className="text-gray-300">—</span>
                      ) : (
                        fmt(item.amount)
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-400">{item.note}</td>
                  </tr>
                ))}
                <tr className="border-t border-gray-200 bg-gray-50">
                  <td className="px-5 py-3.5 font-semibold text-gray-700">소계</td>
                  <td className="px-5 py-3.5 text-right font-mono font-semibold text-gray-900">
                    {fmt(subtotal)}
                  </td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>

          {/* Scholarships */}
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            장학금 감면
          </p>
          <div className="border border-gray-100 rounded-lg overflow-hidden mb-6">
            <table className="w-full text-sm">
              <tbody>
                {tuition.scholarships.map((s) => (
                  <tr key={s.label} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 text-gray-700">{s.label}</td>
                    <td className="px-5 py-3.5 text-right font-mono text-green-600">
                      − {fmt(s.amount)}
                    </td>
                    <td className="w-24" />
                  </tr>
                ))}
                <tr className="border-t border-gray-200 bg-gray-50">
                  <td className="px-5 py-3.5 font-semibold text-gray-700">장학금 합계</td>
                  <td className="px-5 py-3.5 text-right font-mono font-semibold text-green-600">
                    − {fmt(scholarshipTotal)}
                  </td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>

          {/* Final */}
          <div className="flex items-center justify-between bg-[#1f3a5f] text-white rounded-lg px-6 py-5">
            <p className="font-semibold">최종 납부 금액</p>
            <p className="text-2xl font-bold font-mono">{fmt(total)}</p>
          </div>

          {/* Pay button */}
          <div className="flex justify-end mt-5">
            <button className="bg-[#1f3a5f] hover:bg-[#162d4a] text-white px-8 py-3 rounded-md text-sm font-semibold transition-colors">
              인터넷 등록금 납부
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

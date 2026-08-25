import { useState, useEffect } from "react";

type FlowStep = "landing" | "login" | "consent" | "waiting" | "complete";

const STEPPER_STEPS = [
  { id: "login", label: "본인인증" },
  { id: "consent", label: "동의" },
  { id: "waiting", label: "진료중" },
  { id: "complete", label: "처리완료" },
] as const;

const STEP_ORDER: FlowStep[] = ["landing", "login", "consent", "waiting", "complete"];

function getStepperIndex(step: FlowStep): number {
  const map: Record<FlowStep, number> = {
    landing: -1,
    login: 0,
    consent: 1,
    waiting: 2,
    complete: 3,
  };
  return map[step];
}

function ProgressStepper({ step }: { step: FlowStep }) {
  const current = getStepperIndex(step);
  if (current < 0) return null;

  return (
    <div className="flex items-center gap-0 px-6 py-4 bg-white border-b border-gray-100">
      {STEPPER_STEPS.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={s.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                  ${done ? "bg-mint-500 text-white" : active ? "bg-brand-600 text-white shadow-md shadow-brand-200" : "bg-gray-100 text-gray-400"}`}
              >
                {done ? (
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span className={`text-[10px] font-semibold whitespace-nowrap ${active ? "text-brand-600" : done ? "text-mint-600" : "text-gray-400"}`}>
                {s.label}
              </span>
            </div>
            {i < STEPPER_STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 mb-4 rounded-full transition-colors duration-300 ${done ? "bg-mint-400" : "bg-gray-150"}`}
                style={{ background: done ? undefined : "#e5e7eb" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Screen 1: Landing ─── */
function LandingScreen({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col min-h-full bg-white">
      {/* Hospital header */}
      <div className="bg-gradient-to-b from-brand-50 to-white px-6 pt-14 pb-8 text-center border-b border-gray-100">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white border border-brand-100 shadow-lg shadow-brand-50 mb-4">
          <svg className="w-8 h-8 text-brand-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-gray-900">연세세브란스병원</h2>
        <p className="text-sm text-gray-500 mt-1">Severance Hospital</p>
        <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 bg-brand-50 border border-brand-100 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-mint-500" />
          <span className="text-xs font-semibold text-brand-700">의료증빙 자동전달 제휴 병원</span>
        </div>
      </div>

      {/* Center */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-10 text-center">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center mb-8 shadow-xl shadow-brand-200">
          <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <polyline points="9 12 11 14 15 10" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 leading-snug mb-3">
          진료만 받으면<br />보건결석이<br />자동으로 처리됩니다
        </h1>
        <p className="text-sm text-gray-500 leading-relaxed">
          연세세브란스병원과 연계된 서비스입니다.<br />
          서류 제출 없이 학교에 자동으로 전달됩니다.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-2 justify-center mt-8">
          {["서류 제출 불필요", "자동 처리", "개인정보 보호", "30초 등록"].map((t) => (
            <span key={t} className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-xs font-semibold text-gray-600">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="px-6 pb-10 pt-4 bg-white">
        <button
          onClick={onNext}
          className="w-full bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white font-bold text-base py-4 rounded-2xl transition-all duration-150 shadow-lg shadow-brand-200"
        >
          시작하기
        </button>
        <p className="text-center text-xs text-gray-400 mt-3">
          숭실대학교 재학생만 이용 가능합니다
        </p>
      </div>
    </div>
  );
}

/* ─── Screen 2: Login ─── */
function LoginScreen({ onNext }: { onNext: () => void }) {
  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const valid = studentId.length >= 8 && name.length >= 2;

  const handleSubmit = () => {
    if (!valid) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); onNext(); }, 1200);
  };

  return (
    <div className="flex flex-col min-h-full bg-[#f7f9fc]">
      <ProgressStepper step="login" />

      <div className="flex-1 overflow-y-auto px-6 py-8">
        {/* School badge */}
        <div className="flex items-center gap-3 mb-8 p-4 bg-white rounded-2xl border border-gray-100">
          <div className="w-11 h-11 rounded-xl bg-brand-600 flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">숭</span>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">연동 학교</p>
            <p className="text-sm font-bold text-gray-900">숭실대학교</p>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-mint-500" />
            <span className="text-xs font-semibold text-mint-600">연동</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">학교 계정으로<br />로그인</h1>
        <p className="text-sm text-gray-500 mb-8">학번과 이름을 입력해 본인인증을 진행합니다.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5 pl-1">학번</label>
            <input
              type="text"
              placeholder="20230000"
              maxLength={10}
              value={studentId}
              onChange={(e) => setStudentId(e.target.value.replace(/\D/g, ""))}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5 pl-1">이름</label>
            <input
              type="text"
              placeholder="홍길동"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all"
            />
          </div>
        </div>

        <div className="mt-6 p-4 bg-brand-50 border border-brand-100 rounded-xl">
          <p className="text-xs text-brand-700 leading-relaxed">
            <span className="font-bold">개인정보 안내 —</span> 입력하신 정보는 본인인증 목적으로만 사용되며 서버에 저장되지 않습니다.
          </p>
        </div>

        <div className="mt-4">
          <div className="flex items-center gap-3 text-gray-400 text-xs">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="font-medium">또는</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <button className="w-full mt-4 flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-xl py-3.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
            <svg className="w-4 h-4 text-brand-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            학교 포털 계정으로 연동
          </button>
        </div>
      </div>

      <div className="px-6 pb-10 pt-4 bg-white border-t border-gray-100">
        <button
          onClick={handleSubmit}
          disabled={!valid || loading}
          className={`w-full font-bold text-base py-4 rounded-2xl transition-all duration-150
            ${valid && !loading
              ? "bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white shadow-lg shadow-brand-200"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              인증 중…
            </span>
          ) : "인증하고 계속하기"}
        </button>
      </div>
    </div>
  );
}

/* ─── Screen 3: Consent ─── */
function ConsentScreen({ onNext }: { onNext: () => void }) {
  const [checked, setChecked] = useState(false);

  const shared = [
    { label: "진료일자", value: "2026.08.24", shared: true },
    { label: "병원명", value: "연세세브란스병원", shared: true },
    { label: "인증 여부", value: "진료 완료 (코드)", shared: true },
    { label: "진단명 / 상세 내용", value: "비공개", shared: false },
    { label: "처방전 / 의무기록", value: "비공개", shared: false },
  ];

  return (
    <div className="flex flex-col min-h-full bg-[#f7f9fc]">
      <ProgressStepper step="consent" />

      <div className="flex-1 overflow-y-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">개인정보<br />제공 동의</h1>
        <p className="text-sm text-gray-500 mb-8">
          학교에 전달되는 정보를 확인하고 동의해 주세요.
        </p>

        {/* Info table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-5">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">전달 항목</span>
            <span className="text-xs font-bold text-gray-500">공개 여부</span>
          </div>
          {shared.map((item) => (
            <div key={item.label} className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.value}</p>
              </div>
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold
                ${item.shared ? "bg-brand-50 text-brand-700 border border-brand-100" : "bg-gray-100 text-gray-500"}`}>
                {item.shared ? (
                  <>
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    전달
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    미전달
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Key notice */}
        <div className="bg-mint-50 border border-mint-200 rounded-2xl p-4 mb-5">
          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-mint-500 flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="text-xs text-mint-800 leading-relaxed font-medium">
              <span className="font-bold">진단명·처방전 등 상세 진료 내용은 학교에 전달되지 않습니다.</span>{" "}
              병원 방문 사실과 날짜만 암호화된 코드로 전달됩니다.
            </p>
          </div>
        </div>

        {/* Checkbox */}
        <button
          onClick={() => setChecked(!checked)}
          className="w-full flex items-start gap-3 bg-white border-2 rounded-2xl p-4 transition-all"
          style={{ borderColor: checked ? "#0170bf" : "#e5e7eb" }}
        >
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${checked ? "bg-brand-600" : "bg-gray-100"}`}>
            {checked && (
              <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
          <p className="text-sm font-semibold text-gray-800 text-left leading-relaxed">
            진료 사실을 학교에 자동 전달하는 것에 동의합니다.
            <span className="block text-xs text-gray-400 font-normal mt-0.5">동의는 이번 진료에 한해 유효합니다.</span>
          </p>
        </button>
      </div>

      <div className="px-6 pb-10 pt-4 bg-white border-t border-gray-100">
        <button
          onClick={onNext}
          disabled={!checked}
          className={`w-full font-bold text-base py-4 rounded-2xl transition-all duration-150
            ${checked
              ? "bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white shadow-lg shadow-brand-200"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
        >
          동의하고 계속하기
        </button>
      </div>
    </div>
  );
}

/* ─── Screen 4: Waiting ─── */
const PROCESS_STEPS = [
  { label: "접수완료", sublabel: "2026.08.24 09:15" },
  { label: "진료중", sublabel: "담당 의사 배정됨" },
  { label: "인증대기", sublabel: "진료 후 자동 전송" },
  { label: "처리완료", sublabel: "학교 시스템 반영" },
];

function WaitingScreen({ onNext }: { onNext: () => void }) {
  const [activeStep] = useState(1); // "진료중" is current

  return (
    <div className="flex flex-col min-h-full bg-[#f7f9fc]">
      <ProgressStepper step="waiting" />

      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-xl shadow-brand-200 mb-5">
            <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">접수가 완료되었습니다</h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            진료를 받으세요. 진료가 끝나면<br />자동으로 학교에 전달됩니다.
          </p>
        </div>

        {/* Stepper */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5">
          <p className="text-xs font-bold text-gray-400 tracking-wider mb-5">처리 단계</p>
          <div className="relative">
            <div className="absolute left-[18px] top-8 bottom-4 w-0.5 bg-gray-100" />
            <div className="space-y-0">
              {PROCESS_STEPS.map((s, i) => {
                const done = i < activeStep;
                const active = i === activeStep;
                const future = i > activeStep;
                return (
                  <div key={i} className="flex items-start gap-4 pb-6 last:pb-0">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 z-10 transition-all duration-300
                      ${done ? "bg-mint-500" : active ? "bg-brand-600 ring-4 ring-brand-100" : "bg-gray-100"}`}>
                      {done ? (
                        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : active ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-gray-300" />
                      )}
                    </div>
                    <div className="pt-1.5">
                      <p className={`text-sm font-bold ${future ? "text-gray-300" : active ? "text-brand-700" : "text-gray-900"}`}>
                        {s.label}
                        {active && <span className="ml-2 text-xs font-semibold text-brand-500 bg-brand-50 px-2 py-0.5 rounded-full">진행중</span>}
                      </p>
                      <p className={`text-xs mt-0.5 ${future ? "text-gray-200" : "text-gray-400"}`}>{s.sublabel}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="bg-brand-50 border border-brand-100 rounded-2xl p-4 flex items-start gap-3">
          <svg className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="text-xs text-brand-700 leading-relaxed">
            이 창을 닫아도 괜찮습니다. 진료 완료 후 앱 알림으로 처리 완료를 알려드립니다.
          </p>
        </div>

        {/* Demo shortcut */}
        <button
          onClick={onNext}
          className="w-full mt-6 py-3.5 rounded-2xl border-2 border-dashed border-gray-200 text-sm font-semibold text-gray-400 hover:border-brand-300 hover:text-brand-500 transition-colors"
        >
          진료 완료 시뮬레이션 →
        </button>
      </div>
    </div>
  );
}

/* ─── Screen 5: Complete ─── */
function CompleteScreen({ onClose }: { onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);

  return (
    <div className="flex flex-col min-h-full bg-[#f7f9fc]">
      <ProgressStepper step="complete" />

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        {/* Check animation */}
        <div
          className={`w-24 h-24 rounded-full bg-gradient-to-br from-mint-400 to-mint-600 flex items-center justify-center shadow-2xl shadow-mint-200 mb-8 transition-all duration-500 ${mounted ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}
        >
          <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1
          className={`text-2xl font-bold text-gray-900 text-center mb-2 transition-all duration-500 delay-150 ${mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
        >
          보건결석 처리가<br />완료되었습니다
        </h1>
        <p className={`text-sm text-gray-500 text-center mb-8 transition-all duration-500 delay-200 ${mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
          서류 제출 없이 자동으로 처리되었습니다.
        </p>

        {/* Result card */}
        <div
          className={`w-full bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6 transition-all duration-500 delay-300 ${mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
        >
          <div className="px-5 py-3 bg-mint-50 border-b border-mint-100 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-mint-500" />
            <span className="text-xs font-bold text-mint-700">처리 완료</span>
          </div>
          {[
            { label: "병원명", value: "연세세브란스병원" },
            { label: "진료일자", value: "2026.08.24 (일)" },
            { label: "처리 시각", value: "2026.08.24 11:42" },
            { label: "수신 기관", value: "숭실대학교 학생처" },
            { label: "처리 상태", value: "보건결석 승인 완료" },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50 last:border-0">
              <span className="text-xs text-gray-400">{row.label}</span>
              <span className="text-xs font-bold text-gray-800">{row.value}</span>
            </div>
          ))}
        </div>

        {/* School CTA */}
        <button
          className={`w-full flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-2xl py-3.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all duration-500 delay-[400ms] ${mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
        >
          <svg className="w-4 h-4 text-brand-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          학교 시스템에서 확인하기
        </button>
      </div>

      <div className="px-6 pb-10 pt-4 bg-white border-t border-gray-100">
        <button
          onClick={onClose}
          className="w-full bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white font-bold text-base py-4 rounded-2xl transition-all shadow-lg shadow-brand-200"
        >
          확인
        </button>
      </div>
    </div>
  );
}

/* ─── Main QRFlow ─── */
export default function QRFlow({
  onClose,
  initialStep = "landing",
  onComplete,
}: {
  onClose: () => void;
  initialStep?: FlowStep;
  onComplete?: () => void;
}) {
  const [step, setStep] = useState<FlowStep>(initialStep);

  const next = () => {
    const idx = STEP_ORDER.indexOf(step);
    if (idx < STEP_ORDER.length - 1) {
      setStep(STEP_ORDER[idx + 1]);
    }
  };

  const handleClose = () => {
    if (step === "complete" && onComplete) {
      onComplete();
    } else {
      onClose();
    }
  };

  return (
    <div className="size-full flex flex-col bg-white overflow-hidden">
      {step === "landing" && <LandingScreen onNext={next} />}
      {step === "login" && <LoginScreen onNext={next} />}
      {step === "consent" && <ConsentScreen onNext={next} />}
      {step === "waiting" && <WaitingScreen onNext={next} />}
      {step === "complete" && <CompleteScreen onClose={handleClose} />}
    </div>
  );
}

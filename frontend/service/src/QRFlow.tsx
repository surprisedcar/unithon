import { useState, useEffect } from "react";
import QRScanner from "./QRScanner";
import { createVisit, getVisit, type VisitStatus } from "./api/visitApi";

// 로그인/동의는 StudentPage 최상위에서 앱 진입 시 한 번만 처리하므로,
// QRFlow는 "QR 스캔 → 진료중 → 처리완료" 3단계만 담당합니다.
type FlowStep = "scan" | "waiting" | "complete";

interface HospitalQRData {
  hospital: string;
  code: string;
  token: string;
}

const STEPPER_STEPS = [
  { id: "scan", label: "접수" },
  { id: "waiting", label: "진료중" },
  { id: "complete", label: "처리완료" },
] as const;

const STEP_ORDER: FlowStep[] = ["scan", "waiting", "complete"];

function getStepperIndex(step: FlowStep): number {
  const map: Record<FlowStep, number> = {
    scan: 0,
    waiting: 1,
    complete: 2,
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

/* ─── Screen 1: Scan ─── */
function ScanScreen({
  onDetected,
  onClose,
}: {
  onDetected: (data: HospitalQRData) => void;
  onClose: () => void;
}) {
  return (
    <div className="size-full">
      <QRScanner onBack={onClose} onDetected={onDetected} />
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

function WaitingScreen({
  onRefresh,
  hospital,
  status,
}: {
  onRefresh: () => void;
  hospital: HospitalQRData;
  status: VisitStatus;
}) {
  const activeStep = status === "WAITING_HOSPITAL_CONFIRMATION" ? 1 : status === "VISIT_CONFIRMED" ? 2 : 3;

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
            {hospital.hospital}에서 진료를 받으세요.<br />진료가 끝나면 자동으로 학교에 전달됩니다.
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

        {/* Backend status refresh */}
        <button
          onClick={onRefresh}
          className="w-full mt-6 py-3.5 rounded-2xl border-2 border-dashed border-gray-200 text-sm font-semibold text-gray-400 hover:border-brand-300 hover:text-brand-500 transition-colors"
        >
          처리 상태 새로고침
        </button>
      </div>
    </div>
  );
}

/* ─── Screen 5: Complete ─── */
function CompleteScreen({
  onClose,
  hospital,
}: {
  onClose: () => void;
  hospital: HospitalQRData;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);

  const now = new Date();
  const dateLabel = now.toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
  const timeLabel = now.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });

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
            { label: "병원명", value: hospital.hospital },
            { label: "진료일자", value: dateLabel },
            { label: "처리 시각", value: timeLabel },
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

/* ─── Main QRFlow ───
   로그인/동의는 StudentPage에서 앱 진입 시 이미 끝낸 상태로 가정하고,
   이 컴포넌트는 "QR 스캔 → 진료중 → 처리완료"만 담당합니다. */
export default function QRFlow({
  onClose,
  onComplete,
  studentId,
}: {
  onClose: () => void;
  onComplete?: () => void;
  studentId: number;
}) {
  const [step, setStep] = useState<FlowStep>("scan");
  const [hospital, setHospital] = useState<HospitalQRData | null>(null);
  const [visitId, setVisitId] = useState<string | null>(null);
  const [status, setStatus] = useState<VisitStatus>("WAITING_HOSPITAL_CONFIRMATION");
  const [error, setError] = useState("");

  const next = () => {
    const idx = STEP_ORDER.indexOf(step);
    if (idx < STEP_ORDER.length - 1) {
      setStep(STEP_ORDER[idx + 1]);
    }
  };

  const refresh = async () => {
    if (!visitId) return;
    try {
      const visit = await getVisit(visitId);
      setStatus(visit.status);
      if (visit.status === "COMPLETED") setStep("complete");
    } catch (cause) { console.error("Visit 상태 조회 실패", cause); setError(cause instanceof Error ? cause.message : "상태 조회에 실패했습니다.") }
  };

  useEffect(() => {
    if (!visitId || step !== "waiting") return;
    const timer = window.setInterval(() => void refresh(), 3000);
    return () => window.clearInterval(timer);
  }, [visitId, step]);

  const handleDetected = async (data: HospitalQRData) => {
    try {
      const created = await createVisit(studentId, data.token);
      setHospital(data);
      setVisitId(created.visitId);
      setStatus(created.status);
      setStep("waiting");
      setError("");
    } catch (cause) { console.error("Visit 생성 실패", cause); setError(cause instanceof Error ? cause.message : "접수에 실패했습니다.") }
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
      {error && <div className="bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>}
      {step === "scan" && (
        <ScanScreen onDetected={handleDetected} onClose={onClose} />
      )}
      {step === "waiting" && hospital && (
        <WaitingScreen onRefresh={() => void refresh()} hospital={hospital} status={status} />
      )}
      {step === "complete" && hospital && (
        <CompleteScreen onClose={handleClose} hospital={hospital} />
      )}
    </div>
  );
}

import { useEffect, useRef, useState } from "react"
import jsQR from "jsqr"
import { verifyQrToken } from "./api/visitApi"

type ScanState = "requesting" | "scanning" | "detected" | "error"

interface HospitalQRData {
  hospital: string
  code: string
  token: string
}

async function parseQR(raw: string): Promise<HospitalQRData | null> {
  try {
    const token = raw.trim()
    if (!token) return null
    const verified = await verifyQrToken(token)
    return { hospital: verified.hospital.name, code: String(verified.hospital.id), token }
  } catch (cause) { console.error("QR Token 검증 실패", cause); return null }
}

export default function QRScanner({ onBack, onDetected }: {
  onBack: () => void
  onDetected: (data: HospitalQRData) => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const streamRef = useRef<MediaStream | null>(null)

  const [scanState, setScanState] = useState<ScanState>("requesting")
  const [detected, setDetected] = useState<HospitalQRData | null>(null)

  useEffect(() => {
    let cancelled = false

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        })
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
          setScanState("scanning")
        }
      } catch {
        if (!cancelled) setScanState("error")
      }
    }

    startCamera()
    return () => {
      cancelled = true
      stopCamera()
    }
  }, [])

  function stopCamera() {
    cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }

  useEffect(() => {
    if (scanState !== "scanning") return

    async function tick() {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas || video.readyState < video.HAVE_ENOUGH_DATA) {
        rafRef.current = requestAnimationFrame(tick)
        return
      }
      const ctx = canvas.getContext("2d")
      if (!ctx) return
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.drawImage(video, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQR(imageData.data, imageData.width, imageData.height)
      if (code) {
        const data = await parseQR(code.data)
        if (data) {
          setScanState("detected")
          setDetected(data)
          stopCamera()
          return
        }
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [scanState])

  // Demo: simulate a detected QR in environments without camera
  async function simulateScan() {
    const token = localStorage.getItem("unwork.latestQrToken") || ""
    const data = await parseQR(token)
    if (!data) { setScanState("error"); return }
    setScanState("detected")
    setDetected(data)
    stopCamera()
  }

  if (detected && scanState === "detected") {
    return (
      <div className="flex flex-col min-h-full bg-[#f7f9fc]">
        <div className="bg-white px-5 pt-12 pb-5 border-b border-gray-100">
          <button onClick={onBack} className="flex items-center gap-1.5 text-brand-600 text-sm font-semibold mb-4 hover:text-brand-800 transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            돌아가기
          </button>
          <h1 className="text-xl font-bold text-gray-900">QR 인식 완료</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
          <div className="w-20 h-20 rounded-full bg-mint-500 flex items-center justify-center shadow-xl shadow-mint-200">
            <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">{detected.hospital}</p>
            <p className="text-sm text-gray-500 mt-1">병원 QR 코드가 인식되었습니다</p>
          </div>
          <div className="w-full bg-white rounded-2xl border border-gray-100 p-4 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">병원 코드</span>
              <span className="font-mono font-bold text-gray-700">{detected.code}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">인식 시각</span>
              <span className="font-mono font-bold text-gray-700">{new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          </div>
          <button
            onClick={() => onDetected(detected)}
            className="w-full bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white font-bold text-base py-4 rounded-2xl transition-all shadow-lg shadow-brand-200"
          >
            이 병원으로 접수하기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full bg-black">
      {/* Header overlay */}
      <div className="absolute top-0 inset-x-0 z-10 px-5 pt-12 pb-4 bg-gradient-to-b from-black/70 to-transparent">
        <button onClick={onBack} className="flex items-center gap-1.5 text-white/80 text-sm font-semibold hover:text-white transition-colors">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          돌아가기
        </button>
        <h1 className="text-lg font-bold text-white mt-3">병원 QR 스캔</h1>
        <p className="text-xs text-white/60 mt-0.5">병원에서 제공한 QR 코드를 화면 중앙에 맞춰주세요</p>
      </div>

      {/* Camera */}
      <div className="relative flex-1 overflow-hidden">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          muted
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Viewfinder */}
        {scanState === "scanning" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-56 h-56">
              {/* Corner brackets */}
              {[
                "top-0 left-0 border-t-2 border-l-2 rounded-tl-lg",
                "top-0 right-0 border-t-2 border-r-2 rounded-tr-lg",
                "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-lg",
                "bottom-0 right-0 border-b-2 border-r-2 rounded-br-lg",
              ].map((cls, i) => (
                <div key={i} className={`absolute w-8 h-8 border-mint-400 ${cls}`} />
              ))}
              {/* Scan line */}
              <div className="absolute inset-x-0 top-1/2 h-0.5 bg-mint-400/70 animate-pulse" />
            </div>
          </div>
        )}

        {/* Requesting state */}
        {scanState === "requesting" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <svg className="w-8 h-8 text-white animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-white text-sm">카메라 권한 요청 중…</p>
          </div>
        )}

        {/* Error state */}
        {scanState === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8 text-center">
            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
              <svg className="w-7 h-7 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p className="text-white font-semibold">카메라에 접근할 수 없습니다</p>
            <p className="text-white/50 text-xs">브라우저 설정에서 카메라 권한을 허용하거나 아래 시연 버튼을 사용하세요.</p>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-0 inset-x-0 z-10 px-6 pb-10 pt-6 bg-gradient-to-t from-black/80 to-transparent flex flex-col items-center gap-3">
        {(scanState === "scanning" || scanState === "error") && (
          <button
            onClick={simulateScan}
            className="w-full py-3.5 rounded-2xl border border-white/20 bg-white/10 backdrop-blur text-white text-sm font-semibold hover:bg-white/20 transition-colors"
          >
            시연용: QR 인식 시뮬레이션
          </button>
        )}
        <p className="text-white/40 text-xs">
          {scanState === "scanning" ? "QR 코드를 스캔하는 중…" : "카메라가 준비되면 자동으로 인식됩니다"}
        </p>
      </div>
    </div>
  )
}

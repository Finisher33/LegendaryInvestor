import { useEffect, useRef, useState } from 'react';
import { Database, Globe2, Brain, AlertCircle } from 'lucide-react';
import { fetchLiveQuote } from '../services/liveQuote';
import type { LiveQuote } from '../types';

interface Props {
  ticker: string;
  onDone: (live: { quote?: LiveQuote }) => void;
}

const STAGES_LABELS = [
  'Yahoo Finance 라이브 시세 조회',
  '거시 지표 동기화',
  '5인 패널 분석 중',
] as const;
const ICONS = [Database, Globe2, Brain];

export function ProgressLoader({ ticker, onDone }: Props) {
  const [stage, setStage] = useState(0);
  const [warning, setWarning] = useState<string | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    // StrictMode dev에서 useEffect 두 번 호출 — 같은 ticker는 중복 트리거 방지
    if (startedRef.current) return;
    startedRef.current = true;

    let cancelled = false;
    const run = async () => {
      // Stage 1: 라이브 시세 fetch (실제 RTT 기반, 최대 6초)
      setStage(0);
      const t0 = performance.now();
      let quote: LiveQuote | undefined;
      try {
        const q = await fetchLiveQuote(ticker);
        if (q) quote = q;
        else setWarning('라이브 시세를 가져오지 못해 시드 데이터로 진단합니다.');
      } catch {
        setWarning('네트워크 오류 — 시드 데이터로 진단합니다.');
      }
      // 너무 빠르면 살짝 머물게 (UX)
      const elapsed1 = performance.now() - t0;
      if (elapsed1 < 350) await new Promise((r) => setTimeout(r, 350 - elapsed1));
      if (cancelled) return;

      // Stage 2: 거시 지표 (현재는 정적, v0.5에서 FRED 연동 예정)
      setStage(1);
      await new Promise((r) => setTimeout(r, 300));
      if (cancelled) return;

      // Stage 3: 5인 패널 (deterministic, instant — UX 위해 잠깐만)
      setStage(2);
      await new Promise((r) => setTimeout(r, 500));
      if (cancelled) return;

      onDone({ quote });
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [ticker, onDone]);

  return (
    <div className="mx-auto max-w-2xl px-4 pt-16 sm:pt-24 fade-in">
      <div className="text-center mb-6 sm:mb-8">
        <div className="text-[11px] sm:text-xs uppercase tracking-[0.3em] text-slate-500">Diagnosing</div>
        <div className="text-3xl font-bold mt-2 font-mono text-amber-300">{ticker}</div>
      </div>

      <div className="card p-5 sm:p-6 space-y-4">
        {STAGES_LABELS.map((label, i) => {
          const Icon = ICONS[i];
          const active = i === stage;
          const done = i < stage;
          return (
            <div key={label} className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full grid place-items-center border shrink-0 ${
                  done
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : active
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 animate-pulse'
                    : 'bg-slate-800/40 border-slate-700 text-slate-500'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className={`text-[13px] sm:text-sm truncate ${
                    done ? 'text-slate-400' : active ? 'text-slate-100' : 'text-slate-600'
                  }`}
                >
                  {label}
                </div>
                {active && (
                  <div className="mt-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-300"
                      style={{ animation: 'loaderbar 0.9s ease-in-out infinite' }}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {warning && (
          <div className="flex items-start gap-2 mt-3 px-3 py-2 rounded-md border border-amber-500/30 bg-amber-500/10 text-[11px] sm:text-xs text-amber-200">
            <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>{warning}</span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes loaderbar {
          0%   { transform: translateX(-100%); width: 40%; }
          50%  { transform: translateX(0%);    width: 60%; }
          100% { transform: translateX(150%);  width: 40%; }
        }
      `}</style>
    </div>
  );
}

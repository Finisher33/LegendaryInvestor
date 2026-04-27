import { useEffect, useState } from 'react';
import { Database, Globe2, Brain } from 'lucide-react';

const STAGES = [
  { label: '재무 데이터 수집 (yfinance / FMP)', icon: Database, ms: 600 },
  { label: '거시 지표 동기화 (FRED)', icon: Globe2, ms: 500 },
  { label: '5인 패널 분석 중', icon: Brain, ms: 800 },
];

export function ProgressLoader({
  ticker,
  onDone,
}: {
  ticker: string;
  onDone: () => void;
}) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let elapsed = 0;
    const run = async () => {
      for (let i = 0; i < STAGES.length; i++) {
        if (cancelled) return;
        setStage(i);
        await new Promise((r) => setTimeout(r, STAGES[i].ms));
        elapsed += STAGES[i].ms;
      }
      void elapsed;
      if (!cancelled) onDone();
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [onDone]);

  return (
    <div className="mx-auto max-w-2xl px-4 pt-24">
      <div className="text-center mb-8">
        <div className="text-xs uppercase tracking-[0.3em] text-slate-500">Diagnosing</div>
        <div className="text-3xl font-bold mt-2 font-mono text-amber-300">{ticker}</div>
      </div>

      <div className="card p-6 space-y-4">
        {STAGES.map((s, i) => {
          const Icon = s.icon;
          const active = i === stage;
          const done = i < stage;
          return (
            <div key={s.label} className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full grid place-items-center border ${
                  done
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : active
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 animate-pulse'
                    : 'bg-slate-800/40 border-slate-700 text-slate-500'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div
                  className={`text-sm ${
                    done ? 'text-slate-400' : active ? 'text-slate-100' : 'text-slate-600'
                  }`}
                >
                  {s.label}
                </div>
                {active && (
                  <div className="mt-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-300 animate-[loaderbar_0.7s_ease-in-out]"
                      style={{ width: '100%' }}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes loaderbar {
          0% { width: 5%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { SearchBar } from './SearchBar';
import { TICKERS } from '../data/tickers';
import { PERSONA_ORDER, PERSONAS } from '../legends/personas';
import type { MacroState, TickerData } from '../types';
import { Sparkles } from 'lucide-react';
import { MacroEditor } from './MacroEditor';

interface Props {
  onSelect: (t: TickerData) => void;
  macro: MacroState;
  onMacroChange: (m: MacroState) => void;
  onResetMacro: () => void;
}

const RECENT_KEY = 'fl_recent_tickers';

export function HomeView({ onSelect, macro, onMacroChange, onResetMacro }: Props) {
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      if (raw) setRecent(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const recentTickers = recent
    .map((tk) => TICKERS[tk])
    .filter((t): t is TickerData => Boolean(t))
    .slice(0, 6);

  return (
    <div className="mx-auto max-w-6xl px-4 pt-12 pb-20">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>5인의 거장이 자신의 철학으로 진단합니다</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 leading-tight">
          미국 주식, <span className="text-amber-300">거장의 눈</span>으로 본다면.
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto leading-relaxed">
          버핏, 린치, 달리오, 드러켄밀러, 그레이엄.<br className="hidden sm:block" />
          5명의 전설이 같은 종목을 각자의 프레임워크로 정량 평가합니다.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto mb-8">
        <SearchBar onSelect={onSelect} autoFocus />
      </div>

      {/* Recent / Suggested */}
      <div className="max-w-2xl mx-auto space-y-3 text-sm">
        {recentTickers.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-500 mr-1">최근 진단:</span>
            {recentTickers.map((t) => (
              <button
                key={t.ticker}
                onClick={() => onSelect(t)}
                className="chip hover:bg-slate-800 hover:border-slate-600 transition"
              >
                <span className="font-mono text-amber-300">{t.ticker}</span>
                <span className="text-slate-500">{t.nameKo}</span>
              </button>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-500 mr-1">추천:</span>
          {(['AAPL', 'NVDA', 'BRK.B', 'KO', 'TSLA', 'JPM'] as const).map((tk) => {
            const t = TICKERS[tk];
            return (
              <button
                key={tk}
                onClick={() => onSelect(t)}
                className="chip hover:bg-slate-800 hover:border-slate-600 transition"
              >
                <span className="font-mono text-amber-300">{tk}</span>
                <span className="text-slate-500">{t.nameKo}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Macro editor */}
      <div className="mt-12 max-w-2xl mx-auto">
        <MacroEditor macro={macro} onChange={onMacroChange} onReset={onResetMacro} />
      </div>

      {/* 5인 소개 */}
      <div className="mt-16">
        <h2 className="text-center text-xs uppercase tracking-[0.3em] text-slate-500 mb-6">The Five Legends</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {PERSONA_ORDER.map((id) => {
            const p = PERSONAS[id];
            return (
              <div
                key={id}
                className={`card p-4 hover:translate-y-[-2px] transition ${p.badgeBg.replace('bg-', 'hover:bg-')}`}
              >
                <div className={`text-2xl mb-2 ${p.themeColor}`}>{p.symbol}</div>
                <div className="text-sm font-semibold">{p.nameKo}</div>
                <div className="text-[10px] text-slate-500 mb-2">{p.nameEn}</div>
                <div className="text-xs text-slate-400 leading-relaxed">{p.taglineKo}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export const recordRecent = (ticker: string) => {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const prev: string[] = raw ? JSON.parse(raw) : [];
    const next = [ticker, ...prev.filter((t) => t !== ticker)].slice(0, 10);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch { /* ignore */ }
};

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Plus, X, Check } from 'lucide-react';
import { TICKERS, searchTickers } from '../data/tickers';
import { diagnose } from '../legends';
import { PERSONA_ORDER, PERSONAS } from '../legends/personas';
import type { Diagnosis, MacroState, TickerData } from '../types';
import { verdictColor, verdictKo } from '../utils/format';

type Filter = 'NONE' | 'ALL_POS' | 'MAJ_POS' | 'ALL_NEG';

interface Props {
  initialTickers: string[];
  onBack: () => void;
  onOpenTicker: (t: TickerData) => void;
  macro: MacroState;
  onTickersChange?: (ts: string[]) => void;
}

export function CompareView({ initialTickers, onBack, onOpenTicker, macro, onTickersChange }: Props) {
  const [tickers, setTickers] = useState<string[]>(
    initialTickers.length > 0 ? initialTickers.slice(0, 4) : ['AAPL', 'NVDA'],
  );
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [filter, setFilter] = useState<Filter>('NONE');

  useEffect(() => {
    setTickers(initialTickers.length > 0 ? initialTickers.slice(0, 4) : ['AAPL', 'NVDA']);
  }, [initialTickers.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  const setTickersAndNotify = (next: string[]) => {
    setTickers(next);
    onTickersChange?.(next);
  };

  const diagnoses = useMemo<Diagnosis[]>(
    () => tickers.map((tk) => diagnose(TICKERS[tk], macro)),
    [tickers, macro],
  );
  const results = search ? searchTickers(search, 6) : [];

  const addTicker = (tk: string) => {
    if (!tickers.includes(tk) && tickers.length < 4) {
      setTickersAndNotify([...tickers, tk]);
    }
    setSearch('');
    setShowSearch(false);
  };

  const removeTicker = (tk: string) => setTickersAndNotify(tickers.filter((t) => t !== tk));

  const matchesFilter = (d: Diagnosis): boolean => {
    const { positive, negative } = d.consensus;
    switch (filter) {
      case 'ALL_POS': return positive >= 5;
      case 'MAJ_POS': return positive >= 4;
      case 'ALL_NEG': return negative >= 5;
      default: return true;
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pt-4 sm:pt-6 pb-12 sm:pb-16 fade-in">
      <div className="flex items-center gap-2 sm:gap-3 mb-4 flex-wrap">
        <button
          onClick={onBack}
          className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-md text-sm text-slate-400 hover:text-white hover:bg-slate-800/50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">뒤로</span>
        </button>
        <h1 className="text-lg sm:text-xl font-bold">비교 뷰</h1>
        <span className="text-[11px] sm:text-xs text-slate-500">최대 4종목 × 5인 패널</span>
      </div>

      {/* Filter pills */}
      <div className="scroll-x flex items-center gap-2 mb-5 sm:mb-6 text-xs pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
        <span className="text-slate-500 shrink-0">하이라이트:</span>
        {([
          ['NONE', '전체'],
          ['ALL_POS', '5인 모두 긍정'],
          ['MAJ_POS', '4인 이상 긍정'],
          ['ALL_NEG', '5인 모두 부정'],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            className={`shrink-0 px-3 py-1 rounded-full border flex items-center gap-1 ${
              filter === id
                ? 'border-amber-500/50 bg-amber-500/15 text-amber-300'
                : 'border-slate-700 text-slate-400 hover:bg-slate-800/40'
            }`}
          >
            {filter === id && <Check className="w-3 h-3" />}
            {label}
          </button>
        ))}
      </div>

      {/* ── Mobile: ticker stack ─────────────────────────────────────── */}
      <div className="sm:hidden space-y-3">
        {tickers.map((tk, ti) => {
          const t = TICKERS[tk];
          const d = diagnoses[ti];
          const dim = !matchesFilter(d);
          return (
            <div
              key={tk}
              className={`card overflow-hidden transition-opacity ${dim ? 'opacity-40' : ''}`}
            >
              {/* Ticker header */}
              <div className="flex items-center gap-2 px-3 py-2.5 border-b border-slate-800 bg-slate-900/40">
                <button
                  onClick={() => onOpenTicker(t)}
                  className="font-mono font-bold text-amber-300 text-base hover:underline"
                >
                  {tk}
                </button>
                <span className="text-xs text-slate-400 truncate flex-1 min-w-0">{t.nameKo}</span>
                <span className="text-[11px] font-mono shrink-0">
                  <span className="text-emerald-400">{d.consensus.positive}</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-amber-400">{d.consensus.neutral}</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-rose-400">{d.consensus.negative}</span>
                </span>
                <button
                  onClick={() => removeTicker(tk)}
                  className="text-slate-500 hover:text-rose-400 -mr-1 p-1"
                  aria-label={`${tk} 제거`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              {/* Persona rows */}
              <div className="divide-y divide-slate-800">
                {PERSONA_ORDER.map((pid) => {
                  const panel = d.panels.find((x) => x.persona === pid)!;
                  const p = PERSONAS[pid];
                  return (
                    <div key={pid} className="flex items-center gap-3 px-3 py-2">
                      <span className={`text-lg ${p.themeColor} shrink-0`}>{p.symbol}</span>
                      <span className="text-sm flex-1 min-w-0 truncate">{p.nameKo}</span>
                      <span className={`text-xs ${verdictColor(panel.verdict)} shrink-0`}>{verdictKo(panel.verdict)}</span>
                      <span className={`text-base font-bold tabular-nums ${verdictColor(panel.verdict)} shrink-0 w-9 text-right`}>{panel.score}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Add ticker (mobile) */}
        {tickers.length < 4 && (
          <div className="relative">
            <button
              onClick={() => setShowSearch((s) => !s)}
              className="w-full py-3 rounded-xl border border-dashed border-slate-700 text-slate-400 hover:bg-slate-800/40 flex items-center justify-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" /> 종목 추가
            </button>
            {showSearch && (
              <div className="absolute left-0 right-0 mt-2 z-20 card p-2">
                <input
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="티커 검색"
                  className="w-full px-2 py-2 bg-slate-900 border border-slate-700 rounded text-sm outline-none focus:border-amber-500/50"
                />
                {results.length > 0 && (
                  <div className="mt-2 max-h-60 overflow-y-auto">
                    {results.map((t) => (
                      <button
                        key={t.ticker}
                        onClick={() => addTicker(t.ticker)}
                        disabled={tickers.includes(t.ticker)}
                        className="w-full flex items-center gap-2 px-2 py-2 hover:bg-slate-800 rounded text-left disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <span className="font-mono text-amber-300 text-xs">{t.ticker}</span>
                        <span className="text-xs text-slate-300 truncate">{t.nameKo}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Desktop: matrix ──────────────────────────────────────────── */}
      <div className="hidden sm:block">
        {/* Header row with tickers */}
        <div className="grid mb-2" style={{ gridTemplateColumns: `180px repeat(${tickers.length}, minmax(0, 1fr)) auto` }}>
          <div />
          {tickers.map((tk, ti) => {
            const t = TICKERS[tk];
            const d = diagnoses[ti];
            const dim = !matchesFilter(d);
            return (
              <div key={tk} className={`px-2 text-center transition-opacity ${dim ? 'opacity-30' : ''}`}>
                <div className="flex items-center justify-center gap-1.5">
                  <button
                    onClick={() => onOpenTicker(t)}
                    className="font-mono font-bold text-amber-300 hover:underline"
                  >
                    {tk}
                  </button>
                  <button
                    onClick={() => removeTicker(tk)}
                    className="text-slate-500 hover:text-rose-400"
                    aria-label={`${tk} 제거`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-[10px] text-slate-500 truncate">{t.nameKo}</div>
              </div>
            );
          })}
          <div className="px-2">
            {tickers.length < 4 && (
              <div className="relative">
                <button
                  onClick={() => setShowSearch((s) => !s)}
                  className="w-9 h-9 rounded-md border border-dashed border-slate-700 text-slate-400 hover:bg-slate-800/40 grid place-items-center"
                  aria-label="종목 추가"
                >
                  <Plus className="w-4 h-4" />
                </button>
                {showSearch && (
                  <div className="absolute right-0 mt-2 w-64 z-20 card p-2">
                    <input
                      autoFocus
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="티커 검색"
                      className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-sm outline-none focus:border-amber-500/50"
                    />
                    {results.length > 0 && (
                      <div className="mt-2 max-h-60 overflow-y-auto">
                        {results.map((t) => (
                          <button
                            key={t.ticker}
                            onClick={() => addTicker(t.ticker)}
                            disabled={tickers.includes(t.ticker)}
                            className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-slate-800 rounded text-left disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <span className="font-mono text-amber-300 text-xs">{t.ticker}</span>
                            <span className="text-xs text-slate-300 truncate">{t.nameKo}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Matrix rows */}
        <div className="card overflow-hidden">
          {PERSONA_ORDER.map((pid, rowIdx) => {
            const p = PERSONAS[pid];
            return (
              <div
                key={pid}
                className={`grid items-center ${rowIdx > 0 ? 'border-t border-slate-800' : ''}`}
                style={{ gridTemplateColumns: `180px repeat(${tickers.length}, minmax(0, 1fr)) auto` }}
              >
                <div className="px-4 py-3 flex items-center gap-2 min-w-0">
                  <span className={`text-lg ${p.themeColor} shrink-0`}>{p.symbol}</span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{p.nameKo}</div>
                    <div className="text-[10px] text-slate-500 truncate">{p.philosophyKo.split(' (')[0]}</div>
                  </div>
                </div>
                {diagnoses.map((d, i) => {
                  const panel = d.panels.find((x) => x.persona === pid)!;
                  const dim = !matchesFilter(d);
                  return (
                    <div key={i} className={`px-2 py-3 transition-opacity ${dim ? 'opacity-30' : ''}`}>
                      <div
                        className={`rounded-md border px-2 py-2 text-center ${
                          panel.verdict === 'POSITIVE'
                            ? 'border-emerald-500/30 bg-emerald-500/10'
                            : panel.verdict === 'NEUTRAL'
                            ? 'border-amber-500/30 bg-amber-500/10'
                            : 'border-rose-500/30 bg-rose-500/10'
                        }`}
                      >
                        <div className={`text-lg font-bold tabular-nums ${verdictColor(panel.verdict)}`}>
                          {panel.score}
                        </div>
                        <div className={`text-[10px] ${verdictColor(panel.verdict)}`}>
                          {verdictKo(panel.verdict)}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div className="w-9" />
              </div>
            );
          })}
          <div
            className="grid items-center border-t border-slate-700 bg-slate-900/40"
            style={{ gridTemplateColumns: `180px repeat(${tickers.length}, minmax(0, 1fr)) auto` }}
          >
            <div className="px-4 py-3 text-sm font-semibold">컨센서스 (긍·중·부)</div>
            {diagnoses.map((d, i) => {
              const dim = !matchesFilter(d);
              return (
                <div key={i} className={`px-2 py-3 text-center text-sm font-mono transition-opacity ${dim ? 'opacity-30' : ''}`}>
                  <span className="text-emerald-400">{d.consensus.positive}</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-amber-400">{d.consensus.neutral}</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-rose-400">{d.consensus.negative}</span>
                </div>
              );
            })}
            <div className="w-9" />
          </div>
        </div>
      </div>

      <p className="text-[11px] sm:text-xs text-slate-500 mt-4 leading-relaxed">
        같은 종목이라도 인물에 따라 결론이 다를 수 있다는 것이 본 서비스의 핵심.
        거시 의존 패널(달리오·드러켄밀러)은 홈/결과 화면에서 시나리오를 바꾸면 점수가 재계산됩니다.
      </p>
    </div>
  );
}

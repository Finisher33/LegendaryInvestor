import { ArrowLeft, Star, Trash2, Search } from 'lucide-react';
import { useMemo } from 'react';
import { getTickerData } from '../data/tickers';
import { diagnose } from '../legends';
import { PERSONA_ORDER, PERSONAS } from '../legends/personas';
import type { MacroState, TickerData } from '../types';
import { fmtUsd, verdictColor, verdictKo } from '../utils/format';

interface Props {
  tickers: string[];
  onBack: () => void;
  onOpen: (t: TickerData) => void;
  onRemove: (tk: string) => void;
  onGoHome: () => void;
  macro: MacroState;
}

export function WatchlistView({ tickers, onBack, onOpen, onRemove, onGoHome, macro }: Props) {
  const items = useMemo(
    () =>
      tickers
        .map((tk) => getTickerData(tk))
        .filter((t): t is TickerData => Boolean(t))
        .map((t) => ({ t, d: diagnose(t, macro) })),
    [tickers, macro],
  );

  return (
    <div className="mx-auto max-w-6xl px-4 pt-4 sm:pt-6 pb-12 sm:pb-16 fade-in">
      <div className="flex items-center gap-2 sm:gap-3 mb-5 sm:mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-md text-sm text-slate-400 hover:text-white hover:bg-slate-800/50"
          aria-label="뒤로"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">뒤로</span>
        </button>
        <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-300 fill-amber-400" /> 워치리스트
        </h1>
        <span className="text-[11px] sm:text-xs text-slate-500">{items.length}종목</span>
      </div>

      {items.length === 0 ? (
        <div className="card p-8 sm:p-12 text-center">
          <Star className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 mb-1">아직 워치리스트가 비어있습니다.</p>
          <p className="text-xs text-slate-500 mb-5">
            관심 종목을 진단한 뒤 ☆ 버튼으로 추가하세요.
          </p>
          <button
            onClick={onGoHome}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30"
          >
            <Search className="w-4 h-4" />
            종목 진단하러 가기
          </button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          {items.map(({ t, d }, idx) => {
            const overall = Math.round(d.panels.reduce((s, p) => s + p.score, 0) / d.panels.length);
            const dom =
              d.consensus.positive >= 3 ? 'POSITIVE' : d.consensus.negative >= 3 ? 'NEGATIVE' : 'NEUTRAL';
            return (
              <div
                key={t.ticker}
                className={`flex items-center gap-2 sm:gap-4 px-3 sm:px-4 py-3 ${
                  idx > 0 ? 'border-t border-slate-800' : ''
                } hover:bg-slate-800/30`}
              >
                <button
                  onClick={() => onOpen(t)}
                  className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 text-left"
                >
                  <span className="font-mono font-bold text-amber-300 text-sm sm:text-base w-14 sm:w-16 shrink-0">
                    {t.ticker}
                  </span>
                  <span className="flex-1 min-w-0 truncate">
                    <span className="text-slate-100 text-sm">{t.name}</span>
                    <span className="text-slate-500 text-[11px] ml-1.5 hidden sm:inline">{t.nameKo}</span>
                  </span>
                </button>
                <div className="text-right text-sm tabular-nums hidden md:block">
                  <div>{fmtUsd(t.price)}</div>
                </div>

                {/* Mini panel scores — desktop only */}
                <div className="hidden lg:flex gap-1.5">
                  {PERSONA_ORDER.map((pid) => {
                    const panel = d.panels.find((x) => x.persona === pid)!;
                    const p = PERSONAS[pid];
                    return (
                      <div
                        key={pid}
                        title={`${p.nameKo}: ${verdictKo(panel.verdict)} ${panel.score}`}
                        className={`w-7 h-7 rounded-full grid place-items-center text-[10px] font-bold border ${
                          panel.verdict === 'POSITIVE'
                            ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                            : panel.verdict === 'NEUTRAL'
                            ? 'border-amber-500/40 bg-amber-500/15 text-amber-300'
                            : 'border-rose-500/40 bg-rose-500/15 text-rose-300'
                        }`}
                      >
                        {panel.score}
                      </div>
                    );
                  })}
                </div>

                {/* Mini consensus dots — mobile + tablet */}
                <div className="flex lg:hidden items-center gap-0.5 text-[10px] font-mono shrink-0">
                  <span className="text-emerald-400">{d.consensus.positive}</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-amber-400">{d.consensus.neutral}</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-rose-400">{d.consensus.negative}</span>
                </div>

                <div className="text-right shrink-0 w-10 sm:w-auto">
                  <div className={`text-base sm:text-lg font-bold tabular-nums ${verdictColor(dom)}`}>{overall}</div>
                  <div className={`text-[10px] ${verdictColor(dom)}`}>{verdictKo(dom)}</div>
                </div>

                <button
                  onClick={() => onRemove(t.ticker)}
                  className="text-slate-500 hover:text-rose-400 p-1.5 sm:p-2 shrink-0"
                  aria-label="제거"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

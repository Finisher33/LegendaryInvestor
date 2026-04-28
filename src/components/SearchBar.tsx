import { Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { findTicker, getTickerData, searchTickers } from '../data/tickers';
import type { TickerData } from '../types';

interface Props {
  onSelect: (t: TickerData) => void;
  autoFocus?: boolean;
  size?: 'lg' | 'md';
}

export function SearchBar({ onSelect, autoFocus, size = 'lg' }: Props) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const wrap = useRef<HTMLDivElement>(null);
  const results = q.trim() ? searchTickers(q, 10) : [];

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('mousedown', onClick);
    return () => window.removeEventListener('mousedown', onClick);
  }, []);

  const pickByTicker = (ticker: string): TickerData | null => getTickerData(ticker);

  const submit = (overrideTicker?: string) => {
    const ticker = overrideTicker ?? results[highlight]?.ticker;
    let data: TickerData | null = ticker ? pickByTicker(ticker) : null;
    if (!data) data = findTicker(q);
    if (data) {
      onSelect(data);
      setQ('');
      setOpen(false);
    }
  };

  const sizeCls = size === 'lg' ? 'h-12 sm:h-14 text-base sm:text-lg' : 'h-11 text-base';

  return (
    <div ref={wrap} className="relative w-full">
      <div className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 ${sizeCls} rounded-xl border border-slate-700 bg-slate-900/60 focus-within:border-amber-500/60 focus-within:ring-2 focus-within:ring-amber-500/20 transition`}>
        <Search className="w-5 h-5 text-slate-400 shrink-0" />
        <input
          autoFocus={autoFocus}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
            setHighlight(0);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setHighlight((h) => Math.min(h + 1, Math.max(0, results.length - 1)));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setHighlight((h) => Math.max(0, h - 1));
            } else if (e.key === 'Enter') {
              e.preventDefault();
              submit();
            } else if (e.key === 'Escape') {
              setOpen(false);
            }
          }}
          placeholder="티커 또는 회사명 (예: AAPL, AVGO, 애플)"
          className="flex-1 bg-transparent outline-none text-slate-100 placeholder:text-slate-500 min-w-0"
        />
        <kbd className="hidden sm:inline-flex text-[10px] text-slate-500 border border-slate-700 rounded px-1.5 py-0.5">Enter</kbd>
      </div>

      {open && q.trim() && (
        <div className="absolute left-0 right-0 mt-2 z-20 rounded-xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden">
          {results.length === 0 ? (
            <div className="px-4 py-4 text-sm text-slate-500">
              검색 결과 없음. <span className="text-slate-600">S&P 500 / Nasdaq 100 종목만 지원됩니다.</span>
            </div>
          ) : (
            results.map((t, i) => (
              <button
                key={t.ticker}
                onMouseEnter={() => setHighlight(i)}
                onClick={() => submit(t.ticker)}
                className={`w-full flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-left ${
                  i === highlight ? 'bg-slate-800' : 'hover:bg-slate-800/60'
                }`}
              >
                <span className="font-mono font-semibold text-amber-300 w-14 sm:w-16 shrink-0 text-sm">{t.ticker}</span>
                <span className="flex-1 min-w-0">
                  <span className="text-slate-100 text-sm truncate block sm:inline">{t.name}</span>
                  {t.nameKo !== t.name && (
                    <span className="text-slate-500 text-xs sm:ml-2 truncate block sm:inline">{t.nameKo}</span>
                  )}
                </span>
                {!t.isSeed && (
                  <span
                    className="text-[9px] uppercase tracking-wider text-slate-600 border border-slate-700 rounded px-1.5 py-0.5 shrink-0 hidden sm:inline-block"
                    title="시드 데이터로 진단됩니다"
                  >
                    SIM
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

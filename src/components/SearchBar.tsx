import { Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { searchTickers, findTicker } from '../data/tickers';
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
  const results = q.trim() ? searchTickers(q, 8) : [];

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('mousedown', onClick);
    return () => window.removeEventListener('mousedown', onClick);
  }, []);

  const submit = (override?: TickerData) => {
    const t = override ?? results[highlight] ?? findTicker(q);
    if (t) {
      onSelect(t);
      setQ('');
      setOpen(false);
    }
  };

  const sizeCls = size === 'lg' ? 'h-14 text-lg' : 'h-11 text-base';

  return (
    <div ref={wrap} className="relative w-full">
      <div className={`flex items-center gap-3 px-4 ${sizeCls} rounded-xl border border-slate-700 bg-slate-900/60 focus-within:border-amber-500/60 focus-within:ring-2 focus-within:ring-amber-500/20 transition`}>
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
          placeholder="티커 또는 회사명을 입력 (예: AAPL, 애플, NVIDIA)"
          className="flex-1 bg-transparent outline-none text-slate-100 placeholder:text-slate-500"
        />
        <kbd className="hidden sm:inline-flex text-[10px] text-slate-500 border border-slate-700 rounded px-1.5 py-0.5">Enter</kbd>
      </div>

      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 mt-2 z-20 rounded-xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden">
          {results.map((t, i) => (
            <button
              key={t.ticker}
              onMouseEnter={() => setHighlight(i)}
              onClick={() => submit(t)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition ${
                i === highlight ? 'bg-slate-800' : 'hover:bg-slate-800/60'
              }`}
            >
              <span className="font-mono font-semibold text-amber-300 w-16">{t.ticker}</span>
              <span className="flex-1">
                <span className="text-slate-100">{t.name}</span>
                <span className="text-slate-500 text-xs ml-2">{t.nameKo}</span>
              </span>
              <span className="text-xs text-slate-500">${t.price.toFixed(2)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

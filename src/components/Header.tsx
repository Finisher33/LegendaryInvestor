import { GitCompare, Home, Star } from 'lucide-react';

interface HeaderProps {
  onHome: () => void;
  onWatchlist: () => void;
  onCompare: () => void;
  watchlistCount: number;
}

export function Header({ onHome, onWatchlist, onCompare, watchlistCount }: HeaderProps) {
  return (
    <header className="border-b border-slate-800/80 backdrop-blur-md bg-slate-950/60 sticky top-0 z-30">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center gap-6">
        <button
          onClick={onHome}
          className="flex items-center gap-2 group"
        >
          <span className="w-7 h-7 rounded-md bg-amber-500/20 border border-amber-500/40 grid place-items-center text-amber-300 font-bold text-sm group-hover:scale-105 transition">
            5
          </span>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-wide">LegendaryInvestor</div>
            <div className="text-[10px] text-slate-500 -mt-0.5">5인의 거장</div>
          </div>
        </button>

        <nav className="ml-auto flex items-center gap-1">
          <button
            onClick={onHome}
            className="px-3 py-1.5 rounded-md text-sm text-slate-300 hover:text-white hover:bg-slate-800/50 flex items-center gap-1.5"
          >
            <Home className="w-4 h-4" /> 홈
          </button>
          <button
            onClick={onCompare}
            className="px-3 py-1.5 rounded-md text-sm text-slate-300 hover:text-white hover:bg-slate-800/50 flex items-center gap-1.5"
          >
            <GitCompare className="w-4 h-4" /> 비교
          </button>
          <button
            onClick={onWatchlist}
            className="px-3 py-1.5 rounded-md text-sm text-slate-300 hover:text-white hover:bg-slate-800/50 flex items-center gap-1.5 relative"
          >
            <Star className="w-4 h-4" /> 워치리스트
            {watchlistCount > 0 && (
              <span className="ml-1 text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full px-1.5 py-0.5">
                {watchlistCount}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}

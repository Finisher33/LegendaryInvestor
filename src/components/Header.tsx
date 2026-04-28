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
      <div className="mx-auto max-w-6xl px-3 sm:px-4 h-14 flex items-center gap-3 sm:gap-6">
        <button
          onClick={onHome}
          className="flex items-center gap-2 group min-w-0"
          aria-label="홈으로"
        >
          <span className="w-7 h-7 rounded-md bg-amber-500/20 border border-amber-500/40 grid place-items-center text-amber-300 font-bold text-sm group-hover:scale-105 transition shrink-0">
            5
          </span>
          <div className="leading-tight min-w-0">
            <div className="text-[13px] sm:text-sm font-semibold tracking-wide truncate">LegendaryInvestor</div>
            <div className="text-[10px] text-slate-500 -mt-0.5 hidden sm:block">5인의 거장</div>
          </div>
        </button>

        <nav className="ml-auto flex items-center gap-0.5 sm:gap-1">
          <NavBtn icon={<Home className="w-4 h-4" />} label="홈" onClick={onHome} />
          <NavBtn icon={<GitCompare className="w-4 h-4" />} label="비교" onClick={onCompare} />
          <NavBtn
            icon={<Star className="w-4 h-4" />}
            label="워치리스트"
            onClick={onWatchlist}
            badge={watchlistCount > 0 ? watchlistCount : undefined}
          />
        </nav>
      </div>
    </header>
  );
}

function NavBtn({
  icon,
  label,
  onClick,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="px-2 sm:px-3 py-1.5 rounded-md text-sm text-slate-300 hover:text-white hover:bg-slate-800/50 flex items-center gap-1.5 relative"
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
      {badge !== undefined && (
        <span className="ml-0.5 sm:ml-1 text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full px-1.5 leading-tight py-0.5 min-w-[18px] text-center">
          {badge}
        </span>
      )}
    </button>
  );
}

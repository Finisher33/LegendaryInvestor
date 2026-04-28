import type { PersonaVerdict } from '../types';
import { PERSONAS } from '../legends/personas';
import { verdictBg, verdictColor, verdictKo } from '../utils/format';

interface Props {
  panel: PersonaVerdict;
  onClick: () => void;
  selected?: boolean;
}

export function PanelCard({ panel, onClick, selected }: Props) {
  const p = PERSONAS[panel.persona];
  return (
    <button
      onClick={onClick}
      aria-pressed={selected}
      className={`text-left card p-3.5 sm:p-4 hover:bg-slate-800/40 hover:border-slate-600 flex flex-col gap-3 ${
        selected ? 'ring-2 ring-amber-500/60 border-amber-500/40' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full grid place-items-center text-lg shrink-0 border ${p.badgeBg} ${p.themeColor}`}
        >
          {p.symbol}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="text-sm font-semibold truncate">{p.nameKo}</div>
            <div className="text-[10px] text-slate-500 truncate hidden sm:block">{p.nameEn}</div>
          </div>
          <div className="text-[11px] text-slate-500 truncate">{p.philosophyKo}</div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className={`text-xs font-bold px-2 py-1 rounded-md border ${verdictBg(panel.verdict)} ${verdictColor(panel.verdict)}`}>
          {verdictKo(panel.verdict)}
        </div>
        <div className="ml-auto text-right">
          <div className={`text-2xl font-bold tabular-nums ${verdictColor(panel.verdict)}`}>{panel.score}</div>
          <div className="text-[10px] text-slate-500 -mt-1">/ 100</div>
        </div>
      </div>

      {/* Persona-specific tags */}
      {panel.meta && (
        <div className="flex flex-wrap gap-1">
          {panel.persona === 'LYNCH' && panel.meta.lynchCategoryKo && (
            <span className="text-[10px] px-1.5 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
              {String(panel.meta.lynchCategoryKo)}
            </span>
          )}
          {panel.persona === 'GRAHAM' && panel.meta.grahamTrackKo && (
            <span className="text-[10px] px-1.5 py-0.5 rounded border border-rose-500/30 bg-rose-500/10 text-rose-300">
              {String(panel.meta.grahamTrackKo).split(' ')[0]}
            </span>
          )}
          {panel.persona === 'GRAHAM' && panel.meta.ncavPositive === true && (
            <span className="text-[10px] px-1.5 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
              NCAV ✓
            </span>
          )}
          {panel.persona === 'DRUCKENMILLER' && panel.meta.isConcentratedBet === true && (
            <span className="text-[10px] px-1.5 py-0.5 rounded border border-violet-400/40 bg-violet-500/15 text-violet-200">
              Concentrated Bet
            </span>
          )}
          {panel.persona === 'DALIO' && panel.meta.regimeLabel && (
            <span className="text-[10px] px-1.5 py-0.5 rounded border border-sky-500/30 bg-sky-500/10 text-sky-300">
              {String(panel.meta.regimeLabel)}
            </span>
          )}
        </div>
      )}

      <div className="text-[13px] sm:text-xs text-slate-300 leading-relaxed line-clamp-3 min-h-[3.5em]">
        {panel.headline}
      </div>

      {/* Score bar — 등장 시 width 0 → score% 트윈 */}
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          key={panel.score}
          className={`score-bar h-full rounded-full ${
            panel.verdict === 'POSITIVE'
              ? 'bg-emerald-400'
              : panel.verdict === 'NEUTRAL'
              ? 'bg-amber-400'
              : 'bg-rose-400'
          }`}
          style={{ width: `${panel.score}%` }}
        />
      </div>
    </button>
  );
}

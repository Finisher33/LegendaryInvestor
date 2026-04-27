import type { PersonaVerdict } from '../types';
import { PERSONAS } from '../legends/personas';
import { verdictBg, verdictColor, verdictKo } from '../utils/format';
import { Quote as QuoteIcon, BookOpen } from 'lucide-react';

interface Props {
  panel: PersonaVerdict;
  ticker: string;
  nameKo: string;
}

export function PanelDetail({ panel, ticker, nameKo }: Props) {
  const p = PERSONAS[panel.persona];

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className={`w-14 h-14 rounded-full grid place-items-center text-2xl border ${p.badgeBg} ${p.themeColor}`}>
          {p.symbol}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">{p.nameKo}</h2>
            <span className="text-xs text-slate-500">{p.nameEn}</span>
          </div>
          <div className="text-xs text-slate-500">{p.era}</div>
          <div className="text-xs text-slate-400 mt-1">{p.philosophyKo}</div>
        </div>
        <div className="text-right">
          <div className={`text-xs font-bold inline-block px-2 py-1 rounded-md border mb-1 ${verdictBg(panel.verdict)} ${verdictColor(panel.verdict)}`}>
            {verdictKo(panel.verdict)}
          </div>
          <div className={`text-3xl font-bold tabular-nums ${verdictColor(panel.verdict)}`}>{panel.score}</div>
          <div className="text-[10px] text-slate-500 -mt-1">/ 100</div>
        </div>
      </div>

      {/* Headline */}
      <div className="border-l-2 border-amber-500/50 pl-4 mb-6">
        <div className="text-base font-medium text-slate-100">{panel.headline}</div>
        <div className="text-sm text-slate-400 leading-relaxed mt-2">{panel.body}</div>
      </div>

      {/* Meta badges (Lynch category, Druckenmiller bet, Graham track) */}
      {panel.meta && Object.keys(panel.meta).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {panel.persona === 'LYNCH' && panel.meta.lynchCategoryKo && (
            <span className="chip text-emerald-300 border-emerald-500/30 bg-emerald-500/10">
              카테고리: {String(panel.meta.lynchCategoryKo)}
            </span>
          )}
          {panel.persona === 'LYNCH' && typeof panel.meta.tenbaggerScore === 'number' && (
            <span className="chip">Tenbagger 가능성: {panel.meta.tenbaggerScore}/100</span>
          )}
          {panel.persona === 'GRAHAM' && panel.meta.grahamTrackKo && (
            <span className="chip text-rose-300 border-rose-500/30 bg-rose-500/10">
              트랙: {String(panel.meta.grahamTrackKo)}
            </span>
          )}
          {panel.persona === 'GRAHAM' && panel.meta.ncavPositive === true && (
            <span className="chip text-emerald-300 border-emerald-500/30 bg-emerald-500/10">NCAV 충족</span>
          )}
          {panel.persona === 'DALIO' && panel.meta.regimeLabel && (
            <span className="chip text-sky-300 border-sky-500/30 bg-sky-500/10">
              Regime: {String(panel.meta.regimeLabel)}
            </span>
          )}
          {panel.persona === 'DRUCKENMILLER' && panel.meta.badge && (
            <span className={`chip ${
              panel.meta.isConcentratedBet
                ? 'text-violet-200 border-violet-400/40 bg-violet-500/15'
                : ''
            }`}>
              {String(panel.meta.badge)}
            </span>
          )}
        </div>
      )}

      {/* Axes */}
      <div className="space-y-4 mb-6">
        <h3 className="text-xs uppercase tracking-wider text-slate-500">평가 축</h3>
        {panel.axes.map((a, i) => (
          <div key={i}>
            <div className="flex items-center gap-2 text-sm">
              <span className="flex-1 text-slate-200">{a.name}</span>
              {a.display && <span className="font-mono text-xs text-slate-400">{a.display}</span>}
              <span className={`font-bold tabular-nums ${a.passed ? 'text-emerald-400' : 'text-slate-400'}`}>
                {a.value}
              </span>
            </div>
            <div className="mt-1.5 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${a.passed ? 'bg-emerald-400/80' : 'bg-slate-500'}`}
                style={{ width: `${a.value}%` }}
              />
            </div>
            {a.rationaleKo && (
              <div className="text-xs text-slate-500 mt-1 leading-relaxed">{a.rationaleKo}</div>
            )}
          </div>
        ))}
      </div>

      {/* Data Refs */}
      <div className="mb-6">
        <h3 className="text-xs uppercase tracking-wider text-slate-500 mb-3">핵심 지표 (계산값)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {panel.dataRefs.map((d, i) => (
            <div key={i} className="rounded-md border border-slate-800 bg-slate-900/40 px-3 py-2">
              <div className="text-[10px] text-slate-500 truncate">{d.metric}</div>
              <div className="text-sm font-mono text-slate-200">{d.display}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quote */}
      <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-5">
        <div className="flex items-start gap-3">
          <QuoteIcon className={`w-5 h-5 shrink-0 ${p.themeColor}`} />
          <div className="flex-1">
            <p className={`text-base font-medium leading-relaxed ${p.themeColor}`}>
              “{panel.quote.text}”
            </p>
            <div className="text-xs text-slate-500 mt-2 flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {panel.quote.pageOrYear} <span className="text-slate-600">·</span>
              <span className="font-mono text-slate-600">{panel.quote.sourceId}</span>
            </div>
          </div>
        </div>
        <p className="text-[10px] text-slate-600 mt-3 leading-relaxed">
          ※ 인용은 {p.nameKo}의 공개 저작·발언 코퍼스에서 발췌한 시뮬레이션입니다.
          {ticker} ({nameKo}) 분석을 위해 AI가 위 원칙을 적용하여 진단했습니다.
        </p>
      </div>
    </div>
  );
}

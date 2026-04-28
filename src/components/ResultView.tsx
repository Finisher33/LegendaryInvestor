import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Star, Share2, Printer, Check } from 'lucide-react';
import type { Diagnosis, MacroState, PersonaId } from '../types';
import { PanelCard } from './PanelCard';
import { PanelDetail } from './PanelDetail';
import { PERSONA_ORDER } from '../legends/personas';
import { fmtUsd, verdictColor, verdictKo } from '../utils/format';
import { MacroEditor } from './MacroEditor';

interface Props {
  diagnosis: Diagnosis;
  onBack: () => void;
  isWatched: boolean;
  onToggleWatch: () => void;
  selectedPersona?: PersonaId;
  onSelectPersona: (p: PersonaId) => void;
  macro: MacroState;
  onMacroChange: (m: MacroState) => void;
  onResetMacro: () => void;
}

export function ResultView({
  diagnosis,
  onBack,
  isWatched,
  onToggleWatch,
  selectedPersona,
  onSelectPersona,
  macro,
  onMacroChange,
  onResetMacro,
}: Props) {
  const fallback = diagnosis.panels[0].persona;
  const selected: PersonaId = selectedPersona ?? fallback;
  const selectedPanel = diagnosis.panels.find((p) => p.persona === selected) ?? diagnosis.panels[0];
  const [copied, setCopied] = useState(false);
  const detailRef = useRef<HTMLDivElement>(null);

  const isFirstSelect = useRef(true);
  useEffect(() => {
    if (isFirstSelect.current) {
      isFirstSelect.current = false;
      return;
    }
    detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [selected]);

  const overallScore =
    Math.round(diagnosis.panels.reduce((s, p) => s + p.score, 0) / diagnosis.panels.length);
  const consensus = diagnosis.consensus;
  const dominant =
    consensus.positive >= 3
      ? 'POSITIVE'
      : consensus.negative >= 3
      ? 'NEGATIVE'
      : 'NEUTRAL';

  const handleShare = async () => {
    const url = `${window.location.origin}${window.location.pathname}#/${diagnosis.ticker}`;
    const text = `${diagnosis.ticker} · ${diagnosis.nameKo} · 종합 ${overallScore}/100 (LegendaryInvestor)\n${url}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch { /* ignore */ }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pt-4 sm:pt-6 pb-12 sm:pb-16 fade-in">
      {/* Top bar */}
      <div className="flex items-center gap-2 mb-5 sm:mb-6 no-print">
        <button
          onClick={onBack}
          className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-md text-sm text-slate-400 hover:text-white hover:bg-slate-800/50"
          aria-label="뒤로"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">뒤로</span>
        </button>
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <ActionBtn
            onClick={onToggleWatch}
            active={isWatched}
            activeClass="bg-amber-500/15 border-amber-500/40 text-amber-300"
            ariaLabel={isWatched ? '워치리스트 해제' : '워치리스트 추가'}
            label={isWatched ? '추가됨' : '워치리스트'}
            icon={<Star className={`w-4 h-4 ${isWatched ? 'fill-amber-400' : ''}`} />}
          />
          <ActionBtn
            onClick={() => window.print()}
            ariaLabel="PDF로 저장"
            label="PDF"
            icon={<Printer className="w-4 h-4" />}
          />
          <ActionBtn
            onClick={handleShare}
            active={copied}
            activeClass="border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
            ariaLabel="공유"
            label={copied ? '복사됨' : '공유'}
            icon={copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Stock header */}
      <div className="card p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="min-w-0">
            <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap">
              <span className="font-mono text-xl sm:text-2xl font-bold text-amber-300">{diagnosis.ticker}</span>
              <span className="text-base sm:text-lg font-medium truncate max-w-full">{diagnosis.name}</span>
              <span className="text-xs sm:text-sm text-slate-500">{diagnosis.nameKo}</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold mt-1.5 sm:mt-2 tabular-nums">{fmtUsd(diagnosis.price)}</div>
            <div className="text-[11px] sm:text-xs text-slate-500 mt-1">
              진단 시각: {new Date(diagnosis.asOf).toLocaleString('ko-KR')}
            </div>
          </div>

          <div className="sm:ml-auto card bg-slate-900/40 px-3 py-3 sm:px-5 grid grid-cols-3 gap-2 sm:gap-4">
            <Stat label="종합 점수" value={`${overallScore}`} suffix="/100" tone={dominant} />
            <Stat
              label="컨센서스"
              value={`${consensus.positive}·${consensus.neutral}·${consensus.negative}`}
              tone={dominant}
              suffix="긍·중·부"
            />
            <Stat label="결과" value={verdictKo(dominant)} tone={dominant} />
          </div>
        </div>
      </div>

      {/* Macro editor */}
      <div className="mb-6 sm:mb-8 no-print">
        <MacroEditor macro={macro} onChange={onMacroChange} onReset={onResetMacro} />
      </div>

      {/* Panel cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-8 sm:mb-10">
        {PERSONA_ORDER.map((id) => {
          const panel = diagnosis.panels.find((p) => p.persona === id)!;
          return (
            <PanelCard
              key={id}
              panel={panel}
              selected={selected === id}
              onClick={() => onSelectPersona(id)}
            />
          );
        })}
      </div>

      {/* Detail */}
      <div ref={detailRef} className="scroll-mt-20 sm:scroll-mt-24">
        <PanelDetail panel={selectedPanel} ticker={diagnosis.ticker} nameKo={diagnosis.nameKo} />
      </div>
    </div>
  );
}

function ActionBtn({
  onClick,
  active = false,
  activeClass,
  ariaLabel,
  label,
  icon,
}: {
  onClick: () => void;
  active?: boolean;
  activeClass?: string;
  ariaLabel: string;
  label: string;
  icon: React.ReactNode;
}) {
  const base = 'flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md text-sm border';
  const inactive = 'border-slate-700 text-slate-400 hover:bg-slate-800/50';
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className={`${base} ${active ? activeClass : inactive}`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function Stat({
  label,
  value,
  suffix,
  tone,
}: {
  label: string;
  value: string;
  suffix?: string;
  tone: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
}) {
  return (
    <div className="text-center min-w-0">
      <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-500 truncate">{label}</div>
      <div className={`text-base sm:text-xl font-bold tabular-nums ${verdictColor(tone)}`}>{value}</div>
      {suffix && <div className="text-[9px] sm:text-[10px] text-slate-500 -mt-0.5 truncate">{suffix}</div>}
    </div>
  );
}

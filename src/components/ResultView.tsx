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

  // 패널 변경 시 상세로 부드럽게 스크롤 (직접 클릭만, 초기 로드는 제외)
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
    <div className="mx-auto max-w-6xl px-4 pt-6 pb-16">
      {/* Top bar */}
      <div className="flex items-center gap-3 mb-6 no-print">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-slate-400 hover:text-white hover:bg-slate-800/50"
        >
          <ArrowLeft className="w-4 h-4" /> 뒤로
        </button>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={onToggleWatch}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm border transition ${
              isWatched
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                : 'border-slate-700 text-slate-400 hover:bg-slate-800/50'
            }`}
          >
            <Star className={`w-4 h-4 ${isWatched ? 'fill-amber-400' : ''}`} />
            {isWatched ? '워치리스트 추가됨' : '워치리스트 추가'}
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm border border-slate-700 text-slate-400 hover:bg-slate-800/50"
            title="브라우저 인쇄 다이얼로그에서 'PDF로 저장'을 선택하세요"
          >
            <Printer className="w-4 h-4" /> PDF
          </button>
          <button
            onClick={handleShare}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm border transition ${
              copied
                ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                : 'border-slate-700 text-slate-400 hover:bg-slate-800/50'
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            {copied ? '복사됨' : '공유'}
          </button>
        </div>
      </div>

      {/* Stock header */}
      <div className="card p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div>
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="font-mono text-2xl font-bold text-amber-300">{diagnosis.ticker}</span>
              <span className="text-lg font-medium">{diagnosis.name}</span>
              <span className="text-sm text-slate-500">{diagnosis.nameKo}</span>
            </div>
            <div className="text-3xl font-bold mt-2">{fmtUsd(diagnosis.price)}</div>
            <div className="text-xs text-slate-500 mt-1">
              진단 시각: {new Date(diagnosis.asOf).toLocaleString('ko-KR')}
            </div>
          </div>

          <div className="ml-auto card bg-slate-900/40 px-5 py-3 grid grid-cols-3 gap-4 min-w-fit">
            <Stat label="종합 점수" value={`${overallScore}`} suffix="/100" tone={dominant} />
            <Stat
              label="컨센서스"
              value={`${consensus.positive}·${consensus.neutral}·${consensus.negative}`}
              tone={dominant}
              suffix="긍·중·부"
            />
            <Stat
              label="결과"
              value={verdictKo(dominant)}
              tone={dominant}
            />
          </div>
        </div>
      </div>

      {/* Macro editor */}
      <div className="mb-8 no-print">
        <MacroEditor macro={macro} onChange={onMacroChange} onReset={onResetMacro} />
      </div>

      {/* Panel cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
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
      <div ref={detailRef} className="scroll-mt-24">
        <PanelDetail panel={selectedPanel} ticker={diagnosis.ticker} nameKo={diagnosis.nameKo} />
      </div>
    </div>
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
    <div className="text-center">
      <div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className={`text-xl font-bold tabular-nums ${verdictColor(tone)}`}>{value}</div>
      {suffix && <div className="text-[10px] text-slate-500 -mt-0.5">{suffix}</div>}
    </div>
  );
}

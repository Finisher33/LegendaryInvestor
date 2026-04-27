import { useState } from 'react';
import { ChevronDown, RotateCcw, TrendingDown, TrendingUp, Sliders } from 'lucide-react';
import type { MacroState } from '../types';
import { CURRENT_MACRO, macroRegimeLabel } from '../data/macro';

interface Props {
  macro: MacroState;
  onChange: (next: MacroState) => void;
  onReset: () => void;
  defaultExpanded?: boolean;
  variant?: 'card' | 'inline';
}

const REGIMES: Array<{
  id: 'GR_IR' | 'GR_IF' | 'GF_IR' | 'GF_IF';
  label: string;
  growth: 'RISING' | 'FALLING';
  inflation: 'RISING' | 'FALLING';
  hint: string;
}> = [
  { id: 'GR_IR', label: '성장↑ · 인플레↑', growth: 'RISING',  inflation: 'RISING',  hint: '경기과열 — 상품·신흥국·금융주 우호' },
  { id: 'GR_IF', label: '성장↑ · 인플레↓', growth: 'RISING',  inflation: 'FALLING', hint: '골디락스 — 선진국 성장주·하이일드 우호' },
  { id: 'GF_IR', label: '성장↓ · 인플레↑', growth: 'FALLING', inflation: 'RISING',  hint: '스태그플레이션 — 금·원자재·물가연동채' },
  { id: 'GF_IF', label: '성장↓ · 인플레↓', growth: 'FALLING', inflation: 'FALLING', hint: '디플레이션/침체 — 장기국채·달러현금·필수소비재' },
];

const SUMMARY: Record<string, string> = {
  GR_IR: '성장 모멘텀 견조 + 물가 압력 재가속. 실질금리 안정. 경기민감주·원자재 우호 환경.',
  GR_IF: '성장은 우상향 + 인플레이션 하향. 실질금리 점진 하락. 듀레이션이 길어도 좋은 환경.',
  GF_IR: '성장 둔화 + 인플레이션 재상승. 실질금리 가변. 방어주·실물자산이 빛난다.',
  GF_IF: '성장세 둔화, 인플레이션 하향 안정화, 실질금리 +2.2%. ISM 신규주문은 50 이하로 위축 신호. 통화량(M2)은 12개월 모멘텀이 가속.',
};

export function MacroEditor({ macro, onChange, onReset, defaultExpanded = false, variant = 'card' }: Props) {
  const [open, setOpen] = useState(defaultExpanded);
  const isOverride =
    macro.growthDirection !== CURRENT_MACRO.growthDirection ||
    macro.inflationDirection !== CURRENT_MACRO.inflationDirection;

  const currentKey = `${macro.growthDirection === 'RISING' ? 'GR' : 'GF'}_${
    macro.inflationDirection === 'RISING' ? 'IR' : 'IF'
  }`;

  const setRegime = (g: 'RISING' | 'FALLING', i: 'RISING' | 'FALLING') => {
    const key = `${g === 'RISING' ? 'GR' : 'GF'}_${i === 'RISING' ? 'IR' : 'IF'}`;
    onChange({
      ...macro,
      growthDirection: g,
      inflationDirection: i,
      summaryKo: SUMMARY[key] ?? macro.summaryKo,
    });
  };

  const wrapCls = variant === 'card' ? 'card p-4' : 'border-t border-slate-800 pt-3';

  return (
    <div className={wrapCls}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 text-left"
      >
        <Sliders className="w-4 h-4 text-sky-300 shrink-0" />
        <h3 className="text-sm font-semibold">현재 거시 국면</h3>
        <span className="text-xs text-sky-300">{macroRegimeLabel(macro)}</span>
        {isOverride && (
          <span className="chip text-amber-300 border-amber-500/40 bg-amber-500/10 text-[10px] py-0.5 px-2">
            시나리오 모드
          </span>
        )}
        <span className="ml-auto text-xs text-slate-500">{macro.asOf}</span>
        <ChevronDown
          className={`w-4 h-4 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <div className="text-xs text-slate-400 leading-relaxed mt-2">{macro.summaryKo}</div>

      {open && (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {REGIMES.map((r) => {
              const active = currentKey === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setRegime(r.growth, r.inflation)}
                  className={`text-left rounded-lg border px-3 py-2.5 transition ${
                    active
                      ? 'border-sky-400/60 bg-sky-500/15'
                      : 'border-slate-700 bg-slate-900/40 hover:border-slate-600 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-1 text-sm font-medium">
                    {r.growth === 'RISING' ? (
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                    )}
                    <span className="text-slate-200">성장</span>
                    {r.inflation === 'RISING' ? (
                      <TrendingUp className="w-3.5 h-3.5 text-amber-400 ml-2" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5 text-sky-400 ml-2" />
                    )}
                    <span className="text-slate-200">인플레</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">{r.hint}</div>
                </button>
              );
            })}
          </div>

          {isOverride && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-300"
            >
              <RotateCcw className="w-3 h-3" /> 실제 거시 환경으로 되돌리기
            </button>
          )}

          <div className="text-[10px] text-slate-500 leading-relaxed pt-2 border-t border-slate-800">
            거시 4분면을 바꾸면 <span className="text-sky-300">달리오</span>·
            <span className="text-violet-300">드러켄밀러</span>의 점수가 즉시 재계산됩니다 (Sector × Regime fit 매트릭스 기반).
            가치투자자(버핏·린치·그레이엄)의 점수는 거시와 독립이라 변하지 않습니다.
          </div>
        </div>
      )}
    </div>
  );
}

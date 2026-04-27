import type { AxisResult, DataRef, MacroState, PersonaVerdict, Quote, TickerData } from '../types';
import { clip, scale } from '../utils/score';
import { fmtRatio, verdictFromScore } from '../utils/format';
import { SECTOR_REGIME_FIT, macroRegimeKey, macroRegimeLabel } from '../data/macro';

/** PRD §3.3 Ray Dalio — Regime Fit × Resilience */
export function dalioScore(t: TickerData, macro: MacroState): PersonaVerdict {
  const regimeKey = macroRegimeKey(macro);
  const fit = SECTOR_REGIME_FIT[t.sector]?.[regimeKey] ?? 0;

  const resilience =
    0.4 * clip(scale(t.fcfToDebt, 0, 2), 0, 100) +
    0.3 * (100 - clip(t.beta * 50, 0, 100)) +
    0.3 * clip(scale(t.cashRatio, 0, 1.5), 0, 100);

  const raw = 50 + fit * 30 + (resilience - 50) * 0.4;
  const score = Math.round(clip(raw, 0, 100));
  const verdict = verdictFromScore(score);

  const axes: AxisResult[] = [
    {
      name: `Regime Fit (${macroRegimeLabel(macro)})`,
      value: Math.round(50 + fit * 50),
      threshold: 50,
      passed: fit > 0,
      display: `${fit >= 0 ? '+' : ''}${fit.toFixed(2)}`,
      rationaleKo:
        fit > 0.3
          ? '현재 거시 4분면에서 매우 우호적인 섹터'
          : fit > 0
          ? '약하게 우호적'
          : fit > -0.3
          ? '중립~약한 역풍'
          : '역풍 환경',
    },
    {
      name: '재무 회복탄력성 (Resilience)',
      value: Math.round(resilience),
      threshold: 50,
      passed: resilience >= 50,
      display: `FCF/부채 ${fmtRatio(t.fcfToDebt)} · β ${fmtRatio(t.beta)} · 현금비율 ${fmtRatio(t.cashRatio)}`,
      rationaleKo:
        resilience >= 60
          ? '거시 충격에 견딜 체력이 있다'
          : '체력이 약해 거시 변동에 취약',
    },
  ];

  const dataRefs: DataRef[] = [
    { metric: 'Sector', value: 0, display: t.sector, computedBy: 'dalio.regime' },
    { metric: 'Regime', value: 0, display: macroRegimeLabel(macro), computedBy: 'dalio.regime' },
    { metric: 'Sector × Regime fit', value: fit, display: fit.toFixed(2), computedBy: 'dalio.regime' },
    { metric: 'FCF / Debt', value: t.fcfToDebt, display: fmtRatio(t.fcfToDebt), computedBy: 'dalio.resilience' },
    { metric: 'Beta', value: t.beta, display: fmtRatio(t.beta), computedBy: 'dalio.resilience' },
    { metric: 'Cash Ratio', value: t.cashRatio, display: fmtRatio(t.cashRatio), computedBy: 'dalio.resilience' },
  ];

  const headline = buildDalioHeadline(t, macro, fit, score, verdict);
  const body = buildDalioBody(t, macro, fit, resilience);

  const quote = pickDalioQuote(verdict);

  return {
    persona: 'DALIO',
    verdict,
    score,
    headline,
    body,
    axes,
    dataRefs,
    quote,
    meta: { regime: regimeKey, regimeLabel: macroRegimeLabel(macro), fit: fit.toFixed(2) },
  };
}

function buildDalioHeadline(
  t: TickerData,
  macro: MacroState,
  fit: number,
  score: number,
  v: ReturnType<typeof verdictFromScore>,
): string {
  const reg = macroRegimeLabel(macro);
  if (v === 'POSITIVE') return `${reg} 국면에서 ${t.nameKo}는 제 역할을 한다. (${score}/100)`;
  if (v === 'NEUTRAL') return `${reg} 국면 — 결정적 베팅 환경은 아니다. (${score}/100)`;
  return fit < 0
    ? `현재 거시 4분면(${reg})에서는 역풍 자산. (${score}/100)`
    : `체력 부족으로 거시 변동에 취약. (${score}/100)`;
}

function buildDalioBody(
  t: TickerData,
  macro: MacroState,
  fit: number,
  resilience: number,
): string {
  const reg = macroRegimeLabel(macro);
  const fitDescr =
    fit > 0.5
      ? '강하게 우호적'
      : fit > 0
      ? '온건하게 우호적'
      : fit > -0.5
      ? '비우호적'
      : '명확한 역풍';
  const resDescr =
    resilience >= 60
      ? '재무 회복탄력성은 양호'
      : '재무 체력은 평균 이하';
  return `현재 거시 환경은 ${reg} (${macro.summaryKo}). ${t.nameKo}가 속한 ${t.sector} 섹터의 사이클 적합도는 ${fitDescr}이며, ${resDescr}이다. All Weather 관점에서 본다면, 이 종목은 ${
    fit > 0 ? '현재 사이클을 활용할 수 있는' : '다른 자산과 균형을 이뤄야 하는'
  } 위치에 있다. ${
    macro.growthDirection === 'FALLING' && t.beta > 1.2
      ? '베타가 높아 성장 둔화 국면에 노출이 크다.'
      : ''
  }`.trim();
}

function pickDalioQuote(v: ReturnType<typeof verdictFromScore>): Quote {
  const pool: Record<string, Quote> = {
    POSITIVE: {
      text: '역사는 운율을 맞춘다. 같은 거시 국면에서 같은 자산은 비슷한 길을 걷는다.',
      sourceId: 'PRINCIPLES_BIG_DEBT_CRISES',
      pageOrYear: 'Principles, Part 1',
    },
    NEUTRAL: {
      text: '예측은 어렵다. 그래서 어떤 환경에서도 살아남는 포트폴리오를 만든다.',
      sourceId: 'BRIDGEWATER_DAILY_OBS',
      pageOrYear: 'Daily Observations',
    },
    NEGATIVE: {
      text: '거시 사이클을 거스르는 자산을 들고 있는 것은, 강물을 거슬러 헤엄치는 일이다.',
      sourceId: 'PRINCIPLES_LINKEDIN',
      pageOrYear: 'LinkedIn 2018',
    },
  };
  return pool[v];
}

/** Sector × Regime alignment helper (Druckenmiller가 동일 매트릭스 활용) */
export const sectorRegimeFit = (sector: string, macro: MacroState): number =>
  SECTOR_REGIME_FIT[sector]?.[macroRegimeKey(macro)] ?? 0;

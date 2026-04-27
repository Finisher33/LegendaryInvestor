import type { AxisResult, DataRef, MacroState, PersonaVerdict, Quote, TickerData } from '../types';
import { clip, scale } from '../utils/score';
import { fmtPct, fmtRatio, verdictFromScore } from '../utils/format';
import { sectorRegimeFit } from './dalio';
import { macroRegimeLabel } from '../data/macro';

/** PRD §3.4 Druckenmiller — Top-down + Momentum + Asymmetric Bet */
export function druckenmillerScore(t: TickerData, macro: MacroState): PersonaVerdict {
  const earnMom = clip(scale(t.epsRevision3m, -0.05, 0.10), 0, 100);
  const rsIdx = clip(t.relStrength6mPctile, 0, 100);
  const macroFit = clip(50 + sectorRegimeFit(t.sector, macro) * 30, 0, 100);
  const asym = t.upsidePotential / Math.max(t.downsideRisk, 0.01);
  const asymN = clip(scale(asym, 1.0, 4.0), 0, 100);

  const score = Math.round(0.35 * earnMom + 0.25 * rsIdx + 0.25 * macroFit + 0.15 * asymN);
  const verdict = verdictFromScore(score);

  const isConcentratedBet =
    score >= 80 && sectorRegimeFit(t.sector, macro) > 0.3 && t.epsRevision3m > 0.03;

  const axes: AxisResult[] = [
    {
      name: 'EPS 리비전 모멘텀 (3M)',
      value: Math.round(earnMom),
      threshold: 50,
      passed: t.epsRevision3m > 0,
      display: `${t.epsRevision3m >= 0 ? '+' : ''}${fmtPct(t.epsRevision3m)}`,
      rationaleKo:
        t.epsRevision3m > 0.03
          ? '컨센서스 상향이 가속 — 매우 강한 신호'
          : t.epsRevision3m > 0
          ? '소폭 상향'
          : '하향 — 위험 신호',
    },
    {
      name: '상대강도 (6M, 백분위)',
      value: Math.round(rsIdx),
      threshold: 50,
      passed: rsIdx >= 60,
      display: `${rsIdx.toFixed(0)}%ile`,
      rationaleKo: rsIdx >= 70 ? '주도주 후보' : rsIdx >= 50 ? '시장 평균 이상' : '시장 평균 미달',
    },
    {
      name: `거시 적합도 (${macroRegimeLabel(macro)})`,
      value: Math.round(macroFit),
      threshold: 50,
      passed: macroFit >= 50,
      display: `${(sectorRegimeFit(t.sector, macro) >= 0 ? '+' : '')}${sectorRegimeFit(t.sector, macro).toFixed(2)}`,
      rationaleKo: macroFit >= 60 ? '거시 흐름과 정렬' : '거시 역풍',
    },
    {
      name: '비대칭(Up/Down)',
      value: Math.round(asymN),
      threshold: 50,
      passed: asym > 1.5,
      display: `${fmtPct(t.upsidePotential)} / ${fmtPct(t.downsideRisk)} = ${fmtRatio(asym)}x`,
      rationaleKo: asym > 2 ? '명확한 비대칭 — 베팅 가치' : '비대칭이 약하다',
    },
  ];

  const dataRefs: DataRef[] = [
    { metric: 'EPS Revision 3M', value: t.epsRevision3m, display: fmtPct(t.epsRevision3m), computedBy: 'drucken.earnMom' },
    { metric: 'Relative Strength 6M', value: t.relStrength6mPctile, display: `${rsIdx.toFixed(0)}%ile`, computedBy: 'drucken.rs' },
    { metric: 'Macro Fit', value: sectorRegimeFit(t.sector, macro), display: sectorRegimeFit(t.sector, macro).toFixed(2), computedBy: 'drucken.macroFit' },
    { metric: 'Up/Down Asymmetry', value: asym, display: `${fmtRatio(asym)}x`, computedBy: 'drucken.asym' },
  ];

  const headline = buildHeadline(t, score, verdict, isConcentratedBet);
  const body = buildBody(macro, isConcentratedBet, t.epsRevision3m, rsIdx);
  const quote = pickQuote(verdict);

  return {
    persona: 'DRUCKENMILLER',
    verdict,
    score,
    headline,
    body,
    axes,
    dataRefs,
    quote,
    meta: { isConcentratedBet, badge: isConcentratedBet ? 'Concentrated Bet 적합' : score >= 80 ? 'Trend 추종' : 'Pass' },
  };
}

function buildHeadline(
  t: TickerData,
  score: number,
  v: ReturnType<typeof verdictFromScore>,
  concentrated: boolean,
): string {
  if (concentrated) return `[Concentrated Bet] ${t.nameKo} — 거시·미시·차트가 정렬됐다. (${score}/100)`;
  if (v === 'POSITIVE') return `${t.nameKo} — 트렌드를 타라. (${score}/100)`;
  if (v === 'NEUTRAL') return `방향성 불충분. 위치 잡기 보류. (${score}/100)`;
  return `지금은 들어갈 자리가 아니다. (${score}/100)`;
}

function buildBody(
  macro: MacroState,
  concentrated: boolean,
  epsRev: number,
  rs: number,
): string {
  const reg = macroRegimeLabel(macro);
  const epsTxt =
    epsRev > 0.03
      ? `EPS 리비전이 +${fmtPct(epsRev)}로 가속 — 어닝 사이클이 우상향`
      : epsRev > 0
      ? `EPS 리비전 +${fmtPct(epsRev)}로 약하지만 우호적`
      : `EPS 리비전이 ${fmtPct(epsRev)}로 하향`;
  const rsTxt =
    rs >= 70
      ? `상대강도 ${rs.toFixed(0)}%ile — 주도주 후보`
      : rs >= 50
      ? `상대강도 ${rs.toFixed(0)}%ile — 평균 이상`
      : `상대강도 ${rs.toFixed(0)}%ile — 약세 추세`;
  const macroTxt = `현재 ${reg} 국면 (${macro.m2YoYAccel === 'UP' ? 'M2 가속' : 'M2 둔화'} · ${macro.fedBalanceDirection === 'EXPANDING' ? '연준 확장' : '연준 축소'})`;
  const conclude = concentrated
    ? '셋이 한 방향으로 가리킬 때만 큰 베팅을 한다 — 지금이 그런 때다.'
    : 'Concentrated Bet의 조건은 충족하지 못했다. 트렌드가 깨지면 즉시 빠진다.';
  return `${epsTxt}. ${rsTxt}. ${macroTxt}. ${conclude}`;
}

function pickQuote(v: ReturnType<typeof verdictFromScore>): Quote {
  const pool: Record<string, Quote> = {
    POSITIVE: {
      text: '확신이 강할 때, 그리고 오직 그때만, 크게 베팅하라.',
      sourceId: 'SOHN_2015_INTERVIEW',
      pageOrYear: 'Sohn Conference 2015',
    },
    NEUTRAL: {
      text: '내가 옳을 때 큰 포지션, 틀릴 때는 작게. 그게 전부다.',
      sourceId: 'BLOOMBERG_2017',
      pageOrYear: 'Bloomberg Interview 2017',
    },
    NEGATIVE: {
      text: '주가는 12~18개월 선행한다. 가격이 알려주는 것을 거스르지 마라.',
      sourceId: 'CNBC_2020',
      pageOrYear: 'CNBC Interview 2020',
    },
  };
  return pool[v];
}

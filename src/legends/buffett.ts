import type { AxisResult, DataRef, PersonaVerdict, Quote, TickerData } from '../types';
import { clip, scale } from '../utils/score';
import { fmtPct, fmtRatio, verdictFromScore } from '../utils/format';

/** PRD §3.1 Warren Buffett — Quality + Moat + MoS */
export function buffettScore(t: TickerData): PersonaVerdict {
  // Quality (35%)
  const q =
    clip(scale(t.roe10yAvg * 100, 8, 25), 0, 100) * 0.5 +
    clip(scale(t.roic10yAvg * 100, 6, 20), 0, 100) * 0.3 +
    (100 - clip(t.nmStdPp * 10, 0, 100)) * 0.2;

  // Moat (25%)
  const m =
    clip(100 - t.gmStdPp * 20, 0, 100) * 0.4 +
    clip(scale(t.fcfRev * 100, 5, 25), 0, 100) * 0.6;

  // Valuation (25%)
  const oeYield = t.ownerEarningsTtm / t.marketCap; // both in $B
  const spread = oeYield - t.tbond10y;
  const peDiscount = t.pe10yAvg / t.peTtm;
  const v =
    clip(scale(spread, -0.02, 0.05), 0, 100) * 0.7 +
    clip(scale(peDiscount, 0.7, 1.3), 0, 100) * 0.3;

  // Management (15%)
  const mgmt =
    clip(scale(1.5 - t.debtEq, 0, 1.5), 0, 100) * 0.5 +
    (t.buyback5yCum >= 0 ? 100 : 0) * 0.5;

  const score = Math.round(0.35 * q + 0.25 * m + 0.25 * v + 0.15 * mgmt);
  const verdict = verdictFromScore(score);

  const axes: AxisResult[] = [
    {
      name: '퀄리티 (ROE/ROIC/마진안정)',
      value: Math.round(q),
      threshold: 75,
      passed: q >= 75,
      display: `ROE ${fmtPct(t.roe10yAvg)} · ROIC ${fmtPct(t.roic10yAvg)}`,
      rationaleKo: `ROE 10년 평균 ${fmtPct(t.roe10yAvg)}는 버핏 기준 15%${t.roe10yAvg >= 0.15 ? ' 통과' : ' 미달'}.`,
    },
    {
      name: '경제적 해자 (Moat)',
      value: Math.round(m),
      threshold: 70,
      passed: m >= 70,
      display: `FCF/매출 ${fmtPct(t.fcfRev)} · GM σ ${t.gmStdPp.toFixed(1)}pp`,
      rationaleKo: `FCF/매출 ${fmtPct(t.fcfRev)}, 매출총이익률 표준편차 ${t.gmStdPp.toFixed(1)}pp. ${t.gmStdPp <= 3 ? '안정적 마진은 해자의 흔적' : '마진 변동이 큼 — 해자 의심'}.`,
    },
    {
      name: '밸류에이션 (Owner Earnings)',
      value: Math.round(v),
      threshold: 60,
      passed: v >= 60,
      display: `OE Yield ${fmtPct(oeYield)} (10y T-bond ${fmtPct(t.tbond10y)})`,
      rationaleKo: `Owner Earnings 수익률 ${fmtPct(oeYield)}, 10년 국채 ${fmtPct(t.tbond10y)} 대비 스프레드 ${fmtPct(spread)}. PER ${fmtRatio(t.peTtm)}배 vs 10년 평균 ${fmtRatio(t.pe10yAvg)}배.`,
    },
    {
      name: '경영진 (자본배분)',
      value: Math.round(mgmt),
      threshold: 70,
      passed: mgmt >= 70,
      display: `D/E ${fmtRatio(t.debtEq)} · 5Y 자사주매입 ${t.buyback5yCum >= 0 ? '+' : ''}$${t.buyback5yCum.toFixed(0)}B`,
      rationaleKo: `부채/자기자본 ${fmtRatio(t.debtEq)} (기준 1.5↓). 5년 자사주 매입 누적 $${t.buyback5yCum.toFixed(0)}B.`,
    },
  ];

  const dataRefs: DataRef[] = [
    { metric: 'ROE 10Y avg', value: t.roe10yAvg, display: fmtPct(t.roe10yAvg), computedBy: 'compute_buffett.q' },
    { metric: 'ROIC 10Y avg', value: t.roic10yAvg, display: fmtPct(t.roic10yAvg), computedBy: 'compute_buffett.q' },
    { metric: 'FCF/Revenue', value: t.fcfRev, display: fmtPct(t.fcfRev), computedBy: 'compute_buffett.m' },
    { metric: 'Owner Earnings Yield', value: oeYield, display: fmtPct(oeYield), computedBy: 'compute_buffett.v' },
    { metric: 'PE TTM vs 10Y avg', value: t.peTtm / t.pe10yAvg, display: `${fmtRatio(t.peTtm)} / ${fmtRatio(t.pe10yAvg)}`, computedBy: 'compute_buffett.v' },
    { metric: 'Debt / Equity', value: t.debtEq, display: fmtRatio(t.debtEq), computedBy: 'compute_buffett.mgmt' },
  ];

  const quote = pickBuffettQuote(verdict);
  const headline = buildBuffettHeadline(t, score, verdict, spread);
  const body = buildBuffettBody(t, axes, spread);
  void oeYield;

  return {
    persona: 'BUFFETT',
    verdict,
    score,
    headline,
    body,
    axes,
    dataRefs,
    quote,
  };
}

function buildBuffettHeadline(
  t: TickerData,
  score: number,
  verdict: ReturnType<typeof verdictFromScore>,
  spread: number,
): string {
  if (verdict === 'POSITIVE') {
    if (spread > 0.03) return `위대한 기업, 그것도 합리적 가격에. (${score}/100)`;
    return `훌륭한 사업이지만 가격은 더 좋아질 수 있다. (${score}/100)`;
  }
  if (verdict === 'NEUTRAL') {
    if (t.roe10yAvg >= 0.15 && spread < 0.01)
      return `사업의 질은 의심하지 않는다. 다만 가격이 비싸다. (${score}/100)`;
    return `한 축이 빠진 그림이다. 신중하게 본다. (${score}/100)`;
  }
  return `내 기준에선 사지 않는다. (${score}/100)`;
}

function buildBuffettBody(
  t: TickerData,
  axes: AxisResult[],
  spread: number,
): string {
  const [q, m, v, mg] = axes;
  const parts: string[] = [];
  if (t.roe10yAvg >= 0.15)
    parts.push(`${t.nameKo}의 10년 평균 ROE ${fmtPct(t.roe10yAvg)}는 내가 요구하는 15%를 ${(t.roe10yAvg - 0.15) * 100 > 10 ? '압도한다' : '상회한다'}.`);
  else
    parts.push(`${t.nameKo}의 10년 평균 ROE ${fmtPct(t.roe10yAvg)}는 내 기준(15%)에 못 미친다.`);
  if (t.fcfRev >= 0.15)
    parts.push(`FCF/매출 ${fmtPct(t.fcfRev)}는 굳건한 해자의 증거다.`);
  else
    parts.push(`FCF/매출 ${fmtPct(t.fcfRev)}는 해자를 의심하게 한다.`);
  parts.push(
    spread > 0.03
      ? `Owner Earnings 수익률은 10년 국채를 ${(spread * 100).toFixed(1)}pp 상회한다 — 가격이 합리적이다.`
      : spread > 0
      ? `Owner Earnings 수익률 스프레드는 +${(spread * 100).toFixed(1)}pp로, 풍요롭지는 않다.`
      : `Owner Earnings 수익률이 10년 국채에 미치지 못한다 — 너무 비싸다.`,
  );
  parts.push(
    t.buyback5yCum > 0
      ? `5년간 자사주 매입은 일관되게 누적 +$${t.buyback5yCum.toFixed(0)}B. 자본배분은 옳은 방향이다.`
      : `자사주 매입 트랙레코드가 약하다.`,
  );
  void q; void m; void v; void mg;
  return parts.join(' ');
}

function pickBuffettQuote(v: ReturnType<typeof verdictFromScore>): Quote {
  const pool: Record<string, Quote> = {
    POSITIVE: {
      text: '위대한 기업을 합리적인 가격에 사는 것이, 평범한 기업을 훌륭한 가격에 사는 것보다 훨씬 낫다.',
      sourceId: 'BRK_1989_LETTER',
      pageOrYear: '1989 주주서한',
    },
    NEUTRAL: {
      text: '내가 가장 좋아하는 보유 기간은 영원이다. 다만 그것은 가격이 합리적일 때의 이야기다.',
      sourceId: 'BRK_1988_LETTER',
      pageOrYear: '1988 주주서한',
    },
    NEGATIVE: {
      text: '가격은 당신이 지불하는 것이고, 가치는 당신이 얻는 것이다.',
      sourceId: 'BRK_2008_LETTER',
      pageOrYear: '2008 주주서한',
    },
  };
  return pool[v];
}

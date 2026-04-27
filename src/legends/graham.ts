import type { AxisResult, DataRef, PersonaVerdict, Quote, TickerData } from '../types';
import { clip } from '../utils/score';
import { fmtPct, fmtRatio, fmtUsd, verdictFromScore } from '../utils/format';

type GrahamTrack = 'DEF' | 'ENT' | 'NONE';

/** PRD §3.5 Benjamin Graham — Deep Value + Margin of Safety */
export function grahamScore(t: TickerData): PersonaVerdict {
  // 8개 Defensive 체크
  const defensive = [
    { label: '매출 ≥ $500M', passed: t.revenueUsdM >= 500 },
    { label: '유동비율 ≥ 2', passed: t.currentRatio >= 2 },
    { label: '10년 흑자 연속', passed: t.profitYears10y >= 10 },
    { label: '10년 배당 연속', passed: t.dividendYears10y >= 10 },
    { label: 'EPS 10Y 성장 ≥ 33%', passed: t.eps10yGrowth >= 0.33 },
    { label: 'P/E ≤ 15', passed: t.peTtm <= 15 },
    { label: 'P/B ≤ 1.5', passed: t.bvps > 0 && t.price / t.bvps <= 1.5 },
    { label: 'P/E × P/B ≤ 22.5', passed: t.bvps > 0 && t.peTtm * (t.price / t.bvps) <= 22.5 },
  ];
  const passDef = defensive.filter(d => d.passed).length;

  // 5개 Enterprising 체크
  const enterprising = [
    { label: '유동비율 ≥ 1.5', passed: t.currentRatio >= 1.5 },
    { label: '부채/순운전자본 ≤ 1.1', passed: t.debtToNwc <= 1.1 },
    { label: '5년 흑자', passed: t.profitYears10y >= 5 },
    { label: '배당 지급', passed: t.dividendYears10y >= 1 },
    { label: 'EPS 5Y 성장 (+) 또는 NCAV > 시총', passed: t.eps5yGrowth > 0 || t.ncavPerShare > t.price },
    { label: 'P/E ≤ 10 또는 NCAV > 시총', passed: t.peTtm <= 10 || t.ncavPerShare > t.price },
  ];
  const passEnt = enterprising.filter(d => d.passed).length;

  const track: GrahamTrack = passDef >= 6 ? 'DEF' : passEnt >= 4 ? 'ENT' : 'NONE';

  // Graham Number
  const grahamNumber = t.eps > 0 && t.bvps > 0 ? Math.sqrt(22.5 * t.eps * t.bvps) : 0;
  // 성장 가치 공식 (수정형)
  const aaaYield = 0.052; // 가정값
  const Y = aaaYield * 100; // %
  const growthIv =
    t.eps > 0 ? (t.eps * (8.5 + 2 * Math.min(t.eps10yGrowth * 100, 20)) * 4.4) / Y : 0;
  const intrinsic = grahamNumber > 0 && growthIv > 0 ? Math.min(grahamNumber, growthIv) : Math.max(grahamNumber, growthIv);
  const mos = intrinsic > 0 ? (intrinsic - t.price) / intrinsic : -1;

  const base = track !== 'NONE' ? 60 : 30;
  const bonus = clip(mos * 100, -40, 40);
  const score = Math.round(clip(base + bonus, 0, 100));
  const verdict = verdictFromScore(score);

  const ncavPositive = t.ncavPerShare > t.price;

  const axes: AxisResult[] = [
    {
      name: 'Defensive 체크 (8 항목)',
      value: Math.round((passDef / 8) * 100),
      threshold: 75,
      passed: passDef >= 6,
      display: `${passDef}/8`,
      rationaleKo: passDef >= 6 ? '방어형 투자자 트랙 충족' : '방어형 트랙 미달',
    },
    {
      name: 'Enterprising 체크 (6 항목)',
      value: Math.round((passEnt / 6) * 100),
      threshold: 67,
      passed: passEnt >= 4,
      display: `${passEnt}/6`,
      rationaleKo: passEnt >= 4 ? '진취형 투자자 트랙 충족' : '진취형 트랙 미달',
    },
    {
      name: 'Margin of Safety',
      value: Math.round(clip(50 + mos * 50, 0, 100)),
      threshold: 50,
      passed: mos > 0,
      display: `${mos >= 0 ? '+' : ''}${(mos * 100).toFixed(0)}%`,
      rationaleKo:
        mos > 0.3
          ? '내재가치 대비 30% 이상 할인 — 강한 안전마진'
          : mos > 0
          ? '소폭 할인'
          : 'Mr. Market의 가격이 내재가치를 초과',
    },
    {
      name: 'NCAV 검증',
      value: ncavPositive ? 100 : 0,
      threshold: 50,
      passed: ncavPositive,
      display: `${fmtUsd(t.ncavPerShare)} / ${fmtUsd(t.price)}`,
      rationaleKo: ncavPositive ? '주가가 순운전자본 가치 이하 — 그레이엄식 헐값' : 'NCAV 기준 미해당',
    },
  ];

  const dataRefs: DataRef[] = [
    { metric: 'Graham Number', value: grahamNumber, display: fmtUsd(grahamNumber), computedBy: 'graham.formula' },
    { metric: 'Growth IV', value: growthIv, display: fmtUsd(growthIv), computedBy: 'graham.formula' },
    { metric: 'Intrinsic Value', value: intrinsic, display: fmtUsd(intrinsic), computedBy: 'graham.formula' },
    { metric: 'Margin of Safety', value: mos, display: fmtPct(mos), computedBy: 'graham.formula' },
    { metric: 'PE TTM', value: t.peTtm, display: fmtRatio(t.peTtm), computedBy: 'graham.metric' },
    { metric: 'PB', value: t.bvps > 0 ? t.price / t.bvps : 0, display: fmtRatio(t.bvps > 0 ? t.price / t.bvps : 0), computedBy: 'graham.metric' },
  ];

  const trackKo = track === 'DEF' ? '방어형 (Defensive)' : track === 'ENT' ? '진취형 (Enterprising)' : '어느 트랙도 해당없음';
  const headline = buildHeadline(t, track, mos, score, verdict, ncavPositive);
  const body = buildBody(t, track, intrinsic, mos, defensive, enterprising);
  const quote = pickQuote(verdict);

  return {
    persona: 'GRAHAM',
    verdict,
    score,
    headline,
    body,
    axes,
    dataRefs,
    quote,
    meta: {
      grahamTrack: track,
      grahamTrackKo: trackKo,
      grahamNumber: Math.round(grahamNumber * 100) / 100,
      mos: Math.round(mos * 1000) / 10,
      ncavPositive,
    },
  };
}

function buildHeadline(
  t: TickerData,
  track: GrahamTrack,
  mos: number,
  score: number,
  v: ReturnType<typeof verdictFromScore>,
  ncavPositive: boolean,
): string {
  if (track === 'NONE') return `${t.nameKo}는 나의 두 기준 어디에도 해당하지 않는다. (${score}/100)`;
  if (ncavPositive) return `NCAV 이하의 헐값 — 강한 매수 영역. (${score}/100)`;
  if (v === 'POSITIVE') return `${track === 'DEF' ? '방어형' : '진취형'} 트랙 통과 + 안전마진 ${(mos * 100).toFixed(0)}%. (${score}/100)`;
  if (v === 'NEUTRAL') return `트랙은 통과했으나 가격이 더 좋아져야 한다. (${score}/100)`;
  return `Mr. Market의 가격이 너무 비싸다. (${score}/100)`;
}

function buildBody(
  t: TickerData,
  track: GrahamTrack,
  intrinsic: number,
  mos: number,
  def: { label: string; passed: boolean }[],
  ent: { label: string; passed: boolean }[],
): string {
  const trackKo = track === 'DEF' ? '방어형 투자자' : track === 'ENT' ? '진취형 투자자' : '어느 트랙도 통과하지 못한';
  const ivLine =
    intrinsic > 0
      ? `Graham Number와 성장 가치를 종합한 내재가치는 약 ${fmtUsd(intrinsic)}, 현재가 ${fmtUsd(t.price)} 대비 ${
          mos > 0 ? `${(mos * 100).toFixed(0)}%의 안전마진` : `${(-mos * 100).toFixed(0)}% 프리미엄`
        }이다.`
      : '내재가치 산정에 필요한 EPS/BVPS 데이터가 부족하다.';
  const failedDef = def.filter(d => !d.passed).slice(0, 2).map(d => d.label).join(', ');
  const failedEnt = ent.filter(d => !d.passed).slice(0, 2).map(d => d.label).join(', ');
  const fails =
    track === 'DEF'
      ? failedDef
        ? ` 방어형 미충족: ${failedDef}.`
        : ''
      : track === 'ENT'
      ? failedEnt
        ? ` 진취형 미충족: ${failedEnt}.`
        : ''
      : ` 가장 큰 미달 항목: ${failedDef || failedEnt}.`;
  return `${t.nameKo}는 ${trackKo}의 잣대로 본다. ${ivLine}${fails}`.trim();
}

function pickQuote(v: ReturnType<typeof verdictFromScore>): Quote {
  const pool: Record<string, Quote> = {
    POSITIVE: {
      text: 'Mr. Market의 변덕은 우리에게 기회를 줄 뿐, 결코 안내자가 아니다.',
      sourceId: 'INTELLIGENT_INVESTOR_CH8',
      pageOrYear: 'The Intelligent Investor, Ch.8',
    },
    NEUTRAL: {
      text: '안전마진이 없는 매수는 투자가 아니라 투기다.',
      sourceId: 'INTELLIGENT_INVESTOR_CH20',
      pageOrYear: 'The Intelligent Investor, Ch.20',
    },
    NEGATIVE: {
      text: '주식은 사업의 일부다. 그 사업이 보장하지 않는 가격은 정당화될 수 없다.',
      sourceId: 'SECURITY_ANALYSIS_1934',
      pageOrYear: 'Security Analysis, 1934',
    },
  };
  return pool[v];
}

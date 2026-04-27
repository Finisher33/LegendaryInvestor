import type { AxisResult, DataRef, LynchCategory, PersonaVerdict, Quote, TickerData } from '../types';
import { clip, scale } from '../utils/score';
import { fmtPct, fmtRatio, verdictFromScore } from '../utils/format';

const CATEGORY_KO: Record<LynchCategory, string> = {
  FAST_GROWER: '고속성장주',
  STALWART: '우량주',
  SLOW_GROWER: '저성장주',
  CYCLICAL: '경기순환주',
  TURNAROUND: '회생주',
  ASSET_PLAY: '자산주',
};

export function lynchCategorize(t: TickerData): LynchCategory {
  const g = t.revenueGrowth3y;
  const cap = t.marketCap;
  const cyc = t.betaToMacro;
  const asset = t.navPerShare / t.price;
  const fin = t.distressScore;

  if (fin > 0.7 && t.recentDrawdown > 0.6) return 'TURNAROUND';
  if (asset > 1.2) return 'ASSET_PLAY';
  if (g > 0.20 && cap < 5) return 'FAST_GROWER';
  if (g > 0.15) return 'FAST_GROWER';
  if (cyc > 1.3) return 'CYCLICAL';
  if (g >= 0.05 && g <= 0.10 && t.divYield > 0.025) return 'STALWART';
  if (g < 0.05 && t.divYield > 0.04) return 'SLOW_GROWER';
  return 'STALWART';
}

export function lynchScore(t: TickerData): PersonaVerdict {
  const cat = lynchCategorize(t);

  let cs = 50; // 카테고리 적합 점수
  let axes: AxisResult[] = [];

  switch (cat) {
    case 'FAST_GROWER': {
      const peg = t.peg;
      const rg = t.revenueGrowth3y;
      cs =
        clip(scale(2 - peg, 0, 1), 0, 100) * 0.5 +
        clip(scale(rg, 0.10, 0.40), 0, 100) * 0.5;
      axes = [
        { name: 'PEG', value: Math.round(clip(scale(2 - peg, 0, 1), 0, 100)), threshold: 50, passed: peg < 1, display: fmtRatio(peg), rationaleKo: peg < 1 ? `PEG ${fmtRatio(peg)} — 합리적` : `PEG ${fmtRatio(peg)} — 성장 대비 비싸다` },
        { name: '매출 성장 (3Y CAGR)', value: Math.round(clip(scale(rg, 0.10, 0.40), 0, 100)), threshold: 50, passed: rg >= 0.20, display: fmtPct(rg), rationaleKo: rg >= 0.20 ? '연 20%+ 성장 지속' : '성장이 둔화 신호' },
      ];
      break;
    }
    case 'STALWART': {
      const peDisc = t.pe10yAvg / t.peTtm;
      const roeOk = t.roe10yAvg >= 0.15;
      cs =
        clip(scale(peDisc, 0.7, 1.3), 0, 100) * 0.5 +
        (roeOk ? 100 : 40) * 0.5;
      axes = [
        { name: 'PER 역사평균 분위', value: Math.round(clip(scale(peDisc, 0.7, 1.3), 0, 100)), threshold: 50, passed: peDisc >= 1, display: `${fmtRatio(t.peTtm)} / ${fmtRatio(t.pe10yAvg)}`, rationaleKo: peDisc >= 1 ? '역사 평균 대비 할인' : '역사 평균 대비 프리미엄' },
        { name: 'ROE 안정성', value: roeOk ? 100 : 40, threshold: 50, passed: roeOk, display: fmtPct(t.roe10yAvg), rationaleKo: roeOk ? '15% 이상 ROE 유지' : 'ROE 부족' },
      ];
      break;
    }
    case 'SLOW_GROWER': {
      const cov = t.eps / Math.max(t.divYield * t.price, 0.01);
      const dy = t.divYield;
      cs =
        clip(scale(dy, 0.02, 0.06), 0, 100) * 0.5 +
        clip(scale(cov, 1, 3), 0, 100) * 0.5;
      axes = [
        { name: '배당수익률', value: Math.round(clip(scale(dy, 0.02, 0.06), 0, 100)), threshold: 50, passed: dy > 0.04, display: fmtPct(dy), rationaleKo: dy > 0.04 ? '4%+ 배당' : '배당이 박하다' },
        { name: '배당 커버리지 (EPS/DPS)', value: Math.round(clip(scale(cov, 1, 3), 0, 100)), threshold: 50, passed: cov > 1.5, display: fmtRatio(cov), rationaleKo: cov > 1.5 ? '커버리지 충분' : '커버리지 빠듯' },
      ];
      break;
    }
    case 'CYCLICAL': {
      const pbCycle = t.bvps > 0 ? clip(scale(t.bvps / t.price, 0.05, 0.4), 0, 100) : 30;
      const mom = clip(t.relStrength6mPctile, 0, 100);
      cs = pbCycle * 0.5 + mom * 0.5;
      axes = [
        { name: 'P/B 사이클 위치', value: Math.round(pbCycle), threshold: 50, passed: pbCycle >= 50, display: fmtRatio(t.price / Math.max(t.bvps, 0.01)), rationaleKo: '사이클 저점 부근에서 매수, 고점 부근에서 매도' },
        { name: '거시 모멘텀(상대강도)', value: Math.round(mom), threshold: 50, passed: mom >= 50, display: `${mom.toFixed(0)}%ile`, rationaleKo: mom >= 50 ? '회복 모멘텀 잡힘' : '모멘텀 약함' },
      ];
      break;
    }
    case 'TURNAROUND': {
      const cov = t.fcfToDebt;
      const ins = t.insiderBuy6mNet;
      cs =
        clip(scale(cov, 0, 2), 0, 100) * 0.6 +
        (ins > 0 ? 100 : 30) * 0.4;
      axes = [
        { name: '이자보상/현금흐름 (FCF/Debt)', value: Math.round(clip(scale(cov, 0, 2), 0, 100)), threshold: 50, passed: cov > 0.8, display: fmtRatio(cov), rationaleKo: cov > 0.8 ? '체력 회복 중' : '아직 위태롭다' },
        { name: '인사이더 순매수 (6M)', value: ins > 0 ? 100 : 30, threshold: 50, passed: ins > 0, display: ins > 0 ? '+' : '−', rationaleKo: ins > 0 ? '경영진/내부자가 사고 있다 — 좋은 신호' : '내부자 매수 부재' },
      ];
      break;
    }
    case 'ASSET_PLAY': {
      const navRatio = t.navPerShare / t.price;
      cs = clip(scale(navRatio, 0.8, 1.6), 0, 100);
      axes = [
        { name: 'NAV / 주가', value: Math.round(cs), threshold: 50, passed: navRatio > 1.3, display: fmtRatio(navRatio), rationaleKo: navRatio > 1.3 ? '숨은 자산이 시총을 초과 — 자산주 가치' : 'NAV 디스카운트 부족' },
      ];
      break;
    }
  }

  // Tenbagger likelihood (참고)
  const tenbagger =
    (t.marketCap < 5 ? 25 : 0) +
    clip(scale(t.revenueGrowth3y, 0.10, 0.40), 0, 100) * 0.20 +
    (t.peg < 1 ? 15 : 0) +
    (t.institutionalOwnership < 0.40 ? 10 : 0) +
    (t.insiderBuy6mNet > 0 ? 10 : 0) +
    clip(scale(t.tamPenetrationInverse, 0, 1), 0, 100) * 0.20;

  const score = Math.round(cs);
  const verdict = verdictFromScore(score);

  const dataRefs: DataRef[] = [
    { metric: 'Lynch Category', value: 0, display: CATEGORY_KO[cat], computedBy: 'lynch.categorize' },
    { metric: 'PEG', value: t.peg, display: fmtRatio(t.peg), computedBy: 'lynch.metric' },
    { metric: 'Revenue Growth 3Y', value: t.revenueGrowth3y, display: fmtPct(t.revenueGrowth3y), computedBy: 'lynch.metric' },
    { metric: 'Tenbagger Likelihood', value: tenbagger, display: `${tenbagger.toFixed(0)}/100`, computedBy: 'lynch.tenbagger' },
    { metric: 'Institutional Ownership', value: t.institutionalOwnership, display: fmtPct(t.institutionalOwnership), computedBy: 'lynch.metric' },
  ];

  const quote = pickLynchQuote(cat, verdict);
  const headline = buildLynchHeadline(t, cat, score, verdict);
  const body = buildLynchBody(t, cat, tenbagger);

  return {
    persona: 'LYNCH',
    verdict,
    score,
    headline,
    body,
    axes,
    dataRefs,
    quote,
    meta: { lynchCategory: cat, lynchCategoryKo: CATEGORY_KO[cat], tenbaggerScore: Math.round(tenbagger) },
  };
}

function buildLynchHeadline(
  t: TickerData,
  cat: LynchCategory,
  score: number,
  v: ReturnType<typeof verdictFromScore>,
): string {
  const catKo = CATEGORY_KO[cat];
  if (v === 'POSITIVE') {
    if (cat === 'FAST_GROWER') return `${catKo} — Story가 단순하고, 가격도 친절하다. (${score}/100)`;
    if (cat === 'STALWART') return `${catKo} — 잘 아는 우량주를 싸게 사는 자리. (${score}/100)`;
    if (cat === 'TURNAROUND') return `회생의 단서가 보인다. 다만 신중하게. (${score}/100)`;
    if (cat === 'ASSET_PLAY') return `숨은 자산이 시가총액을 덮는다. (${score}/100)`;
    return `${catKo} 잣대로 합격. (${score}/100)`;
  }
  if (v === 'NEUTRAL') return `${t.nameKo}는 ${catKo} 카테고리. 내 잣대로는 어중간. (${score}/100)`;
  return `${catKo} 잣대로는 매력 부족. 다른 종목을 보겠다. (${score}/100)`;
}

function buildLynchBody(t: TickerData, cat: LynchCategory, tenbagger: number): string {
  const lead: Record<LynchCategory, string> = {
    FAST_GROWER: `${t.nameKo}는 매출이 연 ${fmtPct(t.revenueGrowth3y)} 성장 중인 고속성장주다.`,
    STALWART: `${t.nameKo}는 잘 알려진 우량 기업이다. ROE ${fmtPct(t.roe10yAvg)}로 안정적이다.`,
    SLOW_GROWER: `${t.nameKo}는 성장은 더디나 배당 수익률 ${fmtPct(t.divYield)}이 핵심이다.`,
    CYCLICAL: `${t.nameKo}는 경기 사이클에 민감하다 (베타 ${fmtRatio(t.betaToMacro)}). 사이클 저점에서 사야 한다.`,
    TURNAROUND: `${t.nameKo}는 회생 후보다. 부채 만기 구조와 인사이더 매수가 핵심.`,
    ASSET_PLAY: `${t.nameKo}는 NAV/주가 ${fmtRatio(t.navPerShare / t.price)}로 자산주 성격을 가진다.`,
  };
  const tail =
    cat === 'FAST_GROWER'
      ? t.peg < 1
        ? ` PEG ${fmtRatio(t.peg)}로 성장 대비 가격이 친절하다.`
        : ` 다만 PEG ${fmtRatio(t.peg)}는 너무 비싸다.`
      : '';
  const tb =
    t.marketCap < 5 && tenbagger >= 50
      ? ' 작은 시총과 낮은 기관 보유율 — Tenbagger 후보 자격이 있다.'
      : t.marketCap > 200
      ? ' 시총이 너무 커서 Tenbagger는 어렵다 — 그래서 다른 잣대로 본다.'
      : '';
  return lead[cat] + tail + tb;
}

function pickLynchQuote(_cat: LynchCategory, v: ReturnType<typeof verdictFromScore>): Quote {
  const pool: Record<string, Quote> = {
    POSITIVE: {
      text: '소비자가 직접 쓰는 제품에서 시작하라. Tenbagger는 작은 회사에서 나온다.',
      sourceId: 'ONE_UP_ON_WALL_ST_CH3',
      pageOrYear: 'One Up on Wall Street, Ch.3',
    },
    NEUTRAL: {
      text: '카테고리에 맞는 잣대로 봐야 한다. 우량주를 고속성장주로 평가하면 늘 실망한다.',
      sourceId: 'ONE_UP_ON_WALL_ST_CH8',
      pageOrYear: 'One Up on Wall Street, Ch.8',
    },
    NEGATIVE: {
      text: '주식의 Story가 단순하지 않다면, 사지 않는다.',
      sourceId: 'BEATING_THE_STREET_CH4',
      pageOrYear: 'Beating the Street, Ch.4',
    },
  };
  return pool[v];
}

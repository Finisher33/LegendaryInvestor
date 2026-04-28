import type { Sector, TickerData } from '../types';
import type { RegistryEntry } from './registry';

/** 32-bit string hash (deterministic, fast) */
function hash32(str: string, seed = 0): number {
  let h = 0x811c9dc5 ^ seed;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 0x01000193);
  }
  return h >>> 0;
}

/** symbol-seeded 0..1 RNG with named slot */
function rand(symbol: string, slot: string): number {
  return (hash32(symbol, hash32(slot)) % 100000) / 100000;
}

/** [-1, 1] symmetric noise */
function noise(symbol: string, slot: string): number {
  return rand(symbol, slot) * 2 - 1;
}

/** 섹터별 중심 경향 (대표적 S&P 500 평균 근사) */
interface SectorDefaults {
  roe: number; roic: number; nmStdPp: number; gmStdPp: number;
  fcfRev: number; ownerEarningsYield: number;
  peTtm: number; pe10yAvg: number; debtEq: number;
  buyback5yPct: number;             // 시총 대비 5년 자사주 누적 비중
  revenueGrowth3y: number; betaToMacro: number;
  divYield: number; peg: number;
  institutionalOwnership: number; tamPenetrationInverse: number;
  fcfToDebt: number; beta: number; cashRatio: number;
  epsRevision3m: number; relStrength6mPctile: number;
  upsidePotential: number; downsideRisk: number;
  currentRatio: number; profitYears10y: number; dividendYears10y: number;
  eps10yGrowth: number; eps5yGrowth: number;
  pbRatio: number;                   // P/B
}

const SD: Record<Sector, SectorDefaults> = {
  TECH: {
    roe: 0.28, roic: 0.22, nmStdPp: 3.0, gmStdPp: 2.0, fcfRev: 0.22, ownerEarningsYield: 0.035,
    peTtm: 30, pe10yAvg: 28, debtEq: 0.45, buyback5yPct: 0.05,
    revenueGrowth3y: 0.18, betaToMacro: 1.20, divYield: 0.005, peg: 1.5,
    institutionalOwnership: 0.70, tamPenetrationInverse: 0.45,
    fcfToDebt: 1.6, beta: 1.20, cashRatio: 1.1,
    epsRevision3m: 0.04, relStrength6mPctile: 65,
    upsidePotential: 0.25, downsideRisk: 0.20,
    currentRatio: 1.8, profitYears10y: 9, dividendYears10y: 3,
    eps10yGrowth: 0.20, eps5yGrowth: 0.22, pbRatio: 8.0,
  },
  CONSUMER_STAPLES: {
    roe: 0.24, roic: 0.16, nmStdPp: 1.0, gmStdPp: 0.8, fcfRev: 0.13, ownerEarningsYield: 0.045,
    peTtm: 22, pe10yAvg: 21, debtEq: 1.20, buyback5yPct: 0.03,
    revenueGrowth3y: 0.05, betaToMacro: 0.55, divYield: 0.025, peg: 3.0,
    institutionalOwnership: 0.62, tamPenetrationInverse: 0.10,
    fcfToDebt: 0.6, beta: 0.60, cashRatio: 0.6,
    epsRevision3m: 0.01, relStrength6mPctile: 55,
    upsidePotential: 0.10, downsideRisk: 0.08,
    currentRatio: 1.1, profitYears10y: 10, dividendYears10y: 10,
    eps10yGrowth: 0.06, eps5yGrowth: 0.07, pbRatio: 5.5,
  },
  CONSUMER_DISCRETIONARY: {
    roe: 0.22, roic: 0.14, nmStdPp: 3.5, gmStdPp: 2.0, fcfRev: 0.10, ownerEarningsYield: 0.04,
    peTtm: 25, pe10yAvg: 26, debtEq: 0.85, buyback5yPct: 0.04,
    revenueGrowth3y: 0.10, betaToMacro: 1.25, divYield: 0.012, peg: 2.2,
    institutionalOwnership: 0.65, tamPenetrationInverse: 0.30,
    fcfToDebt: 0.8, beta: 1.20, cashRatio: 0.7,
    epsRevision3m: 0.02, relStrength6mPctile: 55,
    upsidePotential: 0.20, downsideRisk: 0.18,
    currentRatio: 1.4, profitYears10y: 8, dividendYears10y: 6,
    eps10yGrowth: 0.10, eps5yGrowth: 0.12, pbRatio: 6.0,
  },
  FINANCIAL: {
    roe: 0.13, roic: 0.10, nmStdPp: 2.5, gmStdPp: 1.5, fcfRev: 0.20, ownerEarningsYield: 0.07,
    peTtm: 14, pe10yAvg: 14, debtEq: 1.40, buyback5yPct: 0.05,
    revenueGrowth3y: 0.06, betaToMacro: 1.10, divYield: 0.022, peg: 1.4,
    institutionalOwnership: 0.78, tamPenetrationInverse: 0.15,
    fcfToDebt: 0.4, beta: 1.05, cashRatio: 0.9,
    epsRevision3m: 0.02, relStrength6mPctile: 60,
    upsidePotential: 0.18, downsideRisk: 0.18,
    currentRatio: 1.3, profitYears10y: 9, dividendYears10y: 9,
    eps10yGrowth: 0.10, eps5yGrowth: 0.12, pbRatio: 1.6,
  },
  HEALTHCARE: {
    roe: 0.20, roic: 0.15, nmStdPp: 2.5, gmStdPp: 1.5, fcfRev: 0.18, ownerEarningsYield: 0.05,
    peTtm: 22, pe10yAvg: 20, debtEq: 0.55, buyback5yPct: 0.04,
    revenueGrowth3y: 0.07, betaToMacro: 0.55, divYield: 0.018, peg: 2.5,
    institutionalOwnership: 0.70, tamPenetrationInverse: 0.30,
    fcfToDebt: 0.9, beta: 0.65, cashRatio: 1.0,
    epsRevision3m: 0.02, relStrength6mPctile: 50,
    upsidePotential: 0.18, downsideRisk: 0.13,
    currentRatio: 1.5, profitYears10y: 9, dividendYears10y: 7,
    eps10yGrowth: 0.10, eps5yGrowth: 0.10, pbRatio: 4.5,
  },
  INDUSTRIAL: {
    roe: 0.20, roic: 0.13, nmStdPp: 2.8, gmStdPp: 1.6, fcfRev: 0.10, ownerEarningsYield: 0.045,
    peTtm: 22, pe10yAvg: 20, debtEq: 0.95, buyback5yPct: 0.03,
    revenueGrowth3y: 0.06, betaToMacro: 1.10, divYield: 0.018, peg: 2.5,
    institutionalOwnership: 0.72, tamPenetrationInverse: 0.20,
    fcfToDebt: 0.7, beta: 1.05, cashRatio: 0.8,
    epsRevision3m: 0.02, relStrength6mPctile: 58,
    upsidePotential: 0.18, downsideRisk: 0.15,
    currentRatio: 1.5, profitYears10y: 9, dividendYears10y: 8,
    eps10yGrowth: 0.08, eps5yGrowth: 0.09, pbRatio: 4.5,
  },
  ENERGY: {
    roe: 0.15, roic: 0.11, nmStdPp: 5.0, gmStdPp: 3.0, fcfRev: 0.13, ownerEarningsYield: 0.075,
    peTtm: 13, pe10yAvg: 16, debtEq: 0.40, buyback5yPct: 0.06,
    revenueGrowth3y: 0.08, betaToMacro: 1.20, divYield: 0.035, peg: 1.5,
    institutionalOwnership: 0.62, tamPenetrationInverse: 0.10,
    fcfToDebt: 1.1, beta: 1.10, cashRatio: 1.0,
    epsRevision3m: -0.01, relStrength6mPctile: 50,
    upsidePotential: 0.18, downsideRisk: 0.20,
    currentRatio: 1.4, profitYears10y: 7, dividendYears10y: 8,
    eps10yGrowth: 0.05, eps5yGrowth: 0.15, pbRatio: 2.0,
  },
  COMMUNICATION: {
    roe: 0.20, roic: 0.16, nmStdPp: 3.0, gmStdPp: 1.5, fcfRev: 0.20, ownerEarningsYield: 0.04,
    peTtm: 22, pe10yAvg: 22, debtEq: 0.55, buyback5yPct: 0.04,
    revenueGrowth3y: 0.10, betaToMacro: 1.10, divYield: 0.012, peg: 1.7,
    institutionalOwnership: 0.74, tamPenetrationInverse: 0.30,
    fcfToDebt: 1.5, beta: 1.05, cashRatio: 1.2,
    epsRevision3m: 0.03, relStrength6mPctile: 60,
    upsidePotential: 0.20, downsideRisk: 0.18,
    currentRatio: 1.8, profitYears10y: 8, dividendYears10y: 4,
    eps10yGrowth: 0.13, eps5yGrowth: 0.15, pbRatio: 4.5,
  },
  UTILITIES: {
    roe: 0.10, roic: 0.07, nmStdPp: 1.0, gmStdPp: 0.5, fcfRev: 0.05, ownerEarningsYield: 0.04,
    peTtm: 18, pe10yAvg: 18, debtEq: 1.50, buyback5yPct: 0.0,
    revenueGrowth3y: 0.04, betaToMacro: 0.40, divYield: 0.035, peg: 4.0,
    institutionalOwnership: 0.55, tamPenetrationInverse: 0.05,
    fcfToDebt: 0.2, beta: 0.45, cashRatio: 0.4,
    epsRevision3m: 0.01, relStrength6mPctile: 55,
    upsidePotential: 0.10, downsideRisk: 0.08,
    currentRatio: 1.0, profitYears10y: 10, dividendYears10y: 10,
    eps10yGrowth: 0.05, eps5yGrowth: 0.06, pbRatio: 2.0,
  },
  MATERIALS: {
    roe: 0.16, roic: 0.11, nmStdPp: 3.0, gmStdPp: 1.8, fcfRev: 0.10, ownerEarningsYield: 0.05,
    peTtm: 18, pe10yAvg: 17, debtEq: 0.70, buyback5yPct: 0.03,
    revenueGrowth3y: 0.07, betaToMacro: 1.10, divYield: 0.020, peg: 2.0,
    institutionalOwnership: 0.68, tamPenetrationInverse: 0.15,
    fcfToDebt: 0.7, beta: 1.05, cashRatio: 0.7,
    epsRevision3m: 0.01, relStrength6mPctile: 55,
    upsidePotential: 0.18, downsideRisk: 0.18,
    currentRatio: 1.5, profitYears10y: 8, dividendYears10y: 8,
    eps10yGrowth: 0.07, eps5yGrowth: 0.08, pbRatio: 2.8,
  },
  REAL_ESTATE: {
    roe: 0.10, roic: 0.06, nmStdPp: 2.0, gmStdPp: 1.0, fcfRev: 0.30, ownerEarningsYield: 0.045,
    peTtm: 28, pe10yAvg: 30, debtEq: 1.30, buyback5yPct: 0.0,
    revenueGrowth3y: 0.05, betaToMacro: 0.80, divYield: 0.040, peg: 5.0,
    institutionalOwnership: 0.78, tamPenetrationInverse: 0.10,
    fcfToDebt: 0.3, beta: 0.85, cashRatio: 0.4,
    epsRevision3m: 0.0, relStrength6mPctile: 50,
    upsidePotential: 0.12, downsideRisk: 0.12,
    currentRatio: 1.0, profitYears10y: 9, dividendYears10y: 10,
    eps10yGrowth: 0.05, eps5yGrowth: 0.05, pbRatio: 2.2,
  },
};

const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));

/** RegistryEntry → 합성 TickerData
 *  symbol을 시드로 sector 디폴트 ± 50% 변동을 적용해 deterministic한 가짜 재무를 생성. */
export function synthesizeTicker(reg: RegistryEntry): TickerData {
  const sd = SD[reg.sector];
  const sym = reg.ticker;

  // 시총 (대략적 분포: 5B ~ 600B 사이)
  const tier = rand(sym, 'tier'); // 0..1
  const marketCap = Math.round(
    tier > 0.85 ? 200 + tier * 800 :          // top 15%: $200B~$1T
    tier > 0.5  ? 50 + (tier - 0.5) * 500 :   // mid 35%: $50~$225B
                  5 + tier * 90,              // bottom 50%: $5~$50B
  );

  // 가격: $20 ~ $500
  const price = Math.round((20 + rand(sym, 'price') * 480) * 100) / 100;

  // 디폴트 ± 변동값 적용
  const v = (slot: string, base: number, scale = 0.4): number =>
    base + base * scale * noise(sym, slot);

  const roe10yAvg = clamp(v('roe', sd.roe), 0.02, 0.65);
  const roic10yAvg = clamp(v('roic', sd.roic), 0.02, 0.55);
  const nmStdPp = clamp(v('nmsd', sd.nmStdPp, 0.6), 0.3, 12);
  const gmStdPp = clamp(v('gmsd', sd.gmStdPp, 0.6), 0.2, 8);
  const fcfRev = clamp(v('fcfrev', sd.fcfRev, 0.5), 0.0, 0.6);

  const ownerEarningsYield = clamp(v('oey', sd.ownerEarningsYield, 0.4), 0.005, 0.18);
  const ownerEarningsTtm = ownerEarningsYield * marketCap;

  const peTtm = clamp(v('pe', sd.peTtm, 0.35), 6, 90);
  const pe10yAvg = clamp(v('pe10', sd.pe10yAvg, 0.25), 8, 80);
  const debtEq = clamp(v('de', sd.debtEq, 0.5), 0.05, 3.5);
  const buyback5yCum = sd.buyback5yPct * marketCap * (0.5 + rand(sym, 'bb'));

  const revenueGrowth3y = clamp(v('rg3', sd.revenueGrowth3y, 0.7), -0.05, 0.55);
  const betaToMacro = clamp(v('btm', sd.betaToMacro, 0.3), 0.2, 2.5);
  const navPerShare = price * (0.2 + rand(sym, 'nav') * 0.4);

  const distressScore = clamp(rand(sym, 'distress') * 0.4, 0, 1);
  const recentDrawdown = clamp(0.05 + rand(sym, 'dd') * 0.5, 0, 0.7);
  const divYield = clamp(v('dy', sd.divYield, 0.6), 0, 0.08);
  const peg = clamp(v('peg', sd.peg, 0.5), 0.3, 6);
  const institutionalOwnership = clamp(v('inst', sd.institutionalOwnership, 0.15), 0.20, 0.95);
  const insiderBuy6mNet = noise(sym, 'insider') * 0.3;
  const tamPenetrationInverse = clamp(v('tam', sd.tamPenetrationInverse, 0.5), 0.05, 0.85);

  const fcfToDebt = clamp(v('fcfd', sd.fcfToDebt, 0.5), 0.1, 5);
  const beta = clamp(v('b', sd.beta, 0.3), 0.2, 2.5);
  const cashRatio = clamp(v('cash', sd.cashRatio, 0.5), 0.1, 3);

  const epsRevision3m = clamp(sd.epsRevision3m + noise(sym, 'epsr') * 0.06, -0.15, 0.15);
  const relStrength6mPctile = clamp(50 + noise(sym, 'rs') * 35, 5, 95);
  const upsidePotential = clamp(v('up', sd.upsidePotential, 0.5), 0.05, 0.6);
  const downsideRisk = clamp(v('dr', sd.downsideRisk, 0.5), 0.04, 0.5);

  const revenueUsdM = Math.round(marketCap * 1000 / peTtm * (price > 0 ? 1 : 1) * (0.5 + rand(sym, 'rev')));
  const currentRatio = clamp(v('cr', sd.currentRatio, 0.4), 0.6, 4);
  const profitYears10y = Math.round(clamp(sd.profitYears10y + noise(sym, 'py') * 1.5, 4, 10));
  const dividendYears10y = Math.round(clamp(sd.dividendYears10y + noise(sym, 'dvy') * 2, 0, 10));
  const eps10yGrowth = clamp(v('e10', sd.eps10yGrowth, 0.6), -0.05, 0.55);
  const eps5yGrowth = clamp(v('e5', sd.eps5yGrowth, 0.7), -0.05, 0.6);

  // EPS, BVPS 산출 (PE / PB로 역산)
  const eps = peTtm > 0 ? Math.round((price / peTtm) * 100) / 100 : 1;
  const pbRatio = clamp(v('pb', sd.pbRatio, 0.4), 0.5, 25);
  const bvps = pbRatio > 0 ? Math.round((price / pbRatio) * 100) / 100 : 1;

  // NCAV per share — 대부분 음수, 가끔 양수
  const ncavRatio = noise(sym, 'ncav') * 0.5; // [-0.5, 0.5]
  const ncavPerShare = Math.round(price * ncavRatio * 100) / 100;
  const debtToNwc = clamp(0.5 + rand(sym, 'dnwc') * 8, 0.2, 12);

  return {
    ticker: reg.ticker,
    name: reg.name,
    nameKo: reg.nameKo,
    sector: reg.sector,
    price, marketCap,
    roe10yAvg, roic10yAvg, nmStdPp, gmStdPp, fcfRev,
    ownerEarningsTtm, tbond10y: 0.044,
    peTtm, pe10yAvg, debtEq, buyback5yCum,
    revenueGrowth3y, betaToMacro, navPerShare,
    distressScore, recentDrawdown, divYield, peg,
    institutionalOwnership, insiderBuy6mNet, tamPenetrationInverse,
    fcfToDebt, beta, cashRatio,
    epsRevision3m, relStrength6mPctile, upsidePotential, downsideRisk,
    revenueUsdM, currentRatio, profitYears10y, dividendYears10y,
    eps10yGrowth, eps5yGrowth, eps, bvps, ncavPerShare, debtToNwc,
    insiderHolds: 0,
    isSynthesized: true,
  };
}

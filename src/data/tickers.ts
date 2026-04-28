import type { TickerData } from '../types';

/** 초기 버전 시드 데이터. 실제 수치는 2026-04-27 기준 근사값으로,
 *  데모/프로토타이핑 목적이며 실제 투자 의사결정에 사용해서는 안 된다.
 *  추후 yfinance/FMP/SEC EDGAR 백엔드 연동으로 대체 예정. */
export const TICKERS: Record<string, TickerData> = {
  AAPL: {
    ticker: 'AAPL', name: 'Apple Inc.', nameKo: '애플',
    sector: 'TECH', price: 187.32, marketCap: 2870,
    roe10yAvg: 0.471, roic10yAvg: 0.41, nmStdPp: 1.4, gmStdPp: 1.1,
    fcfRev: 0.27, ownerEarningsTtm: 105, tbond10y: 0.044,
    peTtm: 28.4, pe10yAvg: 22.1, debtEq: 1.45, buyback5yCum: 350,
    revenueGrowth3y: 0.06, betaToMacro: 1.05, navPerShare: 4.2,
    distressScore: 0.05, recentDrawdown: 0.18, divYield: 0.005, peg: 2.4,
    institutionalOwnership: 0.62, insiderBuy6mNet: -0.2,
    tamPenetrationInverse: 0.3,
    fcfToDebt: 0.85, beta: 1.2, cashRatio: 0.9,
    epsRevision3m: -0.02, relStrength6mPctile: 42,
    upsidePotential: 0.18, downsideRisk: 0.20,
    revenueUsdM: 384000, currentRatio: 1.05, profitYears10y: 10,
    dividendYears10y: 10, eps10yGrowth: 0.16, eps5yGrowth: 0.13,
    eps: 6.59, bvps: 4.20, ncavPerShare: -1.2, debtToNwc: 8.0,
    insiderHolds: 0.07,
  },
  NVDA: {
    ticker: 'NVDA', name: 'NVIDIA Corp.', nameKo: '엔비디아',
    sector: 'TECH', price: 905.0, marketCap: 2230,
    roe10yAvg: 0.42, roic10yAvg: 0.38, nmStdPp: 6.8, gmStdPp: 4.2,
    fcfRev: 0.42, ownerEarningsTtm: 60, tbond10y: 0.044,
    peTtm: 38.0, pe10yAvg: 41.0, debtEq: 0.45, buyback5yCum: 25,
    revenueGrowth3y: 0.61, betaToMacro: 1.6, navPerShare: 28.0,
    distressScore: 0.02, recentDrawdown: 0.15, divYield: 0.0004, peg: 0.6,
    institutionalOwnership: 0.66, insiderBuy6mNet: -0.8,
    tamPenetrationInverse: 0.65,
    fcfToDebt: 1.8, beta: 1.7, cashRatio: 1.4,
    epsRevision3m: 0.09, relStrength6mPctile: 88,
    upsidePotential: 0.45, downsideRisk: 0.30,
    revenueUsdM: 60000, currentRatio: 4.2, profitYears10y: 10,
    dividendYears10y: 8, eps10yGrowth: 0.55, eps5yGrowth: 0.74,
    eps: 23.5, bvps: 28.0, ncavPerShare: 5.4, debtToNwc: 0.3,
    insiderHolds: 0.04,
  },
  MSFT: {
    ticker: 'MSFT', name: 'Microsoft Corp.', nameKo: '마이크로소프트',
    sector: 'TECH', price: 415.5, marketCap: 3090,
    roe10yAvg: 0.36, roic10yAvg: 0.31, nmStdPp: 2.1, gmStdPp: 1.5,
    fcfRev: 0.31, ownerEarningsTtm: 80, tbond10y: 0.044,
    peTtm: 34.0, pe10yAvg: 28.0, debtEq: 0.35, buyback5yCum: 110,
    revenueGrowth3y: 0.13, betaToMacro: 0.95, navPerShare: 36.0,
    distressScore: 0.02, recentDrawdown: 0.12, divYield: 0.0072, peg: 2.1,
    institutionalOwnership: 0.71, insiderBuy6mNet: -0.3,
    tamPenetrationInverse: 0.4,
    fcfToDebt: 1.6, beta: 0.95, cashRatio: 1.1,
    epsRevision3m: 0.04, relStrength6mPctile: 72,
    upsidePotential: 0.22, downsideRisk: 0.18,
    revenueUsdM: 245000, currentRatio: 1.7, profitYears10y: 10,
    dividendYears10y: 10, eps10yGrowth: 0.18, eps5yGrowth: 0.20,
    eps: 12.2, bvps: 36.0, ncavPerShare: 1.0, debtToNwc: 1.2,
    insiderHolds: 0.01,
  },
  GOOGL: {
    ticker: 'GOOGL', name: 'Alphabet Inc.', nameKo: '알파벳',
    sector: 'COMMUNICATION', price: 167.0, marketCap: 2080,
    roe10yAvg: 0.21, roic10yAvg: 0.20, nmStdPp: 1.8, gmStdPp: 1.0,
    fcfRev: 0.22, ownerEarningsTtm: 73, tbond10y: 0.044,
    peTtm: 25.0, pe10yAvg: 28.0, debtEq: 0.10, buyback5yCum: 220,
    revenueGrowth3y: 0.14, betaToMacro: 1.10, navPerShare: 23.0,
    distressScore: 0.01, recentDrawdown: 0.10, divYield: 0.0048, peg: 1.5,
    institutionalOwnership: 0.78, insiderBuy6mNet: -0.1,
    tamPenetrationInverse: 0.45,
    fcfToDebt: 4.0, beta: 1.05, cashRatio: 1.8,
    epsRevision3m: 0.05, relStrength6mPctile: 75,
    upsidePotential: 0.25, downsideRisk: 0.18,
    revenueUsdM: 320000, currentRatio: 2.1, profitYears10y: 10,
    dividendYears10y: 1, eps10yGrowth: 0.20, eps5yGrowth: 0.23,
    eps: 6.7, bvps: 23.0, ncavPerShare: 8.0, debtToNwc: 0.2,
    insiderHolds: 0.07,
  },
  AMZN: {
    ticker: 'AMZN', name: 'Amazon.com', nameKo: '아마존',
    sector: 'CONSUMER_DISCRETIONARY', price: 182.0, marketCap: 1900,
    roe10yAvg: 0.18, roic10yAvg: 0.10, nmStdPp: 3.5, gmStdPp: 2.1,
    fcfRev: 0.07, ownerEarningsTtm: 32, tbond10y: 0.044,
    peTtm: 50.0, pe10yAvg: 80.0, debtEq: 0.55, buyback5yCum: 6,
    revenueGrowth3y: 0.11, betaToMacro: 1.30, navPerShare: 18.0,
    distressScore: 0.04, recentDrawdown: 0.20, divYield: 0.0, peg: 1.4,
    institutionalOwnership: 0.62, insiderBuy6mNet: -0.4,
    tamPenetrationInverse: 0.5,
    fcfToDebt: 0.6, beta: 1.25, cashRatio: 0.7,
    epsRevision3m: 0.06, relStrength6mPctile: 66,
    upsidePotential: 0.30, downsideRisk: 0.22,
    revenueUsdM: 575000, currentRatio: 1.05, profitYears10y: 8,
    dividendYears10y: 0, eps10yGrowth: 0.30, eps5yGrowth: 0.40,
    eps: 3.6, bvps: 18.0, ncavPerShare: -3.2, debtToNwc: 5.0,
    insiderHolds: 0.10,
  },
  META: {
    ticker: 'META', name: 'Meta Platforms', nameKo: '메타',
    sector: 'COMMUNICATION', price: 488.0, marketCap: 1240,
    roe10yAvg: 0.27, roic10yAvg: 0.24, nmStdPp: 4.5, gmStdPp: 1.6,
    fcfRev: 0.30, ownerEarningsTtm: 49, tbond10y: 0.044,
    peTtm: 26.0, pe10yAvg: 25.0, debtEq: 0.15, buyback5yCum: 90,
    revenueGrowth3y: 0.16, betaToMacro: 1.30, navPerShare: 60.0,
    distressScore: 0.02, recentDrawdown: 0.22, divYield: 0.004, peg: 1.0,
    institutionalOwnership: 0.78, insiderBuy6mNet: -0.5,
    tamPenetrationInverse: 0.35,
    fcfToDebt: 3.0, beta: 1.30, cashRatio: 1.3,
    epsRevision3m: 0.07, relStrength6mPctile: 78,
    upsidePotential: 0.28, downsideRisk: 0.22,
    revenueUsdM: 145000, currentRatio: 2.7, profitYears10y: 10,
    dividendYears10y: 1, eps10yGrowth: 0.25, eps5yGrowth: 0.28,
    eps: 18.8, bvps: 60.0, ncavPerShare: 12.0, debtToNwc: 0.3,
    insiderHolds: 0.13,
  },
  TSLA: {
    ticker: 'TSLA', name: 'Tesla Inc.', nameKo: '테슬라',
    sector: 'CONSUMER_DISCRETIONARY', price: 175.0, marketCap: 555,
    roe10yAvg: 0.06, roic10yAvg: 0.10, nmStdPp: 8.5, gmStdPp: 3.8,
    fcfRev: 0.05, ownerEarningsTtm: 4.5, tbond10y: 0.044,
    peTtm: 65.0, pe10yAvg: 120.0, debtEq: 0.10, buyback5yCum: 0,
    revenueGrowth3y: 0.36, betaToMacro: 2.10, navPerShare: 22.0,
    distressScore: 0.10, recentDrawdown: 0.45, divYield: 0.0, peg: 3.5,
    institutionalOwnership: 0.45, insiderBuy6mNet: -0.6,
    tamPenetrationInverse: 0.7,
    fcfToDebt: 1.4, beta: 2.0, cashRatio: 1.0,
    epsRevision3m: -0.08, relStrength6mPctile: 22,
    upsidePotential: 0.50, downsideRisk: 0.45,
    revenueUsdM: 96000, currentRatio: 1.7, profitYears10y: 4,
    dividendYears10y: 0, eps10yGrowth: 0.05, eps5yGrowth: 0.20,
    eps: 2.7, bvps: 22.0, ncavPerShare: 4.0, debtToNwc: 0.2,
    insiderHolds: 0.13,
  },
  'BRK.B': {
    ticker: 'BRK.B', name: 'Berkshire Hathaway', nameKo: '버크셔 해서웨이',
    sector: 'FINANCIAL', price: 410.0, marketCap: 880,
    roe10yAvg: 0.09, roic10yAvg: 0.08, nmStdPp: 2.0, gmStdPp: 1.0,
    fcfRev: 0.15, ownerEarningsTtm: 38, tbond10y: 0.044,
    peTtm: 23.0, pe10yAvg: 19.0, debtEq: 0.25, buyback5yCum: 70,
    revenueGrowth3y: 0.07, betaToMacro: 0.85, navPerShare: 240.0,
    distressScore: 0.01, recentDrawdown: 0.06, divYield: 0.0, peg: 3.0,
    institutionalOwnership: 0.55, insiderBuy6mNet: 0.2,
    tamPenetrationInverse: 0.2,
    fcfToDebt: 0.9, beta: 0.85, cashRatio: 1.5,
    epsRevision3m: 0.01, relStrength6mPctile: 60,
    upsidePotential: 0.12, downsideRisk: 0.10,
    revenueUsdM: 365000, currentRatio: 1.3, profitYears10y: 10,
    dividendYears10y: 0, eps10yGrowth: 0.07, eps5yGrowth: 0.10,
    eps: 17.8, bvps: 240.0, ncavPerShare: 60.0, debtToNwc: 0.6,
    insiderHolds: 0.16,
  },
  KO: {
    ticker: 'KO', name: 'Coca-Cola Co.', nameKo: '코카콜라',
    sector: 'CONSUMER_STAPLES', price: 62.0, marketCap: 268,
    roe10yAvg: 0.412, roic10yAvg: 0.18, nmStdPp: 1.5, gmStdPp: 1.0,
    fcfRev: 0.24, ownerEarningsTtm: 11, tbond10y: 0.044,
    peTtm: 25.0, pe10yAvg: 22.0, debtEq: 1.6, buyback5yCum: 8,
    revenueGrowth3y: 0.07, betaToMacro: 0.55, navPerShare: 5.5,
    distressScore: 0.05, recentDrawdown: 0.08, divYield: 0.030, peg: 3.5,
    institutionalOwnership: 0.70, insiderBuy6mNet: -0.1,
    tamPenetrationInverse: 0.1,
    fcfToDebt: 0.4, beta: 0.55, cashRatio: 0.7,
    epsRevision3m: 0.02, relStrength6mPctile: 55,
    upsidePotential: 0.10, downsideRisk: 0.08,
    revenueUsdM: 46000, currentRatio: 1.1, profitYears10y: 10,
    dividendYears10y: 10, eps10yGrowth: 0.06, eps5yGrowth: 0.07,
    eps: 2.5, bvps: 5.5, ncavPerShare: -2.0, debtToNwc: 7.5,
    insiderHolds: 0.0,
  },
  JPM: {
    ticker: 'JPM', name: 'JPMorgan Chase', nameKo: 'JP모건 체이스',
    sector: 'FINANCIAL', price: 198.0, marketCap: 570,
    roe10yAvg: 0.15, roic10yAvg: 0.10, nmStdPp: 2.2, gmStdPp: 1.5,
    fcfRev: 0.19, ownerEarningsTtm: 50, tbond10y: 0.044,
    peTtm: 12.0, pe10yAvg: 12.0, debtEq: 1.30, buyback5yCum: 60,
    revenueGrowth3y: 0.08, betaToMacro: 1.15, navPerShare: 110.0,
    distressScore: 0.04, recentDrawdown: 0.10, divYield: 0.024, peg: 1.6,
    institutionalOwnership: 0.74, insiderBuy6mNet: 0.0,
    tamPenetrationInverse: 0.15,
    fcfToDebt: 0.4, beta: 1.05, cashRatio: 0.9,
    epsRevision3m: 0.02, relStrength6mPctile: 64,
    upsidePotential: 0.15, downsideRisk: 0.18,
    revenueUsdM: 162000, currentRatio: 1.2, profitYears10y: 10,
    dividendYears10y: 10, eps10yGrowth: 0.10, eps5yGrowth: 0.13,
    eps: 16.5, bvps: 110.0, ncavPerShare: 12.0, debtToNwc: 1.0,
    insiderHolds: 0.0,
  },
  V: {
    ticker: 'V', name: 'Visa Inc.', nameKo: '비자',
    sector: 'FINANCIAL', price: 275.0, marketCap: 555,
    roe10yAvg: 0.36, roic10yAvg: 0.30, nmStdPp: 1.0, gmStdPp: 0.5,
    fcfRev: 0.55, ownerEarningsTtm: 19, tbond10y: 0.044,
    peTtm: 30.0, pe10yAvg: 30.0, debtEq: 0.55, buyback5yCum: 55,
    revenueGrowth3y: 0.10, betaToMacro: 0.95, navPerShare: 18.0,
    distressScore: 0.01, recentDrawdown: 0.06, divYield: 0.008, peg: 2.0,
    institutionalOwnership: 0.82, insiderBuy6mNet: -0.1,
    tamPenetrationInverse: 0.25,
    fcfToDebt: 1.2, beta: 0.92, cashRatio: 1.2,
    epsRevision3m: 0.03, relStrength6mPctile: 70,
    upsidePotential: 0.18, downsideRisk: 0.10,
    revenueUsdM: 35000, currentRatio: 1.4, profitYears10y: 10,
    dividendYears10y: 10, eps10yGrowth: 0.16, eps5yGrowth: 0.17,
    eps: 9.2, bvps: 18.0, ncavPerShare: 0.0, debtToNwc: 2.5,
    insiderHolds: 0.0,
  },
  JNJ: {
    ticker: 'JNJ', name: 'Johnson & Johnson', nameKo: '존슨앤드존슨',
    sector: 'HEALTHCARE', price: 155.0, marketCap: 372,
    roe10yAvg: 0.22, roic10yAvg: 0.18, nmStdPp: 1.8, gmStdPp: 0.8,
    fcfRev: 0.21, ownerEarningsTtm: 21, tbond10y: 0.044,
    peTtm: 16.5, pe10yAvg: 17.0, debtEq: 0.45, buyback5yCum: 20,
    revenueGrowth3y: 0.04, betaToMacro: 0.45, navPerShare: 27.0,
    distressScore: 0.03, recentDrawdown: 0.10, divYield: 0.032, peg: 3.5,
    institutionalOwnership: 0.70, insiderBuy6mNet: 0.0,
    tamPenetrationInverse: 0.2,
    fcfToDebt: 0.7, beta: 0.50, cashRatio: 0.9,
    epsRevision3m: 0.01, relStrength6mPctile: 45,
    upsidePotential: 0.10, downsideRisk: 0.08,
    revenueUsdM: 88000, currentRatio: 1.2, profitYears10y: 10,
    dividendYears10y: 10, eps10yGrowth: 0.05, eps5yGrowth: 0.06,
    eps: 9.4, bvps: 27.0, ncavPerShare: -2.0, debtToNwc: 3.0,
    insiderHolds: 0.0,
  },
  WMT: {
    ticker: 'WMT', name: 'Walmart Inc.', nameKo: '월마트',
    sector: 'CONSUMER_STAPLES', price: 60.0, marketCap: 480,
    roe10yAvg: 0.20, roic10yAvg: 0.13, nmStdPp: 0.6, gmStdPp: 0.5,
    fcfRev: 0.03, ownerEarningsTtm: 13, tbond10y: 0.044,
    peTtm: 28.0, pe10yAvg: 24.0, debtEq: 0.65, buyback5yCum: 25,
    revenueGrowth3y: 0.05, betaToMacro: 0.50, navPerShare: 9.0,
    distressScore: 0.04, recentDrawdown: 0.05, divYield: 0.014, peg: 4.0,
    institutionalOwnership: 0.32, insiderBuy6mNet: -0.1,
    tamPenetrationInverse: 0.05,
    fcfToDebt: 0.3, beta: 0.50, cashRatio: 0.3,
    epsRevision3m: 0.02, relStrength6mPctile: 78,
    upsidePotential: 0.10, downsideRisk: 0.08,
    revenueUsdM: 645000, currentRatio: 0.8, profitYears10y: 10,
    dividendYears10y: 10, eps10yGrowth: 0.03, eps5yGrowth: 0.07,
    eps: 2.15, bvps: 9.0, ncavPerShare: -8.0, debtToNwc: 12.0,
    insiderHolds: 0.45,
  },
  XOM: {
    ticker: 'XOM', name: 'Exxon Mobil', nameKo: '엑손모빌',
    sector: 'ENERGY', price: 117.0, marketCap: 470,
    roe10yAvg: 0.13, roic10yAvg: 0.10, nmStdPp: 5.5, gmStdPp: 3.2,
    fcfRev: 0.12, ownerEarningsTtm: 38, tbond10y: 0.044,
    peTtm: 13.0, pe10yAvg: 16.0, debtEq: 0.20, buyback5yCum: 25,
    revenueGrowth3y: 0.10, betaToMacro: 1.15, navPerShare: 60.0,
    distressScore: 0.05, recentDrawdown: 0.12, divYield: 0.033, peg: 1.4,
    institutionalOwnership: 0.61, insiderBuy6mNet: 0.05,
    tamPenetrationInverse: 0.1,
    fcfToDebt: 1.2, beta: 1.10, cashRatio: 0.9,
    epsRevision3m: -0.03, relStrength6mPctile: 50,
    upsidePotential: 0.15, downsideRisk: 0.18,
    revenueUsdM: 345000, currentRatio: 1.4, profitYears10y: 8,
    dividendYears10y: 10, eps10yGrowth: 0.04, eps5yGrowth: 0.20,
    eps: 9.0, bvps: 60.0, ncavPerShare: 5.0, debtToNwc: 0.8,
    insiderHolds: 0.0,
  },
  NKE: {
    ticker: 'NKE', name: 'Nike Inc.', nameKo: '나이키',
    sector: 'CONSUMER_DISCRETIONARY', price: 88.0, marketCap: 132,
    roe10yAvg: 0.34, roic10yAvg: 0.20, nmStdPp: 2.5, gmStdPp: 1.4,
    fcfRev: 0.10, ownerEarningsTtm: 4.5, tbond10y: 0.044,
    peTtm: 22.0, pe10yAvg: 28.0, debtEq: 0.85, buyback5yCum: 18,
    revenueGrowth3y: 0.04, betaToMacro: 1.20, navPerShare: 9.5,
    distressScore: 0.06, recentDrawdown: 0.42, divYield: 0.018, peg: 4.0,
    institutionalOwnership: 0.65, insiderBuy6mNet: 0.05,
    tamPenetrationInverse: 0.3,
    fcfToDebt: 0.7, beta: 1.15, cashRatio: 0.7,
    epsRevision3m: -0.06, relStrength6mPctile: 18,
    upsidePotential: 0.30, downsideRisk: 0.20,
    revenueUsdM: 51000, currentRatio: 2.4, profitYears10y: 10,
    dividendYears10y: 10, eps10yGrowth: 0.07, eps5yGrowth: 0.05,
    eps: 4.0, bvps: 9.5, ncavPerShare: 2.0, debtToNwc: 0.6,
    insiderHolds: 0.18,
  },
};

/* ── 시드 + 레지스트리 통합 조회 ────────────────────────────────────
 * - SEED_TICKERS: 위에서 정의된 15종목 (실수치 근사) — 큐레이션 우선
 * - REGISTRY: S&P 500 + Nasdaq 100 ~530종목 (식별 정보만)
 * - getTickerData(symbol): SEED 우선, 없으면 synthesizeTicker로 합성하여 반환
 * - searchTickers(q): SEED + REGISTRY 통합 검색 (티커/영문명/한글명 부분일치)
 */
import type { LiveField, LiveQuote } from '../types';
import { REGISTRY, REGISTRY_MAP, type RegistryEntry } from './registry';
import { synthesizeTicker } from './synth';

const SEED_TICKERS = TICKERS;

/** 큐레이션된 시드(15) + 레지스트리(530+)를 합쳐 ticker → TickerData를 돌려준다.
 *  레지스트리에만 있는 종목은 합성으로 즉석 생성. 시드 우선. */
export const getTickerData = (symbol: string): TickerData | null => {
  const upper = symbol.trim().toUpperCase();
  if (SEED_TICKERS[upper]) return SEED_TICKERS[upper];
  const reg = REGISTRY_MAP[upper];
  if (reg) return synthesizeTicker(reg);
  return null;
};

/** ticker가 알려진 종목인지 (시드든 레지스트리든) */
export const hasTicker = (symbol: string): boolean => getTickerData(symbol) !== null;

/**
 * 라이브 시세를 베이스 TickerData에 덮어써 새 객체로 반환.
 * - 어떤 필드가 라이브로 갱신됐는지 liveFields 배열에 기록
 * - PE 갱신 시 EPS도 자동 재계산 (Graham number 같은 의존 지표가 정확해지도록)
 * - 시총 갱신 시 Owner Earnings Yield도 재계산
 */
export const applyLiveQuote = (base: TickerData, q: LiveQuote): TickerData => {
  const out: TickerData = { ...base };
  const live: LiveField[] = [];

  if (q.price != null && q.price > 0) {
    out.price = Math.round(q.price * 100) / 100;
    live.push('price');
  }
  if (q.marketCapB != null && q.marketCapB > 0) {
    out.marketCap = q.marketCapB;
    live.push('marketCap');
    // Owner earnings yield는 marketCap 변화에 비례 — TTM은 그대로 두고
    // diagnose 측에서 ratio가 자동 재계산됨
  }
  if (q.peTtm != null && q.peTtm > 0) {
    out.peTtm = Math.round(q.peTtm * 100) / 100;
    live.push('peTtm');
    // EPS 재계산 (Graham Number 정확도 향상)
    if (out.price > 0) {
      out.eps = Math.round((out.price / out.peTtm) * 100) / 100;
    }
  }
  if (q.pbRatio != null && q.pbRatio > 0) {
    out.bvps = out.price > 0 ? Math.round((out.price / q.pbRatio) * 100) / 100 : out.bvps;
    live.push('pbRatio');
  }
  if (q.divYield != null && q.divYield >= 0) {
    out.divYield = q.divYield;
    live.push('divYield');
  }
  if (q.beta != null && q.beta > 0) {
    out.beta = q.beta;
    out.betaToMacro = q.beta;  // 우리 모델은 동일 컨셉
    live.push('beta');
  }
  if (q.fiftyTwoWeekHigh != null && q.fiftyTwoWeekHigh > 0 && q.fiftyTwoWeekLow != null) {
    // 최근 drawdown = (52주 고점 - 현재가) / 52주 고점
    if (out.price > 0) {
      out.recentDrawdown = Math.max(0, (q.fiftyTwoWeekHigh - out.price) / q.fiftyTwoWeekHigh);
    }
    live.push('fiftyTwoWeekRange');
  }

  out.liveFields = live;
  out.liveQuote = q;
  return out;
};

export const allKnownTickers = (): string[] =>
  Array.from(new Set([...Object.keys(SEED_TICKERS), ...REGISTRY.map((r) => r.ticker)]));

export const ALL_TICKERS = allKnownTickers();

export const findTicker = (q: string): TickerData | null => {
  const trimmed = q.trim();
  const upper = trimmed.toUpperCase();
  // 1) 정확한 ticker 매치
  const exact = getTickerData(upper);
  if (exact) return exact;
  // 2) 시드 안에서 영문명/한글명 정확 매치
  const seedByName = Object.values(SEED_TICKERS).find(
    (t) => t.name.toLowerCase() === q.toLowerCase().trim() || t.nameKo === trimmed,
  );
  if (seedByName) return seedByName;
  // 3) 레지스트리 안에서 영문명/한글명 정확 매치
  const regByName = REGISTRY.find(
    (r) => r.name.toLowerCase() === q.toLowerCase().trim() || r.nameKo === trimmed,
  );
  if (regByName) return synthesizeTicker(regByName);
  return null;
};

interface SearchResult {
  ticker: string;
  name: string;
  nameKo: string;
  sector: string;
  isSeed: boolean;
}

/** UI용 가벼운 검색 결과 — TickerData 합성을 지연시켜 검색 응답 속도 보장.
 *  실제 진단 시점에 getTickerData()로 변환된다. */
export const searchTickers = (q: string, limit = 8): SearchResult[] => {
  const ql = q.toLowerCase().trim();
  const qKo = q.trim();
  if (!ql) return [];

  // 시드 우선 + 레지스트리 보조 — ticker prefix > 부분 일치 순
  const matches: Array<{ score: number; r: SearchResult }> = [];

  const score = (entry: { ticker: string; name: string; nameKo: string }, isSeed: boolean): number => {
    const tk = entry.ticker.toLowerCase();
    const nm = entry.name.toLowerCase();
    let s = 0;
    if (tk === ql) s = 1000;
    else if (tk.startsWith(ql)) s = 800 - (tk.length - ql.length);
    else if (tk.includes(ql)) s = 500 - tk.indexOf(ql);
    else if (nm.startsWith(ql)) s = 600 - (nm.length - ql.length) * 0.1;
    else if (nm.includes(ql)) s = 300 - nm.indexOf(ql) * 0.1;
    else if (entry.nameKo && entry.nameKo.includes(qKo)) s = 400 - entry.nameKo.indexOf(qKo) * 0.1;
    else return -1;
    if (isSeed) s += 50; // 시드는 가벼운 가산점
    return s;
  };

  for (const t of Object.values(SEED_TICKERS)) {
    const s = score(t, true);
    if (s > 0) matches.push({ score: s, r: { ticker: t.ticker, name: t.name, nameKo: t.nameKo, sector: t.sector, isSeed: true } });
  }
  for (const r of REGISTRY) {
    if (SEED_TICKERS[r.ticker]) continue; // 시드와 중복 제거
    const s = score(r, false);
    if (s > 0) matches.push({ score: s, r: { ticker: r.ticker, name: r.name, nameKo: r.nameKo, sector: r.sector, isSeed: false } });
  }

  return matches
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((m) => m.r);
};

/** 카운트 — UI 표시용 */
export const REGISTRY_SIZE = REGISTRY.length;
export const SEED_SIZE = Object.keys(SEED_TICKERS).length;

export type { RegistryEntry };

export type Verdict = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';

export type PersonaId =
  | 'BUFFETT'
  | 'LYNCH'
  | 'DALIO'
  | 'DRUCKENMILLER'
  | 'GRAHAM';

export type LynchCategory =
  | 'FAST_GROWER'
  | 'STALWART'
  | 'SLOW_GROWER'
  | 'CYCLICAL'
  | 'TURNAROUND'
  | 'ASSET_PLAY';

export type Sector =
  | 'TECH'
  | 'CONSUMER_STAPLES'
  | 'CONSUMER_DISCRETIONARY'
  | 'FINANCIAL'
  | 'HEALTHCARE'
  | 'INDUSTRIAL'
  | 'ENERGY'
  | 'COMMUNICATION'
  | 'UTILITIES'
  | 'MATERIALS'
  | 'REAL_ESTATE';

export interface TickerData {
  ticker: string;
  name: string;
  nameKo: string;
  sector: Sector;
  price: number;
  marketCap: number;          // 십억 USD
  // Buffett 입력
  roe10yAvg: number;          // 0~1
  roic10yAvg: number;
  nmStdPp: number;            // percentage point std dev
  gmStdPp: number;
  fcfRev: number;
  ownerEarningsTtm: number;   // 십억 USD
  tbond10y: number;           // 0~1
  peTtm: number;
  pe10yAvg: number;
  debtEq: number;
  buyback5yCum: number;       // 십억 USD (음수면 발행)
  // Lynch 입력
  revenueGrowth3y: number;    // 0~1 (CAGR)
  betaToMacro: number;
  navPerShare: number;
  distressScore: number;      // 0~1
  recentDrawdown: number;     // 0~1
  divYield: number;           // 0~1
  peg: number;
  institutionalOwnership: number; // 0~1
  insiderBuy6mNet: number;        // 양수면 순매수
  tamPenetrationInverse: number;  // 0~1 (1 = 침투율 낮음 = runway 큼)
  // Dalio 입력
  fcfToDebt: number;
  beta: number;
  cashRatio: number;
  // Druckenmiller 입력
  epsRevision3m: number;        // 0.05 = +5%
  relStrength6mPctile: number;  // 0~100
  upsidePotential: number;
  downsideRisk: number;
  // Graham 입력 (defensive/enterprising 트랙)
  revenueUsdM: number;
  currentRatio: number;
  profitYears10y: number;        // 최근 10년 흑자 횟수
  dividendYears10y: number;
  eps10yGrowth: number;          // 0~1
  eps5yGrowth: number;
  eps: number;                   // TTM EPS
  bvps: number;
  ncavPerShare: number;
  debtToNwc: number;
  insiderHolds: number;          // %
  // 공시
  isMissingPct?: number;         // 0~1
  isSynthesized?: boolean;       // true = 시드 데이터(근사값), false/undefined = 큐레이션된 실수치
}

export interface MacroState {
  growthDirection: 'RISING' | 'FALLING';
  inflationDirection: 'RISING' | 'FALLING';
  m2YoYAccel: 'UP' | 'DOWN' | 'FLAT';
  fedBalanceDirection: 'EXPANDING' | 'CONTRACTING';
  ismNewOrders: number;
  realRate: number;
  asOf: string;
  summaryKo: string;
}

export interface AxisResult {
  name: string;
  value: number;       // 0~100
  threshold: number;   // 표시용 기준값
  passed: boolean;
  unit?: string;
  display?: string;    // 사용자 친화적 표시 (e.g. "47.1%")
  rationaleKo?: string;
}

export interface Quote {
  text: string;
  sourceId: string;
  pageOrYear: string;
}

export interface DataRef {
  metric: string;
  value: number;
  display: string;
  computedBy: string;
}

export interface PersonaVerdict {
  persona: PersonaId;
  verdict: Verdict;
  score: number;                 // 0~100
  headline: string;
  body: string;
  axes: AxisResult[];
  dataRefs: DataRef[];
  quote: Quote;
  meta?: Record<string, string | number | boolean>; // e.g. lynchCategory, grahamTrack
}

export interface Diagnosis {
  ticker: string;
  name: string;
  nameKo: string;
  sector: Sector;
  price: number;
  asOf: string;
  dataQuality: { missingPct: number; warnings: string[] };
  panels: PersonaVerdict[];
  consensus: { positive: number; neutral: number; negative: number };
  macro: MacroState;
  isSynthesized: boolean;
}

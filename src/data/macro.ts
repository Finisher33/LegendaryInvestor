import type { MacroState } from '../types';

// 초기 버전: 거시지표는 정적 스냅샷. 추후 FRED API 연동.
export const CURRENT_MACRO: MacroState = {
  growthDirection: 'FALLING',
  inflationDirection: 'FALLING',
  m2YoYAccel: 'UP',
  fedBalanceDirection: 'CONTRACTING',
  ismNewOrders: 49.2,
  realRate: 0.022,
  asOf: '2026-04-27',
  summaryKo:
    '성장세는 둔화 국면, 인플레이션은 하향 안정화, 실질금리 +2.2%. ISM 신규주문은 50 이하로 위축 신호. 통화량(M2)은 12개월 모멘텀이 가속.',
};

/** Sector × Regime 적합도 매트릭스 (Dalio 4계절).
 * +1 매우 우호, 0 중립, -1 매우 비우호.
 * Regime 키: G상승/I상승, G상승/I하락, G하락/I상승, G하락/I하락
 */
export const SECTOR_REGIME_FIT: Record<
  string,
  Record<'GR_IR' | 'GR_IF' | 'GF_IR' | 'GF_IF', number>
> = {
  TECH:                   { GR_IR:  0.2, GR_IF:  0.9, GF_IR: -0.4, GF_IF:  0.5 },
  CONSUMER_STAPLES:       { GR_IR:  0.1, GR_IF: -0.1, GF_IR:  0.3, GF_IF:  0.6 },
  CONSUMER_DISCRETIONARY: { GR_IR:  0.6, GR_IF:  0.7, GF_IR: -0.6, GF_IF: -0.2 },
  FINANCIAL:              { GR_IR:  0.8, GR_IF:  0.4, GF_IR: -0.3, GF_IF: -0.6 },
  HEALTHCARE:             { GR_IR:  0.0, GR_IF:  0.4, GF_IR:  0.2, GF_IF:  0.5 },
  INDUSTRIAL:             { GR_IR:  0.7, GR_IF:  0.6, GF_IR: -0.7, GF_IF: -0.3 },
  ENERGY:                 { GR_IR:  0.9, GR_IF:  0.2, GF_IR:  0.6, GF_IF: -0.5 },
  COMMUNICATION:          { GR_IR:  0.1, GR_IF:  0.6, GF_IR: -0.3, GF_IF:  0.3 },
  UTILITIES:              { GR_IR: -0.2, GR_IF: -0.3, GF_IR:  0.5, GF_IF:  0.8 },
  MATERIALS:              { GR_IR:  0.8, GR_IF:  0.3, GF_IR: -0.4, GF_IF: -0.5 },
};

export const macroRegimeKey = (m: MacroState): 'GR_IR' | 'GR_IF' | 'GF_IR' | 'GF_IF' =>
  `${m.growthDirection === 'RISING' ? 'GR' : 'GF'}_${m.inflationDirection === 'RISING' ? 'IR' : 'IF'}` as const;

export const macroRegimeLabel = (m: MacroState): string => {
  const g = m.growthDirection === 'RISING' ? '성장↑' : '성장↓';
  const i = m.inflationDirection === 'RISING' ? '인플레↑' : '인플레↓';
  return `${g} · ${i}`;
};

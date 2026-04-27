export const fmtPct = (x: number, digits = 1): string =>
  `${(x * 100).toFixed(digits)}%`;

export const fmtNum = (x: number, digits = 2): string =>
  x.toLocaleString('en-US', { maximumFractionDigits: digits, minimumFractionDigits: 0 });

export const fmtUsd = (x: number, digits = 2): string =>
  `$${fmtNum(x, digits)}`;

export const fmtUsdBn = (x: number): string => {
  if (Math.abs(x) >= 1000) return `$${(x / 1000).toFixed(2)}T`;
  if (Math.abs(x) >= 1) return `$${x.toFixed(1)}B`;
  return `$${(x * 1000).toFixed(0)}M`;
};

export const fmtRatio = (x: number, digits = 2): string => x.toFixed(digits);

export const verdictFromScore = (score: number): 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' => {
  if (score >= 80) return 'POSITIVE';
  if (score >= 60) return 'NEUTRAL';
  return 'NEGATIVE';
};

export const verdictKo = (v: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'): string =>
  v === 'POSITIVE' ? '긍정' : v === 'NEUTRAL' ? '중립' : '부정';

export const verdictColor = (v: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'): string =>
  v === 'POSITIVE' ? 'text-emerald-400' : v === 'NEUTRAL' ? 'text-amber-400' : 'text-rose-400';

export const verdictBg = (v: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'): string =>
  v === 'POSITIVE' ? 'bg-emerald-500/15 border-emerald-500/30' :
  v === 'NEUTRAL'  ? 'bg-amber-500/15 border-amber-500/30' :
                     'bg-rose-500/15 border-rose-500/30';

export const clip = (x: number, lo: number, hi: number): number =>
  Math.max(lo, Math.min(hi, x));

/** lo→hi 구간을 0→100으로 선형 매핑. lo 이하는 0, hi 이상은 100. */
export const scale = (x: number, lo: number, hi: number): number => {
  if (hi === lo) return 50;
  return ((x - lo) / (hi - lo)) * 100;
};

export const round1 = (x: number) => Math.round(x * 10) / 10;

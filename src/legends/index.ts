import type { Diagnosis, MacroState, PersonaVerdict, TickerData } from '../types';
import { CURRENT_MACRO } from '../data/macro';
import { buffettScore } from './buffett';
import { lynchScore } from './lynch';
import { dalioScore } from './dalio';
import { druckenmillerScore } from './druckenmiller';
import { grahamScore } from './graham';

export function diagnose(ticker: TickerData, macro: MacroState = CURRENT_MACRO): Diagnosis {
  const panels: PersonaVerdict[] = [
    buffettScore(ticker),
    lynchScore(ticker),
    dalioScore(ticker, macro),
    druckenmillerScore(ticker, macro),
    grahamScore(ticker),
  ];

  const consensus = panels.reduce(
    (acc, p) => {
      if (p.verdict === 'POSITIVE') acc.positive += 1;
      else if (p.verdict === 'NEUTRAL') acc.neutral += 1;
      else acc.negative += 1;
      return acc;
    },
    { positive: 0, neutral: 0, negative: 0 },
  );

  return {
    ticker: ticker.ticker,
    name: ticker.name,
    nameKo: ticker.nameKo,
    sector: ticker.sector,
    price: ticker.price,
    asOf: new Date().toISOString(),
    dataQuality: { missingPct: ticker.isMissingPct ?? 0, warnings: [] },
    panels,
    consensus,
    macro,
    isSynthesized: ticker.isSynthesized === true,
    liveFields: ticker.liveFields ?? [],
    liveQuote: ticker.liveQuote,
  };
}

export { PERSONAS, PERSONA_ORDER } from './personas';

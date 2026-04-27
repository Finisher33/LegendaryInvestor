/** URL 해시 ↔ 라우트 매핑.
 *
 *  형식
 *   ''                    → home
 *   '#/AAPL'              → ticker AAPL 진단
 *   '#/AAPL/BUFFETT'      → ticker AAPL 진단 + 패널 선택
 *   '#/compare/AAPL,NVDA' → 비교 뷰
 *   '#/watchlist'         → 워치리스트
 */

import type { PersonaId } from '../types';

export type ParsedRoute =
  | { kind: 'home' }
  | { kind: 'ticker'; ticker: string; persona?: PersonaId }
  | { kind: 'compare'; tickers: string[] }
  | { kind: 'watchlist' };

const VALID_PERSONAS: PersonaId[] = ['BUFFETT', 'LYNCH', 'DALIO', 'DRUCKENMILLER', 'GRAHAM'];

export function parseHash(raw: string): ParsedRoute {
  const h = raw.replace(/^#\/?/, '').trim();
  if (!h) return { kind: 'home' };

  const parts = h.split('/').filter(Boolean).map(decodeURIComponent);
  if (parts[0]?.toLowerCase() === 'compare') {
    const list = (parts[1] ?? '')
      .split(',')
      .map((t) => t.trim().toUpperCase())
      .filter(Boolean)
      .slice(0, 4);
    return { kind: 'compare', tickers: list };
  }
  if (parts[0]?.toLowerCase() === 'watchlist') {
    return { kind: 'watchlist' };
  }

  // 첫 토큰을 티커로 간주
  const ticker = parts[0].toUpperCase();
  const personaPart = parts[1]?.toUpperCase();
  const persona = (VALID_PERSONAS as string[]).includes(personaPart ?? '')
    ? (personaPart as PersonaId)
    : undefined;
  return { kind: 'ticker', ticker, persona };
}

export function buildHash(r: ParsedRoute): string {
  switch (r.kind) {
    case 'home':
      return '';
    case 'ticker':
      return `#/${encodeURIComponent(r.ticker)}${r.persona ? `/${r.persona}` : ''}`;
    case 'compare':
      return `#/compare/${r.tickers.map(encodeURIComponent).join(',')}`;
    case 'watchlist':
      return `#/watchlist`;
  }
}

export function setHash(r: ParsedRoute) {
  const next = buildHash(r);
  if (next === window.location.hash || (next === '' && window.location.hash === '')) return;
  if (next === '') {
    history.replaceState(null, '', window.location.pathname + window.location.search);
  } else {
    window.location.hash = next;
  }
}

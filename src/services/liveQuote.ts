import type { LiveQuote } from '../types';

/**
 * 클라이언트 측 라이브 시세 fetcher.
 *
 * - sessionStorage 5분 TTL 캐시 (탭 닫으면 삭제됨, 동일 세션 내 재조회 흡수)
 * - 6초 타임아웃 (Vercel Function의 5초 타임아웃 + 네트워크 여유 1초)
 * - 실패해도 throw 안 함 — null 반환 → 호출자가 시드 데이터로 graceful degradation
 *
 * 사용 예:
 *   const live = await fetchLiveQuote('AAPL');
 *   if (live?.price) { ... }
 */

const CACHE_PREFIX = 'fl_live_quote:';
const CACHE_TTL_MS = 5 * 60 * 1000;
const FETCH_TIMEOUT_MS = 6000;
// dev에선 vite가 /api/* 를 모르니 fetch는 404 → 자동으로 null 반환됨

interface CachedEntry {
  fetchedAt: number;
  quote: LiveQuote;
}

function readCache(symbol: string): LiveQuote | null {
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + symbol);
    if (!raw) return null;
    const e = JSON.parse(raw) as CachedEntry;
    if (Date.now() - e.fetchedAt > CACHE_TTL_MS) {
      sessionStorage.removeItem(CACHE_PREFIX + symbol);
      return null;
    }
    return e.quote;
  } catch {
    return null;
  }
}

function writeCache(symbol: string, quote: LiveQuote) {
  try {
    const e: CachedEntry = { fetchedAt: Date.now(), quote };
    sessionStorage.setItem(CACHE_PREFIX + symbol, JSON.stringify(e));
  } catch { /* quota exceeded — ignore */ }
}

async function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

/** 단일 ticker 라이브 시세. 실패 시 null 반환. */
export async function fetchLiveQuote(symbol: string): Promise<LiveQuote | null> {
  const sym = symbol.trim().toUpperCase();
  if (!sym) return null;

  const cached = readCache(sym);
  if (cached) return { ...cached };

  try {
    const r = await fetchWithTimeout(
      `/api/quote?ticker=${encodeURIComponent(sym)}`,
      FETCH_TIMEOUT_MS,
    );
    if (!r.ok) return null;
    const data = (await r.json()) as { quotes: Record<string, LiveQuote> };
    const q = data.quotes?.[sym];
    if (!q || !q.ok) return null;
    writeCache(sym, q);
    return q;
  } catch {
    return null;
  }
}

/** 여러 ticker 한번에 (compare/watchlist용). 실패한 종목은 결과에서 누락. */
export async function fetchLiveQuotes(symbols: string[]): Promise<Record<string, LiveQuote>> {
  const unique = Array.from(new Set(symbols.map((s) => s.trim().toUpperCase()))).filter(Boolean).slice(0, 20);
  if (unique.length === 0) return {};

  // 캐시 먼저 채우기
  const out: Record<string, LiveQuote> = {};
  const toFetch: string[] = [];
  for (const s of unique) {
    const c = readCache(s);
    if (c) out[s] = c;
    else toFetch.push(s);
  }

  if (toFetch.length === 0) return out;

  try {
    const r = await fetchWithTimeout(
      `/api/quote?ticker=${encodeURIComponent(toFetch.join(','))}`,
      FETCH_TIMEOUT_MS,
    );
    if (!r.ok) return out;
    const data = (await r.json()) as { quotes: Record<string, LiveQuote> };
    for (const s of toFetch) {
      const q = data.quotes?.[s];
      if (q?.ok) {
        out[s] = q;
        writeCache(s, q);
      }
    }
  } catch { /* network — keep partial cache hits */ }

  return out;
}

/** 디버깅/테스트용 — 캐시 비우기 */
export function clearLiveQuoteCache(): void {
  try {
    const keys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k && k.startsWith(CACHE_PREFIX)) keys.push(k);
    }
    keys.forEach((k) => sessionStorage.removeItem(k));
  } catch { /* ignore */ }
}

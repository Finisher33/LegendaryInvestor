/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Vercel Function: /api/quote?ticker=AAPL,NVDA,KO
 *
 * Yahoo Finance를 라이브 소스로 사용해 가격·시총·PE·52주 고저 등을 반환.
 * - 1차: query1.finance.yahoo.com/v7/finance/quote (가장 풍부한 정보)
 * - 2차 fallback: v8/finance/chart (가격만이라도 확보)
 *
 * 캐싱:
 * - Vercel Edge CDN: s-maxage=300 (5분 fresh) + stale-while-revalidate=600 (10분 stale 허용)
 *   → 동일 ticker 동시다발 요청은 Edge에서 흡수, 업스트림 부하 최소화
 *
 * 안전장치:
 * - 5초 타임아웃 (Yahoo가 느려져도 사용자 진단은 최대 5초만 지연)
 * - 실패 시 quotes 배열 일부만 반환하고 warnings에 사유 명시
 * - 절대 500을 던지지 않음 (200 + warnings로 클라이언트가 graceful fallback)
 */

interface YahooV7Quote {
  symbol?: string;
  shortName?: string;
  longName?: string;
  currency?: string;
  regularMarketPrice?: number;
  regularMarketPreviousClose?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
  regularMarketDayHigh?: number;
  regularMarketDayLow?: number;
  regularMarketTime?: number; // unix sec
  marketCap?: number;          // raw $
  trailingPE?: number;
  forwardPE?: number;
  priceToBook?: number;
  trailingAnnualDividendYield?: number;
  fiftyTwoWeekLow?: number;
  fiftyTwoWeekHigh?: number;
  beta?: number;
  exchange?: string;
  marketState?: string;
}

interface QuoteOut {
  ticker: string;
  ok: boolean;
  source: 'yahoo-v7' | 'yahoo-v8' | 'none';
  asOf: string;
  price: number | null;
  prevClose: number | null;
  dayChangePct: number | null;
  marketCapUsd: number | null;
  marketCapB: number | null;       // 십억 USD (앱 단위 통일)
  peTtm: number | null;
  forwardPE: number | null;
  pbRatio: number | null;
  divYield: number | null;
  fiftyTwoWeekLow: number | null;
  fiftyTwoWeekHigh: number | null;
  beta: number | null;
  currency: string | null;
  shortName: string | null;
  exchange: string | null;
  marketState: string | null;     // 'REGULAR' | 'CLOSED' | 'PRE' | 'POST'
  regularMarketTimeIso: string | null;
  warnings: string[];
}

const YAHOO_HEADERS = {
  // Yahoo는 user-agent 없는 요청을 자주 차단
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'application/json,text/plain,*/*',
  'Accept-Language': 'en-US,en;q=0.9',
};

const TIMEOUT_MS = 5000;
const MAX_TICKERS = 20;

async function fetchWithTimeout(url: string, ms = TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { headers: YAHOO_HEADERS, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

function emptyOut(ticker: string, warnings: string[]): QuoteOut {
  return {
    ticker, ok: false, source: 'none', asOf: new Date().toISOString(),
    price: null, prevClose: null, dayChangePct: null,
    marketCapUsd: null, marketCapB: null,
    peTtm: null, forwardPE: null, pbRatio: null, divYield: null,
    fiftyTwoWeekLow: null, fiftyTwoWeekHigh: null, beta: null,
    currency: null, shortName: null, exchange: null, marketState: null,
    regularMarketTimeIso: null, warnings,
  };
}

function mapV7(q: YahooV7Quote): QuoteOut {
  const mc = typeof q.marketCap === 'number' ? q.marketCap : null;
  return {
    ticker: q.symbol || '',
    ok: true,
    source: 'yahoo-v7',
    asOf: new Date().toISOString(),
    price: q.regularMarketPrice ?? null,
    prevClose: q.regularMarketPreviousClose ?? null,
    dayChangePct: typeof q.regularMarketChangePercent === 'number'
      ? q.regularMarketChangePercent / 100
      : null,
    marketCapUsd: mc,
    marketCapB: mc != null ? Math.round((mc / 1e9) * 100) / 100 : null,
    peTtm: q.trailingPE ?? null,
    forwardPE: q.forwardPE ?? null,
    pbRatio: q.priceToBook ?? null,
    divYield: q.trailingAnnualDividendYield ?? null,
    fiftyTwoWeekLow: q.fiftyTwoWeekLow ?? null,
    fiftyTwoWeekHigh: q.fiftyTwoWeekHigh ?? null,
    beta: q.beta ?? null,
    currency: q.currency ?? null,
    shortName: q.shortName || q.longName || null,
    exchange: q.exchange ?? null,
    marketState: q.marketState ?? null,
    regularMarketTimeIso: q.regularMarketTime
      ? new Date(q.regularMarketTime * 1000).toISOString()
      : null,
    warnings: [],
  };
}

async function tryV7(symbols: string[]): Promise<Record<string, QuoteOut>> {
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols.join(','))}`;
  const r = await fetchWithTimeout(url);
  if (!r.ok) throw new Error(`yahoo-v7 ${r.status}`);
  const data: any = await r.json();
  const arr: YahooV7Quote[] = data?.quoteResponse?.result || [];
  const out: Record<string, QuoteOut> = {};
  for (const q of arr) if (q.symbol) out[q.symbol] = mapV7(q);
  return out;
}

async function tryV8One(symbol: string): Promise<QuoteOut | null> {
  // v8 chart endpoint은 거의 항상 살아있음 — 가격 + previousClose는 확보 가능
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
  try {
    const r = await fetchWithTimeout(url);
    if (!r.ok) return null;
    const data: any = await r.json();
    const meta: any = data?.chart?.result?.[0]?.meta;
    if (!meta?.regularMarketPrice) return null;
    return {
      ticker: symbol,
      ok: true,
      source: 'yahoo-v8',
      asOf: new Date().toISOString(),
      price: meta.regularMarketPrice ?? null,
      prevClose: meta.previousClose ?? null,
      dayChangePct: meta.regularMarketPrice && meta.previousClose
        ? (meta.regularMarketPrice - meta.previousClose) / meta.previousClose
        : null,
      marketCapUsd: null, marketCapB: null,
      peTtm: null, forwardPE: null, pbRatio: null, divYield: null,
      fiftyTwoWeekLow: meta.fiftyTwoWeekLow ?? null,
      fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh ?? null,
      beta: null,
      currency: meta.currency ?? null,
      shortName: meta.shortName || meta.longName || null,
      exchange: meta.exchangeName ?? null,
      marketState: meta.marketState ?? null,
      regularMarketTimeIso: meta.regularMarketTime
        ? new Date(meta.regularMarketTime * 1000).toISOString()
        : null,
      warnings: ['fallback-v8: marketCap/PE/PB/div는 미확보'],
    };
  } catch {
    return null;
  }
}

const handler = async (req: any, res: any): Promise<void> => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }

  const raw = (req.query?.ticker ?? '') as string | string[];
  const symbols = (Array.isArray(raw) ? raw.join(',') : raw)
    .split(',')
    .map((s: string) => s.trim().toUpperCase())
    .filter(Boolean)
    .slice(0, MAX_TICKERS);

  if (symbols.length === 0) {
    res.status(400).json({ error: 'ticker query param required (e.g. ?ticker=AAPL,NVDA)' });
    return;
  }

  const out: Record<string, QuoteOut> = {};
  const warnings: string[] = [];

  // 1차: Yahoo v7
  try {
    const v7 = await tryV7(symbols);
    Object.assign(out, v7);
  } catch (e) {
    warnings.push(`v7 batch failed: ${(e as Error).message}`);
  }

  // 2차: 누락된 심볼은 v8 chart로 개별 시도
  const missing = symbols.filter((s) => !out[s]);
  if (missing.length > 0) {
    const fills = await Promise.all(missing.map(tryV8One));
    fills.forEach((q, i) => {
      const sym = missing[i];
      if (q) out[sym] = q;
      else out[sym] = emptyOut(sym, ['both v7 and v8 failed or symbol unknown']);
    });
  }

  // 응답
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=300, stale-while-revalidate=600',
  );
  res.status(200).json({
    asOf: new Date().toISOString(),
    quotes: out,
    warnings,
  });
};

export default handler;

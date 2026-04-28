/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Vercel Function: /api/quote?ticker=AAPL,NVDA,KO
 *
 * 라이브 시세 멀티-소스 fetcher (모든 소스가 실패해도 200 + warnings 반환).
 *
 * 전략:
 *   Yahoo v7 batch quote: 글로벌 401 차단됨 (2024 deprecated) → 사용 안 함.
 *   1차: Yahoo query2 v8 chart    (가격 + 52주 + dayChange) — 가장 신뢰할 수 있는 무인증 엔드포인트
 *   2차: Yahoo query1 v8 chart    (1차 실패 시 동일 데이터, 다른 호스트)
 *   3차: Stooq CSV                (Yahoo 차단 시 가격만 — 가장 보수적 fallback)
 *
 * 시총·PE·PB·배당률은 무인증으로 안정적인 소스가 없어 v0.3에선 미제공.
 *   → 클라이언트는 시드 값 유지, liveFields에 'price'만 추가됨.
 *
 * CDN 캐시: 5분 fresh + 10분 stale-while-revalidate.
 * 타임아웃: 4초/소스 (3소스 합산 최대 12초이지만 보통 1차에서 끝남).
 */

interface QuoteOut {
  ticker: string;
  ok: boolean;
  source: 'yahoo-q2-v8' | 'yahoo-q1-v8' | 'stooq' | 'none';
  asOf: string;
  regularMarketTimeIso: string | null;
  price: number | null;
  prevClose: number | null;
  dayChangePct: number | null;
  marketCapUsd: number | null;
  marketCapB: number | null;
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
  marketState: string | null;
  warnings: string[];
}

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'application/json,text/plain,*/*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://finance.yahoo.com/',
};

const STOOQ_HEADERS = {
  'User-Agent': HEADERS['User-Agent'],
  'Accept': 'text/csv,*/*',
};

const TIMEOUT_MS = 4000;
const MAX_TICKERS = 20;

async function fetchWithTimeout(url: string, init: RequestInit = {}, ms = TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

function emptyOut(ticker: string, warnings: string[]): QuoteOut {
  return {
    ticker, ok: false, source: 'none', asOf: new Date().toISOString(),
    regularMarketTimeIso: null,
    price: null, prevClose: null, dayChangePct: null,
    marketCapUsd: null, marketCapB: null,
    peTtm: null, forwardPE: null, pbRatio: null, divYield: null,
    fiftyTwoWeekLow: null, fiftyTwoWeekHigh: null, beta: null,
    currency: null, shortName: null, exchange: null, marketState: null,
    warnings,
  };
}

function mapYahooMeta(meta: any, source: 'yahoo-q1-v8' | 'yahoo-q2-v8'): QuoteOut {
  const price = typeof meta.regularMarketPrice === 'number' ? meta.regularMarketPrice : null;
  const prev = typeof meta.previousClose === 'number'
    ? meta.previousClose
    : (typeof meta.chartPreviousClose === 'number' ? meta.chartPreviousClose : null);
  return {
    ticker: meta.symbol || '',
    ok: price != null,
    source,
    asOf: new Date().toISOString(),
    regularMarketTimeIso: typeof meta.regularMarketTime === 'number'
      ? new Date(meta.regularMarketTime * 1000).toISOString()
      : null,
    price,
    prevClose: prev,
    dayChangePct: price != null && prev != null && prev > 0 ? (price - prev) / prev : null,
    marketCapUsd: null,
    marketCapB: null,
    peTtm: null,
    forwardPE: null,
    pbRatio: null,
    divYield: null,
    fiftyTwoWeekLow: meta.fiftyTwoWeekLow ?? null,
    fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh ?? null,
    beta: null,
    currency: meta.currency ?? null,
    shortName: meta.shortName || meta.longName || null,
    exchange: meta.exchangeName || meta.fullExchangeName || null,
    marketState: meta.marketState ?? null,
    warnings: [],
  };
}

async function tryYahooV8(symbol: string, host: 'query1' | 'query2'): Promise<QuoteOut | null> {
  const url = `https://${host}.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`;
  try {
    const r = await fetchWithTimeout(url, { headers: HEADERS });
    if (!r.ok) return null;
    const data: any = await r.json();
    const meta: any = data?.chart?.result?.[0]?.meta;
    if (!meta?.regularMarketPrice) return null;
    return mapYahooMeta(meta, host === 'query1' ? 'yahoo-q1-v8' : 'yahoo-q2-v8');
  } catch {
    return null;
  }
}

/** Stooq CSV: Symbol,Date,Time,Open,High,Low,Close,Volume */
async function tryStooq(symbol: string): Promise<QuoteOut | null> {
  const sym = symbol.toLowerCase().replace('.', '-'); // BRK.B → brk-b
  const url = `https://stooq.com/q/l/?s=${sym}.us&f=sd2t2ohlcv&h&e=csv`;
  try {
    const r = await fetchWithTimeout(url, { headers: STOOQ_HEADERS });
    if (!r.ok) return null;
    const csv = await r.text();
    // Parse CSV — line 2 has data
    const lines = csv.trim().split(/\r?\n/);
    if (lines.length < 2) return null;
    const cols = lines[1].split(',');
    if (cols.length < 7) return null;
    const close = parseFloat(cols[6]);
    const open = parseFloat(cols[3]);
    if (!Number.isFinite(close) || close <= 0) return null;
    const dayChangePct = Number.isFinite(open) && open > 0 ? (close - open) / open : null;
    const date = cols[1] && cols[2]
      ? new Date(`${cols[1]}T${cols[2]}Z`).toISOString()
      : null;
    return {
      ticker: symbol,
      ok: true,
      source: 'stooq',
      asOf: new Date().toISOString(),
      regularMarketTimeIso: date,
      price: close,
      prevClose: Number.isFinite(open) ? open : null, // best effort
      dayChangePct,
      marketCapUsd: null, marketCapB: null,
      peTtm: null, forwardPE: null, pbRatio: null, divYield: null,
      fiftyTwoWeekLow: null, fiftyTwoWeekHigh: null, beta: null,
      currency: 'USD',
      shortName: null,
      exchange: null,
      marketState: null,
      warnings: ['stooq fallback: 가격만 확보 (시총·PE 미제공)'],
    };
  } catch {
    return null;
  }
}

async function fetchOne(symbol: string): Promise<QuoteOut> {
  const errors: string[] = [];

  // 1차: Yahoo query2 v8
  const q2 = await tryYahooV8(symbol, 'query2');
  if (q2) return q2;
  errors.push('yahoo-q2-v8 failed');

  // 2차: Yahoo query1 v8
  const q1 = await tryYahooV8(symbol, 'query1');
  if (q1) return q1;
  errors.push('yahoo-q1-v8 failed');

  // 3차: Stooq
  const st = await tryStooq(symbol);
  if (st) return st;
  errors.push('stooq failed');

  return emptyOut(symbol, [`all sources failed: ${errors.join(' / ')}`]);
}

const handler = async (req: any, res: any): Promise<void> => {
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'GET') { res.status(405).json({ error: 'method not allowed' }); return; }

  const raw = (req.query?.ticker ?? '') as string | string[];
  const symbols = (Array.isArray(raw) ? raw.join(',') : raw)
    .split(',')
    .map((s: string) => s.trim().toUpperCase())
    .filter(Boolean)
    .slice(0, MAX_TICKERS);

  if (symbols.length === 0) {
    res.status(400).json({ error: 'ticker query param required' });
    return;
  }

  // 병렬 fetch (각 소스가 실패해도 다른 종목은 영향 없음)
  const results = await Promise.all(symbols.map((s: string) => fetchOne(s)));
  const out: Record<string, QuoteOut> = {};
  results.forEach((q: QuoteOut, i: number) => { out[symbols[i]] = q; });

  const warnings: string[] = [];
  const okCount = results.filter((q: QuoteOut) => q.ok).length;
  if (okCount < symbols.length) {
    warnings.push(`${symbols.length - okCount}/${symbols.length} 종목이 라이브 데이터를 가져오지 못함`);
  }

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
  res.status(200).json({
    asOf: new Date().toISOString(),
    quotes: out,
    warnings,
  });
};

export default handler;

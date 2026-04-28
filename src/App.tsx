import { useCallback, useEffect, useMemo, useState } from 'react';
import { DisclaimerBar, DisclaimerFooter } from './components/Disclaimer';
import { Header } from './components/Header';
import { HomeView, recordRecent } from './components/HomeView';
import { ProgressLoader } from './components/ProgressLoader';
import { ResultView } from './components/ResultView';
import { CompareView } from './components/CompareView';
import { WatchlistView } from './components/WatchlistView';
import { diagnose } from './legends';
import { getTickerData } from './data/tickers';
import { CURRENT_MACRO } from './data/macro';
import type { Diagnosis, MacroState, PersonaId, TickerData } from './types';
import { parseHash, setHash, type ParsedRoute } from './utils/hashRoute';

type Route =
  | { kind: 'home' }
  | { kind: 'loading'; ticker: TickerData; persona?: PersonaId }
  | { kind: 'result'; diagnosis: Diagnosis; persona?: PersonaId }
  | { kind: 'compare'; tickers: string[] }
  | { kind: 'watchlist' };

const WATCHLIST_KEY = 'fl_watchlist';
const MACRO_KEY = 'fl_macro_override';

export default function App() {
  const [route, setRoute] = useState<Route>({ kind: 'home' });
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [macro, setMacroState] = useState<MacroState>(CURRENT_MACRO);

  // ── Persistence: watchlist + macro override ───────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(WATCHLIST_KEY);
      if (raw) setWatchlist(JSON.parse(raw));
    } catch { /* ignore */ }
    try {
      const raw = localStorage.getItem(MACRO_KEY);
      if (raw) setMacroState({ ...CURRENT_MACRO, ...JSON.parse(raw) } as MacroState);
    } catch { /* ignore */ }
  }, []);

  const persistWatchlist = (next: string[]) => {
    setWatchlist(next);
    try {
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(next));
    } catch { /* ignore */ }
  };

  const persistMacro = useCallback((next: MacroState) => {
    setMacroState(next);
    try {
      localStorage.setItem(MACRO_KEY, JSON.stringify(next));
    } catch { /* ignore */ }
  }, []);

  // ── Hash → Route (incoming, e.g. user pastes URL or clicks back) ──────
  const applyHash = useCallback(
    (parsed: ParsedRoute) => {
      setRoute((cur) => {
        if (parsed.kind === 'home') return { kind: 'home' };
        if (parsed.kind === 'watchlist') return { kind: 'watchlist' };
        if (parsed.kind === 'compare') {
          const tickers = parsed.tickers.filter((tk) => getTickerData(tk) !== null);
          return {
            kind: 'compare',
            tickers: tickers.length > 0 ? tickers : ['AAPL', 'NVDA'],
          };
        }
        // ticker route — but only run diagnose if not already on this ticker
        const t = getTickerData(parsed.ticker);
        if (!t) return { kind: 'home' };
        if (cur.kind === 'result' && cur.diagnosis.ticker === parsed.ticker) {
          return { ...cur, persona: parsed.persona };
        }
        if (cur.kind === 'loading' && cur.ticker.ticker === parsed.ticker) {
          return cur;
        }
        return { kind: 'loading', ticker: t, persona: parsed.persona };
      });
    },
    [],
  );

  useEffect(() => {
    applyHash(parseHash(window.location.hash));
    const onHash = () => applyHash(parseHash(window.location.hash));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [applyHash]);

  // ── Route → Hash (outgoing, when state changes) ───────────────────────
  useEffect(() => {
    if (route.kind === 'home') setHash({ kind: 'home' });
    else if (route.kind === 'loading') setHash({ kind: 'ticker', ticker: route.ticker.ticker, persona: route.persona });
    else if (route.kind === 'result') setHash({ kind: 'ticker', ticker: route.diagnosis.ticker, persona: route.persona });
    else if (route.kind === 'compare') setHash({ kind: 'compare', tickers: route.tickers });
    else if (route.kind === 'watchlist') setHash({ kind: 'watchlist' });
  }, [route]);

  // ── Re-diagnose on macro change if currently viewing a result ─────────
  useEffect(() => {
    if (route.kind === 'result') {
      const t = getTickerData(route.diagnosis.ticker);
      if (t) {
        const d = diagnose(t, macro);
        setRoute({ kind: 'result', diagnosis: d, persona: route.persona });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [macro]);

  // ── Navigation helpers ────────────────────────────────────────────────
  const goHome = () => setRoute({ kind: 'home' });
  const goLoading = (t: TickerData) => {
    recordRecent(t.ticker);
    setRoute({ kind: 'loading', ticker: t });
  };
  const goCompare = () =>
    setRoute({
      kind: 'compare',
      tickers: watchlist.length > 0 ? watchlist.slice(0, 4) : ['AAPL', 'NVDA'],
    });
  const goWatchlist = () => setRoute({ kind: 'watchlist' });

  const handleSelect = (t: TickerData) => goLoading(t);

  const handleLoadingDone = useCallback(() => {
    setRoute((cur) => {
      if (cur.kind !== 'loading') return cur;
      const d = diagnose(cur.ticker, macro);
      return { kind: 'result', diagnosis: d, persona: cur.persona };
    });
  }, [macro]);

  const handleSelectPersona = (p: PersonaId) => {
    setRoute((cur) => (cur.kind === 'result' ? { ...cur, persona: p } : cur));
  };

  const isWatched = useMemo(() => {
    if (route.kind === 'result') return watchlist.includes(route.diagnosis.ticker);
    return false;
  }, [route, watchlist]);

  const toggleWatch = () => {
    if (route.kind !== 'result') return;
    const tk = route.diagnosis.ticker;
    persistWatchlist(
      watchlist.includes(tk) ? watchlist.filter((x) => x !== tk) : [tk, ...watchlist],
    );
  };

  const removeFromWatch = (tk: string) => {
    persistWatchlist(watchlist.filter((x) => x !== tk));
  };

  const resetMacro = () => persistMacro(CURRENT_MACRO);

  return (
    <div className="min-h-screen flex flex-col">
      <DisclaimerBar />
      <div className="no-print">
        <Header
          onHome={goHome}
          onCompare={goCompare}
          onWatchlist={goWatchlist}
          watchlistCount={watchlist.length}
        />
      </div>

      <main className="flex-1">
        {route.kind === 'home' && (
          <HomeView
            onSelect={handleSelect}
            macro={macro}
            onMacroChange={persistMacro}
            onResetMacro={resetMacro}
          />
        )}

        {route.kind === 'loading' && (
          <ProgressLoader ticker={route.ticker.ticker} onDone={handleLoadingDone} />
        )}

        {route.kind === 'result' && (
          <ResultView
            diagnosis={route.diagnosis}
            onBack={goHome}
            isWatched={isWatched}
            onToggleWatch={toggleWatch}
            selectedPersona={route.persona}
            onSelectPersona={handleSelectPersona}
            macro={macro}
            onMacroChange={persistMacro}
            onResetMacro={resetMacro}
          />
        )}

        {route.kind === 'compare' && (
          <CompareView
            initialTickers={route.tickers}
            onBack={goHome}
            onOpenTicker={handleSelect}
            macro={macro}
            onTickersChange={(ts) =>
              setRoute({ kind: 'compare', tickers: ts })
            }
          />
        )}

        {route.kind === 'watchlist' && (
          <WatchlistView
            tickers={watchlist}
            onBack={goHome}
            onOpen={handleSelect}
            onRemove={removeFromWatch}
            onGoHome={goHome}
            macro={macro}
          />
        )}
      </main>

      <div className="no-print">
        <DisclaimerFooter />
      </div>
    </div>
  );
}

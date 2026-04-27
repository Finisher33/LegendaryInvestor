import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';

const STORAGE_KEY = 'fl_disclaimer_dismissed';

export function DisclaimerBar() {
  const [dismissed, setDismissed] = useState(
    () => typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY) === '1',
  );
  if (dismissed) return null;
  return (
    <div className="border-b border-amber-500/30 bg-amber-500/10 text-amber-100 text-xs">
      <div className="mx-auto max-w-6xl px-4 py-2 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
        <p className="leading-relaxed flex-1">
          <strong className="text-amber-300">투자 자문이 아닙니다.</strong>{' '}
          본 서비스는 교육·정보 제공 목적의 시뮬레이션이며, 등장 인물의 의견은 그들의 공개된 저작·발언을 기반으로 AI가 생성한 가상의 분석입니다.
          실제 본인의 견해가 아니며, 모든 투자 결정과 그 결과는 이용자 본인에게 귀속됩니다.
        </p>
        <button
          onClick={() => {
            localStorage.setItem(STORAGE_KEY, '1');
            setDismissed(true);
          }}
          className="text-amber-300 hover:text-amber-100 shrink-0"
          aria-label="배너 닫기"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function DisclaimerFooter() {
  return (
    <footer className="mt-16 border-t border-slate-800/80 bg-slate-950/40">
      <div className="mx-auto max-w-6xl px-4 py-8 text-xs text-slate-500 leading-relaxed space-y-2">
        <p>
          본 서비스는 투자 자문이나 권유가 아니며, 교육·정보 제공 목적의 시뮬레이션입니다. 등장 인물의 의견은
          공개된 저작·발언·투자원칙을 기반으로 AI가 생성한 가상의 분석이며, 실제 본인의 견해가 아닙니다.
          모든 투자 결정과 그 결과는 이용자 본인에게 귀속됩니다.
        </p>
        <p>
          This service is not investment advice or solicitation. It is an educational simulation. The
          opinions expressed by the AI personas are generated based on the legends’ publicly available
          writings and speeches, and do not represent their actual views. All investment decisions and
          their consequences are the responsibility of the user.
        </p>
        <p className="text-slate-600">
          LegendaryInvestor · v0.2 · 2026-04-28 · Powered by deterministic scoring + LLM commentary
        </p>
      </div>
    </footer>
  );
}

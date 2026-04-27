# LegendaryInvestor — 5인의 거장

> 5인의 거장(Five Legends) 패널이 자신의 철학으로 미국 주식을 진단하는 AI 투자 시뮬레이션
> 위치: `C:\뭉\Legendary Investor\`

미국 주식 티커를 입력하면 워렌 버핏 · 피터 린치 · 레이 달리오 · 스탠리 드러켄밀러 · 벤자민 그레이엄
다섯 명의 전설적 투자자가 각자의 철학으로 진단하는 AI 투자 패널 앱.

> **본 서비스는 투자 자문이나 권유가 아니며, 교육·정보 제공 목적의 시뮬레이션입니다.**

## 빠른 시작

```bash
cd "C:\뭉\Legendary Investor"
npm install      # 최초 1회 (이미 node_modules 포함되어 옴)
npm run dev
```

`http://localhost:5174` 에서 접속.

PRD 원본은 `docs/Five_Legends_PRD.docx` 에 있다.

## 빌드

```bash
npm run build
npm run preview
```

## 구조

```
src/
├── App.tsx                     # 라우팅 (home / loading / result / compare / watchlist)
├── types.ts                    # TickerData, Diagnosis, PersonaVerdict 타입
├── data/
│   ├── tickers.ts              # 시드 종목 데이터 (15개)
│   └── macro.ts                # 거시 4계절 + Sector × Regime 매트릭스
├── legends/
│   ├── buffett.ts              # PRD §3.1 Quality + Moat + MoS
│   ├── lynch.ts                # PRD §3.2 GARP + 6 카테고리
│   ├── dalio.ts                # PRD §3.3 Regime Fit × Resilience
│   ├── druckenmiller.ts        # PRD §3.4 Top-down + Momentum + Asymmetric
│   ├── graham.ts               # PRD §3.5 Defensive/Enterprising + MoS
│   ├── personas.ts             # 인물 프로필 (이름, 어조, 심볼)
│   └── index.ts                # diagnose(ticker) 오케스트레이터
├── components/
│   ├── Header.tsx, Disclaimer.tsx
│   ├── HomeView.tsx, SearchBar.tsx
│   ├── ProgressLoader.tsx
│   ├── PanelCard.tsx, PanelDetail.tsx
│   ├── ResultView.tsx
│   ├── CompareView.tsx
│   └── WatchlistView.tsx
└── utils/
    ├── score.ts                # clip, scale 헬퍼
    └── format.ts               # fmtPct, fmtUsd, verdictKo
```

## v0.1 → v0.2 변경분

**v0.1 (Initial)**
- 5인 패널 결정론적 점수 함수 (PRD §3 의사코드 그대로 구현)
- 티커 검색 → 3단계 로딩 → 5장 카드 → 클릭 시 상세 → 1차 출처 인용
- 비교 뷰 (최대 4종목 × 5인 매트릭스)
- 워치리스트 (localStorage 영속)
- 디스클레이머 배너/푸터 (한·영 병기)
- Tailwind v4 다크 테마, 반응형

**v0.2 (이번 패치)**
- **URL 해시 라우팅**: `#/AAPL`, `#/AAPL/BUFFETT`, `#/compare/AAPL,NVDA,KO`, `#/watchlist` 딥링크
  - 공유 버튼이 실제 URL을 클립보드에 복사 (이전: 텍스트만)
  - 뒤로가기/앞으로가기 정상 동작
- **거시 시나리오 에디터**: 4분면 토글로 Growth × Inflation 가정 변경
  - 달리오·드러켄밀러 점수가 라이브 재계산 (Buffett·Lynch·Graham은 거시 독립이라 변동 없음)
  - localStorage 영속, 기본값으로 되돌리기 버튼
  - PRD §3.3 / §3.4 의 "거시 4계절" 모듈을 사용자가 직접 시나리오 테스트
- **PanelCard 인물별 칩**: Lynch 카테고리, Graham 트랙·NCAV, Druckenmiller Concentrated Bet, Dalio Regime을 카드에서 즉시 확인
- **Compare 뷰 컨센서스 필터**: 5인 모두 긍정 / 4인 이상 / 5인 모두 부정 하이라이트 (PRD §2.2)
- **PDF 내보내기**: `@media print` 스타일 + 결과 화면 PDF 버튼 → 브라우저 인쇄 다이얼로그에서 'PDF로 저장'

## 다음 단계 (v0.3~)

- yfinance/FMP/SEC EDGAR 백엔드 연동 → 라이브 데이터
- Anthropic API tool_use 파이프라인 → 실제 LLM 인용/Self-Audit (PRD §5)
- pgvector RAG 코퍼스 (인물별 1차 출처)
- 종합 점수 변동 알림, 분기 백테스트 리포트
- 모바일 PWA 패키징

## 데이터 면책

`src/data/tickers.ts` 의 시드 데이터는 2026-04-27 기준 근사값으로,
**실제 투자 의사결정에 사용해서는 안 됩니다.** 추후 백엔드 연동으로 대체됩니다.

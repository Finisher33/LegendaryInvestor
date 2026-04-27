import type { PersonaId } from '../types';

export interface PersonaProfile {
  id: PersonaId;
  nameKo: string;
  nameEn: string;
  era: string;
  taglineKo: string;
  longBioKo: string;
  philosophyKo: string;
  themeColor: string;     // tailwind text color class (e.g. 'text-amber-300')
  badgeBg: string;        // bg class
  initial: string;        // 1글자 영문 이니셜
  symbol: string;         // 작은 심볼 (없으면 빈 문자열)
}

export const PERSONAS: Record<PersonaId, PersonaProfile> = {
  BUFFETT: {
    id: 'BUFFETT',
    nameKo: '워렌 버핏',
    nameEn: 'Warren Buffett',
    era: '1965 ~ 현재 (Berkshire Hathaway)',
    taglineKo: '위대한 기업을 합리적 가격에',
    longBioKo:
      '60년간 버크셔를 이끌며 \'위대한 기업을 합리적 가격에\'라는 단순한 원칙을 지켜왔다. ROE/ROIC, 경제적 해자, Owner Earnings, 자본배분의 순서로만 사고한다.',
    philosophyKo: '퀄리티 + 해자 + 안전마진 (Quality + Moat + Margin of Safety)',
    themeColor: 'text-amber-300',
    badgeBg: 'bg-amber-500/15 border-amber-500/30',
    initial: 'B',
    symbol: '🦉',
  },
  LYNCH: {
    id: 'LYNCH',
    nameKo: '피터 린치',
    nameEn: 'Peter Lynch',
    era: 'Magellan Fund 1977~1990',
    taglineKo: 'Tenbagger는 작은 회사에서 나온다',
    longBioKo:
      '13년간 마젤란 펀드를 운용하며 연평균 29%를 기록. 종목을 6개 카테고리로 분류하고, 각 카테고리에 맞는 잣대로만 평가한다. \'Story가 단순한가\'를 늘 묻는다.',
    philosophyKo: 'GARP + 6 카테고리 분류 (Growth At Reasonable Price)',
    themeColor: 'text-emerald-300',
    badgeBg: 'bg-emerald-500/15 border-emerald-500/30',
    initial: 'L',
    symbol: '🛒',
  },
  DALIO: {
    id: 'DALIO',
    nameKo: '레이 달리오',
    nameEn: 'Ray Dalio',
    era: 'Bridgewater 1975~2022',
    taglineKo: '역사는 운율을 맞춘다',
    longBioKo:
      '브리지워터를 세계 최대 헤지펀드로 키운 사람. 종목을 단독으로 보지 않고, 거시 4분면(성장↑↓ × 인플레↑↓)에서 어떤 역할을 하는지를 평가한다.',
    philosophyKo: '거시 4계절 + All Weather (Macro Regime × Resilience)',
    themeColor: 'text-sky-300',
    badgeBg: 'bg-sky-500/15 border-sky-500/30',
    initial: 'D',
    symbol: '🌧️',
  },
  DRUCKENMILLER: {
    id: 'DRUCKENMILLER',
    nameKo: '스탠리 드러켄밀러',
    nameEn: 'Stanley Druckenmiller',
    era: '1981~현재 (Duquesne)',
    taglineKo: '확신이 있을 때, 크게',
    longBioKo:
      '30년간 단 한 번도 연간 손실을 내지 않은 사람. 12~18개월 선행 거시 판단과 강한 확신이 들 때의 비대칭 베팅이 무기다.',
    philosophyKo: '탑다운 + 모멘텀 + 비대칭 베팅',
    themeColor: 'text-violet-300',
    badgeBg: 'bg-violet-500/15 border-violet-500/30',
    initial: 'D',
    symbol: '🎯',
  },
  GRAHAM: {
    id: 'GRAHAM',
    nameKo: '벤자민 그레이엄',
    nameEn: 'Benjamin Graham',
    era: '1928~1956 (Graham-Newman)',
    taglineKo: '안전마진이 없는 매수는 투기다',
    longBioKo:
      '가치투자의 아버지이자 안전마진 개념의 창시자. 주식은 사업의 일부이며, Mr. Market의 변덕은 기회일 뿐이라고 가르쳤다.',
    philosophyKo: 'Deep Value + Margin of Safety',
    themeColor: 'text-rose-300',
    badgeBg: 'bg-rose-500/15 border-rose-500/30',
    initial: 'G',
    symbol: '📕',
  },
};

export const PERSONA_ORDER: PersonaId[] = ['BUFFETT', 'LYNCH', 'DALIO', 'DRUCKENMILLER', 'GRAHAM'];

// 작가가 자유롭게 추가하는 인물 커스텀 필드 한 칸.
// type에 따라 입력 폼이 다르게 보입니다: text(한 줄), textarea(여러 줄).
// 나중에 number, select 등을 추가해도 이 구조를 그대로 확장할 수 있습니다.
export type PersonFieldType = "text" | "textarea";

// 필드가 속한 탭. "basic"은 사이드패널에도 노출되는 한 줄 정보 모음이고,
// 나머지는 전체화면 상세에서만 보이는 탭입니다. 탭이 늘어나면 이 목록에 추가하면 됩니다.
export const PERSON_TABS = [
  { id: "basic", label: "기본정보" },
  { id: "detail", label: "상세정보" },
] as const;

export type PersonTabId = (typeof PERSON_TABS)[number]["id"];

export type PersonField = {
  id: string;
  label: string; // 예: "나이", "트라우마", "MBTI"
  type: PersonFieldType;
  value: string;
  tab: PersonTabId;
};

export type Person = {
  id: string;
  name: string;
  color: string;
  imageUrl: string | null;
  originalImageUrl: string | null;
  positionX: number | null;
  positionY: number | null;
  customFields: PersonField[];
  createdAt: string;
  updatedAt: string;
};

export type Relationship = {
  id: string;
  label: string | null;
  fromId: string;
  toId: string;
  from?: Person;
  to?: Person;
  createdAt: string;
  updatedAt: string;
};

// 스토리북 — 인물/관계도(및 향후 세계관·타임라인·시나리오)를 담는 작업공간 하나.
export type Storybook = {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

function makeFieldId(label: string) {
  return `f-${label}-${Math.random().toString(36).slice(2, 6)}`;
}

// 새 인물을 만들 때 기본으로 깔아주는 "기본정보" 탭 필드들.
// 작가는 자유롭게 이름을 바꾸거나 지우거나, 같은 탭에 새 한 줄 필드를 더 추가할 수 있습니다.
// 모두 빈 값으로 시작합니다 — 나이/성별 등을 일부러 모호하게 비워두고 싶은 작가도 있기 때문입니다.
export function createDefaultPersonFields(): PersonField[] {
  return [
    { id: makeFieldId("나이"), label: "나이", type: "text", value: "", tab: "basic" },
    { id: makeFieldId("성별"), label: "성별", type: "text", value: "", tab: "basic" },
    { id: makeFieldId("소속/직업"), label: "소속/직업", type: "text", value: "", tab: "basic" },
    { id: makeFieldId("한줄소개"), label: "한 줄 소개", type: "text", value: "", tab: "basic" },
  ];
}

export const PERSON_COLORS = [
  "yellow",
  "peach",
  "orange",
  "salmon",
  "lime",
  "green",
  "mint",
  "skyblue",
  "blue",
  "lavender",
  "pink",
  "rose",
  "taupe",
  "tan",
  "gray",
  "slate",
] as const;

export type PersonColor = (typeof PERSON_COLORS)[number];

export const COLOR_BG: Record<string, string> = {
  yellow: "#FBF08A",
  peach: "#FCE0BC",
  orange: "#FCC58F",
  salmon: "#F19992",
  lime: "#E3E792",
  green: "#A6E59A",
  mint: "#9BEBC4",
  skyblue: "#AEE2EF",
  blue: "#A4C5FA",
  lavender: "#D2BBFA",
  pink: "#FCB1F4",
  rose: "#F8B4C3",
  taupe: "#BBADA0",
  tan: "#D2BD8E",
  gray: "#DCDCDC",
  slate: "#5C6B79",
};

export const COLOR_TEXT: Record<string, string> = {
  yellow: "#5C5414",
  peach: "#6B4A1E",
  orange: "#6B3F0F",
  salmon: "#6B1F19",
  lime: "#4B5212",
  green: "#1F4A18",
  mint: "#0F4A30",
  skyblue: "#11475A",
  blue: "#1A3A73",
  lavender: "#3F2A6B",
  pink: "#6B1B62",
  rose: "#6B2535",
  taupe: "#3C332B",
  tan: "#4A3F22",
  gray: "#3A3A3A",
  slate: "#FFFFFF",
};

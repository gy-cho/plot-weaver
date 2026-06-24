export type Person = {
  id: string;
  name: string;
  description: string | null;
  color: string;
  imageUrl: string | null;
  positionX: number | null;
  positionY: number | null;
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
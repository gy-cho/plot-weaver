"use client";

import { COLOR_BG, COLOR_TEXT, type Person } from "@/types";

type Props = {
  person: Person;
  size: number;
  fontSize?: number;
};

export default function PersonAvatar({ person, size, fontSize }: Props) {
  if (person.imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={person.imageUrl}
        alt={person.name}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: COLOR_BG[person.color] ?? "#F1EFE8",
        color: COLOR_TEXT[person.color] ?? "#2C2C2A",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 500,
        fontSize: fontSize ?? size * 0.4,
        flexShrink: 0,
      }}
    >
      {person.name.slice(0, 1)}
    </div>
  );
}

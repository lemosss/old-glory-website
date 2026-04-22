export const VOCATIONS: Record<number, string> = {
  0: "None",
  1: "Sorcerer",
  2: "Druid",
  3: "Paladin",
  4: "Knight",
  5: "Master Sorcerer",
  6: "Elder Druid",
  7: "Royal Paladin",
  8: "Elite Knight",
};

export function getVocationName(vocationId: number): string {
  return VOCATIONS[vocationId] ?? "Unknown";
}

export const TOWNS: Record<number, string> = {
  1: "Rookgaard",
  2: "Thais",
  3: "Carlin",
  4: "Ab'Dendriel",
  5: "Kazordoon",
  6: "Venore",
  7: "Edron",
  8: "Darashia",
  9: "Ankrahmun",
  10: "Port Hope",
  11: "Liberty Bay",
  12: "Svargrond",
  13: "Yalahar",
};

export function getTownName(townId: number): string {
  return TOWNS[townId] ?? `Town ${townId}`;
}

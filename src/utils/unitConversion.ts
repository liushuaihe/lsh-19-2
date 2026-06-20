import type { UnitConversion } from "@/types";

const COMMON_UNITS = [
  "kg", "g", "mg",
  "L", "mL",
  "个", "只", "条", "片", "根",
  "袋", "箱", "桶", "瓶", "包", "罐",
  "勺", "杯", "碗", "把", "撮",
  "斤", "两", "钱",
];

export function getCommonUnits(): string[] {
  return [...COMMON_UNITS];
}

export function convertUnit(
  quantity: number,
  fromUnit: string,
  toUnit: string,
  conversions: UnitConversion[]
): number {
  if (fromUnit === toUnit) return quantity;

  const direct = conversions.find(
    (c) => c.fromUnit === fromUnit && c.toUnit === toUnit
  );
  if (direct) return quantity * direct.factor;

  const reverse = conversions.find(
    (c) => c.fromUnit === toUnit && c.toUnit === fromUnit
  );
  if (reverse && reverse.factor !== 0) return quantity / reverse.factor;

  const path = findConversionPath(fromUnit, toUnit, conversions);
  if (path !== null) {
    let result = quantity;
    for (const factor of path) {
      result *= factor;
    }
    return result;
  }

  return quantity;
}

function findConversionPath(
  fromUnit: string,
  toUnit: string,
  conversions: UnitConversion[]
): number[] | null {
  const visited = new Set<string>();
  const queue: { unit: string; factors: number[] }[] = [
    { unit: fromUnit, factors: [] },
  ];
  visited.add(fromUnit);

  while (queue.length > 0) {
    const current = queue.shift()!;

    for (const conv of conversions) {
      if (conv.fromUnit === current.unit && !visited.has(conv.toUnit)) {
        const newFactors = [...current.factors, conv.factor];
        if (conv.toUnit === toUnit) return newFactors;
        visited.add(conv.toUnit);
        queue.push({ unit: conv.toUnit, factors: newFactors });
      }

      if (conv.toUnit === current.unit && !visited.has(conv.fromUnit)) {
        const reverseFactor =
          conv.factor !== 0 ? 1 / conv.factor : Infinity;
        if (!isFinite(reverseFactor)) continue;
        const newFactors = [...current.factors, reverseFactor];
        if (conv.fromUnit === toUnit) return newFactors;
        visited.add(conv.fromUnit);
        queue.push({ unit: conv.fromUnit, factors: newFactors });
      }
    }
  }

  return null;
}

export function getConversionHint(
  fromUnit: string,
  toUnit: string,
  conversions: UnitConversion[]
): string | null {
  if (fromUnit === toUnit) return null;

  const direct = conversions.find(
    (c) => c.fromUnit === fromUnit && c.toUnit === toUnit
  );
  if (direct) return `1 ${fromUnit} = ${direct.factor} ${toUnit}`;

  const reverse = conversions.find(
    (c) => c.fromUnit === toUnit && c.toUnit === fromUnit
  );
  if (reverse && reverse.factor !== 0) {
    return `1 ${fromUnit} = ${(1 / reverse.factor).toFixed(4)} ${toUnit}`;
  }

  return null;
}

export const DEFAULT_CONVERSIONS: Omit<UnitConversion, "id">[] = [
  { fromUnit: "袋", toUnit: "kg", factor: 25 },
  { fromUnit: "箱", toUnit: "kg", factor: 10 },
  { fromUnit: "桶", toUnit: "L", factor: 5 },
  { fromUnit: "瓶", toUnit: "mL", factor: 500 },
  { fromUnit: "包", toUnit: "g", factor: 500 },
  { fromUnit: "罐", toUnit: "g", factor: 400 },
  { fromUnit: "斤", toUnit: "g", factor: 500 },
  { fromUnit: "两", toUnit: "g", factor: 50 },
  { fromUnit: "钱", toUnit: "g", factor: 5 },
  { fromUnit: "kg", toUnit: "g", factor: 1000 },
  { fromUnit: "g", toUnit: "mg", factor: 1000 },
  { fromUnit: "L", toUnit: "mL", factor: 1000 },
  { fromUnit: "杯", toUnit: "mL", factor: 250 },
  { fromUnit: "勺", toUnit: "mL", factor: 15 },
];

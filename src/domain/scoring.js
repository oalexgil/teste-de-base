export const clampScore = (value) => Math.max(0, Math.min(100, Math.round(value)));

export function weightedScore(parts) {
  const valid = parts.filter((p) => Number.isFinite(p.value) && Number.isFinite(p.weight) && p.weight > 0);
  if (!valid.length) return 0;
  const totalWeight = valid.reduce((sum, p) => sum + p.weight, 0);
  return clampScore(valid.reduce((sum, p) => sum + p.value * p.weight, 0) / totalWeight);
}

export function compositeAdSignalScore({ efficiency, leadQuality, creativeHealth }) {
  return weightedScore([
    { value: efficiency, weight: 0.4 },
    { value: leadQuality, weight: 0.35 },
    { value: creativeHealth, weight: 0.25 },
  ]);
}

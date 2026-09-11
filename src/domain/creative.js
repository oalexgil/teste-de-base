const safeDivide = (num, den) => (den > 0 ? num / den : 0);

export function joinCreativePerformance(mediaRecords = [], creativeRecords = []) {
  const metadata = new Map(creativeRecords.map((row) => [String(row.adId), row]));
  const grouped = new Map();

  for (const row of mediaRecords) {
    const meta = metadata.get(String(row.adId)) || {};
    const key = [meta.hook || 'Unknown hook', meta.angle || 'Unknown angle', meta.format || 'Unknown format'].join(' | ');
    if (!grouped.has(key)) {
      grouped.set(key, {
        key,
        hook: meta.hook || 'Unknown hook',
        angle: meta.angle || 'Unknown angle',
        format: meta.format || 'Unknown format',
        spend: 0, impressions: 0, clicks: 0, leads: 0, conversions: 0, revenue: 0, ads: new Set(),
      });
    }
    const item = grouped.get(key);
    item.ads.add(String(row.adId || 'unknown'));
    item.spend += Number(row.spend || 0);
    item.impressions += Number(row.impressions || 0);
    item.clicks += Number(row.clicks || 0);
    item.leads += Number(row.leads || 0);
    item.conversions += Number(row.conversions || 0);
    item.revenue += Number(row.revenue || 0);
  }

  return Array.from(grouped.values()).map((item) => ({
    ...item,
    ads: Array.from(item.ads),
    ctr: safeDivide(item.clicks, item.impressions),
    cpl: safeDivide(item.spend, item.leads),
    roas: safeDivide(item.revenue, item.spend),
  }));
}

export function creativeHealthScore(groups = []) {
  if (!groups.length) return 0;
  const totalSpend = groups.reduce((sum, g) => sum + g.spend, 0);
  const sorted = [...groups].sort((a, b) => b.spend - a.spend);
  const concentration = totalSpend > 0 ? sorted[0].spend / totalSpend : 1;
  const profitable = groups.filter((g) => g.roas >= 2).length / groups.length;
  const diversity = Math.min(1, groups.length / 5);
  const score = 45 + profitable * 30 + diversity * 20 - Math.max(0, concentration - 0.6) * 50;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function diagnoseCreative(groups = []) {
  const findings = [];
  if (!groups.length) return findings;
  const totalSpend = groups.reduce((sum, g) => sum + g.spend, 0);
  const ranked = [...groups].sort((a, b) => b.spend - a.spend);
  const dominant = ranked[0];

  if (totalSpend > 0 && dominant.spend / totalSpend > 0.65) {
    findings.push({
      category: 'creative', severity: 'warning', title: 'Creative spend is concentrated in one concept',
      evidence: [{ metric: 'Top concept spend share', current: dominant.spend / totalSpend }],
      interpretation: 'The account is vulnerable to fatigue or a sudden decline in one dominant creative idea.',
      action: `Develop a challenger concept that changes the angle or hook instead of making only cosmetic variants of “${dominant.key}”.`, confidence: 'high',
    });
  }

  const loser = ranked.find((g) => g.spend > 0 && g.roas > 0 && g.roas < 1);
  if (loser) {
    findings.push({
      category: 'creative', severity: 'critical', title: 'A creative concept is consuming spend below break-even tracked ROAS',
      evidence: [{ metric: `${loser.key} ROAS`, current: loser.roas }],
      interpretation: 'The concept has received spend but is not recovering tracked media cost.',
      action: 'Reduce exposure and isolate whether the weak component is hook, angle, format or offer before producing more variants.', confidence: 'medium',
    });
  }

  const winner = [...groups].sort((a, b) => b.roas - a.roas)[0];
  if (winner && winner.roas >= 2) {
    findings.push({
      category: 'creative', severity: 'info', title: 'Winning creative concept identified',
      evidence: [{ metric: `${winner.key} ROAS`, current: winner.roas }],
      interpretation: 'This concept currently has stronger tracked revenue efficiency than its peers.',
      action: `Create controlled challengers around the “${winner.angle}” angle while changing one variable at a time.`, confidence: 'medium',
    });
  }

  return findings;
}

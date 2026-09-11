const safeDivide = (num, den) => (den > 0 ? num / den : 0);

export function aggregateMedia(records = []) {
  const totals = records.reduce(
    (acc, row) => {
      acc.spend += Number(row.spend || 0);
      acc.impressions += Number(row.impressions || 0);
      acc.clicks += Number(row.clicks || 0);
      acc.landingPageViews += Number(row.landingPageViews || 0);
      acc.leads += Number(row.leads || 0);
      acc.conversions += Number(row.conversions || 0);
      acc.revenue += Number(row.revenue || 0);
      return acc;
    },
    { spend: 0, impressions: 0, clicks: 0, landingPageViews: 0, leads: 0, conversions: 0, revenue: 0 },
  );

  return {
    ...totals,
    cpm: safeDivide(totals.spend * 1000, totals.impressions),
    ctr: safeDivide(totals.clicks, totals.impressions),
    cpc: safeDivide(totals.spend, totals.clicks),
    landingPageRate: safeDivide(totals.landingPageViews, totals.clicks),
    cvr: safeDivide(totals.leads, totals.landingPageViews || totals.clicks),
    cpl: safeDivide(totals.spend, totals.leads),
    roas: safeDivide(totals.revenue, totals.spend),
  };
}

export function efficiencyScore(metrics) {
  if (!metrics || metrics.spend <= 0) return 0;

  let score = 55;
  if (metrics.ctr >= 0.015) score += 10;
  else if (metrics.ctr < 0.0075) score -= 12;

  if (metrics.landingPageRate >= 0.8) score += 8;
  else if (metrics.landingPageRate > 0 && metrics.landingPageRate < 0.6) score -= 12;

  if (metrics.cvr >= 0.1) score += 12;
  else if (metrics.cvr < 0.03) score -= 12;

  if (metrics.roas >= 3) score += 15;
  else if (metrics.roas > 0 && metrics.roas < 1) score -= 18;

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function diagnoseMedia(metrics) {
  const findings = [];
  if (!metrics || metrics.spend <= 0) return findings;

  if (metrics.ctr < 0.0075) {
    findings.push({
      category: 'media', severity: 'warning', title: 'Low click-through rate',
      evidence: [{ metric: 'CTR', current: metrics.ctr }],
      interpretation: 'The account may have a pre-click relevance or creative problem.',
      action: 'Review audience-message fit and compare performance by creative concept.', confidence: 'medium',
    });
  }

  if (metrics.landingPageRate > 0 && metrics.landingPageRate < 0.6) {
    findings.push({
      category: 'media', severity: 'critical', title: 'Click-to-landing-page leakage',
      evidence: [{ metric: 'Landing page view rate', current: metrics.landingPageRate }],
      interpretation: 'A significant share of ad clicks does not become a measured landing-page view.',
      action: 'Check page speed, redirects, tracking and accidental clicks before increasing spend.', confidence: 'high',
    });
  }

  if (metrics.roas > 0 && metrics.roas < 1) {
    findings.push({
      category: 'media', severity: 'critical', title: 'Spend is not recovering tracked revenue',
      evidence: [{ metric: 'ROAS', current: metrics.roas }],
      interpretation: 'Tracked revenue is below media spend.',
      action: 'Stop scaling until attribution quality and downstream conversion economics are verified.', confidence: 'high',
    });
  }

  return findings;
}

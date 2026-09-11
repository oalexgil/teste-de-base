const severityRank = { critical: 3, warning: 2, info: 1 };

export function prioritizeRecommendations(...groups) {
  return groups
    .flat()
    .filter(Boolean)
    .sort((a, b) => (severityRank[b.severity] || 0) - (severityRank[a.severity] || 0));
}

export function buildExecutiveSummary({ score, media, leads, creativeGroups, recommendations, budgetAtRisk = null }) {
  const criticalCount = recommendations.filter((r) => r.severity === 'critical').length;
  const warningCount = recommendations.filter((r) => r.severity === 'warning').length;
  const bestCreative = [...creativeGroups].sort((a, b) => b.roas - a.roas)[0];

  return {
    score,
    headline:
      score >= 80 ? 'Performance is healthy with focused optimization opportunities.' :
      score >= 60 ? 'Performance is mixed; there are material opportunities to improve economics.' :
      'Performance requires attention before additional scaling.',
    risk: { critical: criticalCount, warning: warningCount },
    budgetAtRisk,
    economics: {
      spend: media.spend,
      cpl: media.cpl,
      cpql: leads.cpql,
      cac: leads.cac,
      roas: media.roas,
    },
    bestCreative: bestCreative ? {
      concept: bestCreative.key,
      roas: bestCreative.roas,
      ctr: bestCreative.ctr,
    } : null,
    nextAction: recommendations[0]?.action || 'Import more data to generate a prioritized recommendation.',
  };
}

const safeDivide = (num, den) => (den > 0 ? num / den : 0);

export function campaignEconomics(mediaRecords = [], leadRecords = []) {
  const campaigns = new Map();

  for (const row of mediaRecords) {
    const id = String(row.campaignId || row.campaignName || 'unknown');
    if (!campaigns.has(id)) {
      campaigns.set(id, {
        campaignId: id,
        campaignName: row.campaignName || id,
        platform: row.platform || 'Unknown',
        spend: 0,
        reportedLeads: 0,
        revenue: 0,
        crmLeads: 0,
        qualified: 0,
        meetings: 0,
        sales: 0,
        crmRevenue: 0,
      });
    }
    const item = campaigns.get(id);
    item.spend += Number(row.spend || 0);
    item.reportedLeads += Number(row.leads || 0);
    item.revenue += Number(row.revenue || 0);
  }

  for (const row of leadRecords) {
    const id = String(row.campaignId || 'unknown');
    if (!campaigns.has(id)) {
      campaigns.set(id, {
        campaignId: id,
        campaignName: id,
        platform: row.platform || 'Unknown',
        spend: 0,
        reportedLeads: 0,
        revenue: 0,
        crmLeads: 0,
        qualified: 0,
        meetings: 0,
        sales: 0,
        crmRevenue: 0,
      });
    }
    const item = campaigns.get(id);
    item.crmLeads += 1;
    if (row.qualified === true || row.qualified === 'true' || row.status === 'qualified' || row.status === 'won') item.qualified += 1;
    if (row.meetingBooked === true || row.meetingBooked === 'true') item.meetings += 1;
    if (row.won === true || row.won === 'true' || row.status === 'won') item.sales += 1;
    item.crmRevenue += Number(row.revenue || 0);
  }

  return Array.from(campaigns.values()).map((item) => ({
    ...item,
    cpl: safeDivide(item.spend, item.reportedLeads || item.crmLeads),
    cpql: safeDivide(item.spend, item.qualified),
    costPerMeeting: safeDivide(item.spend, item.meetings),
    cac: safeDivide(item.spend, item.sales),
    qualificationRate: safeDivide(item.qualified, item.crmLeads),
    closeRate: safeDivide(item.sales, item.crmLeads),
    roas: safeDivide(item.crmRevenue || item.revenue, item.spend),
  }));
}

const number = (value) => {
  const parsed = Number(String(value ?? '').replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
};

const boolean = (value) => {
  if (typeof value === 'boolean') return value;
  return ['true', '1', 'yes', 'sim', 'qualified', 'won'].includes(String(value ?? '').trim().toLowerCase());
};

export function normalizeMediaRow(row) {
  return {
    date: row.date || row.day || '',
    platform: row.platform || 'Unknown',
    accountId: row.accountId || row.account_id || '',
    campaignId: row.campaignId || row.campaign_id || row.campaign || '',
    campaignName: row.campaignName || row.campaign_name || row.campaign || '',
    adGroupId: row.adGroupId || row.adset_id || row.ad_group_id || '',
    adId: row.adId || row.ad_id || row.ad || '',
    spend: number(row.spend || row.cost),
    impressions: number(row.impressions),
    clicks: number(row.clicks || row.link_clicks),
    landingPageViews: number(row.landingPageViews || row.landing_page_views),
    leads: number(row.leads || row.results),
    conversions: number(row.conversions || row.purchases),
    revenue: number(row.revenue || row.purchase_value || row.conversion_value),
  };
}

export function normalizeLeadRow(row) {
  return {
    leadId: row.leadId || row.lead_id || row.id || '',
    createdAt: row.createdAt || row.created_at || row.date || '',
    platform: row.platform || 'Unknown',
    campaignId: row.campaignId || row.campaign_id || row.campaign || '',
    adId: row.adId || row.ad_id || row.ad || '',
    status: String(row.status || '').toLowerCase(),
    qualified: boolean(row.qualified),
    meetingBooked: boolean(row.meetingBooked || row.meeting_booked),
    won: boolean(row.won || row.sale),
    revenue: number(row.revenue || row.value),
    rejectionReason: row.rejectionReason || row.rejection_reason || '',
  };
}

export function normalizeCreativeRow(row) {
  return {
    adId: row.adId || row.ad_id || row.ad || '',
    creativeName: row.creativeName || row.creative_name || row.name || '',
    hook: row.hook || 'Unknown hook',
    angle: row.angle || 'Unknown angle',
    format: row.format || 'Unknown format',
    offer: row.offer || '',
    cta: row.cta || '',
    launchedAt: row.launchedAt || row.launched_at || row.date || '',
  };
}

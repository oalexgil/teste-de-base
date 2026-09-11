export const mediaRecords = [
  { date: '2026-09-01', platform: 'Meta', campaignId: 'c1', campaignName: 'Lead Gen - Core', adId: 'a1', spend: 420, impressions: 42000, clicks: 820, landingPageViews: 690, leads: 58, conversions: 4, revenue: 3600 },
  { date: '2026-09-02', platform: 'Meta', campaignId: 'c1', campaignName: 'Lead Gen - Core', adId: 'a2', spend: 380, impressions: 39000, clicks: 540, landingPageViews: 315, leads: 31, conversions: 1, revenue: 900 },
  { date: '2026-09-03', platform: 'Google', campaignId: 'c2', campaignName: 'Search - High Intent', adId: 'a3', spend: 510, impressions: 18000, clicks: 690, landingPageViews: 655, leads: 46, conversions: 7, revenue: 6200 },
  { date: '2026-09-04', platform: 'Meta', campaignId: 'c3', campaignName: 'Creative Test', adId: 'a4', spend: 290, impressions: 36000, clicks: 250, landingPageViews: 238, leads: 13, conversions: 0, revenue: 0 },
];

export const leadRecords = [
  { leadId: 'l1', campaignId: 'c1', adId: 'a1', qualified: true, meetingBooked: true, won: true, revenue: 900, status: 'won' },
  { leadId: 'l2', campaignId: 'c1', adId: 'a1', qualified: true, meetingBooked: true, won: false, revenue: 0, status: 'qualified' },
  { leadId: 'l3', campaignId: 'c1', adId: 'a1', qualified: false, meetingBooked: false, won: false, revenue: 0, status: 'unresponsive' },
  { leadId: 'l4', campaignId: 'c1', adId: 'a2', qualified: false, meetingBooked: false, won: false, revenue: 0, status: 'invalid' },
  { leadId: 'l5', campaignId: 'c1', adId: 'a2', qualified: false, meetingBooked: false, won: false, revenue: 0, status: 'unresponsive' },
  { leadId: 'l6', campaignId: 'c2', adId: 'a3', qualified: true, meetingBooked: true, won: true, revenue: 1800, status: 'won' },
  { leadId: 'l7', campaignId: 'c2', adId: 'a3', qualified: true, meetingBooked: true, won: true, revenue: 1400, status: 'won' },
  { leadId: 'l8', campaignId: 'c2', adId: 'a3', qualified: true, meetingBooked: true, won: false, revenue: 0, status: 'qualified' },
  { leadId: 'l9', campaignId: 'c3', adId: 'a4', qualified: false, meetingBooked: false, won: false, revenue: 0, status: 'invalid' },
  { leadId: 'l10', campaignId: 'c3', adId: 'a4', qualified: false, meetingBooked: false, won: false, revenue: 0, status: 'unresponsive' },
];

export const creativeRecords = [
  { adId: 'a1', creativeName: 'UGC Pain Hook', hook: 'Stop wasting ad budget', angle: 'Efficiency', format: 'UGC video', offer: 'Audit', cta: 'Get report' },
  { adId: 'a2', creativeName: 'Cheap Leads Static', hook: 'Get more leads', angle: 'Volume', format: 'Static', offer: 'Free trial', cta: 'Start' },
  { adId: 'a3', creativeName: 'Search Intent', hook: 'Paid media analytics', angle: 'Control', format: 'Search', offer: 'Demo', cta: 'See analysis' },
  { adId: 'a4', creativeName: 'Generic AI', hook: 'Use AI for ads', angle: 'AI novelty', format: 'Static', offer: 'Free trial', cta: 'Try now' },
];

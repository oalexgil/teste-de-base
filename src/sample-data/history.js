export const baselineMediaRecords = [
  { date: '2026-08-25', platform: 'Meta', campaignId: 'c1', campaignName: 'Lead Gen - Core', adId: 'a1', spend: 360, impressions: 40000, clicks: 760, landingPageViews: 650, leads: 54, conversions: 5, revenue: 4100 },
  { date: '2026-08-26', platform: 'Meta', campaignId: 'c1', campaignName: 'Lead Gen - Core', adId: 'a2', spend: 320, impressions: 37000, clicks: 600, landingPageViews: 510, leads: 39, conversions: 3, revenue: 2600 },
  { date: '2026-08-27', platform: 'Google', campaignId: 'c2', campaignName: 'Search - High Intent', adId: 'a3', spend: 470, impressions: 17000, clicks: 650, landingPageViews: 620, leads: 45, conversions: 8, revenue: 6800 },
  { date: '2026-08-28', platform: 'Meta', campaignId: 'c3', campaignName: 'Creative Test', adId: 'a4', spend: 250, impressions: 33000, clicks: 300, landingPageViews: 275, leads: 18, conversions: 1, revenue: 700 },
];

export const baselineLeadRecords = [
  { leadId: 'b1', campaignId: 'c1', adId: 'a1', qualified: true, meetingBooked: true, won: true, revenue: 1100, status: 'won' },
  { leadId: 'b2', campaignId: 'c1', adId: 'a1', qualified: true, meetingBooked: true, won: true, revenue: 900, status: 'won' },
  { leadId: 'b3', campaignId: 'c1', adId: 'a1', qualified: true, meetingBooked: true, won: false, revenue: 0, status: 'qualified' },
  { leadId: 'b4', campaignId: 'c1', adId: 'a2', qualified: true, meetingBooked: true, won: false, revenue: 0, status: 'qualified' },
  { leadId: 'b5', campaignId: 'c1', adId: 'a2', qualified: false, meetingBooked: false, won: false, revenue: 0, status: 'unresponsive' },
  { leadId: 'b6', campaignId: 'c2', adId: 'a3', qualified: true, meetingBooked: true, won: true, revenue: 1900, status: 'won' },
  { leadId: 'b7', campaignId: 'c2', adId: 'a3', qualified: true, meetingBooked: true, won: true, revenue: 1600, status: 'won' },
  { leadId: 'b8', campaignId: 'c2', adId: 'a3', qualified: true, meetingBooked: true, won: false, revenue: 0, status: 'qualified' },
  { leadId: 'b9', campaignId: 'c3', adId: 'a4', qualified: true, meetingBooked: false, won: false, revenue: 0, status: 'qualified' },
  { leadId: 'b10', campaignId: 'c3', adId: 'a4', qualified: false, meetingBooked: false, won: false, revenue: 0, status: 'invalid' },
];

export const businessTargets = {
  maxCpl: 18,
  maxCpql: 250,
  maxCac: 450,
  minRoas: 2.5,
  minQualificationRate: 0.45,
  maxLowQualityRate: 0.25,
};

export const demoExperiments = [
  {
    id: 'exp-001',
    name: 'Volume hook → efficiency hook',
    metric: 'cac',
    direction: 'down',
    minimumLift: 0.12,
    hypothesis: 'A stronger efficiency message will reduce customer acquisition cost even if CPL rises.',
  },
  {
    id: 'exp-002',
    name: 'Lead form qualification questions',
    metric: 'qualificationRate',
    direction: 'up',
    minimumLift: 0.1,
    hypothesis: 'Extra qualification questions will improve downstream lead quality.',
  },
];

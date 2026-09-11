import { aggregateMedia, efficiencyScore, diagnoseMedia } from './media.js';
import { aggregateLeads, leadQualityScore, diagnoseLeads } from './leads.js';
import { joinCreativePerformance, creativeHealthScore, diagnoseCreative } from './creative.js';
import { campaignEconomics } from './campaigns.js';
import { compositeAdSignalScore } from './scoring.js';
import { comparePeriods, evaluateTargets, estimateBudgetAtRisk, temporalFindings } from './change.js';
import { evaluateExperiments, experimentFindings } from './experiments.js';
import { prioritizeRecommendations, buildExecutiveSummary } from '../recommendations/engine.js';

export function analyzeWorkspace({
  mediaRecords = [],
  leadRecords = [],
  creativeRecords = [],
  baselineMediaRecords = [],
  baselineLeadRecords = [],
  targets = {},
  experiments = [],
}) {
  const media = aggregateMedia(mediaRecords);
  const leads = aggregateLeads(leadRecords, media.spend);
  const creativeGroups = joinCreativePerformance(mediaRecords, creativeRecords);
  const campaigns = campaignEconomics(mediaRecords, leadRecords);

  const scores = {
    efficiency: efficiencyScore(media),
    leadQuality: leadQualityScore(leads),
    creativeHealth: creativeHealthScore(creativeGroups),
  };
  scores.overall = compositeAdSignalScore(scores);

  const hasBaseline = baselineMediaRecords.length > 0 || baselineLeadRecords.length > 0;
  const baselineMedia = hasBaseline ? aggregateMedia(baselineMediaRecords) : null;
  const baselineLeads = hasBaseline ? aggregateLeads(baselineLeadRecords, baselineMedia?.spend || 0) : null;
  const trends = hasBaseline
    ? comparePeriods({ currentMedia: media, currentLeads: leads, baselineMedia, baselineLeads })
    : [];
  const targetChecks = evaluateTargets({ media, leads, targets });
  const periodDays = new Set(mediaRecords.map((row) => row.date).filter(Boolean)).size || 1;
  const budgetAtRisk = estimateBudgetAtRisk({ media, trends, targetChecks, periodDays, horizonDays: 7 });

  const currentSnapshot = { media, leads };
  const baselineSnapshot = { media: baselineMedia || {}, leads: baselineLeads || {} };
  const experimentResults = hasBaseline
    ? evaluateExperiments(experiments, currentSnapshot, baselineSnapshot)
    : experiments.map((item) => ({ ...item, status: 'learning', improvement: 0, conclusion: 'Baseline data is missing.' }));

  const recommendations = prioritizeRecommendations(
    temporalFindings({ trends, budgetAtRisk }),
    diagnoseMedia(media),
    diagnoseLeads(leads),
    diagnoseCreative(creativeGroups),
    experimentFindings(experimentResults),
  );

  return {
    scores,
    media,
    leads,
    campaigns,
    creativeGroups,
    change: {
      trends,
      targetChecks,
      budgetAtRisk,
      baseline: hasBaseline ? { media: baselineMedia, leads: baselineLeads } : null,
    },
    experiments: experimentResults,
    recommendations,
    executiveSummary: buildExecutiveSummary({
      score: scores.overall,
      media,
      leads,
      creativeGroups,
      recommendations,
      budgetAtRisk,
    }),
  };
}

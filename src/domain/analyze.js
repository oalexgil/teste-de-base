import { aggregateMedia, efficiencyScore, diagnoseMedia } from './media.js';
import { aggregateLeads, leadQualityScore, diagnoseLeads } from './leads.js';
import { joinCreativePerformance, creativeHealthScore, diagnoseCreative } from './creative.js';
import { compositeAdSignalScore } from './scoring.js';
import { prioritizeRecommendations, buildExecutiveSummary } from '../recommendations/engine.js';

export function analyzeWorkspace({ mediaRecords = [], leadRecords = [], creativeRecords = [] }) {
  const media = aggregateMedia(mediaRecords);
  const leads = aggregateLeads(leadRecords, media.spend);
  const creativeGroups = joinCreativePerformance(mediaRecords, creativeRecords);

  const scores = {
    efficiency: efficiencyScore(media),
    leadQuality: leadQualityScore(leads),
    creativeHealth: creativeHealthScore(creativeGroups),
  };
  scores.overall = compositeAdSignalScore(scores);

  const recommendations = prioritizeRecommendations(
    diagnoseMedia(media),
    diagnoseLeads(leads),
    diagnoseCreative(creativeGroups),
  );

  return {
    scores,
    media,
    leads,
    creativeGroups,
    recommendations,
    executiveSummary: buildExecutiveSummary({
      score: scores.overall,
      media,
      leads,
      creativeGroups,
      recommendations,
    }),
  };
}

const metricReaders = {
  cpl: (snapshot) => snapshot.media?.cpl || 0,
  cpql: (snapshot) => snapshot.leads?.cpql || 0,
  cac: (snapshot) => snapshot.leads?.cac || 0,
  roas: (snapshot) => snapshot.media?.roas || 0,
  qualificationRate: (snapshot) => snapshot.leads?.qualificationRate || 0,
  lowQualityRate: (snapshot) => snapshot.leads?.lowQualityRate || 0,
};

function improvement(current, baseline, direction) {
  if (!(baseline > 0)) return 0;
  return direction === 'down' ? (baseline - current) / baseline : (current - baseline) / baseline;
}

export function evaluateExperiments(experiments = [], currentSnapshot = {}, baselineSnapshot = {}) {
  return experiments.map((experiment) => {
    const read = metricReaders[experiment.metric];
    if (!read) return { ...experiment, status: 'unsupported', improvement: 0 };

    const current = Number(read(currentSnapshot) || 0);
    const baseline = Number(read(baselineSnapshot) || 0);
    const lift = improvement(current, baseline, experiment.direction || 'up');
    const threshold = Number(experiment.minimumLift || 0.1);

    let status = 'learning';
    if (baseline > 0 && lift >= threshold) status = 'winner';
    else if (baseline > 0 && lift <= -threshold) status = 'loser';

    return {
      ...experiment,
      current,
      baseline,
      improvement: lift,
      status,
      conclusion:
        status === 'winner' ? `Target metric improved by ${Math.round(lift * 100)}%.` :
        status === 'loser' ? `Target metric worsened by ${Math.round(Math.abs(lift) * 100)}%.` :
        baseline > 0 ? 'Change is not yet large enough to call the experiment.' : 'Baseline data is missing.',
    };
  });
}

export function experimentFindings(results = []) {
  return results
    .filter((item) => item.status === 'winner' || item.status === 'loser')
    .map((item) => ({
      category: 'experiment',
      severity: item.status === 'loser' ? 'warning' : 'info',
      title: `${item.status === 'winner' ? 'Winning' : 'Losing'} experiment: ${item.name}`,
      evidence: [{ metric: `${item.metric} experiment lift`, current: item.improvement, baseline: item.baseline }],
      interpretation: item.conclusion,
      action: item.status === 'winner'
        ? 'Preserve the winning variable and design the next test around one new change.'
        : 'Do not scale this change; revert or isolate the variable before the next test.',
      confidence: 'medium',
    }));
}

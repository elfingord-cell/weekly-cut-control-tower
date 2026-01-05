import { CorridorStatus } from '@prisma/client';
import { format } from 'date-fns';

export type ReportInput = {
  weekEnding: Date;
  weightAvg7dKg: number;
  prevWeightAvg7dKg: number | null;
  deltaKg: number | null;
  ratePctPerWeek: number | null;
  bfAvgPercent: number | null;
  trainingDone: number;
  trainingPlanned: number | null;
  alcoholDrinks: number;
  sweetsDays: number;
  sleepAvgHours: number;
  stress1to5: number;
  consistencyScore: number;
  corridorStatus: CorridorStatus;
  targetRateMinPctPerWeek: number;
  targetRateMaxPctPerWeek: number;
  trendSlopeKgPerWeek: number | null;
  projectedGoalDate: Date | null;
  goalEndDate: Date;
  bufferWeeks: number | null;
  note: string | null;
  targetWeightKg: number | null;
};

function formatNumber(value: number | null, digits = 1): string {
  if (value == null || Number.isNaN(value)) return 'n/a';
  return value.toFixed(digits);
}

function formatSigned(value: number | null, digits = 2, suffix = ''): string {
  if (value == null || Number.isNaN(value)) return 'n/a';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(digits)}${suffix}`;
}

function corridorLabel(status: CorridorStatus): string {
  switch (status) {
    case CorridorStatus.in:
      return 'in corridor';
    case CorridorStatus.too_fast:
      return 'too fast';
    case CorridorStatus.too_slow:
      return 'too slow';
    default:
      return 'n/a';
  }
}

export function generateWeeklyReport(input: ReportInput): string {
  const {
    weekEnding,
    weightAvg7dKg,
    prevWeightAvg7dKg,
    deltaKg,
    ratePctPerWeek,
    bfAvgPercent,
    trainingDone,
    trainingPlanned,
    alcoholDrinks,
    sweetsDays,
    sleepAvgHours,
    stress1to5,
    consistencyScore,
    corridorStatus,
    targetRateMinPctPerWeek,
    targetRateMaxPctPerWeek,
    trendSlopeKgPerWeek,
    projectedGoalDate,
    goalEndDate,
    bufferWeeks,
    note,
  } = input;

  const trainingLine =
    trainingPlanned != null
      ? `- Training: done ${trainingDone} / planned ${trainingPlanned}`
      : `- Training: done ${trainingDone}`;

  const formattedWeekEnding = format(weekEnding, 'yyyy-MM-dd');
  const formattedGoalDate = format(goalEndDate, 'yyyy-MM-dd');
  const projected = projectedGoalDate ? format(projectedGoalDate, 'yyyy-MM-dd') : 'n/a';
  const bufferText =
    bufferWeeks == null || Number.isNaN(bufferWeeks)
      ? 'n/a'
      : `${bufferWeeks >= 0 ? '+' : ''}${bufferWeeks.toFixed(1)} weeks`;

  return [
    'WEEKLY CHECK-IN REPORT',
    `Week ending: ${formattedWeekEnding}`,
    '',
    'BODY',
    `- Weight (7d avg): ${formatNumber(weightAvg7dKg)} kg`,
    `- Prev (7d avg): ${formatNumber(prevWeightAvg7dKg)} kg`,
    `- Delta: ${formatSigned(deltaKg, 1, ' kg')}`,
    `- Rate: ${formatSigned(ratePctPerWeek, 2, ' %/wk')}`,
    `- BF (avg): ${formatNumber(bfAvgPercent)} %`,
    '',
    'TRAINING & RECOVERY',
    trainingLine,
    `- Sleep (avg): ${formatNumber(sleepAvgHours)} h`,
    `- Stress (1–5): ${formatNumber(stress1to5, 0)}`,
    '',
    'NUTRITION & HABITS',
    `- Alcohol drinks: ${alcoholDrinks}`,
    `- Sweets days: ${sweetsDays}`,
    '',
    'CONSISTENCY',
    `- Consistency score: ${consistencyScore}/100`,
    '',
    'TARGET CORRIDOR (classification)',
    `- Target corridor: ${targetRateMinPctPerWeek.toFixed(1)}–${targetRateMaxPctPerWeek.toFixed(1)} %/wk`,
    `- This week: ${corridorLabel(corridorStatus)}`,
    '',
    'PROJECTION (trend-based)',
    `- Trend slope: ${trendSlopeKgPerWeek == null ? 'n/a' : `${trendSlopeKgPerWeek.toFixed(2)} kg/week`}`,
    `- Projected date to target weight: ${projected}`,
    `- Goal end date (settings): ${formattedGoalDate}`,
    `- Buffer vs goal end: ${bufferText}`,
    '',
    'NOTES',
    `- Note: ${note ? `"${note}"` : 'n/a'}`,
  ].join('\n');
}

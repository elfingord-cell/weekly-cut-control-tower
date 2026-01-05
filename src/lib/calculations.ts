import { addDays, differenceInCalendarDays } from 'date-fns';
import { BufferMode, CorridorStatus, Settings, WeeklyCheckin } from '@prisma/client';

type TrendResult = {
  slopeKgPerWeek: number | null;
  projectedGoalDate: Date | null;
  bufferWeeks: number | null;
};

type DerivedResult = {
  prevWeightAvg7dKg: number | null;
  deltaKg: number | null;
  ratePctPerWeek: number | null;
  slopeKgPerWeek: number | null;
  projectedGoalDate: Date | null;
  bufferWeeks: number | null;
  consistencyScore: number;
  corridorStatus: CorridorStatus;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

function linearRegressionSlope(points: { x: number; y: number }[]): number | null {
  if (points.length === 0) return null;
  const n = points.length;
  const sumX = points.reduce((acc, p) => acc + p.x, 0);
  const sumY = points.reduce((acc, p) => acc + p.y, 0);
  const sumXY = points.reduce((acc, p) => acc + p.x * p.y, 0);
  const sumX2 = points.reduce((acc, p) => acc + p.x * p.x, 0);
  const denominator = n * sumX2 - sumX * sumX;
  if (denominator === 0) return null;
  const slope = (n * sumXY - sumX * sumY) / denominator;
  return slope;
}

function calculateSlopeKgPerWeek(checkins: WeeklyCheckin[]): number | null {
  if (checkins.length === 0) return null;
  const sorted = [...checkins].sort((a, b) => a.weekEnding.getTime() - b.weekEnding.getTime());
  const last = sorted[sorted.length - 1];
  if (sorted.length < 2) return null;
  if (sorted.length >= 4) {
    const recent = sorted.slice(-4);
    const baseIndex = recent.length - 1;
    const points = recent.map((c, idx) => ({ x: idx - baseIndex, y: c.weightAvg7dKg }));
    const slopePerWeek = linearRegressionSlope(points);
    return slopePerWeek;
  }
  const prev = sorted[sorted.length - 2];
  return last.weightAvg7dKg - prev.weightAvg7dKg;
}

function calculateProjection(
  targetWeightKg: number | null,
  goalEndDate: Date,
  slopeKgPerWeek: number | null,
  currentWeightKg: number,
  anchorDate: Date,
): TrendResult {
  if (targetWeightKg == null || slopeKgPerWeek == null) {
    return { slopeKgPerWeek, projectedGoalDate: null, bufferWeeks: null };
  }
  if (Math.abs(slopeKgPerWeek) < 0.05) {
    return { slopeKgPerWeek, projectedGoalDate: null, bufferWeeks: null };
  }
  const weeksToTarget = (targetWeightKg - currentWeightKg) / slopeKgPerWeek;
  const projectedGoalDate = addDays(anchorDate, weeksToTarget * 7);
  const bufferWeeks = differenceInCalendarDays(goalEndDate, projectedGoalDate) / 7;
  return { slopeKgPerWeek, projectedGoalDate, bufferWeeks };
}

function calculateConsistencyScore(checkin: WeeklyCheckin): number {
  let score = 100;
  if (checkin.trainingPlanned != null) {
    const missed = Math.max(0, checkin.trainingPlanned - checkin.trainingDone);
    score -= missed * 10;
  }
  score -= Math.min(30, checkin.alcoholDrinks * 4);
  score -= checkin.sweetsDays * 5;
  if (checkin.sleepAvgHours < 7) {
    score -= Math.min(20, (7 - checkin.sleepAvgHours) * 5);
  }
  if (checkin.stress1to5 > 3) {
    score -= Math.min(10, (checkin.stress1to5 - 3) * 5);
  }
  return clamp(score, 0, 100);
}

function classifyCorridor(
  ratePctPerWeek: number | null,
  minPct: number,
  maxPct: number,
): CorridorStatus {
  if (ratePctPerWeek == null) return CorridorStatus.n_a;
  const absRate = Math.abs(ratePctPerWeek);
  if (absRate < minPct) return CorridorStatus.too_slow;
  if (absRate > maxPct) return CorridorStatus.too_fast;
  return CorridorStatus.in;
}

export function computeDerivedMetrics(
  checkins: WeeklyCheckin[],
  settings: Settings,
): DerivedResult {
  const sorted = [...checkins].sort((a, b) => a.weekEnding.getTime() - b.weekEnding.getTime());
  const current = sorted[sorted.length - 1];
  const prev = sorted[sorted.length - 2];
  const prevWeightAvg7dKg = prev?.weightAvg7dKg ?? null;
  const deltaKg = prev ? current.weightAvg7dKg - prev.weightAvg7dKg : null;
  const ratePctPerWeek = prev ? (deltaKg! / prev.weightAvg7dKg) * 100 : null;
  const slopeKgPerWeek = calculateSlopeKgPerWeek(sorted);
  const { projectedGoalDate, bufferWeeks } = calculateProjection(
    settings.targetWeightKg,
    settings.goalEndDate,
    slopeKgPerWeek,
    current.weightAvg7dKg,
    current.weekEnding,
  );

  const consistencyScore = calculateConsistencyScore(current);
  const corridorStatus = classifyCorridor(
    ratePctPerWeek,
    settings.targetRateMinPctPerWeek,
    settings.targetRateMaxPctPerWeek,
  );

  return {
    prevWeightAvg7dKg,
    deltaKg,
    ratePctPerWeek,
    slopeKgPerWeek,
    projectedGoalDate,
    bufferWeeks,
    consistencyScore,
    corridorStatus,
  };
}

export function formatBufferMode(bufferMode: BufferMode): string {
  switch (bufferMode) {
    case BufferMode.low:
      return 'Low buffer';
    case BufferMode.medium:
      return 'Medium buffer';
    case BufferMode.high:
      return 'High buffer';
    default:
      return bufferMode;
  }
}

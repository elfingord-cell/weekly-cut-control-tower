'use server';

import { prisma } from '@/lib/prisma';
import { getOrCreateSettings } from '@/lib/settings';
import { checkinSchema } from '@/lib/validation';
import { computeDerivedMetrics } from '@/lib/calculations';
import { generateWeeklyReport } from '@/lib/report';
import { revalidatePath } from 'next/cache';

export async function createCheckin(formData: FormData) {
  const parsed = checkinSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    throw new Error(parsed.error.errors.map((e) => e.message).join(', '));
  }
  const input = parsed.data;
  const settings = await getOrCreateSettings();
  const existingCheckins = await prisma.weeklyCheckin.findMany({ orderBy: { weekEnding: 'asc' } });

  const created = await prisma.$transaction(async (tx) => {
    const newCheckin = await tx.weeklyCheckin.create({
      data: {
        weekEnding: input.weekEnding,
        weightAvg7dKg: input.weightAvg7dKg,
        bfAvgPercent: input.bfAvgPercent,
        trainingPlanned: input.trainingPlanned,
        trainingDone: input.trainingDone,
        alcoholDrinks: input.alcoholDrinks,
        sweetsDays: input.sweetsDays,
        sleepAvgHours: input.sleepAvgHours,
        stress1to5: input.stress1to5,
        note: input.note,
        settings: { connect: { id: settings.id } },
      },
    });

    const derived = computeDerivedMetrics([...existingCheckins, newCheckin], settings);

    await tx.derivedMetrics.create({
      data: {
        checkinId: newCheckin.id,
        prevWeightAvg7dKg: derived.prevWeightAvg7dKg,
        deltaKg: derived.deltaKg,
        ratePctPerWeek: derived.ratePctPerWeek,
        projectedGoalDate: derived.projectedGoalDate,
        bufferWeeks: derived.bufferWeeks,
        consistencyScore: derived.consistencyScore,
        corridorStatus: derived.corridorStatus,
      },
    });

    const reportText = generateWeeklyReport({
      weekEnding: newCheckin.weekEnding,
      weightAvg7dKg: newCheckin.weightAvg7dKg,
      prevWeightAvg7dKg: derived.prevWeightAvg7dKg,
      deltaKg: derived.deltaKg,
      ratePctPerWeek: derived.ratePctPerWeek,
      bfAvgPercent: newCheckin.bfAvgPercent,
      trainingDone: newCheckin.trainingDone,
      trainingPlanned: newCheckin.trainingPlanned,
      alcoholDrinks: newCheckin.alcoholDrinks,
      sweetsDays: newCheckin.sweetsDays,
      sleepAvgHours: newCheckin.sleepAvgHours,
      stress1to5: newCheckin.stress1to5,
      consistencyScore: derived.consistencyScore,
      corridorStatus: derived.corridorStatus,
      targetRateMinPctPerWeek: settings.targetRateMinPctPerWeek,
      targetRateMaxPctPerWeek: settings.targetRateMaxPctPerWeek,
      trendSlopeKgPerWeek: derived.slopeKgPerWeek,
      projectedGoalDate: derived.projectedGoalDate,
      goalEndDate: settings.goalEndDate,
      bufferWeeks: derived.bufferWeeks,
      note: newCheckin.note,
      targetWeightKg: settings.targetWeightKg,
    });

    await tx.reportOutput.create({ data: { checkinId: newCheckin.id, reportText } });

    return newCheckin;
  });

  revalidatePath('/');
  revalidatePath(`/checkin/${created.id}`);
  return created.id;
}

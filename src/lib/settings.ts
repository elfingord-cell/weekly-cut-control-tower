import { BufferMode } from '@prisma/client';
import { prisma } from './prisma';

export async function getOrCreateSettings() {
  const existing = await prisma.settings.findFirst();
  if (existing) return existing;
  return prisma.settings.create({
    data: {
      goalEndDate: new Date(),
      startWeightKg: 80,
      startBfPercent: null,
      targetWeightKg: null,
      targetBfPercent: null,
      targetRateMinPctPerWeek: 0.5,
      targetRateMaxPctPerWeek: 0.7,
      bufferMode: BufferMode.medium,
    },
  });
}

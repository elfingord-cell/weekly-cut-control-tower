import { BufferMode } from '@prisma/client';
import { prisma } from '../src/lib/prisma';

async function main() {
  const existing = await prisma.settings.findFirst();
  if (!existing) {
    await prisma.settings.create({
      data: {
        goalEndDate: new Date(),
        maintenanceStartDate: null,
        maintenanceEndDate: null,
        startWeightKg: 80,
        startBfPercent: null,
        targetWeightKg: null,
        targetBfPercent: null,
        targetRateMinPctPerWeek: 0.5,
        targetRateMaxPctPerWeek: 0.7,
        bufferMode: BufferMode.medium,
      },
    });
    console.log('Seeded default settings');
  } else {
    console.log('Settings already present, skipping');
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

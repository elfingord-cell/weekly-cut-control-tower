import { z } from 'zod';

export const checkinSchema = z.object({
  weekEnding: z.coerce.date(),
  weightAvg7dKg: z.coerce.number().positive(),
  bfAvgPercent: z.union([z.coerce.number().min(0).max(100), z.literal('')]).transform((val) =>
    val === '' ? null : val,
  ),
  trainingPlanned: z.union([z.coerce.number().int().min(0), z.literal('')]).transform((val) =>
    val === '' ? null : val,
  ),
  trainingDone: z.coerce.number().int().min(0),
  alcoholDrinks: z.coerce.number().int().min(0).default(0),
  sweetsDays: z.coerce.number().int().min(0).default(0),
  sleepAvgHours: z.coerce.number().min(0),
  stress1to5: z.coerce.number().int().min(1).max(5).default(3),
  note: z.string().max(1000).optional().transform((val) => (val && val.length ? val : null)),
});

export type CheckinInput = z.infer<typeof checkinSchema>;

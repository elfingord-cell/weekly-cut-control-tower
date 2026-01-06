import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';
import Link from 'next/link';
import { CopyCard } from '@/components/CopyCard';
import { Banner } from '@/components/Banner';

function formatNumber(value: number | null | undefined, digits = 1) {
  if (value == null || Number.isNaN(value)) return 'n/a';
  return value.toFixed(digits);
}

export default async function CheckinDetail({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const checkin = await prisma.weeklyCheckin.findUnique({
    where: { id },
    include: { derivedMetrics: true, reportOutput: true },
  });

  if (!checkin) return notFound();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">Check-in detail</p>
          <h1 className="text-3xl font-bold">Week ending {format(checkin.weekEnding, 'yyyy-MM-dd')}</h1>
        </div>
        <Link href="/" className="text-sky-400 hover:underline">
          Back to dashboard
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card space-y-2">
          <p className="text-sm text-slate-400">Body</p>
          <p className="text-4xl font-bold">{checkin.weightAvg7dKg.toFixed(1)} kg</p>
          <p className="text-slate-300">BF avg: {formatNumber(checkin.bfAvgPercent)}%</p>
          <p className="text-slate-300">Delta: {formatNumber(checkin.derivedMetrics?.deltaKg)} kg</p>
          <p className="text-slate-300">
            Rate: {checkin.derivedMetrics?.ratePctPerWeek == null
              ? 'n/a'
              : `${checkin.derivedMetrics.ratePctPerWeek.toFixed(2)} %/wk`}
          </p>
        </div>

        <div className="card space-y-2">
          <p className="text-sm text-slate-400">Habits</p>
          <p className="text-slate-300">Training: {checkin.trainingDone}{checkin.trainingPlanned != null ? ` / ${checkin.trainingPlanned}` : ''}</p>
          <p className="text-slate-300">Alcohol drinks: {checkin.alcoholDrinks}</p>
          <p className="text-slate-300">Sweets days: {checkin.sweetsDays}</p>
          <p className="text-slate-300">Sleep avg: {checkin.sleepAvgHours.toFixed(1)} h</p>
          <p className="text-slate-300">Stress: {checkin.stress1to5}</p>
        </div>

        <div className="card space-y-2">
          <p className="text-sm text-slate-400">Derived</p>
          <p className="text-slate-300">Consistency score: {checkin.derivedMetrics?.consistencyScore ?? 'n/a'}/100</p>
          <p className="text-slate-300">Corridor: {checkin.derivedMetrics?.corridorStatus ?? 'n/a'}</p>
          <p className="text-slate-300">
            Projected goal date:{' '}
            {checkin.derivedMetrics?.projectedGoalDate
              ? format(checkin.derivedMetrics.projectedGoalDate, 'yyyy-MM-dd')
              : 'n/a'}
          </p>
          <p className="text-slate-300">
            Buffer vs goal:{' '}
            {checkin.derivedMetrics?.bufferWeeks == null
              ? 'n/a'
              : `${checkin.derivedMetrics.bufferWeeks >= 0 ? '+' : ''}${checkin.derivedMetrics.bufferWeeks.toFixed(1)} weeks`}
          </p>
        </div>
      </div>

      {checkin.note && <Banner tone="info">Note: {checkin.note}</Banner>}

      {checkin.reportOutput && <CopyCard text={checkin.reportOutput.reportText} />}
    </div>
  );
}

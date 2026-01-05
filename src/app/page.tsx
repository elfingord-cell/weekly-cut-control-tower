import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getOrCreateSettings } from '@/lib/settings';
import { WeightChart } from '@/components/WeightChart';
import { Banner } from '@/components/Banner';
import { format } from 'date-fns';

function formatNumber(value: number | null | undefined, digits = 1) {
  if (value == null || Number.isNaN(value)) return 'n/a';
  return value.toFixed(digits);
}

export default async function DashboardPage() {
  const settings = await getOrCreateSettings();
  const checkins = await prisma.weeklyCheckin.findMany({
    orderBy: { weekEnding: 'desc' },
    include: { derivedMetrics: true },
  });

  const latest = checkins[0];
  const warningMissingAuth = !process.env.BASIC_AUTH_USER || !process.env.BASIC_AUTH_PASSWORD;

  return (
    <div className="space-y-4">
      {warningMissingAuth && (
        <Banner tone="warning">
          Basic auth is not configured. Set BASIC_AUTH_USER and BASIC_AUTH_PASSWORD to protect the dashboard.
        </Banner>
      )}

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-slate-400">Single-user weekly progress tracker</p>
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>
        <Link
          href="/checkin/new"
          className="bg-sky-500 hover:bg-sky-400 text-slate-900 px-4 py-2 rounded-md font-semibold"
        >
          New Weekly Check-in
        </Link>
      </div>

      {latest ? (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="card space-y-2">
            <p className="text-sm text-slate-400">Latest check-in</p>
            <p className="text-xl font-semibold">Week ending {format(latest.weekEnding, 'yyyy-MM-dd')}</p>
            <p className="text-4xl font-bold">{latest.weightAvg7dKg.toFixed(1)} kg</p>
            <Link href={`/checkin/${latest.id}`} className="text-sky-400 hover:underline text-sm">
              View details
            </Link>
          </div>

          <div className="card space-y-2">
            <p className="text-sm text-slate-400">Trend</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-slate-400">Rate</p>
                <p className="text-lg font-semibold">
                  {latest.derivedMetrics?.ratePctPerWeek == null
                    ? 'n/a'
                    : `${latest.derivedMetrics.ratePctPerWeek.toFixed(2)} %/wk`}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Corridor</p>
                <p className="text-lg font-semibold">{latest.derivedMetrics?.corridorStatus ?? 'n/a'}</p>
              </div>
              <div>
                <p className="text-slate-400">Projected goal date</p>
                <p className="text-lg font-semibold">
                  {latest.derivedMetrics?.projectedGoalDate
                    ? format(latest.derivedMetrics.projectedGoalDate, 'yyyy-MM-dd')
                    : 'n/a'}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Buffer vs goal</p>
                <p className="text-lg font-semibold">
                  {latest.derivedMetrics?.bufferWeeks == null
                    ? 'n/a'
                    : `${latest.derivedMetrics.bufferWeeks >= 0 ? '+' : ''}${latest.derivedMetrics.bufferWeeks.toFixed(
                        1,
                      )} wks`}
                </p>
              </div>
            </div>
          </div>

          <div className="card space-y-2">
            <p className="text-sm text-slate-400">Consistency</p>
            <p className="text-5xl font-bold">
              {latest.derivedMetrics?.consistencyScore ?? 'n/a'}
              <span className="text-base text-slate-400">/100</span>
            </p>
            <p className="text-sm text-slate-400">Alcohol: {latest.alcoholDrinks} • Sleep: {latest.sleepAvgHours.toFixed(1)}h</p>
          </div>
        </div>
      ) : (
        <div className="card">
          <p>No check-ins yet. Start with your first weekly check-in.</p>
        </div>
      )}

      <div className="card table-card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Recent check-ins</h2>
          <p className="text-sm text-slate-400">Goal end date: {format(settings.goalEndDate, 'yyyy-MM-dd')}</p>
        </div>
        {checkins.length === 0 ? (
          <p className="text-slate-400">No data yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table>
              <thead className="text-slate-400 text-sm">
                <tr>
                  <th>Date</th>
                  <th>Weight</th>
                  <th>Delta</th>
                  <th>Rate %/wk</th>
                  <th>Buffer (wks)</th>
                  <th>Consistency</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {checkins.map((c) => (
                  <tr key={c.id} className="border-t border-slate-800/60">
                    <td>{format(c.weekEnding, 'yyyy-MM-dd')}</td>
                    <td>{c.weightAvg7dKg.toFixed(1)} kg</td>
                    <td>{formatNumber(c.derivedMetrics?.deltaKg)} kg</td>
                    <td>
                      {c.derivedMetrics?.ratePctPerWeek == null
                        ? 'n/a'
                        : `${c.derivedMetrics.ratePctPerWeek.toFixed(2)} %`}
                    </td>
                    <td>
                      {c.derivedMetrics?.bufferWeeks == null
                        ? 'n/a'
                        : `${c.derivedMetrics.bufferWeeks >= 0 ? '+' : ''}${c.derivedMetrics.bufferWeeks.toFixed(1)}`}
                    </td>
                    <td>{c.derivedMetrics?.consistencyScore ?? 'n/a'}</td>
                    <td>
                      <Link href={`/checkin/${c.id}`} className="text-sky-400 hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {checkins.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-3">Weight trend</h2>
          <WeightChart checkins={checkins} />
        </div>
      )}
    </div>
  );
}

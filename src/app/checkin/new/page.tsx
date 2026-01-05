import { redirect } from 'next/navigation';
import { createCheckin } from '@/app/actions';
import { Banner } from '@/components/Banner';
import { getOrCreateSettings } from '@/lib/settings';

async function submit(formData: FormData) {
  'use server';
  const id = await createCheckin(formData);
  redirect(`/checkin/${id}`);
}

export default async function NewCheckinPage() {
  const settings = await getOrCreateSettings();
  return (
    <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-slate-400">Weekly check-in</p>
            <h1 className="text-2xl font-bold">Add check-in</h1>
          </div>
        </div>

        <form action={submit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1">
              <span>Week ending</span>
              <input type="date" name="weekEnding" required />
            </label>
            <label className="space-y-1">
              <span>Weight (7d avg) kg</span>
              <input type="number" step="0.1" name="weightAvg7dKg" required />
            </label>
            <label className="space-y-1">
              <span>Body fat % (avg)</span>
              <input type="number" step="0.1" name="bfAvgPercent" />
            </label>
            <label className="space-y-1">
              <span>Training planned (sessions)</span>
              <input type="number" min="0" name="trainingPlanned" />
            </label>
            <label className="space-y-1">
              <span>Training done (sessions)</span>
              <input type="number" min="0" name="trainingDone" required />
            </label>
            <label className="space-y-1">
              <span>Alcohol drinks</span>
              <input type="number" min="0" name="alcoholDrinks" defaultValue={0} />
            </label>
            <label className="space-y-1">
              <span>Sweets days</span>
              <input type="number" min="0" name="sweetsDays" defaultValue={0} />
            </label>
            <label className="space-y-1">
              <span>Sleep avg hours</span>
              <input type="number" step="0.1" name="sleepAvgHours" defaultValue={7} />
            </label>
            <label className="space-y-1">
              <span>Stress (1-5)</span>
              <input type="number" min="1" max="5" name="stress1to5" defaultValue={3} />
            </label>
          </div>

          <label className="space-y-1 block">
            <span>Note</span>
            <textarea name="note" rows={3} placeholder="Optional observations" />
          </label>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="bg-sky-500 hover:bg-sky-400 text-slate-900 px-4 py-2 rounded-md font-semibold"
            >
              Save check-in
            </button>
            <a href="/" className="text-slate-300 hover:underline text-sm">
              Cancel
            </a>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        <div className="card space-y-2 text-sm text-slate-200">
          <p className="text-base font-semibold">Guidance</p>
          <ul className="list-disc list-inside space-y-2 text-slate-300">
            <li>Use the same weigh-in window each week to keep the 7d average consistent.</li>
            <li>Defaults assume 0 drinks, 0 sweets days, 7 hours sleep, stress at 3.</li>
            <li>Training planned is optional; when omitted, consistency ignores missed sessions.</li>
          </ul>
        </div>
        <Banner tone="info">
          Goal end date: {settings.goalEndDate.toISOString().split('T')[0]} — corridor target {settings.targetRateMinPctPerWeek}
          –{settings.targetRateMaxPctPerWeek}%/week.
        </Banner>
      </div>
    </div>
  );
}

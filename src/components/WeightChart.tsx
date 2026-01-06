'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { Line } from 'react-chartjs-2';
import { WeeklyCheckin } from '@prisma/client';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, TimeScale);

export function WeightChart({ checkins }: { checkins: WeeklyCheckin[] }) {
  const sorted = [...checkins].sort((a, b) => a.weekEnding.getTime() - b.weekEnding.getTime());
  const data = {
    labels: sorted.map((c) => c.weekEnding),
    datasets: [
      {
        label: 'Weight (7d avg)',
        data: sorted.map((c) => c.weightAvg7dKg),
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56, 189, 248, 0.2)',
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#e5e7eb' } },
      tooltip: { mode: 'index' as const, intersect: false },
    },
    scales: {
      x: {
        type: 'time' as const,
        ticks: { color: '#cbd5e1' },
        grid: { color: 'rgba(255,255,255,0.08)' },
      },
      y: {
        ticks: { color: '#cbd5e1' },
        grid: { color: 'rgba(255,255,255,0.08)' },
      },
    },
  };

  return <Line data={data} options={options} />;
}

// app/ChartSection.tsx
'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import combinedData from './data/combined_data.json';
import LifeExpectancyChart from './LifeExpectancyChart';

/** Parse YYYY-MM-DD string to Date */
function parseDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00');
}

/**
 * Merge monthly MFI into daily UNH "as of" each day.
 */
function mergeAsOf(
  dailyUNH: { Date: string; Close: number }[],
  monthlyMFI: { Date: string; Income: number }[]
) {
  const unhSorted = [...dailyUNH].sort(
    (a, b) => parseDate(a.Date).getTime() - parseDate(b.Date).getTime()
  );
  const mfiSorted = [...monthlyMFI].sort(
    (a, b) => parseDate(a.Date).getTime() - parseDate(b.Date).getTime()
  );

  let mfiIndex = 0;
  const merged: Array<{ Date: string; Close: number; Income: number }> = [];

  for (const day of unhSorted) {
    const dayTime = parseDate(day.Date).getTime();

    while (mfiIndex < mfiSorted.length - 1) {
      const nextMfi = mfiSorted[mfiIndex + 1];
      if (nextMfi && parseDate(nextMfi.Date).getTime() <= dayTime) {
        mfiIndex++;
      } else {
        break;
      }
    }

    const currentMfi = mfiSorted[mfiIndex];
    merged.push({
      Date: day.Date,
      Close: day.Close,
      Income: currentMfi ? currentMfi.Income : 0
    });
  }

  return merged;
}

/**
 * Compute the cumulative percentage change for both Close and Income values.
 * Only when the median family income changes do we calculate a new cumulative data point.
 */
function cumulativePercentChange(
  data: Array<{ Date: string; Close: number; Income: number }>
) {
  if (!data.length) return [];

  const sorted = [...data].sort(
    (a, b) => parseDate(a.Date).getTime() - parseDate(b.Date).getTime()
  );
  const firstClose = sorted[0]!.Close;
  const firstIncome = sorted[0]!.Income;

  // Start with the baseline record
  const result = [{ Date: sorted[0]!.Date, CumClose: 0, CumIncome: 0 }];
  let prevIncome = firstIncome;

  // Only update cumulative values when income changes
  for (let i = 1; i < sorted.length; i++) {
    const row = sorted[i]!;
    if (row.Income !== prevIncome) {
      const cumIncome = ((row.Income - firstIncome) / firstIncome) * 100;
      const cumClose = ((row.Close - firstClose) / firstClose) * 100;
      result.push({ Date: row.Date, CumClose: cumClose, CumIncome: cumIncome });
      prevIncome = row.Income;
    }
  }

  return result;
}

export default function ChartSection() {
  // 1) Extract UNH and MFI arrays from the JSON
  const unhData = combinedData.unh_data || [];
  const mfiData = combinedData.median_income || [];

  if (!unhData.length || !mfiData.length) {
    return <p>No chart data available</p>;
  }

  // 2) Merge the data and compute cumulative percentage change
  const mergedDaily = useMemo(() => mergeAsOf(unhData, mfiData), [unhData, mfiData]);
  if (!mergedDaily.length) {
    return <p>No merged data found</p>;
  }
  const cumData = useMemo(() => cumulativePercentChange(mergedDaily), [mergedDaily]);

  // Define Claim Denial Rates data
  const claimDenialData = [
    { name: 'United Healthcare', rate: 33 },
    { name: 'Blue Cross', rate: 22 },
    { name: 'Aetna', rate: 22 },
    { name: 'Cigna', rate: 21 },
    { name: 'CareSource', rate: 21 },
    { name: 'Select Health', rate: 19 },
    { name: 'Anthem', rate: 18 },
    { name: 'Oscar', rate: 17 },
    { name: 'Superior Health', rate: 15 },
    { name: 'CHRISTUS', rate: 15 },
    { name: 'Ambetter', rate: 14 },
    { name: 'HealthOptions', rate: 14 },
    { name: 'Celtic', rate: 13 },
    { name: 'Kaiser', rate: 6 }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {/* Cumulative % Change chart */}
      <div className="flex flex-col">
        <div className="relative aspect-square p-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={cumData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="Date"
                tickFormatter={(tick) => String(new Date(tick).getFullYear())}
              />
              <YAxis />
              <Tooltip />
              <Legend verticalAlign="top" align="left" />
              <Line
                type="monotone"
                dataKey="CumClose"
                name="United Healthcare Stock Price"
                stroke="red"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="CumIncome"
                name="Median Family Income (U.S.)"
                stroke="black"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-center text-sm font-semibold text-black opacity-75">
          Cumulative % Change
        </p>
      </div>

      {/* Claim Denial Rates horizontal bar chart */}
      <div className="flex flex-col">
        <div className="relative aspect-square p-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={claimDenialData}
              layout="vertical"
              margin={{ top: 5, bottom: 5, left: 5, right: 40 }}
            >
              {/* Remove grid and legend for a cleaner look */}
              <XAxis type="number" domain={[0, 'dataMax']} hide />
              <YAxis dataKey="name" type="category" width={120} />
              <Tooltip />
              <Bar dataKey="rate">
                {claimDenialData.map((entry, index) => {
                  let fillColor = "#8884d8"; // default color
                  if (entry.name === 'United Healthcare') fillColor = 'red';
                  if (entry.name === 'Kaiser') fillColor = 'lightgreen';
                  return <Cell key={`cell-${index}`} fill={fillColor} />;
                })}
                <LabelList
                  dataKey="rate"
                  position="right"
                  formatter={(value: number): string => `${value}%`}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-center text-sm font-semibold text-black opacity-75">
          Claim Denial Rates (2024)
        </p>
      </div>

      {/* Life Expectancy Chart */}
      <div className="relative aspect-square p-2">
        <LifeExpectancyChart />
      </div>

      {/* Info Card with Background Image */}
      <div
        className="relative flex items-center justify-center p-0 rounded"
        style={{
          backgroundImage: "url('/images/your-background.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Overlay for contrast */}
        <div className="w-full h-full flex flex-col items-center justify-center bg-white bg-opacity-50 p-4 rounded">
          <h3 className="text-xl font-semibold text-black mb-2">More Data</h3>
          <p className="mb-4 text-center text-black">
            Dive deeper into additional healthcare insurance data and charts.
          </p>
          <Link
            href="/Study-1"
            className="inline-block rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 transition"
          >
            Explore
          </Link>
        </div>
      </div>
    </div>
  );
}

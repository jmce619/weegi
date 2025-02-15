// app/ChartSection.tsx
'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import {
  CartesianGrid,
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

  // Start with the baseline record (using non-null assertion for sorted[0])
  const result = [{ Date: sorted[0]!.Date, CumClose: 0, CumIncome: 0 }];
  let prevIncome = firstIncome;

  // Only update cumulative values when income changes
  for (let i = 1; i < sorted.length; i++) {
    const row = sorted[i]!; // assert row is not undefined
    if (row.Income !== prevIncome) {
      const cumIncome = ((row.Income - firstIncome) / firstIncome) * 100;
      const cumClose = ((row.Close - firstClose) / firstClose) * 100;
      result.push({ Date: row.Date, CumClose: cumClose, CumIncome: cumIncome });
      prevIncome = row.Income;
    }
  }

  return result;
}

/**
 * Compute the year-over-year percentage change for Close and Income values.
 */
function yearOverYearChange(
  data: Array<{ Date: string; Close: number; Income: number }>
) {
  if (!data.length) return [];

  const sorted = [...data].sort(
    (a, b) => parseDate(a.Date).getTime() - parseDate(b.Date).getTime()
  );
  const yearMap = new Map<number, { Date: string; Close: number; Income: number }>();

  for (const row of sorted) {
    const y = parseDate(row.Date).getFullYear();
    yearMap.set(y, row);
  }

  const yearlyArr = Array.from(yearMap.entries()).map(([year, row]) => ({
    year,
    Close: row.Close,
    Income: row.Income
  }));
  yearlyArr.sort((a, b) => a.year - b.year);

  const output = [];
  for (let i = 1; i < yearlyArr.length; i++) {
    const prev = yearlyArr[i - 1]!;
    const curr = yearlyArr[i]!;
    const yoyClose = ((curr.Close - prev.Close) / prev.Close) * 100;
    const yoyIncome = ((curr.Income - prev.Income) / prev.Income) * 100;
    output.push({
      Date: String(curr.year),
      YoYClose: yoyClose,
      YoYIncome: yoyIncome
    });
  }
  return output;
}

export default function ChartSection() {
  // 1) Extract UNH + MFI arrays from the JSON
  const unhData = combinedData.unh_data || [];
  const mfiData = combinedData.median_income || [];

  if (!unhData.length || !mfiData.length) {
    return <p>No chart data available</p>;
  }

  // 2) Merge daily UNH with monthly MFI data
  const mergedDaily = useMemo(() => mergeAsOf(unhData, mfiData), [unhData, mfiData]);
  if (!mergedDaily.length) {
    return <p>No merged data found</p>;
  }

  // 3) Compute transformations
  const cumData = useMemo(() => cumulativePercentChange(mergedDaily), [mergedDaily]);
  const yoyData = useMemo(() => yearOverYearChange(mergedDaily), [mergedDaily]);

  return (
    <div className="grid grid-rows-2 grid-cols-2 gap-6">
      {/* Top-left: Cumulative % Change chart */}
      <div className="col-span-1">
        <div className="w-full h-[500px] p-2">
          <h2 className="mb-2 text-lg font-semibold">Cumulative % Change</h2>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={cumData}>
              <CartesianGrid strokeDasharray="3 3" />
              {/* Format x-axis ticks to show only the year */}
              <XAxis dataKey="Date" tickFormatter={(tick) => new Date(tick).getFullYear()} />
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
      </div>

      {/* Top-right: Year-over-Year % Change chart */}
      <div className="col-span-1">
        <div className="w-full h-[500px] p-2">
          <h2 className="mb-2 text-lg font-semibold">Year-over-Year % Change</h2>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={yoyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Date" />
              <YAxis />
              <Tooltip />
              <Legend verticalAlign="top" align="left" />
              <Line
                type="monotone"
                dataKey="YoYClose"
                name="United Healthcare Stock Price"
                stroke="red"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="YoYIncome"
                name="Median Family Income (U.S.)"
                stroke="black"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom-left: Life Expectancy Chart */}
      <div className="col-span-1">
        <div className="w-full h-[500px] p-2">
          <LifeExpectancyChart />
        </div>
      </div>

      {/* Bottom-right: Info Card with Background Image */}
      <div
        className="col-span-1 flex items-center justify-center p-0 rounded shadow-sm"
        style={{
          backgroundImage: "url('/images/your-background.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Overlay for contrast */}
        <div className="w-full h-full flex flex-col items-center justify-center bg-black bg-opacity-50 p-4 rounded">
          <h3 className="text-xl font-semibold text-white mb-2">More Data</h3>
          <p className="mb-4 text-center text-white">
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

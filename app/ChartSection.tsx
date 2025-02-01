'use client';

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

    // Move forward in MFI while next MFI date <= current daily date
    while (
      mfiIndex < mfiSorted.length - 1 &&
      parseDate(mfiSorted[mfiIndex + 1]!.Date).getTime() <= dayTime
    ) {
      mfiIndex++;
    }

    merged.push({
      Date: day.Date,
      Close: day.Close,
      Income: mfiSorted[mfiIndex]!.Income
    });
  }

  return merged;
}

/**
 * Cumulative % change from earliest date: ((val - firstVal)/firstVal)*100
 */
function cumulativePercentChange(
  data: Array<{ Date: string; Close: number; Income: number }>
) {
  if (!data.length) return [];

  // Sorting ensures that the earliest date is at index 0.
  const sorted = [...data].sort(
    (a, b) => parseDate(a.Date).getTime() - parseDate(b.Date).getTime()
  );
  const firstClose = sorted[0]!.Close;
  const firstIncome = sorted[0]!.Income;

  return sorted.map((row) => ({
    Date: row.Date,
    // (UNH)
    CumClose: ((row.Close - firstClose) / firstClose) * 100,
    // (MFI)
    CumIncome: ((row.Income - firstIncome) / firstIncome) * 100
  }));
}

/**
 * Year-over-year %: group daily data by year => last day => yoy = (thisYear - lastYear)/lastYear * 100
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
    yearMap.set(y, row); // Overwrite – keeping the last day of each year
  }

  const yearlyArr = Array.from(yearMap.entries()).map(([year, row]) => ({
    year,
    Close: row.Close,
    Income: row.Income
  }));
  yearlyArr.sort((a, b) => a.year - b.year);

  const output = [];
  for (let i = 1; i < yearlyArr.length; i++) {
    const prev = yearlyArr[i - 1];
    const curr = yearlyArr[i];
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

  // 2) Merge daily UNH + monthly MFI => daily array {Date, Close, Income}
  const mergedDaily = useMemo(() => mergeAsOf(unhData, mfiData), [unhData, mfiData]);
  if (!mergedDaily.length) {
    return <p>No merged data found</p>;
  }

  // 3) Compute transformations
  const cumData = useMemo(() => cumulativePercentChange(mergedDaily), [mergedDaily]);
  const yoyData = useMemo(() => yearOverYearChange(mergedDaily), [mergedDaily]);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* Left: Cumulative % chart */}
      <div className="w-full h-[500px] border p-2">
        <h2 className="mb-2 text-lg font-semibold">Cumulative % Change</h2>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={cumData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="Date" />
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

      {/* Right: Year-over-Year % chart */}
      <div className="w-full h-[500px] border p-2">
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
  );
}

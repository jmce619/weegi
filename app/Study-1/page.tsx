// app/Study-1/page.tsx
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
import combinedData from '../data/combined_data.json';

/** Parse a date string (YYYY-MM-DD) to a Date object */
function parseDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00');
}

/**
 * Merge daily stock data with monthly income data.
 * We assume dailyData has one record per day, and incomeData is reported monthly.
 */
function mergeData(
  dailyData: { Date: string; Close: number }[],
  incomeData: { Date: string; Income: number }[]
) {
  const sortedDaily = [...dailyData].sort(
    (a, b) => parseDate(a.Date).getTime() - parseDate(b.Date).getTime()
  );
  const sortedIncome = [...incomeData].sort(
    (a, b) => parseDate(a.Date).getTime() - parseDate(b.Date).getTime()
  );

  let incomeIndex = 0;
  const merged = [];

  for (let i = 0; i < sortedDaily.length; i++) {
    // Assert that the daily element is defined.
    const daily = sortedDaily[i]!;
    const currentDate = parseDate(daily.Date);

    // As long as there is a next income record and its date is <= currentDate, move forward.
    while (
      incomeIndex < sortedIncome.length - 1 &&
      parseDate(sortedIncome[incomeIndex + 1]!.Date).getTime() <= currentDate.getTime()
    ) {
      incomeIndex++;
    }

    merged.push({
      Date: daily.Date,
      Close: daily.Close,
      // Assert that sortedIncome[incomeIndex] is defined.
      Income: sortedIncome[incomeIndex]!.Income
    });
  }
  return merged;
}

/**
 * Compute the cumulative percentage change for Close and Income.
 * Only update when the Income changes.
 */
function cumulativePercentChange(
  data: Array<{ Date: string; Close: number; Income: number | null }>
) {
  if (!data.length) return [];

  const sorted = [...data].sort(
    (a, b) => parseDate(a.Date).getTime() - parseDate(b.Date).getTime()
  );
  const firstClose = sorted[0]!.Close;
  const firstIncome = sorted[0]!.Income;
  const result = [{ Date: sorted[0]!.Date, CumClose: 0, CumIncome: 0 }];
  let prevIncome = firstIncome;

  // Only update cumulative values when Income changes
  for (let i = 1; i < sorted.length; i++) {
    const row = sorted[i]!; // Assert row is defined.
    if (row.Income !== prevIncome && row.Income !== null && firstIncome !== null) {
      const cumIncome = ((row.Income - firstIncome) / firstIncome) * 100;
      const cumClose = ((row.Close - firstClose) / firstClose) * 100;
      result.push({ Date: row.Date, CumClose: cumClose, CumIncome: cumIncome });
      prevIncome = row.Income;
    }
  }
  return result;
}

/**
 * Compute year-over-year percentage change for Close and Income.
 */
function yearOverYearChange(
  data: Array<{ Date: string; Close: number; Income: number | null }>
) {
  if (!data.length) return [];

  const sorted = [...data].sort(
    (a, b) => parseDate(a.Date).getTime() - parseDate(b.Date).getTime()
  );
  const yearMap = new Map<number, { Date: string; Close: number; Income: number | null }>();

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
    if (prev.Close !== 0 && prev.Income !== null && curr.Income !== null) {
      const yoyClose = ((curr.Close - prev.Close) / prev.Close) * 100;
      const yoyIncome = ((curr.Income - prev.Income) / prev.Income) * 100;
      output.push({
        Date: String(curr.year),
        YoYClose: yoyClose,
        YoYIncome: yoyIncome
      });
    }
  }
  return output;
}

export default function Study1Page() {
  const unhData = combinedData.unh_data || [];
  const incomeData = combinedData.median_income || [];

  if (!unhData.length || !incomeData.length) {
    return <p>No chart data available</p>;
  }

  const mergedData = useMemo(() => mergeData(unhData, incomeData), [unhData, incomeData]);
  if (!mergedData.length) {
    return <p>No merged data found</p>;
  }

  const cumData = useMemo(() => cumulativePercentChange(mergedData), [mergedData]);
  const yoyData = useMemo(() => yearOverYearChange(mergedData), [mergedData]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Study-1: Healthcare Insurance Data</h1>
      <div className="space-y-6">
        {/* Cumulative % Change Chart */}
        <div className="w-full h-[500px] p-2 border rounded">
          <h2 className="mb-2 text-lg font-semibold">Cumulative % Change</h2>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={cumData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="Date"
                tickFormatter={(tick) => new Date(tick).getFullYear().toString()}
              />
              <YAxis />
              <Tooltip />
              <Legend verticalAlign="top" align="left" />
              <Line type="monotone" dataKey="CumClose" name="Stock Price" stroke="red" dot={false} />
              <Line type="monotone" dataKey="CumIncome" name="Median Family Income" stroke="black" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Year-over-Year % Change Chart */}
        <div className="w-full h-[500px] p-2 border rounded">
          <h2 className="mb-2 text-lg font-semibold">Year-over-Year % Change</h2>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={yoyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Date" />
              <YAxis />
              <Tooltip />
              <Legend verticalAlign="top" align="left" />
              <Line type="monotone" dataKey="YoYClose" name="Stock Price" stroke="red" dot={false} />
              <Line type="monotone" dataKey="YoYIncome" name="Median Family Income" stroke="black" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

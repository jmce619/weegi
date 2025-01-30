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

/** Parse "YYYY-MM-DD" into a Date object */
function parseDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00');
}

/** 
 * 1) Rebase both UNH and MFI to 100 starting from a common start date.
 *    We find the LATER of the two min-dates as the start,
 *    then "rebased = (value / valueAtStart) * 100".
 *    We'll return { unh: [...], mfi: [...] } as two separate arrays.
 */
function rebaseTo100(
  unh: Array<{ Date: string; Close: number }>,
  mfi: Array<{ Date: string; Income: number }>
) {
  if (!unh.length || !mfi.length) {
    return { unh: [], mfi: [] };
  }
  // Sort each by date
  const unhSorted = [...unh].sort((a, b) => parseDate(a.Date).getTime() - parseDate(b.Date).getTime());
  const mfiSorted = [...mfi].sort((a, b) => parseDate(a.Date).getTime() - parseDate(b.Date).getTime());

  // Find the "common start" = later of the 2 earliest dates
  const unhStartDate = parseDate(unhSorted[0].Date);
  const mfiStartDate = parseDate(mfiSorted[0].Date);
  const commonStart = new Date(Math.max(unhStartDate.getTime(), mfiStartDate.getTime()));

  // Find the baseClose (UNH) at or after commonStart
  const unhBaseEntry = unhSorted.find(d => parseDate(d.Date) >= commonStart);
  const mfiBaseEntry = mfiSorted.find(d => parseDate(d.Date) >= commonStart);
  if (!unhBaseEntry || !mfiBaseEntry) {
    return { unh: [], mfi: [] };
  }
  const baseClose = unhBaseEntry.Close;
  const baseIncome = mfiBaseEntry.Income;

  // Rebase each array from that date forward
  const unhRebased = unhSorted
    .filter(d => parseDate(d.Date) >= commonStart)
    .map(d => ({
      Date: d.Date,
      RebasedClose: (d.Close / baseClose) * 100
    }));
  const mfiRebased = mfiSorted
    .filter(d => parseDate(d.Date) >= commonStart)
    .map(d => ({
      Date: d.Date,
      RebasedIncome: (d.Income / baseIncome) * 100
    }));

  return { unh: unhRebased, mfi: mfiRebased };
}

/** 
 * 2) Cumulative % change from the first item in each array.
 *    For UNH: ((Close - firstClose)/ firstClose)*100
 *    For MFI: ((Income - firstIncome)/ firstIncome)*100
 */
function cumulativePercentChange(
  unh: Array<{ Date: string; Close: number }>,
  mfi: Array<{ Date: string; Income: number }>
) {
  if (!unh.length || !mfi.length) {
    return { unh: [], mfi: [] };
  }
  const unhSorted = [...unh].sort((a, b) => parseDate(a.Date).getTime() - parseDate(b.Date).getTime());
  const mfiSorted = [...mfi].sort((a, b) => parseDate(a.Date).getTime() - parseDate(b.Date).getTime());

  const firstClose = unhSorted[0].Close;
  const firstIncome = mfiSorted[0].Income;

  const unhPct = unhSorted.map(d => ({
    Date: d.Date,
    CumClose: ((d.Close - firstClose) / firstClose) * 100
  }));
  const mfiPct = mfiSorted.map(d => ({
    Date: d.Date,
    CumIncome: ((d.Income - firstIncome) / firstIncome) * 100
  }));

  return { unh: unhPct, mfi: mfiPct };
}

/** 
 * 3) Year-over-year % change:
 *    - For UNH: group by year, take last daily close
 *    - For MFI: group by year, take last entry
 *    yoyClose = ((thisYearClose - lastYearClose)/ lastYearClose)*100
 *    yoyIncome= ((thisYearIncome- lastYearIncome)/ lastYearIncome)*100
 */
function yearOverYearChange(
  unh: Array<{ Date: string; Close: number }>,
  mfi: Array<{ Date: string; Income: number }>
) {
  if (!unh.length || !mfi.length) {
    return { unh: [], mfi: [] };
  }

  function groupByYear<T extends { Date: string; value: number }>(arr: T[]) {
    // Sort ascending
    arr.sort((a, b) => parseDate(a.Date).getTime() - parseDate(b.Date).getTime());
    const map = new Map<number, T>();
    for (const row of arr) {
      const year = parseDate(row.Date).getFullYear();
      map.set(year, row); // overwrite => last row in that year
    }
    // Return array
    const result: Array<{ year: number; value: number }> = [];
    for (const [year, row] of map.entries()) {
      result.push({ year, value: row.value });
    }
    result.sort((a, b) => a.year - b.year);
    return result;
  }

  // 1. Convert UNH => {Date, value=Close}, MFI => {Date, value=Income}
  const unhArr = unh.map(d => ({ Date: d.Date, value: d.Close }));
  const mfiArr = mfi.map(d => ({ Date: d.Date, value: d.Income }));

  const unhYearly = groupByYear(unhArr);
  const mfiYearly = groupByYear(mfiArr);

  // 2. yoy calculation
  function yoy(data: Array<{ year: number; value: number }>) {
    const output = [];
    for (let i = 1; i < data.length; i++) {
      const prev = data[i - 1];
      const curr = data[i];
      const pct = ((curr.value - prev.value) / prev.value) * 100;
      output.push({ Date: String(curr.year), yoyPct: pct });
    }
    return output;
  }

  return {
    unh: yoy(unhYearly).map(d => ({ Date: d.Date, YoYClose: d.yoyPct })),
    mfi: yoy(mfiYearly).map(d => ({ Date: d.Date, YoYIncome: d.yoyPct }))
  };
}

export default function ChartSection() {
  // 1) We have 2 arrays in combinedData: unh_data, median_income
  const unhData = combinedData.unh_data || [];
  const mfiData = combinedData.median_income || [];

  // If either array is empty, show fallback
  if (!unhData.length || !mfiData.length) {
    return <p>No chart data available</p>;
  }

  // 2) Compute 3 transformations
  const rebased = useMemo(() => rebaseTo100(unhData, mfiData), [unhData, mfiData]);
  const cumPct = useMemo(() => cumulativePercentChange(unhData, mfiData), [unhData, mfiData]);
  const yoy = useMemo(() => yearOverYearChange(unhData, mfiData), [unhData, mfiData]);

  // Next, each transformation returns 2 arrays: one for UNH, one for MFI.
  // We'll unify them for Recharts: match items by date so we can plot 2 lines on one chart.

  function mergeByDate(
    arrA: Array<{ Date: string; [key: string]: number }>,
    arrB: Array<{ Date: string; [key: string]: number }>
  ) {
    // naive approach: for each date in arrA, find matching date in arrB
    const merged: Array<{ Date: string; [key: string]: number }> = [];
    arrA.forEach(itemA => {
      const itemB = arrB.find(b => b.Date === itemA.Date);
      merged.push({ ...itemA, ...itemB });
    });
    return merged;
  }

  // 1) Rebased => unh[], mfi[]
  const rebasedChartData = mergeByDate(rebased.unh, rebased.mfi);
  // 2) Cumulative => unh[], mfi[]
  const cumChartData = mergeByDate(cumPct.unh, cumPct.mfi);
  // 3) yoy => unh[], mfi[]
  const yoyChartData = mergeByDate(yoy.unh, yoy.mfi);

  return (
    <div>
      {/* (A) Rebased Chart */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-2">Rebased to 100</h2>
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <LineChart data={rebasedChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="RebasedClose"
                name="UNH (rebased)"
                stroke="#8884d8"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="RebasedIncome"
                name="MFI (rebased)"
                stroke="#82ca9d"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* (B) Cumulative % Chart */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-2">Cumulative % Change</h2>
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <LineChart data={cumChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="CumClose"
                name="UNH % from Start"
                stroke="#8884d8"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="CumIncome"
                name="MFI % from Start"
                stroke="#82ca9d"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* (C) Year-Over-Year % Change */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-2">Year-over-Year % Change</h2>
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <LineChart data={yoyChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="YoYClose"
                name="UNH YoY %"
                stroke="#8884d8"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="YoYIncome"
                name="MFI YoY %"
                stroke="#82ca9d"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}

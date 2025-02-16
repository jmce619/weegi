// app/Study-1/page.tsx
'use client';

import { useMemo, useState } from 'react';
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
import combinedData from '../data/combined_stock_income.json';

/** Helper: Convert a "YYYY-MM-DD" string into a Date object */
function parseDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00');
}

/**
 * Merge the daily stock data with the median income data.
 * We use UNH’s daily data as the base.
 * For each daily record we also:
 *   - Pull the corresponding values from Centene, Cigna, and Aetna by index.
 *   - "As‑of" merge the median income data: pick the most recent income record
 *     whose Date is ≤ the daily record’s Date.
 */
function mergeStockAndIncomeData() {
  const unhData = combinedData.unh_data || [];
  const centeneData = combinedData.centene_data || [];
  const cignaData = combinedData.cigna_data || [];
  const aetnaData = combinedData.aetna_data || [];
  const incomeData = combinedData.median_income || [];

  // Ensure income data is sorted (ascending by date)
  const sortedIncome = [...incomeData].sort(
    (a, b) => parseDate(a.Date).getTime() - parseDate(b.Date).getTime()
  );

  // Use the earliest income value as a fallback.
  // (Non-null assertion because we expect at least one income record.)
  const baselineIncome = sortedIncome[0]!.Income;

  let incomeIndex = 0;
  const merged = unhData.map((record, i) => {
    const currentDate = parseDate(record.Date);
    // Advance incomeIndex if the next income record's date is not later than the current date.
    while (
      incomeIndex < sortedIncome.length - 1 &&
      parseDate(sortedIncome[incomeIndex + 1]!.Date).getTime() <= currentDate.getTime()
    ) {
      incomeIndex++;
    }
    return {
      Date: record.Date,
      UNH: record.Close,
      Centene: centeneData[i] ? centeneData[i].Close : null,
      Cigna: cignaData[i] ? cignaData[i].Close : null,
      Aetna: aetnaData[i] ? aetnaData[i].Close : null,
      // Always use a number (fallback to baselineIncome if undefined)
      Income: sortedIncome[incomeIndex]?.Income ?? baselineIncome
    };
  });
  return merged;
}

/**
 * Compute the cumulative percentage change relative to the first value.
 */
function cumulativePercentChange(
  data: Array<{
    Date: string;
    UNH: number;
    Centene: number | null;
    Cigna: number | null;
    Aetna: number | null;
    Income: number;
  }>
) {
  if (!data.length) return [];
  const sorted = [...data].sort(
    (a, b) => parseDate(a.Date).getTime() - parseDate(b.Date).getTime()
  );
  const firstUNH = sorted[0]!.UNH;
  const firstCentene = sorted[0]!.Centene;
  const firstCigna = sorted[0]!.Cigna;
  const firstAetna = sorted[0]!.Aetna;
  const firstIncome = sorted[0]!.Income;

  return sorted.map(row => ({
    Date: row.Date,
    CumUNH: ((row.UNH - firstUNH) / firstUNH) * 100,
    CumCentene:
      firstCentene !== null && row.Centene !== null
        ? ((row.Centene - firstCentene) / firstCentene) * 100
        : null,
    CumCigna:
      firstCigna !== null && row.Cigna !== null
        ? ((row.Cigna - firstCigna) / firstCigna) * 100
        : null,
    CumAetna:
      firstAetna !== null && row.Aetna !== null
        ? ((row.Aetna - firstAetna) / firstAetna) * 100
        : null,
    CumIncome: ((row.Income - firstIncome) / firstIncome) * 100
  }));
}

/**
 * Compute the "rebased to 100" values.
 * Each series is scaled so that its first value becomes 100.
 */
function rebaseTo100(
  data: Array<{
    Date: string;
    UNH: number;
    Centene: number | null;
    Cigna: number | null;
    Aetna: number | null;
    Income: number;
  }>
) {
  if (!data.length) return [];
  const sorted = [...data].sort(
    (a, b) => parseDate(a.Date).getTime() - parseDate(b.Date).getTime()
  );
  const firstUNH = sorted[0]!.UNH;
  const firstCentene = sorted[0]!.Centene;
  const firstCigna = sorted[0]!.Cigna;
  const firstAetna = sorted[0]!.Aetna;
  const firstIncome = sorted[0]!.Income;

  return sorted.map(row => ({
    Date: row.Date,
    RebUNH: (row.UNH / firstUNH) * 100,
    RebCentene:
      firstCentene !== null && row.Centene !== null ? (row.Centene / firstCentene) * 100 : null,
    RebCigna:
      firstCigna !== null && row.Cigna !== null ? (row.Cigna / firstCigna) * 100 : null,
    RebAetna:
      firstAetna !== null && row.Aetna !== null ? (row.Aetna / firstAetna) * 100 : null,
    RebIncome: (row.Income / firstIncome) * 100
  }));
}

/**
 * Compute the Year-over-Year percentage change.
 * We group by year (using the last available daily record of that year)
 * and compare each year to the previous.
 */
function yearOverYearChange(
  data: Array<{
    Date: string;
    UNH: number;
    Centene: number | null;
    Cigna: number | null;
    Aetna: number | null;
    Income: number;
  }>
) {
  if (!data.length) return [];
  const sorted = [...data].sort(
    (a, b) => parseDate(a.Date).getTime() - parseDate(b.Date).getTime()
  );

  // Group the data by year using the last record for each year.
  const yearly = new Map<number, typeof sorted[0]>();
  sorted.forEach(record => {
    const year = parseDate(record.Date).getFullYear();
    yearly.set(year, record);
  });

  // Sort years numerically
  const years = Array.from(yearly.keys()).sort((a, b) => a - b);
  const results = [];
  for (let i = 1; i < years.length; i++) {
    const prevYear = years[i - 1]!;
    const currYear = years[i]!;
    const prevRecord = yearly.get(prevYear)!;
    const currRecord = yearly.get(currYear)!;
    results.push({
      Date: String(currYear),
      YoYUNH: ((currRecord.UNH - prevRecord.UNH) / prevRecord.UNH) * 100,
      YoYCentene:
        prevRecord.Centene !== null && currRecord.Centene !== null
          ? ((currRecord.Centene - prevRecord.Centene) / prevRecord.Centene) * 100
          : null,
      YoYCigna:
        prevRecord.Cigna !== null && currRecord.Cigna !== null
          ? ((currRecord.Cigna - prevRecord.Cigna) / prevRecord.Cigna) * 100
          : null,
      YoYAetna:
        prevRecord.Aetna !== null && currRecord.Aetna !== null
          ? ((currRecord.Aetna - prevRecord.Aetna) / prevRecord.Aetna) * 100
          : null,
      YoYIncome: ((currRecord.Income - prevRecord.Income) / prevRecord.Income) * 100
    });
  }
  return results;
}

export default function StudyOnePage() {
  // Set the active tab to one of three options.
  const [activeTab, setActiveTab] = useState<'cumulative' | 'rebased' | 'yoy'>('cumulative');

  // Merge the stock and income data
  const mergedData = useMemo(() => mergeStockAndIncomeData(), []);

  // Compute the three transformations
  const cumData = useMemo(() => cumulativePercentChange(mergedData), [mergedData]);
  const rebData = useMemo(() => rebaseTo100(mergedData), [mergedData]);
  const yoyData = useMemo(() => yearOverYearChange(mergedData), [mergedData]);

  // Determine which chart to render based on the active tab.
  // Determine which chart to render based on the active tab.
let chartContent: React.ReactElement = <></>; // Default fallback

if (activeTab === 'cumulative') {
  chartContent = (
    <LineChart data={cumData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis
        dataKey="Date"
        tickFormatter={(tick) => new Date(tick).getFullYear().toString()}
      />
      <YAxis />
      <Tooltip />
      <Legend verticalAlign="top" align="left" />
      <Line type="monotone" dataKey="CumUNH" name="UNH" stroke="red" dot={false} />
      <Line type="monotone" dataKey="CumCentene" name="Centene" stroke="blue" dot={false} />
      <Line type="monotone" dataKey="CumCigna" name="Cigna" stroke="green" dot={false} />
      <Line type="monotone" dataKey="CumAetna" name="Aetna" stroke="orange" dot={false} />
      <Line type="monotone" dataKey="CumIncome" name="Median Income" stroke="black" dot={false} />
    </LineChart>
  );
} else if (activeTab === 'rebased') {
  chartContent = (
    <LineChart data={rebData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis
        dataKey="Date"
        tickFormatter={(tick) => new Date(tick).getFullYear().toString()}
      />
      <YAxis />
      <Tooltip />
      <Legend verticalAlign="top" align="left" />
      <Line type="monotone" dataKey="RebUNH" name="UNH" stroke="red" dot={false} />
      <Line type="monotone" dataKey="RebCentene" name="Centene" stroke="blue" dot={false} />
      <Line type="monotone" dataKey="RebCigna" name="Cigna" stroke="green" dot={false} />
      <Line type="monotone" dataKey="RebAetna" name="Aetna" stroke="orange" dot={false} />
      <Line type="monotone" dataKey="RebIncome" name="Median Income" stroke="black" dot={false} />
    </LineChart>
  );
} else if (activeTab === 'yoy') {
  chartContent = (
    <LineChart data={yoyData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="Date" />
      <YAxis />
      <Tooltip />
      <Legend verticalAlign="top" align="left" />
      <Line type="monotone" dataKey="YoYUNH" name="UNH" stroke="red" dot={false} />
      <Line type="monotone" dataKey="YoYCentene" name="Centene" stroke="blue" dot={false} />
      <Line type="monotone" dataKey="YoYCigna" name="Cigna" stroke="green" dot={false} />
      <Line type="monotone" dataKey="YoYAetna" name="Aetna" stroke="orange" dot={false} />
      <Line type="monotone" dataKey="YoYIncome" name="Median Income" stroke="black" dot={false} />
    </LineChart>
  );
}

return (
  <div className="w-full h-[500px] p-2 border">
    <ResponsiveContainer width="100%" height="100%">
      {chartContent}
    </ResponsiveContainer>
  </div>
);

}

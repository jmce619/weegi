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
import combinedData from '../data/combined_data.json';

/** Helper: parse "YYYY-MM-DD" into JS Date. */
function parseDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00');
}

/** Merge monthly MFI data into daily UNH data "as of" each day. */
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
    while (
      mfiIndex < mfiSorted.length - 1 &&
      parseDate(mfiSorted[mfiIndex + 1].Date).getTime() <= dayTime
    ) {
      mfiIndex++;
    }
    merged.push({
      Date: day.Date,
      Close: day.Close,
      Income: mfiSorted[mfiIndex].Income
    });
  }

  return merged;
}

/** (1) Rebase => (value / baseValue)*100 */
function rebaseTo100(data: Array<{ Date: string; Close: number; Income: number }>) {
  if (!data.length) return [];
  const sorted = [...data].sort((a, b) => parseDate(a.Date).getTime() - parseDate(b.Date).getTime());
  const baseClose = sorted[0].Close;
  const baseIncome = sorted[0].Income;

  return sorted.map((d) => ({
    Date: d.Date,
    CloseVal: (d.Close / baseClose) * 100,
    IncomeVal: (d.Income / baseIncome) * 100
  }));
}

/** (2) Cumulative => ((value - firstValue)/ firstValue)*100 */
function cumulativePercentChange(data: Array<{ Date: string; Close: number; Income: number }>) {
  if (!data.length) return [];
  const sorted = [...data].sort((a, b) => parseDate(a.Date).getTime() - parseDate(b.Date).getTime());
  const firstClose = sorted[0].Close;
  const firstIncome = sorted[0].Income;

  return sorted.map((d) => ({
    Date: d.Date,
    CloseVal: ((d.Close - firstClose) / firstClose) * 100,
    IncomeVal: ((d.Income - firstIncome) / firstIncome) * 100
  }));
}

/** 
 * (3) Year-over-year => group daily by year => last day => yoy = ((thisYear - lastYear)/ lastYear)*100
 */
function yearOverYearChange(data: Array<{ Date: string; Close: number; Income: number }>) {
  if (!data.length) return [];
  const sorted = [...data].sort((a, b) => parseDate(a.Date).getTime() - parseDate(b.Date).getTime());
  const yearMap = new Map<number, { Date: string; Close: number; Income: number }>();

  for (const row of sorted) {
    const y = parseDate(row.Date).getFullYear();
    // Overwrite => last day in that year
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
    const prev = yearlyArr[i - 1];
    const curr = yearlyArr[i];
    const yoyClose = ((curr.Close - prev.Close) / prev.Close) * 100;
    const yoyIncome = ((curr.Income - prev.Income) / prev.Income) * 100;
    output.push({
      Date: String(curr.year), // We'll store year as 'Date'
      CloseVal: yoyClose,       // Unified key: 'CloseVal'
      IncomeVal: yoyIncome      // Unified key: 'IncomeVal'
    });
  }
  return output;
}

export default function HealthcareStudyPage() {
  // 1) Load data from JSON
  const unhData = combinedData.unh_data || [];
  const mfiData = combinedData.median_income || [];
  if (!unhData.length || !mfiData.length) {
    return <p>No data found.</p>;
  }

  // 2) Merge daily + monthly => daily array { Date, Close, Income }
  const mergedDaily = useMemo(() => mergeAsOf(unhData, mfiData), [unhData, mfiData]);
  if (!mergedDaily.length) {
    return <p>No merged data found.</p>;
  }

  // 3) Build three different transformations, all in the same shape:
  //    { Date, CloseVal, IncomeVal }
  const rebaseData = useMemo(() => rebaseTo100(mergedDaily), [mergedDaily]);
  const cumulativeData = useMemo(() => cumulativePercentChange(mergedDaily), [mergedDaily]);
  const yoyData = useMemo(() => yearOverYearChange(mergedDaily), [mergedDaily]);

  // 4) Put them in a dictionary for easy switching
  const dataSets = {
    rebased: rebaseData,
    cumulative: cumulativeData,
    yoy: yoyData
  };

  // Manage which dataset is currently displayed
  const [activeTab, setActiveTab] = useState<'rebased' | 'cumulative' | 'yoy'>('rebased');
  const displayData = dataSets[activeTab];

  // Tab labels
  const tabs = [
    { key: 'rebased', label: 'Rebased to 100' },
    { key: 'cumulative', label: 'Cumulative % Change' },
    { key: 'yoy', label: 'Year-over-Year % Change' }
  ];

  return (
    <main className="p-4 mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold mb-6">Healthcare Data (Tabbed Chart)</h1>

      {/* Tabs */}
      <div className="mb-4 flex space-x-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as 'rebased' | 'cumulative' | 'yoy')}
            className={`px-4 py-2 rounded ${
              activeTab === t.key ? 'bg-blue-500 text-white' : 'bg-gray-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Single Chart - we switch data sets based on activeTab */}
      <div className="w-full h-[500px] border p-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={displayData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="Date" />
            <YAxis />
            <Tooltip />
            <Legend verticalAlign="top" align="left" />
            {/* 
              We map 'CloseVal' -> UNH, 'IncomeVal' -> MFI
              Orange for UNH, Blue for MFI
            */}
            <Line
              type="monotone"
              dataKey="CloseVal"
              name="United Healthcare Stock Price"
              stroke="orange"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="IncomeVal"
              name="Median Family Income (U.S.)"
              stroke="blue"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </main>
  );
}

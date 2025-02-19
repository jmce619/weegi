// components/CumulativeChart.tsx
'use client';

import { useMemo } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import combinedData from '../app/data/combined_stock_income.json';

/** Parse a "YYYY-MM-DD" string into a Date object */
function parseDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00');
}

/**
 * Merge daily UNH data with median income data.
 */
function mergeStockAndIncomeData() {
  const unhData = combinedData.unh_data || [];
  const centeneData = combinedData.centene_data || [];
  const cignaData = combinedData.cigna_data || [];
  const aetnaData = combinedData.aetna_data || [];
  const incomeData = combinedData.median_income || [];

  const sortedIncome = [...incomeData].sort(
    (a, b) => parseDate(a.Date).getTime() - parseDate(b.Date).getTime()
  );
  // Fallback: use earliest income value.
  const baselineIncome = sortedIncome[0]!.Income;

  let incomeIndex = 0;
  const merged = unhData.map((record, i) => {
    const currentDate = parseDate(record.Date);
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
      Income: sortedIncome[incomeIndex]?.Income ?? baselineIncome
    };
  });
  return merged;
}

/**
 * Compute cumulative percentage change relative to the first record.
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

export default function CumulativeChart() {
  const mergedData = useMemo(() => mergeStockAndIncomeData(), []);
  const cumData = useMemo(() => cumulativePercentChange(mergedData), [mergedData]);

  return (
    // Updated container: use h-full so it fills the parent's dimensions
    <div className="w-full h-full p-1 relative">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={cumData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="Date"
            tickFormatter={(tick) => new Date(tick).getFullYear().toString()}
            tick={{ fontSize: '10px' }}
          />
          <YAxis tick={{ fontSize: '10px' }} />
          <Tooltip contentStyle={{ fontSize: '10px' }} />
          <Line type="monotone" dataKey="CumUNH" name="UNH" stroke="red" dot={false} />
          <Line type="monotone" dataKey="CumCentene" name="Centene" stroke="blue" dot={false} />
          <Line type="monotone" dataKey="CumCigna" name="Cigna" stroke="green" dot={false} />
          <Line type="monotone" dataKey="CumAetna" name="Aetna" stroke="orange" dot={false} />
          <Line type="monotone" dataKey="CumIncome" name="Median Income" stroke="black" dot={false} />
        </LineChart>
      </ResponsiveContainer>
      {/* Custom legend overlay */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          left: 70,
          fontSize: '9px',
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          padding: '5px',
          borderRadius: '4px'
        }}
      >
        <div style={{ color: 'red' }}>UNH</div>
        <div style={{ color: 'blue' }}>Centene</div>
        <div style={{ color: 'green' }}>Cigna</div>
        <div style={{ color: 'orange' }}>Aetna</div>
        <div style={{ color: 'black' }}>Median Income</div>
      </div>
    </div>
  );
}

'use client';

import Papa from 'papaparse';
import { useEffect, useState } from 'react';
import {
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

export default function LifeExpectancyChart() {
  const [chartData, setChartData] = useState<
    Array<{ Year: string; [country: string]: string | number }>
  >([]);

  useEffect(() => {
    // Fetch and parse the CSV from public/life_expectancy.csv
    Papa.parse('/life_expectancy.csv', {
      download: true,
      header: true,       // Use first row as headers
      dynamicTyping: true, // Convert numeric strings to numbers
      complete: (results) => {
        setChartData(results.data as Array<{ Year: string; [country: string]: any }>);
      },
      error: (err) => {
        console.error('Error parsing CSV:', err);
      }
    });
  }, []);

  if (!chartData.length) {
    return <p>Loading life expectancy data...</p>;
  }

  return (
    <div className="w-full h-[500px] p-2">
      <h2 className="mb-2 text-lg font-semibold">
        Life Expectancy (From CSV 2009 - 2021)
      </h2>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          {/* Removed the CartesianGrid to eliminate the background grid */}
          <XAxis dataKey="Year" />
          {/* Force the Y-axis to show a range from 76 to 86 and format ticks to one decimal place */}
          <YAxis
            domain={[76, 86]}
            tickFormatter={(tick) => tick.toFixed(1)}
          />
          <Tooltip />
          <Legend verticalAlign="top" align="left" />
          <Line type="monotone" dataKey="United Kingdom" name="UK" stroke="#8884d8" dot={false} />
          <Line type="monotone" dataKey="United States" name="US" stroke="#82ca9d" dot={false} />
          <Line type="monotone" dataKey="Canada" name="Canada" stroke="#ff7300" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

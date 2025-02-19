// app/LifeExpectancyChart.tsx
'use client';

import Papa from 'papaparse';
import { useEffect, useState } from 'react';
import {
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
        setChartData(
          results.data as Array<{ Year: string; [country: string]: any }>
        );
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
    // Set the container to relative to position the overlay correctly
    <div className="w-full h-[500px] p-2 relative">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          {/* Style the ticks to be small */}
          <XAxis dataKey="Year" tick={{ fontSize: '10px' }} />
          <YAxis
            domain={[76, 86]}
            tickFormatter={(tick) => tick.toFixed(1)}
            tick={{ fontSize: '10px' }}
          />
          <Tooltip />
          {/* Built-in Legend removed */}
          <Line
            type="monotone"
            dataKey="United Kingdom"
            name="UK"
            stroke="#8884d8"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="United States"
            name="US"
            stroke="#82ca9d"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="Canada"
            name="Canada"
            stroke="#ff7300"
            dot={false}
          />
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
        <div style={{ color: '#8884d8' }}>UK</div>
        <div style={{ color: '#82ca9d' }}>US</div>
        <div style={{ color: '#ff7300' }}>Canada</div>
      </div>
      <h2 className="mt-2 text-sm font-semibold text-black opacity-75 text-center">
        Life Expectancy
      </h2>
    </div>
  );
}

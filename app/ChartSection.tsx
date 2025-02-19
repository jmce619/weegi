// app/ChartSection.tsx
'use client';

import CumulativeChart from 'components/CumulativeChart';
import Link from 'next/link';
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import LifeExpectancyChart from './LifeExpectancyChart';

export default function ChartSection() {
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
    <div className="grid grid-rows-2 grid-cols-2 gap-6">
      {/* Top-left: Cumulative Chart */}
      <div className="col-span-1">
        <CumulativeChart />
      </div>

      {/* Top-right: Claim Denial Rates bar chart */}
      <div className="col-span-1">
        <div className="w-full h-[500px] p-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={claimDenialData}
              layout="vertical"
              margin={{ top: 5, bottom: 5, left: 5, right: 40 }}
            >
              {/* Grid removed for a cleaner look */}
              <XAxis type="number" domain={[0, 'dataMax']} hide />
              <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: '10px' }} />
              <Tooltip contentStyle={{ fontSize: '10px' }} />
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
                  style={{ fontSize: '10px', fill: 'black', fontWeight: 'bold' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="mt-2 text-center text-xs font-semibold text-black opacity-75">
            Claim Denial Rates (2024)
          </p>
        </div>
      </div>

      {/* Bottom-left: Life Expectancy Chart */}
      <div className="relative aspect-square p-2">
        <LifeExpectancyChart />
      </div>

      {/* Bottom-right: Info Card */}
      <div
        className="relative flex items-center justify-center p-0 rounded"
        style={{
          backgroundImage: "url('/images/your-background.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
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

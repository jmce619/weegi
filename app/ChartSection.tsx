// app/ChartSection.tsx
'use client';

import CumulativeChart from 'components/CumulativeChart';
import Link from 'next/link';
import { useEffect, useState } from 'react';
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

// Custom hook to detect mobile viewport (width < 768px)
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 768);
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
}

export default function ChartSection() {
  const isMobile = useIsMobile();

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
    <div className="grid grid-cols-2 gap-6">
      {/* Top-left: Cumulative Chart with title overlay */}
      <div className="relative aspect-square">
        <CumulativeChart />
        <div className="absolute top-0 left-0 w-full p-1 z-10">
          <h3 className="text-xs md:text-base font-bold text-center bg-white bg-opacity-75">
            Healthcare Insurance Stocks vs Median Family Income (% Change)
          </h3>
        </div>
      </div>

      {/* Top-right: Claim Denial Rates Bar Chart */}
      <div className="relative aspect-square">
        <div className="w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={claimDenialData}
              layout="vertical"
              margin={{ top: 5, bottom: 5, left: 5, right: 40 }}
            >
              {/* Hide ticks on mobile, show them on larger screens */}
              <XAxis
                type="number"
                domain={[0, 'dataMax']}
                tick={isMobile ? false : { fontSize: '10px' }}
                hide={false}
              />
              <YAxis
                type="category"
                tick={isMobile ? false : { fontSize: '10px' }}
              />
              <Tooltip contentStyle={{ fontSize: isMobile ? '8px' : '10px' }} />
              <Bar dataKey="rate">
                {claimDenialData.map((entry, index) => {
                  let fillColor = "#8884d8";
                  if (entry.name === 'United Healthcare') fillColor = 'red';
                  if (entry.name === 'Kaiser') fillColor = 'lightgreen';
                  return <Cell key={`cell-${index}`} fill={fillColor} />;
                })}
                {/* Insurance name inside the bar */}
                <LabelList
                  dataKey="name"
                  position="insideLeft"
                  style={{
                    fontSize: isMobile ? '8px' : '10px',
                    fill: 'white',
                    fontWeight: 'bold'
                  }}
                />
                {/* Percentage value outside the bar */}
                <LabelList
                  dataKey="rate"
                  position="right"
                  formatter={(value: number): string => `${value}%`}
                  style={{
                    fontSize: isMobile ? '8px' : '10px',
                    fill: 'black',
                    fontWeight: 'bold'
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-1 text-center text-xs font-semibold text-black opacity-75">
          Claim Denial Rates (2024)
        </p>
      </div>

      {/* Bottom-left: Life Expectancy Chart */}
      <div className="relative aspect-square">
        <LifeExpectancyChart />
      </div>

      {/* Bottom-right: Info Card */}
      <div className="relative aspect-square">
        <div
          className="flex items-center justify-center rounded h-full"
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
    </div>
  );
}

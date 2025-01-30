'use client';

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

interface ChartDataPoint {
  Date: string;
  Close?: number;
  Income?: number;
}

export default function TwoLineChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <div className="w-full h-64">
      {/* ResponsiveContainer will size the chart to its parent container */}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="Date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="Close" stroke="#8884d8" name="UNH Close Price" dot={false}/>
          <Line type="monotone" dataKey="Income" stroke="#82ca9d" name="Median Family Income" dot={false}/>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

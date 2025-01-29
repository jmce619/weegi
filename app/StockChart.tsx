'use client';

import { CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts';

interface StockDataPoint {
  date: string;       // e.g. "2023-08-10"
  price: number;      // e.g. 100.23
}

export default function StockChart({ data }: { data: StockDataPoint[] }) {
  return (
    <div className="w-full overflow-x-auto">
      <LineChart
        width={600}      // set a fixed width, or manage via responsive container
        height={300}
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis domain={['auto', 'auto']} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="price" stroke="#8884d8" dot={false} />
      </LineChart>
    </div>
  );
}

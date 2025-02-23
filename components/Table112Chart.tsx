'use client';

import { useEffect, useState } from 'react';
import { Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface Table112Data {
  year: number;
  ValueB: number;
  ValueC: number;
}

export default function Table112Chart() {
  const [data, setData] = useState<Table112Data[]>([]);

  useEffect(() => {
    fetch('/table_1_12.json')
      .then(res => res.json())
      .then((jsonData) => {
        jsonData.sort((a: Table112Data, b: Table112Data) => a.year - b.year);
        setData(jsonData);
      })
      .catch(err => console.error('Error fetching table data:', err));
  }, []);

  const dataLength = data?.length ?? 0;

  // Custom dot render function for ValueB with filled dots to mask the line
  const renderCustomDotB = (props: any): JSX.Element => {
    const { cx, cy, index, payload } = props;
    const dot = (
      <circle
        key={`dotB-circle-${index}`}
        cx={cx}
        cy={cy}
        r={4}
        fill="white"
        stroke="#ff7300"
        strokeWidth={2}
      />
    );

    if (dataLength && (index === 0 || index === dataLength - 1)) {
      return (
        <g key={`dotB-${index}`}>
          {dot}
          <text
            x={cx}
            y={cy - 10}
            fill="#ff7300"
            textAnchor="middle"
            fontSize={12}
          >
            {payload.ValueB}
          </text>
        </g>
      );
    }
    return <g key={`dotB-${index}`}>{dot}</g>;
  };

  // Custom dot render function for ValueC with filled dots to mask the line
  const renderCustomDotC = (props: any): JSX.Element => {
    const { cx, cy, index, payload } = props;
    const dot = (
      <circle
        key={`dotC-circle-${index}`}
        cx={cx}
        cy={cy}
        r={4}
        fill="white"
        stroke="#387908"
        strokeWidth={2}
      />
    );

    if (dataLength && (index === 0 || index === dataLength - 1)) {
      return (
        <g key={`dotC-${index}`}>
          {dot}
          <text
            x={cx}
            y={cy - 10}
            fill="#387908"
            textAnchor="middle"
            fontSize={12}
          >
            {payload.ValueC}
          </text>
        </g>
      );
    }
    return <g key={`dotC-${index}`}>{dot}</g>;
  };

  return (
    <div className="w-full h-[400px] p-4 border bg-white">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 30, right: 20, left: 20, bottom: 20 }}>
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="ValueB"
            name="Single Coverage"
            stroke="#ff7300"
            dot={renderCustomDotB}
          />
          <Line
            type="monotone"
            dataKey="ValueC"
            name="Family Coverage"
            stroke="#387908"
            dot={renderCustomDotC}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

'use client';

import CumulativeChart from 'components/CumulativeChart';
import PremiumStackedBarChart from 'components/PremiumStackedBarChart';
import RebasedChart from 'components/RebasedChart';
import Table112Chart from 'components/Table112Chart';
import YearOverYearChart from 'components/YearOverYearChart';
import { useEffect, useState } from 'react';
import {
    Bar,
    BarChart,
    Cell,
    LabelList,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

// Interface for the cleaned pivot data (for pivot table and interactive chart)
interface TidyData {
  Location: string;
  year: number;
  value: number;
}

// Inline component for the interactive time series line chart
function InteractiveLineChart() {
  const [tsData, setTsData] = useState<TidyData[]>([]);

  useEffect(() => {
    fetch('/clean_data.json')
      .then((res) => res.json())
      .then((jsonData) => {
        jsonData.sort((a: TidyData, b: TidyData) => a.year - b.year);
        setTsData(jsonData);
      })
      .catch((err) => console.error('Error loading data:', err));
  }, []);

  const states = Array.from(new Set(tsData.map((d) => d.Location)));

  const stateColors: Record<string, string> = {
    Alabama: '#ff4d4f',
    Maine: '#1890ff',
    'New York': '#52c41a',
    'North Dakota': '#faad14',
    Tennessee: '#722ed1'
  };

  const yearMap: Record<number, any> = {};
  tsData.forEach((row) => {
    if (!yearMap[row.year]) {
      yearMap[row.year] = { year: row.year };
    }
    yearMap[row.year][row.Location] = row.value;
  });
  const chartData = Object.values(yearMap).sort(
    (a: any, b: any) => a.year - b.year
  );

  return (
    <div className="w-full h-[500px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip />
          <Legend />
          {states.map((stateName, index) => (
            <Line
              key={`${stateName}-${index}`}
              type="monotone"
              dataKey={stateName}
              name={stateName}
              dot={false}
              stroke={stateColors[stateName] || '#000'}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// Component for displaying the clean data as a pivot table (states as rows, years as columns)
function CleanDataPivotTable() {
  const [pivotData, setPivotData] = useState<any[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [states, setStates] = useState<string[]>([]);

  useEffect(() => {
    fetch('/clean_data.json')
      .then((res) => res.json())
      .then((jsonData: TidyData[]) => {
        const yearSet = new Set<number>();
        const stateSet = new Set<string>();
        jsonData.forEach((row) => {
          yearSet.add(row.year);
          stateSet.add(row.Location);
        });
        const yearsArr = Array.from(yearSet).sort((a, b) => a - b);
        const statesArr = Array.from(stateSet).sort();
        setYears(yearsArr);
        setStates(statesArr);

        const pivot = statesArr.map((state) => {
          const row: any = { Location: state };
          yearsArr.forEach((year) => {
            const found = jsonData.find(
              (item) => item.Location === state && item.year === year
            );
            row[year] = found ? found.value : '-';
          });
          return row;
        });
        setPivotData(pivot);
      })
      .catch((err) => console.error('Error loading pivot data:', err));
  }, []);

  return (
    <div className="mt-6 p-4 bg-gray-100 border rounded overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700"></th>
            {years.map((year) => (
              <th key={year} className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                {year}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {pivotData.map((row, index) => (
            <tr key={index}>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{row.Location}</td>
              {years.map((year) => (
                <td key={year} className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                  {row[year]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Custom hook to detect mobile viewport
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

// Claim Denial Chart (from home page)
function ClaimDenialChart() {
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
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={claimDenialData}
          layout="vertical"
          margin={{ top: 5, bottom: 5, left: 5, right: 40 }}
        >
          <XAxis
            type="number"
            domain={[0, 'dataMax']}
            tick={isMobile ? false : { fontSize: '10px' }}
          />
          <YAxis
            type="category"
            dataKey="name"
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
            <LabelList
              dataKey="name"
              position="insideLeft"
              style={{
                fontSize: isMobile ? '8px' : '10px',
                fill: 'white',
                fontWeight: 'bold'
              }}
            />
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
  );
}

// New Claim Bar Chart as a vertical bar chart
function NewClaimBarChart() {
  const isMobile = useIsMobile();
  const newClaimData = [
    { state: 'FL', rate: 21.99 },
    { state: 'CA', rate: 20.52 },
    { state: 'NY', rate: 15.86 },
    { state: 'GA', rate: 14.82 },
    { state: 'NC', rate: 13.43 },
    { state: 'PA', rate: 12.55 },
    { state: 'IL', rate: 10.98 },
    { state: 'MI', rate: 10.90 },
    { state: 'VA', rate: 10.69 },
    { state: 'TX', rate: 9.55 }
  ];

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={newClaimData} margin={{ top: 5, bottom: 5, left: 5, right: 40 }}>
          <XAxis 
            dataKey="state"
            tick={isMobile ? false : { fontSize: '10px' }}
            axisLine={isMobile ? false : true}
            tickLine={isMobile ? false : true}
          />
          <YAxis 
            type="number"
            domain={[0, 'dataMax']}
            tick={isMobile ? false : { fontSize: '10px' }}
            axisLine={isMobile ? false : true}
            tickLine={isMobile ? false : true}
          />
          <Tooltip contentStyle={{ fontSize: isMobile ? '8px' : '10px' }} />
          <Bar dataKey="rate" fill="#82ca9d">
            <LabelList 
              dataKey="rate"
              position="top"
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
  );
}

export default function StudyOnePage() {
  const [activeTab, setActiveTab] = useState<'cumulative' | 'rebased' | 'yoy'>('cumulative');

  let chartContent: React.ReactElement = <></>;
  if (activeTab === 'cumulative') {
    chartContent = <CumulativeChart />;
  } else if (activeTab === 'rebased') {
    chartContent = <RebasedChart />;
  } else if (activeTab === 'yoy') {
    chartContent = <YearOverYearChart />;
  }

  const description = (() => {
    if (activeTab === 'cumulative') {
      return "Cumulative % Change: This transformation calculates the percentage change of each data point relative to the first recorded value. It normalizes the data by using a common starting point, making it easier to observe overall growth or decline over time.";
    } else if (activeTab === 'rebased') {
      return "Rebased to 100: In this transformation, the first data point is set to 100, and all subsequent values are scaled accordingly. This approach standardizes different data series to a common baseline, allowing for direct visual comparisons even when the original scales differ.";
    } else if (activeTab === 'yoy') {
      return "Year over Year % Change: This method calculates the percentage change compared to the same day one year earlier. It is especially useful for identifying seasonal trends and comparing performance over consistent time intervals.";
    }
  })();

  return (
    <div className="max-w-4xl mx-auto px-4">
      {/* --- Tabs Section --- */}
      <div className="mb-4 flex">
        <button
          onClick={() => setActiveTab('cumulative')}
          className={`mr-4 pb-2 ${activeTab === 'cumulative' ? ' border-red-600 font-bold' : 'text-neutral-600'}`}
        >
          Cumulative % Change
        </button>
        <button
          onClick={() => setActiveTab('rebased')}
          className={`mr-4 pb-2 ${activeTab === 'rebased' ? 'border-b-2 border-red-600 font-bold' : 'text-neutral-600'}`}
        >
          Rebased to 100
        </button>
        <button
          onClick={() => setActiveTab('yoy')}
          className={`mr-4 pb-2 ${activeTab === 'yoy' ? 'border-b-2 border-red-600 font-bold' : 'text-neutral-600'}`}
        >
          Year over Year % Change
        </button>
      </div>

      {/* --- Chart Container for Tabbed Charts --- */}
      <div className="w-full h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          {chartContent}
        </ResponsiveContainer>
      </div>

      {/* --- Description Under Tabbed Chart --- */}
      <div className="mt-4 p-2">
        <p className="text-sm text-gray-700">{description}</p>
      </div>

      {/* --- Premiums and Claims Section --- */}
      <div className=" rounded">
        <h2 className="text-xl font-bold mb-4">Premiums and Claims</h2>
        <div className="flex gap-4">
          <div className="w-[70%] h-[500px]">
            <InteractiveLineChart />
          </div>
          <div className="w-[30%] h-[500px]">
            <PremiumStackedBarChart />
          </div>
        </div>
      </div>

      {/* --- Clean Data Pivot Table Section --- */}
      <CleanDataPivotTable />

      {/* --- Claims Overview Section --- */}
      <div className="mt-6 p-4">
        <h2 className="text-xl font-bold mb-4">Claims Denial Rates</h2>
        <div className="flex gap-4">
          <div className="w-1/2 h-[400px]">
            <ClaimDenialChart />
          </div>
          <div className="w-1/2 h-[400px]">
            <NewClaimBarChart />
          </div>
        </div>
      </div>

      {/* --- Table 1.12 Time Series Section with Annotations --- */}
      <div className="mt-6 p-4">
        <h2 className="text-xl font-bold mb-4">Rising Cost of Health Insurance</h2>
        <Table112Chart />
      </div>
    </div>
  );
}

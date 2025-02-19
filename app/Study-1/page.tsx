// app/Study-1/page.tsx
'use client';

import CumulativeChart from 'components/CumulativeChart'; // Import the new component
import { useState } from 'react';
import { ResponsiveContainer } from 'recharts';

export default function StudyOnePage() {
  // Set the active tab to one of three options.
  const [activeTab, setActiveTab] = useState<'cumulative' | 'rebased' | 'yoy'>('cumulative');

  // Use the new component for the cumulative chart.
  let chartContent: React.ReactElement = <></>;

  if (activeTab === 'cumulative') {
    chartContent = <CumulativeChart />;
  } else if (activeTab === 'rebased') {
    // ... existing code for rebased chart (unchanged) ...
  } else if (activeTab === 'yoy') {
    // ... existing code for year-over-year chart (unchanged) ...
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      {/* Tab Header */}
      <div className="mb-4 flex border-b">
        <button
          onClick={() => setActiveTab('cumulative')}
          className={`mr-4 pb-2 ${activeTab === 'cumulative' ? 'border-b-2 border-red-600 font-bold' : 'text-neutral-600'}`}
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

      {/* Chart Container */}
      <div className="w-full h-[500px] p-2 border">
        <ResponsiveContainer width="100%" height="100%">
          {chartContent}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

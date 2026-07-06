import React from 'react';
import TimeSeriesChart from './components/TimeSeriesChart';
import './App.css';

// Sample data - replace with your own time-series data
const sampleData = {
  cost: [
    { x: new Date('2026-06-10').getTime(), y: 2.04 },
    { x: new Date('2026-06-11').getTime(), y: 25.85 },
    { x: new Date('2026-06-12').getTime(), y: 44.36 },
    { x: new Date('2026-06-13').getTime(), y: 55.65 },
    { x: new Date('2026-06-14').getTime(), y: 63 }
  ],
  cpa: [
    { x: new Date('2026-06-10').getTime(), y: 0.68 },
    { x: new Date('2026-06-11').getTime(), y: 0.86 },
    { x: new Date('2026-06-12').getTime(), y: 1.23 },
    { x: new Date('2026-06-13').getTime(), y: 0.79 },
    { x: new Date('2026-06-14').getTime(), y: 0.71 }
  ],
  roi: [
    { x: new Date('2026-06-10').getTime(), y: 610.78 },
    { x: new Date('2026-06-11').getTime(), y: 180.50 },
    { x: new Date('2026-06-12').getTime(), y: 161.47 },
    { x: new Date('2026-06-13').getTime(), y: 56.33 },
    { x: new Date('2026-06-14').getTime(), y: 357.25 }
  ],
  conversions: [
    { x: new Date('2026-06-10').getTime(), y: 3 },
    { x: new Date('2026-06-11').getTime(), y: 30 },
    { x: new Date('2026-06-12').getTime(), y: 36 },
    { x: new Date('2026-06-13').getTime(), y: 70 },
    { x: new Date('2026-06-14').getTime(), y: 90 }
  ]
};

function App() {
  return (
    <div className="App">
      <TimeSeriesChart data={sampleData} />
    </div>
  );
}

export default App;

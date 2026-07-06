import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  ComposedChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const TimeSeriesChart = ({ data }) => {
  const [activePointDate, setActivePointDate] = useState(null);
  const chartContainerRef = useRef(null);

  // Transform data format for Recharts
  const chartData = data.cost.map((item, index) => ({
    date: item.x,
    cost: item.y,
    cpa: data.cpa[index]?.y || 0,
    roi: data.roi[index]?.y || 0,
    conversions: data.conversions[index]?.y || 0
  }));

  // Fixed max values for scaling
  const maxCost = 63;
  const maxCpa = 50;
  const maxRoi = Math.max(...chartData.map(d => d.roi)) * 1.1;
  const maxConversions = 110;

  // Setup green line hover effect
  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    const getGreenLinePath = () => {
      const svg = container.querySelector('svg');
      if (!svg) return null;

      const paths = svg.querySelectorAll('path.recharts-line-curve');
      for (const path of paths) {
        if (path.getAttribute('stroke') === '#0b8401') {
          return path;
        }
      }
      return null;
    };

    const handleMouseMove = (e) => {
      const greenLinePath = getGreenLinePath();
      if (!greenLinePath) return;

      const svg = greenLinePath.ownerSVGElement;
      if (!svg) return;

      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());

      const pathLength = greenLinePath.getTotalLength();
      let minDistance = Infinity;

      for (let i = 0; i <= pathLength; i += 5) {
        const pathPoint = greenLinePath.getPointAtLength(i);
        const dx = pathPoint.x - svgP.x;
        const dy = pathPoint.y - svgP.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < minDistance) {
          minDistance = distance;
        }
      }

      if (minDistance <= 15) {
        greenLinePath.setAttribute('stroke-width', '1.5');
      } else {
        greenLinePath.setAttribute('stroke-width', '3');
      }
    };

    const handleMouseLeave = () => {
      const greenLinePath = getGreenLinePath();
      if (greenLinePath) {
        greenLinePath.setAttribute('stroke-width', '3');
      }
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [data]);

  const CustomTooltip = ({ active, payload }) => {
    useEffect(() => {
      if (active && payload && payload.length && payload[0].payload.date) {
        setActivePointDate(payload[0].payload.date);
      }
    }, [active, payload]);

    if (active && payload && payload.length) {
      const date = new Date(payload[0].payload.date);
      const formattedDate = `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;

      return (
        <div style={{
          background: 'white',
          padding: '0 8px 4px 8px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{ fontWeight: 600, marginBottom: '0', color: '#333', fontSize: '11px', textAlign: 'left' }}>
            {formattedDate}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0', lineHeight: '1.2' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', lineHeight: '1.2' }}>
              <span style={{ width: '12px', height: '12px', background: '#FFF0BF', borderRadius: '50%', display: 'inline-block' }}></span>
              <span style={{ color: '#666', fontSize: '15px', lineHeight: '1.2', fontWeight: 600 }}>Cost: <strong style={{ color: '#333', fontWeight: 700 }}>{payload[0].payload.cost.toFixed(2)}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', lineHeight: '1.2' }}>
              <span style={{ width: '12px', height: '12px', background: '#346EFD', borderRadius: '50%', display: 'inline-block' }}></span>
              <span style={{ color: '#666', fontSize: '15px', lineHeight: '1.2', fontWeight: 600 }}>CPA: <strong style={{ color: '#333', fontWeight: 700 }}>{payload[0].payload.cpa.toFixed(2)}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', lineHeight: '1.2' }}>
              <span style={{ width: '12px', height: '12px', background: '#0b8401', borderRadius: '50%', display: 'inline-block' }}></span>
              <span style={{ color: '#666', fontSize: '15px', lineHeight: '1.2', fontWeight: 600 }}>ROI confirmed: <strong style={{ color: '#333', fontWeight: 700 }}>{payload[0].payload.roi.toFixed(2)}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', lineHeight: '1.2' }}>
              <span style={{ width: '12px', height: '12px', background: '#b500fe', display: 'inline-block' }}></span>
              <span style={{ color: '#666', fontSize: '15px', lineHeight: '1.2', fontWeight: 600 }}>Conversions: <strong style={{ color: '#333', fontWeight: 700 }}>{payload[0].payload.conversions.toFixed(0)}</strong></span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const formatXAxis = (timestamp) => {
    const date = new Date(timestamp);
    return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  // Purple square dot - animated
  const PurpleSquareDot = React.memo((props) => {
    const { cx, cy, payload } = props;
    const isActive = payload && activePointDate === payload.date;

    if (!isActive) return null;

    return (
      <g>
        <motion.circle
          cx={cx}
          cy={cy}
          r={15}
          fill="rgba(181, 0, 254, 0.3)"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
        <motion.rect
          x={cx - 3}
          y={cy - 3}
          width={6}
          height={6}
          fill="#b500fe"
          stroke="white"
          strokeWidth={2}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.2, delay: 0.1, ease: "easeOut" }}
        />
      </g>
    );
  });

  // Purple square native dot (small, no border)
  const PurpleSquareNativeDot = (props) => {
    const { cx, cy } = props;
    return (
      <rect
        x={cx - 4}
        y={cy - 4}
        width={8}
        height={8}
        fill="#b500fe"
        stroke="none"
      />
    );
  };

  // Green diamond dot - animated
  const GreenDiamondDot = React.memo((props) => {
    const { cx, cy, payload } = props;
    const isActive = payload && activePointDate === payload.date;

    if (!isActive) return null;

    return (
      <g>
        <motion.circle
          cx={cx}
          cy={cy}
          r={15}
          fill="rgba(11, 132, 1, 0.3)"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
        <motion.path
          d={`M ${cx},${cy - 3.5} L ${cx + 3.5},${cy} L ${cx},${cy + 3.5} L ${cx - 3.5},${cy} Z`}
          fill="#0b8401"
          stroke="white"
          strokeWidth={2}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.2, delay: 0.1, ease: "easeOut" }}
        />
      </g>
    );
  });

  // Yellow circle dot - animated
  const YellowCircleDot = React.memo((props) => {
    const { cx, cy, payload } = props;
    const isActive = payload && activePointDate === payload.date;

    if (!isActive) return null;

    return (
      <g>
        <motion.circle
          cx={cx}
          cy={cy}
          r={15}
          fill="rgba(253, 240, 159, 0.3)"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
        <motion.circle
          cx={cx}
          cy={cy}
          r={3}
          fill="#FFF0BF"
          stroke="white"
          strokeWidth={2}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.2, delay: 0.1, ease: "easeOut" }}
        />
      </g>
    );
  });

  const RoundedBar = (props) => {
    const { fill, x, y, width, height } = props;
    const radius = 4;

    return (
      <g>
        <rect
          x={x}
          y={y + radius}
          width={width}
          height={height - radius}
          fill={fill}
        />
        <path
          d={`M${x},${y + radius} Q${x},${y} ${x + radius},${y} L${x + width - radius},${y} Q${x + width},${y} ${x + width},${y + radius} L${x + width},${y + height} L${x},${y + height} Z`}
          fill={fill}
        />
      </g>
    );
  };

  return (
    <div style={{ background: '#FDE8E9', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{
        maxWidth: '427px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px'
      }}>
        {/* Left axis labels - outside the chart border */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          height: '120px',
          paddingTop: '0',
          fontSize: '12px',
          color: '#666',
          textAlign: 'right',
          minWidth: '40px',
          gap: '0'
        }}>
          <div style={{ background: 'white', padding: '0', fontWeight: 'bold' }}>Tdy</div>
          <div style={{ background: 'white', padding: '0' }}>0%</div>
          <div style={{ background: 'transparent', padding: '0' }}>$0</div>
          <div style={{ background: 'white', padding: '0' }}>$0</div>
          <div style={{ background: 'transparent', padding: '0' }}>0</div>
          <div style={{ background: 'white', padding: '0' }}>0</div>
        </div>

        {/* Chart container with border */}
        <div
          ref={chartContainerRef}
          style={{
            flex: 1,
            background: 'transparent',
            borderRadius: '4px',
            padding: '0 10px 0 0',
            border: '1px solid #ddd',
            cursor: 'pointer',
            height: '150px'
          }}
          onMouseLeave={() => {
            setActivePointDate(null);
          }}
        >
          <ResponsiveContainer width="100%" height={150}>
              <ComposedChart
                data={chartData}
                margin={{ top: 15, right: 0, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="0" stroke="none" vertical={false} />
                <XAxis hide dataKey="date" />
                <YAxis yAxisId="cost" hide domain={[0, maxCost]} />
                <YAxis yAxisId="cpa" hide domain={[0, maxCpa]} />
                <YAxis yAxisId="roi" hide domain={[0, maxRoi]} />
                <YAxis yAxisId="conversions" hide domain={[0, maxConversions]} />
                <Tooltip
                  content={<CustomTooltip />}
                  animationDuration={200}
                  isAnimationActive={true}
                  cursor={{ stroke: 'rgba(0,0,0,0.1)', strokeWidth: 1 }}
                />

                {/* Yellow area with border line and circle dots */}
                <Area
                  yAxisId="cost"
                  type="monotone"
                  dataKey="cost"
                  fill="#FFF0BF"
                  fillOpacity={1}
                  stroke="#FDF09F"
                  strokeWidth={2}
                  dot={<YellowCircleDot />}
                  activeDot={false}
                />

                {/* Blue bars with rounded corners and white border */}
                <Bar
                  yAxisId="cpa"
                  dataKey="cpa"
                  fill="#346EFD"
                  stroke="white"
                  strokeWidth={1}
                  radius={[4, 4, 0, 0]}
                  barSize={30}
                />

                {/* Green smooth line with diamond dots */}
                <Line
                  yAxisId="roi"
                  type="monotone"
                  dataKey="roi"
                  stroke="#0b8401"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  dot={false}
                  activeDot={<GreenDiamondDot />}
                />

                {/* Purple line with square markers */}
                <Line
                  yAxisId="conversions"
                  type="linear"
                  dataKey="conversions"
                  stroke="#b500fe"
                  strokeWidth={1.5}
                  dot={<PurpleSquareNativeDot />}
                  activeDot={<PurpleSquareDot />}
                />
              </ComposedChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default TimeSeriesChart;

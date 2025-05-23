import React from 'react';
import { useIsMobile } from "@/hooks/use-mobile";
import { QuizResults } from "@/utils/quizData";
import { generateChartData } from "@/utils/chartGenerator";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

interface EnergyGraphPointsProps {
  results: QuizResults;
}

// Define a type for the points
interface ChartPoint {
  index: number;
  name: string;
  day: number;
  energy: number;
  description: string;
}

const EnergyGraphPoints: React.FC<EnergyGraphPointsProps> = ({ results }) => {
  const isMobile = useIsMobile();
  const chartData = generateChartData(results);
  
  // SVG canvas dimensions - reduced top/bottom padding on desktop, increased height on mobile
  const padding = { 
    top: isMobile ? 30 : 20, 
    right: 20, 
    bottom: isMobile ? 30 : 20, 
    left: 60 
  };
  
  const width = isMobile ? 300 : 600;
  const height = isMobile ? 400 : 300; // Increased height for mobile
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  
  // Scales for x and y axes
  const xScale = (day: number) => {
    return padding.left + (day - 1) * (innerWidth / (chartData.cycleLength - 1));
  };
  
  const yScale = (energy: number) => {
    // Scale energy 0-5 to svg coordinates (top to bottom)
    return padding.top + (5 - energy) * (innerHeight / 5);
  };
  
  // Calculate key points
  const points: ChartPoint[] = [
    { index: 1, name: "Cycle Start", day: 1, energy: 1, description: "Day 1 - Beginning of your period" },
    { index: 2, name: "Period End", day: chartData.periodEndDay, energy: 3, description: "End of your menstrual flow" },
    { index: 3, name: "Peak Energy", day: chartData.peakDay, energy: 5, description: "Your highest energy point" },
    { index: 4, name: "Lowest Energy", day: chartData.lowestDay, energy: 1, description: "Your lowest energy point" },
    { index: 5, name: "Cycle End", day: chartData.cycleLength, energy: 1, description: `Day ${chartData.cycleLength} - End of your cycle` }
  ];
  
  // Function to generate grid lines - one vertical line per day
  const generateGridLines = () => {
    const xLines = [];
    const yLines = [];
    
    // X-axis grid lines (one per day)
    for (let day = 1; day <= chartData.cycleLength; day++) {
      xLines.push(
        <line 
          key={`x-${day}`}
          x1={xScale(day)} 
          y1={padding.top} 
          x2={xScale(day)} 
          y2={height - padding.bottom}
          stroke={day % 5 === 0 ? "#e2e8f0" : "#f1f5f9"} // More prominent lines every 5 days
          strokeWidth={day % 5 === 0 ? 1 : 0.5}
          strokeDasharray={day % 5 === 0 ? "4" : "2"}
        />
      );
    }
    
    // Y-axis grid lines (for each energy level)
    for (let energy = 0; energy <= 5; energy++) {
      yLines.push(
        <line 
          key={`y-${energy}`}
          x1={padding.left} 
          y1={yScale(energy)} 
          x2={width - padding.right} 
          y2={yScale(energy)}
          stroke="#e2e8f0"
          strokeDasharray={energy === 0 ? "0" : "4"}
        />
      );
    }
    
    return [...xLines, ...yLines];
  };
  
  // Function to generate x-axis labels
  const generateXAxisLabels = () => {
    const labels = [];
    
    // Add label for day 1
    labels.push(
      <text 
        key="x-1" 
        x={xScale(1)} 
        y={height - padding.bottom + 20}
        textAnchor="middle"
        fontSize="12"
        fill="#64748b"
      >
        Day 1
      </text>
    );
    
    // Add label for middle day
    const middleDay = Math.floor(chartData.cycleLength / 2);
    labels.push(
      <text 
        key={`x-${middleDay}`} 
        x={xScale(middleDay)} 
        y={height - padding.bottom + 20}
        textAnchor="middle"
        fontSize="12"
        fill="#64748b"
      >
        ~{middleDay} days
      </text>
    );
    
    // Add label for cycle end
    labels.push(
      <text 
        key={`x-${chartData.cycleLength}`} 
        x={xScale(chartData.cycleLength)} 
        y={height - padding.bottom + 20}
        textAnchor="middle"
        fontSize="12"
        fill="#64748b"
      >
        ~{chartData.cycleLength} days
      </text>
    );
    
    return labels;
  };
  
  // Function to generate y-axis labels
  const generateYAxisLabels = () => {
    const labels = [];
    const energyLabels = ["Very Low", "Low", "Moderate", "High", "Peak"];
    
    for (let energy = 1; energy <= 5; energy++) {
      labels.push(
        <text 
          key={`y-${energy}`} 
          x={padding.left - 10} 
          y={yScale(energy)}
          textAnchor="end"
          dominantBaseline="middle"
          fontSize="12"
          fill="#64748b"
        >
          {energyLabels[energy-1]}
        </text>
      );
    }
    
    return labels;
  };
  
  // Generate cubic Bézier curve
  const generateCubicBezier = () => {
    if (points.length < 5) return null;
    
    // Get sorted points by index to ensure correct order
    const sortedPoints = [...points].sort((a, b) => a.index - b.index);
    
    // Extract the key points with meaningful names
    const P = { x: xScale(sortedPoints[0].day), y: yScale(sortedPoints[0].energy) }; // Cycle Start
    const Q = { x: xScale(sortedPoints[1].day), y: yScale(sortedPoints[1].energy) }; // Period End
    const R = { x: xScale(sortedPoints[2].day), y: yScale(sortedPoints[2].energy) }; // Peak Energy
    const S = { x: xScale(sortedPoints[3].day), y: yScale(sortedPoints[3].energy) }; // Lowest Energy
    const T = { x: xScale(sortedPoints[4].day), y: yScale(sortedPoints[4].energy) }; // Cycle End
    
    // Calculate control points for first Bézier segment (P to R)
    // P's outgoing control point: horizontal length equal to distance from P to Q
    const cp1x = P.x + (Q.x - P.x);
    const cp1y = P.y; // Same y-level as P for flat tangent
    
    // R's incoming control point: horizontal length equal to distance from Q to R
    const cp2x = R.x - (R.x - Q.x);
    const cp2y = R.y; // Same y-level as R for flat tangent
    
    // Calculate control points for second Bézier segment (R to T)
    // R's outgoing control point: horizontal length equal to half the distance from R to S
    const cp3x = R.x + (S.x - R.x) * 0.85;
    const cp3y = R.y; // Same y-level as R for flat tangent
    
    // T's incoming control point: horizontal length equal to twice the distance from S to T
    const cp4x = T.x - (T.x - S.x) * 2;
    const cp4y = T.y; // Same y-level as T for flat tangent
    
    // Build the path
    const bezierPath = `
      M ${P.x},${P.y}
      C ${cp1x},${cp1y} ${cp2x},${cp2y} ${R.x},${R.y}
      C ${cp3x},${cp3y} ${cp4x},${cp4y} ${T.x},${T.y}
    `;
    
    return (
      <path 
        d={bezierPath} 
        stroke="#FD8687" 
        strokeWidth={2} 
        fill="none" 
        strokeLinecap="round"
      />
    );
  };
  
  // Generate the purple gradient area below the curve
  const generatePurpleGradientArea = () => {
    if (points.length < 5) return null;
    
    // Get sorted points by index to ensure correct order
    const sortedPoints = [...points].sort((a, b) => a.index - b.index);
    
    // Extract the key points
    const P = { x: xScale(sortedPoints[0].day), y: yScale(sortedPoints[0].energy) }; // Cycle Start
    const Q = { x: xScale(sortedPoints[1].day), y: yScale(sortedPoints[1].energy) }; // Period End
    const R = { x: xScale(sortedPoints[2].day), y: yScale(sortedPoints[2].energy) }; // Peak Energy
    const S = { x: xScale(sortedPoints[3].day), y: yScale(sortedPoints[3].energy) }; // Lowest Energy
    const T = { x: xScale(sortedPoints[4].day), y: yScale(sortedPoints[4].energy) }; // Cycle End
    
    // Calculate control points for first Bézier segment (P to R)
    const cp1x = P.x + (Q.x - P.x);
    const cp1y = P.y;
    
    const cp2x = R.x - (R.x - Q.x);
    const cp2y = R.y;
    
    // Calculate control points for second Bézier segment (R to T)
    const cp3x = R.x + (S.x - R.x) * 0.85;
    const cp3y = R.y;
    
    const cp4x = T.x - (T.x - S.x) * 2;
    const cp4y = T.y;
    
    // Calculate baseline y-value for energy level 1
    const baselineY = yScale(1);
    
    // Build the path
    // Start at first point, follow bezier curve, go down to baseline, then back to start
    const areaPath = `
      M ${P.x},${P.y}
      C ${cp1x},${cp1y} ${cp2x},${cp2y} ${R.x},${R.y}
      C ${cp3x},${cp3y} ${cp4x},${cp4y} ${T.x},${T.y}
      L ${T.x},${baselineY}
      L ${P.x},${baselineY}
      Z
    `;
    
    return (
      <path 
        d={areaPath} 
        fill="url(#purpleGradient)" 
        stroke="none"
        opacity={0.7}
      />
    );
  };
  
  // Generate the red gradient area above the curve (between energy 1 and 5)
  const generateRedGradientArea = () => {
    if (points.length < 5) return null;
    
    // Get sorted points by index to ensure correct order
    const sortedPoints = [...points].sort((a, b) => a.index - b.index);
    
    // Extract the key points
    const P = { x: xScale(sortedPoints[0].day), y: yScale(sortedPoints[0].energy) }; // Cycle Start
    const Q = { x: xScale(sortedPoints[1].day), y: yScale(sortedPoints[1].energy) }; // Period End
    const R = { x: xScale(sortedPoints[2].day), y: yScale(sortedPoints[2].energy) }; // Peak Energy
    const S = { x: xScale(sortedPoints[3].day), y: yScale(sortedPoints[3].energy) }; // Lowest Energy
    const T = { x: xScale(sortedPoints[4].day), y: yScale(sortedPoints[4].energy) }; // Cycle End
    
    // Calculate control points for the bezier curves
    const cp1x = P.x + (Q.x - P.x);
    const cp1y = P.y;
    
    const cp2x = R.x - (R.x - Q.x);
    const cp2y = R.y;
    
    const cp3x = R.x + (S.x - R.x) * 0.85;
    const cp3y = R.y;
    
    const cp4x = T.x - (T.x - S.x) * 2;
    const cp4y = T.y;
    
    // Calculate top line y-value for energy level 5
    const topY = yScale(5);
    
    // Build the path
    // Start at y=5 for first point's x, go down to curve, follow curve, then up to y=5 for last point's x, and back
    const areaPath = `
      M ${P.x},${topY}
      L ${P.x},${P.y}
      C ${cp1x},${cp1y} ${cp2x},${cp2y} ${R.x},${R.y}
      C ${cp3x},${cp3y} ${cp4x},${cp4y} ${T.x},${T.y}
      L ${T.x},${topY}
      Z
    `;
    
    return (
      <path 
        d={areaPath} 
        fill="url(#redGradient)" 
        stroke="none"
        opacity={0.7}
      />
    );
  };
  
  // Render SVG point without hover card functionality
  const renderPoint = (point: ChartPoint) => {
    // Only render points with index 1 (Cycle Start), 3 (Peak Energy), and 5 (Cycle End)
    if (point.index !== 1 && point.index !== 3 && point.index !== 5) {
      return null;
    }
    
    const x = xScale(point.day);
    const y = yScale(point.energy);
    
    return (
      <g key={`point-${point.index}`}>
        <circle
          cx={x}
          cy={y}
          r={6}
          className="fill-[#9b87f5] stroke-2 stroke-white"
        />
      </g>
    );
  };
  
  return (
    <div className={cn(
      "w-full h-full relative",
      isMobile && "min-h-[400px]" // Ensure minimum height on mobile
    )}>
      <div className="absolute top-2 right-2">
        <HoverCard>
          <HoverCardTrigger asChild>
            <button className="text-gray-400 hover:text-gray-600">
              <Info size={18} />
            </button>
          </HoverCardTrigger>
          <HoverCardContent className="w-60 p-3">
            <div className="space-y-1">
              <h4 className="font-medium">About this graph</h4>
              <p className="text-xs text-gray-500">
                This is a visualization of your energy levels throughout your {chartData.cycleLength}-day cycle.
                Each point represents a key moment based on your responses.
              </p>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>

      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className="overflow-visible"
      >
        {/* Define gradients */}
        <defs>
          <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#D4C7F4" stopOpacity="1" />
            <stop offset="100%" stopColor="#D4C7F4" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="redGradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#FF7672" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#FF7672" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Grid lines */}
        {generateGridLines()}
        
        {/* X and Y axes */}
        <line 
          x1={padding.left} 
          y1={height - padding.bottom} 
          x2={width - padding.right} 
          y2={height - padding.bottom}
          stroke="#94a3b8"
          strokeWidth={1.5}
        />
        <line 
          x1={padding.left} 
          y1={padding.top} 
          x2={padding.left} 
          y2={height - padding.bottom}
          stroke="#94a3b8"
          strokeWidth={1.5}
        />
        
        {/* Labels */}
        {generateXAxisLabels()}
        {generateYAxisLabels()}
        
        {/* Gradient areas - render these before the curve */}
        {generatePurpleGradientArea()}
        {generateRedGradientArea()}
        
        {/* Bezier Curve */}
        {generateCubicBezier()}
        
        {/* Chart points without tooltips */}
        {points.map(renderPoint)}
      </svg>
      
      {/* Empty legend container - keeping the structure for future use */}
      <div className="mt-4 flex justify-center flex-wrap gap-4 text-xs text-gray-500">
        {/* Legend content removed as previously requested */}
      </div>
    </div>
  );
};

export default EnergyGraphPoints;

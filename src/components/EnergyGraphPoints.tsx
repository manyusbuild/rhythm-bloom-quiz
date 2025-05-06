
import React from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { useIsMobile } from "@/hooks/use-mobile";
import { QuizResults } from "@/utils/quizData";
import { generateChartData } from "@/utils/chartGenerator";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

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
    { index: 2, name: "Period End", day: chartData.periodEndDay, energy: 3, description: "End of your menstrual flow" }, // Updated energy to 3
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
  
  // Generate cardinal spline paths
  const generateCardinalSpline = (points: ChartPoint[], tension: number, color: string) => {
    if (points.length < 2) return null;
    
    // Sort points by day to ensure proper ordering
    const sortedPoints = [...points].sort((a, b) => a.day - b.day);
    
    const pointCoords = sortedPoints.map(point => ({
      x: xScale(point.day),
      y: yScale(point.energy)
    }));
    
    // Cardinal spline implementation
    let path = `M ${pointCoords[0].x},${pointCoords[0].y}`;
    
    for (let i = 0; i < pointCoords.length - 1; i++) {
      const p0 = i > 0 ? pointCoords[i - 1] : pointCoords[i];
      const p1 = pointCoords[i];
      const p2 = pointCoords[i + 1];
      const p3 = i < pointCoords.length - 2 ? pointCoords[i + 2] : p2;
      
      // Calculate control points
      const cp1x = p1.x + (p2.x - p0.x) * tension / 6;
      const cp1y = p1.y + (p2.y - p0.y) * tension / 6;
      const cp2x = p2.x - (p3.x - p1.x) * tension / 6;
      const cp2y = p2.y - (p3.y - p1.y) * tension / 6;
      
      path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    
    return (
      <path 
        d={path} 
        stroke={color} 
        strokeWidth={1.5} 
        fill="none" 
        strokeLinecap="round"
      />
    );
  };
  
  // Generate cubic Bézier curve (two segments)
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
    const cp3x = R.x + (S.x - R.x) / 2;
    const cp3y = R.y; // Same y-level as R for flat tangent
    
    // T's incoming control point: horizontal length equal to max(twice the distance from S to T, 10 days)
    // Calculate minimum length for the handle (5 days * 2)
    const minHandleLength = (innerWidth / (chartData.cycleLength - 1)) * 5 * 2;
    // Use the maximum of actual distance or minimum distance
    const handleLength = Math.max((T.x - S.x) * 2, minHandleLength);
    const cp4x = T.x - handleLength;
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
        stroke="green" 
        strokeWidth={1.5} 
        fill="none" 
        strokeLinecap="round"
      />
    );
  };
  
  // Render SVG point with hover card - Fix tooltip positioning
  const renderPoint = (point: ChartPoint) => {
    const x = xScale(point.day);
    const y = yScale(point.energy);
    
    return (
      <g key={`point-${point.index}`} className="cursor-pointer">
        <foreignObject
          x={x - 6}
          y={y - 6}
          width={12}
          height={12}
        >
          <div className="h-full w-full flex items-center justify-center">
            <HoverCard>
              <HoverCardTrigger asChild>
                <div 
                  className="h-[12px] w-[12px] rounded-full bg-[#9b87f5] border-2 border-white cursor-pointer"
                  style={{ touchAction: 'none' }}
                />
              </HoverCardTrigger>
              <HoverCardContent 
                className="w-64 p-3" 
                side="top"
                align="center"
                sideOffset={5}
              >
                <div className="space-y-1">
                  <h4 className="font-medium">{point.name} ({point.index})</h4>
                  <p className="text-sm text-gray-500">{point.description}</p>
                  <div className="text-xs text-gray-400">
                    Day: {point.day} • Energy: {point.energy}
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
        </foreignObject>
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
        
        {/* Experimental Cardinal Splines */}
        {generateCardinalSpline(points, 0.5, 'red')}
        {generateCardinalSpline(points, 1, 'blue')}
        
        {/* New Cubic Bézier Curve */}
        {generateCubicBezier()}
        
        {/* Chart points with tooltips - these must be rendered LAST to be on top */}
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

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

// Define the point type to fix the TypeScript error
interface ChartPoint {
  index: number;
  name: string;
  day: number;
  energy: number;
  description: string;
}

interface CoordinatePoint {
  x: number;
  y: number;
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
    { index: 2, name: "Period End", day: chartData.periodEndDay, energy: 2.5, description: "End of your menstrual flow" },
    { index: 3, name: "Peak Energy", day: chartData.peakDay, energy: 5, description: "Your highest energy point" },
    { index: 4, name: "Lowest Energy", day: chartData.lowestDay, energy: 1, description: "Your lowest energy point" },
    { index: 5, name: "Cycle End", day: chartData.cycleLength, energy: 1, description: `Day ${chartData.cycleLength} - End of your cycle` }
  ];
  
  // Create ghost points for loopable curves
  const createGhostPoints = (originalPoints: ChartPoint[]): ChartPoint[] => {
    const cycleDuration = chartData.cycleLength;
    
    // Ghost points before the start (reusing Lowest and Peak)
    const preGhost1: ChartPoint = {
      ...originalPoints[3], // Lowest Energy
      index: -1,
      day: originalPoints[3].day - cycleDuration // Position before Day 1
    };
    
    const preGhost2: ChartPoint = {
      ...originalPoints[2], // Peak Energy
      index: 0,
      day: originalPoints[2].day - cycleDuration // Position before Day 1
    };
    
    // Ghost points after the end (reusing Period End and Cycle Start)
    const postGhost1: ChartPoint = {
      ...originalPoints[1], // Period End
      index: 6, 
      day: originalPoints[1].day + cycleDuration // Position after cycle end
    };
    
    const postGhost2: ChartPoint = {
      ...originalPoints[0], // Cycle Start
      index: 7,
      day: originalPoints[0].day + cycleDuration // Position after cycle end
    };
    
    // Combine all points for the loopable cardinal spline
    return [preGhost1, preGhost2, ...originalPoints, postGhost1, postGhost2];
  };
  
  // Generate extended points array for loopable splines
  const extendedPoints = createGhostPoints(points);
  
  // Function to generate grid lines - one vertical line per day
  const generateGridLines = () => {
    // ... keep existing code (grid line generation)
  };
  
  // Function to generate x-axis labels
  const generateXAxisLabels = () => {
    // ... keep existing code (X axis label generation)
  };
  
  // Function to generate y-axis labels
  const generateYAxisLabels = () => {
    // ... keep existing code (Y axis label generation)
  };
  
  // Generate cardinal spline paths with proper TypeScript typing
  const generateCardinalSpline = (pointsArray: ChartPoint[], tension: number, color: string) => {
    if (pointsArray.length < 2) return null;
    
    // Sort points by day to ensure proper ordering
    const sortedPoints = [...pointsArray].sort((a, b) => a.day - b.day);
    
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
  
  // Render SVG point with hover card - Fixed tooltip functionality using foreignObject
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
              <HoverCardContent className="w-64 p-3">
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
        
        {/* Loopable Cardinal Splines with ghost points */}
        {generateCardinalSpline(extendedPoints, 0.5, 'red')}
        {generateCardinalSpline(extendedPoints, 1, 'blue')}
        
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

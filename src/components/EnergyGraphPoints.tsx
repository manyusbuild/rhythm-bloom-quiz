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
  const points = [
    { index: 1, name: "Cycle Start", day: 1, energy: 1, description: "Day 1 - Beginning of your period" },
    { index: 2, name: "Period End", day: chartData.periodEndDay, energy: 2.5, description: "End of your menstrual flow" },
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
  
  // Render SVG point with hover card
  const renderPoint = (point: typeof points[0]) => {
    const x = xScale(point.day);
    const y = yScale(point.energy);
    
    return (
      <HoverCard key={`point-${point.index}`}>
        <HoverCardTrigger asChild>
          <g className="cursor-pointer" transform={`translate(${x}, ${y})`}>
            <circle 
              r={6} 
              fill="#9b87f5"
              stroke="white"
              strokeWidth={2}
            />
          </g>
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
        
        {/* Graph title */}
        <text 
          x={width / 2} 
          y={20} 
          textAnchor="middle"
          fontSize="14"
          fontWeight="bold"
          fill="#1e293b"
        >
          Your Energy Cycle Points
        </text>
        
        {/* Chart points - excluding ovulation point */}
        {points.map(renderPoint)}
      </svg>
      
      {/* Empty legend container - keeping the structure for future use */}
      <div className="mt-4 flex justify-center flex-wrap gap-4 text-xs text-gray-500">
        {/* Legend content removed as requested */}
      </div>
    </div>
  );
};

export default EnergyGraphPoints;

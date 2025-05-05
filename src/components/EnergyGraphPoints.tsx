
import React from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { useIsMobile } from "@/hooks/use-mobile";
import { QuizResults } from "@/utils/quizData";
import { generateChartData } from "@/utils/chartGenerator";
import { CircleDot, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface EnergyGraphPointsProps {
  results: QuizResults;
}

const EnergyGraphPoints: React.FC<EnergyGraphPointsProps> = ({ results }) => {
  const isMobile = useIsMobile();
  const chartData = generateChartData(results);
  
  // SVG canvas dimensions
  const padding = { top: 40, right: 40, bottom: 40, left: 60 };
  const width = isMobile ? 300 : 600;
  const height = 300;
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
    { name: "Cycle Start", day: 1, energy: 1, description: "Day 1 - Beginning of your period" },
    { name: "Period End", day: chartData.periodEndDay, energy: 2.5, description: "End of your menstrual flow" },
    { name: "Peak Energy", day: chartData.peakDay, energy: 5, description: "Your highest energy point" },
    { name: "Lowest Energy", day: chartData.lowestDay, energy: 1, description: "Your lowest energy point" },
    { name: "Cycle End", day: chartData.cycleLength, energy: 1, description: `Day ${chartData.cycleLength} - End of your cycle` }
  ];
  
  // Add ovulation marker (approximately cycle length - 14)
  const ovulationDay = Math.max(Math.floor(chartData.cycleLength / 2), chartData.cycleLength - 14);
  const ovulationPoint = { 
    name: "Ovulation", 
    day: ovulationDay, 
    energy: 3, 
    description: "Approximate time of ovulation" 
  };
  
  // Function to generate grid lines
  const generateGridLines = () => {
    const xLines = [];
    const yLines = [];
    
    // X-axis grid lines (every 5 days)
    for (let day = 5; day <= chartData.cycleLength; day += 5) {
      xLines.push(
        <line 
          key={`x-${day}`}
          x1={xScale(day)} 
          y1={padding.top} 
          x2={xScale(day)} 
          y2={height - padding.bottom}
          stroke="#e2e8f0"
          strokeDasharray="4"
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
    
    // Add labels for day 1 and cycle end
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
        Day {middleDay}
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
        Day {chartData.cycleLength}
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
  const renderPoint = (point: typeof points[0], index: number) => {
    const x = xScale(point.day);
    const y = yScale(point.energy);
    
    return (
      <HoverCard key={`point-${index}`}>
        <HoverCardTrigger asChild>
          <g className="cursor-pointer" transform={`translate(${x}, ${y})`}>
            <circle 
              r={6} 
              fill={point.name === "Ovulation" ? "#9ca3af" : "#9b87f5"}
              stroke="white"
              strokeWidth={2}
            />
          </g>
        </HoverCardTrigger>
        <HoverCardContent className="w-60 p-3">
          <div className="space-y-1">
            <h4 className="font-medium">{point.name}</h4>
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
    <div className="w-full h-full relative">
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
        
        {/* Chart points */}
        {points.map(renderPoint)}
        {renderPoint(ovulationPoint, points.length)}
      </svg>
      
      <div className="mt-4 flex justify-center flex-wrap gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <CircleDot size={14} className="text-rhythm-accent1" />
          <span>Key energy points</span>
        </div>
        <div className="flex items-center gap-1">
          <CircleDot size={14} className="text-gray-400" />
          <span>Estimated ovulation</span>
        </div>
      </div>
    </div>
  );
};

export default EnergyGraphPoints;

import React, { useState } from 'react';
import { QuizResults } from "@/utils/quizData";
import { generateChartData } from "@/utils/chartGenerator";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { SquareCode } from "lucide-react";

interface EnergyChartProps {
  results: QuizResults;
  onReset: () => void;
}

const EnergyChart: React.FC<EnergyChartProps> = ({ results, onReset }) => {
  const [devMode, setDevMode] = useState(false);
  const chartData = generateChartData(results);
  const { 
    points, 
    cycleLength, 
    peakDay, 
    lowestDay, 
    peakMessage, 
    lowMessage, 
    fuzziness,
    displayCycleLengthLabel,
    conditionMessage
  } = chartData;
  
  // SVG dimensions and settings - increased width for better visibility
  const width = 900;
  const height = 400;
  const padding = 60;
  const innerWidth = width - (padding * 2);
  const innerHeight = height - (padding * 2);
  
  // Scale the data points for markers
  const scaledPoints = points.map(point => ({
    x: padding + (point.day - 1) * (innerWidth / (cycleLength - 1)),
    y: padding + innerHeight - ((point.energy - 1) / 4) * innerHeight
  }));
  
  // Generate SVG path for the energy curve using points
  const bezierPath = `M ${points.map(p => `${padding + (p.day - 1) * (innerWidth / (cycleLength - 1))},${padding + innerHeight - ((p.energy - 1) / 4) * innerHeight}`).join(' L ')}`;
  
  // Generate area path for the gradient fill
  const areaPath = `
    M ${padding},${padding + innerHeight}
    L ${points.map(p => `${padding + (p.day - 1) * (innerWidth / (cycleLength - 1))},${padding + innerHeight - ((p.energy - 1) / 4) * innerHeight}`).join(' ')}
    L ${padding + innerWidth},${padding + innerHeight}
    Z
  `;
  
  // Calculate key points for developer mode
  const peakPointIndex = points.findIndex(p => p.day === peakDay);
  const peakPoint = {
    x: padding + (peakDay - 1) * (innerWidth / (cycleLength - 1)),
    y: padding + innerHeight - ((points[peakPointIndex]?.energy || 5) - 1) / 4 * innerHeight
  };
  
  const lowPointIndex = points.findIndex(p => p.day === lowestDay);
  const lowPoint = {
    x: padding + (lowestDay - 1) * (innerWidth / (cycleLength - 1)),
    y: padding + innerHeight - ((points[lowPointIndex]?.energy || 1) - 1) / 4 * innerHeight
  };
  
  // Energy scale labels (descriptive text)
  const energyLabels = [
    "Peak Energy", 
    "High", 
    "Moderate", 
    "Low", 
    "Very Low"
  ];
  
  // Calculate grid lines (every 7 days)
  const dayGridLines = [];
  for (let day = 7; day < cycleLength; day += 7) {
    const x = padding + (day - 1) * (innerWidth / (cycleLength - 1));
    dayGridLines.push(x);
  }
  
  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Your Personal Energy Rhythm
        </h2>
        <p className="text-rhythm-text">
          Based on your responses, here's how your energy levels may flow throughout your cycle
        </p>
        {conditionMessage && (
          <p className="text-sm text-amber-600 italic mt-2">
            {conditionMessage}
          </p>
        )}
      </div>
      
      <div className="relative flex justify-end mb-2">
        <Toggle 
          pressed={devMode} 
          onPressedChange={setDevMode}
          className="text-xs bg-gray-100 hover:bg-gray-200"
          size="sm"
        >
          <SquareCode className="h-4 w-4 mr-1" /> Dev Mode
        </Toggle>
      </div>
      
      <div className="w-full overflow-x-auto mb-8">
        <div className="min-w-[900px] lg:w-full">
          <svg 
            width="100%" 
            height={height + 80} 
            viewBox={`0 0 ${width} ${height + 80}`} 
            preserveAspectRatio="xMidYMid meet"
            className="mx-auto"
          >
            {/* Define gradient for energy curve fill */}
            <defs>
              <linearGradient id="energyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#9b87f5" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#FFDEE2" stopOpacity="0.5" />
              </linearGradient>
              
              {/* Pattern for fuzzy lines if needed */}
              <pattern id="fuzzyPattern" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="6" stroke="#ff7193" strokeWidth="4" strokeOpacity="0.3" />
              </pattern>
            </defs>
            
            {/* Chart grid - horizontal lines for each energy level */}
            {Array.from({ length: 5 }).map((_, i) => (
              <line 
                key={`h-line-${i}`}
                x1={padding} 
                y1={padding + (innerHeight / 4) * i} 
                x2={width - padding} 
                y2={padding + (innerHeight / 4) * i}
                className="energy-chart-grid" 
                stroke="#E5E7EB"
                strokeWidth="1"
              />
            ))}
            
            {/* Vertical grid lines every 7 days */}
            {dayGridLines.map((x, i) => (
              <line 
                key={`v-line-${i}`}
                x1={x} 
                y1={padding} 
                x2={x} 
                y2={height - padding}
                className="energy-chart-grid" 
                stroke="#E5E7EB"
                strokeWidth="1"
              />
            ))}
            
            {/* Energy curve area fill */}
            <path 
              d={areaPath} 
              className="energy-gradient-area" 
              fill="url(#energyGradient)"
            />
            
            {/* Energy curve line */}
            <path 
              d={bezierPath} 
              className="energy-curve" 
              stroke="#ff7193"
              strokeWidth="3"
              fill="none"
              strokeDasharray={fuzziness.overall ? "5,2" : "none"}
            />
            
            {/* Developer mode elements */}
            {devMode && (
              <g className="developer-markers">
                {/* Start point marker */}
                <circle 
                  cx={scaledPoints[0].x} 
                  cy={scaledPoints[0].y} 
                  r="5" 
                  fill="#333"
                  stroke="#fff" 
                  strokeWidth="1"
                />
                <text 
                  x={scaledPoints[0].x} 
                  y={scaledPoints[0].y - 10} 
                  fontSize="10" 
                  fill="#333" 
                  textAnchor="middle"
                >
                  Start: Day 1
                </text>
                
                {/* Peak point marker */}
                <circle 
                  cx={peakPoint.x} 
                  cy={peakPoint.y} 
                  r="5" 
                  fill="#ff7193"
                  stroke="#fff" 
                  strokeWidth="1"
                />
                <text 
                  x={peakPoint.x} 
                  y={peakPoint.y - 10} 
                  fontSize="10" 
                  fill="#333" 
                  textAnchor="middle"
                >
                  Peak: Day {peakDay}
                </text>
                
                {/* Low point marker */}
                <circle 
                  cx={lowPoint.x} 
                  cy={lowPoint.y} 
                  r="5" 
                  fill="#9b87f5"
                  stroke="#fff" 
                  strokeWidth="1"
                />
                <text 
                  x={lowPoint.x} 
                  y={lowPoint.y + 15} 
                  fontSize="10" 
                  fill="#333" 
                  textAnchor="middle"
                >
                  Low: Day {lowestDay}
                </text>
                
                {/* End point marker */}
                <circle 
                  cx={scaledPoints[scaledPoints.length - 1].x} 
                  cy={scaledPoints[scaledPoints.length - 1].y} 
                  r="5" 
                  fill="#333"
                  stroke="#fff" 
                  strokeWidth="1"
                />
                <text 
                  x={scaledPoints[scaledPoints.length - 1].x} 
                  y={scaledPoints[scaledPoints.length - 1].y - 10} 
                  fontSize="10" 
                  fill="#333" 
                  textAnchor="middle"
                >
                  End: Day {cycleLength}
                </text>
              </g>
            )}
            
            {/* X-axis */}
            <line 
              x1={padding} 
              y1={height - padding} 
              x2={width - padding} 
              y2={height - padding} 
              stroke="#8E9196" 
              strokeWidth="2" 
            />
            
            {/* Y-axis */}
            <line 
              x1={padding} 
              y1={padding} 
              x2={padding} 
              y2={height - padding} 
              stroke="#8E9196" 
              strokeWidth="2" 
            />
            
            {/* X-axis labels */}
            <text x={padding} y={height - 10} fontSize="12" textAnchor="middle" fill="#8E9196">
              Day 1
            </text>
            {dayGridLines.map((x, i) => (
              <text 
                key={`x-label-${i}`}
                x={x} 
                y={height - 10} 
                fontSize="12" 
                textAnchor="middle" 
                fill="#8E9196"
              >
                Day {(i + 1) * 7}
              </text>
            ))}
            <text x={padding + innerWidth} y={height - 10} fontSize="12" textAnchor="middle" fill="#8E9196">
              {displayCycleLengthLabel}
              {fuzziness.xAxis && <tspan fontStyle="italic">*</tspan>}
            </text>
            
            {/* Y-axis labels */}
            {energyLabels.map((label, i) => (
              <text 
                key={`y-label-${i}`} 
                x={padding - 10} 
                y={padding + (innerHeight / 4) * i} 
                fontSize="12" 
                fill="#8E9196" 
                textAnchor="end"
                dominantBaseline="middle"
              >
                {label}
              </text>
            ))}
            
            <text x={padding - 40} y={padding - 20} fontSize="14" fill="#8E9196" fontWeight="bold" dominantBaseline="middle">
              Energy Level
            </text>
            
            {/* Fuzzy indicator explanation if needed */}
            {(fuzziness.xAxis || fuzziness.overall) && (
              <text x={padding} y={height + 30} fontSize="10" fill="#666" fontStyle="italic">
                *Cycle patterns may vary
              </text>
            )}
          </svg>
        </div>
      </div>
      
      <div className="text-center space-y-4 max-w-md mx-auto">
        <p className="text-rhythm-text">
          Understanding your unique rhythm can help you plan activities, manage energy levels, and practice self-care throughout your cycle.
        </p>
        
        <Button
          onClick={onReset}
          className="bg-rhythm-accent1 hover:bg-rhythm-accent2 text-white py-2 px-6 rounded-xl"
        >
          Start Over
        </Button>
      </div>
    </div>
  );
};

export default EnergyChart;

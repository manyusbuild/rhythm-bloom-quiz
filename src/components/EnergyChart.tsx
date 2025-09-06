
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
    bezierPoints, 
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
  
  // Scale the bezier points to fit the SVG
  const scaledBezierPoints = bezierPoints.map(point => ({
    x: padding + point.x * innerWidth,
    y: padding + innerHeight - (point.y * innerHeight)
  }));
  
  // Get energy range from chart data for dynamic scaling
  const energyValues = points.map(p => p.energy);
  const minEnergy = Math.min(...energyValues);
  const maxEnergy = Math.max(...energyValues);
  const energyRange = maxEnergy - minEnergy;
  
  // Scale the data points for markers using dynamic energy range
  const scaledPoints = points.map(point => ({
    x: padding + (point.day - 1) * (innerWidth / (cycleLength - 1)),
    y: padding + innerHeight - ((point.energy - minEnergy) / energyRange) * innerHeight
  }));
  
  // Generate SVG path for bezier curve
  const bezierPath = `M ${scaledBezierPoints.map(p => `${p.x},${p.y}`).join(' L ')}`;
  
  // Generate area path for the gradient fill
  const areaPath = `
    M ${scaledBezierPoints[0].x},${padding + innerHeight}
    L ${scaledBezierPoints.map(p => `${p.x},${p.y}`).join(' ')}
    L ${scaledBezierPoints[scaledBezierPoints.length - 1].x},${padding + innerHeight}
    Z
  `;
  
  // Calculate key points for developer mode
  const peakPointIndex = points.findIndex(p => p.day === peakDay);
  const peakPoint = scaledPoints[peakPointIndex] || scaledPoints[Math.floor(scaledPoints.length / 2)];
  
  const lowPointIndex = points.findIndex(p => p.day === lowestDay);
  const lowPoint = scaledPoints[lowPointIndex] || scaledPoints[scaledPoints.length - 2];
  
  // Dynamic energy scale labels based on actual energy range
  const generateEnergyLabels = () => {
    const labels = [];
    const steps = 4; // Create 5 levels (0-4 indices)
    for (let i = 0; i <= steps; i++) {
      const energyValue = maxEnergy - (i * energyRange / steps);
      if (energyValue === maxEnergy) {
        labels.push("Peak Energy");
      } else if (energyValue === minEnergy) {
        labels.push("Low Energy");
      } else {
        labels.push(`Level ${energyValue.toFixed(1)}`);
      }
    }
    return labels;
  };
  
  const energyLabels = generateEnergyLabels();
  
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
            {energyLabels.map((_, i) => (
              <line 
                key={`h-line-${i}`}
                x1={padding} 
                y1={padding + (innerHeight / (energyLabels.length - 1)) * i} 
                x2={width - padding} 
                y2={padding + (innerHeight / (energyLabels.length - 1)) * i}
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
                  cx={scaledBezierPoints[0].x} 
                  cy={scaledBezierPoints[0].y} 
                  r="5" 
                  fill="#333"
                  stroke="#fff" 
                  strokeWidth="1"
                />
                <text 
                  x={scaledBezierPoints[0].x} 
                  y={scaledBezierPoints[0].y - 10} 
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
                  cx={scaledBezierPoints[scaledBezierPoints.length - 1].x} 
                  cy={scaledBezierPoints[scaledBezierPoints.length - 1].y} 
                  r="5" 
                  fill="#333"
                  stroke="#fff" 
                  strokeWidth="1"
                />
                <text 
                  x={scaledBezierPoints[scaledBezierPoints.length - 1].x} 
                  y={scaledBezierPoints[scaledBezierPoints.length - 1].y - 10} 
                  fontSize="10" 
                  fill="#333" 
                  textAnchor="middle"
                >
                  End: Day {cycleLength}
                </text>
                
                {/* Control points markers (for Bezier curve visualization) */}
                {bezierPoints.map((point, i) => (
                  i % 10 === 0 && i > 0 && i < bezierPoints.length - 1 && (
                    <circle 
                      key={`ctrl-${i}`}
                      cx={point.x} 
                      cy={point.y} 
                      r="3" 
                      fill="none"
                      stroke="#666" 
                      strokeWidth="1"
                      strokeDasharray="2,2"
                    />
                  )
                ))}
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
                y={padding + (innerHeight / (energyLabels.length - 1)) * i} 
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


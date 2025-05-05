
import React, { useState, useEffect } from 'react';
import { QuizResults } from "@/utils/quizData";
import { generateChartData } from "@/utils/chartGenerator";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { SquareCode } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface EnergyChartProps {
  results: QuizResults;
  onReset: () => void;
}

const EnergyChart: React.FC<EnergyChartProps> = ({ results, onReset }) => {
  const [devMode, setDevMode] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<null | {
    x: number;
    y: number;
    day: number;
    energy: number;
    type: string;
    source?: string;
  }>(null);
  
  const isMobile = useIsMobile();
  const chartData = generateChartData(results);
  
  const { 
    points, 
    bezierPoints, 
    cycleLength, 
    peakDay, 
    lowestDay, 
    fuzziness,
    displayCycleLengthLabel,
    conditionMessage,
    periodEndDay,
    controlPoints
  } = chartData;
  
  useEffect(() => {
    if (isMobile) {
      // Disable devMode on mobile
      setDevMode(false);
    }
  }, [isMobile]);
  
  // SVG dimensions and settings with improved responsiveness
  const padding = isMobile ? 20 : 60; // Reduced padding on mobile
  const width = isMobile ? 320 : 900;  // Adjusted for mobile
  const height = isMobile ? 260 : 400; // Adjusted for mobile
  const innerWidth = width - (padding * 2);
  const innerHeight = height - (padding * 2);
  
  // Scale the points to fit the SVG
  const scaledStartPoint = {
    x: padding,
    y: padding + innerHeight - ((1 - 1) / 4) * innerHeight // Always at energy level 1
  };
  
  const scaledPeakPoint = {
    x: padding + (peakDay - 1) * (innerWidth / (cycleLength - 1)),
    y: padding + innerHeight - ((5 - 1) / 4) * innerHeight // Always at energy level 5
  };
  
  const scaledEndPoint = {
    x: padding + innerWidth,
    y: padding + innerHeight - ((1 - 1) / 4) * innerHeight // Always at energy level 1
  };
  
  const scaledControlPoint1 = {
    x: padding + (controlPoints[0].day - 1) * (innerWidth / (cycleLength - 1)),
    y: padding + innerHeight - ((controlPoints[0].energy - 1) / 4) * innerHeight
  };
  
  const scaledControlPoint2 = {
    x: padding + (controlPoints[1].day - 1) * (innerWidth / (cycleLength - 1)),
    y: padding + innerHeight - ((controlPoints[1].energy - 1) / 4) * innerHeight
  };
  
  // Scale the bezier points for visualization
  const scaledBezierPoints = bezierPoints.map(point => ({
    x: padding + point.x * innerWidth,
    y: padding + innerHeight - (point.y * innerHeight)
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
  
  // Calculate grid lines (every 5 days)
  const dayGridLines = [];
  const dayInterval = isMobile ? 7 : 5;
  for (let day = dayInterval; day < cycleLength; day += dayInterval) {
    const x = padding + (day - 1) * (innerWidth / (cycleLength - 1));
    dayGridLines.push({ day, x });
  }
  
  // Energy level grid lines (1-5)
  const energyGridLines = [1, 2, 3, 4, 5].map(level => {
    const y = padding + innerHeight - ((level - 1) / 4) * innerHeight;
    return { level, y };
  });
  
  // Handle point hover in dev mode
  const handlePointHover = (point: any) => {
    setHoveredPoint(point);
  };
  
  const handlePointLeave = () => {
    setHoveredPoint(null);
  };
  
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
      
      {!isMobile && (
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
      )}
      
      <div className="w-full flex justify-center mb-8">
        <div className={`${isMobile ? 'w-full' : 'w-full max-w-4xl'}`}>
          <svg 
            width="100%" 
            height={height} 
            viewBox={`0 0 ${width} ${height}`} 
            preserveAspectRatio="xMidYMid meet"
            className="mx-auto"
          >
            {/* Define enhanced gradients for energy curve fill */}
            <defs>
              <linearGradient id="energyGradientTop" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#A7F3D0" stopOpacity="0.9" /> {/* Soft green for high energy */}
                <stop offset="50%" stopColor="#D1FAE5" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#D1FAE5" stopOpacity="0.1" />
              </linearGradient>
              
              <linearGradient id="energyGradientBottom" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#FECDD3" stopOpacity="0.9" /> {/* Soft pink for low energy */}
                <stop offset="50%" stopColor="#FEE2E2" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#FEE2E2" stopOpacity="0.1" />
              </linearGradient>
              
              <linearGradient id="energyGradientCombined" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#A7F3D0" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#FEF3C7" stopOpacity="0.4" /> {/* Blended midpoint */}
                <stop offset="100%" stopColor="#FECDD3" stopOpacity="0.8" />
              </linearGradient>
              
              {/* Pattern for fuzzy lines if needed */}
              <pattern id="fuzzyPattern" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="6" stroke="#ff7193" strokeWidth="4" strokeOpacity="0.3" />
              </pattern>
            </defs>
            
            {/* Chart grid - subtle horizontal lines for energy levels */}
            {energyGridLines.map((line) => (
              <line 
                key={`h-line-${line.level}`}
                x1={padding} 
                y1={line.y} 
                x2={width - padding} 
                y2={line.y}
                className="energy-chart-grid" 
                stroke="#E5E7EB"
                strokeWidth="1"
                strokeOpacity="0.2"
              />
            ))}
            
            {/* Vertical grid lines every 5 days */}
            {dayGridLines.map((line, i) => (
              <line 
                key={`v-line-${i}`}
                x1={line.x} 
                y1={padding} 
                x2={line.x} 
                y2={height - padding}
                className="energy-chart-grid" 
                stroke="#E5E7EB"
                strokeWidth="1"
                strokeOpacity="0.2"
              />
            ))}
            
            {/* Energy curve area fill with bi-directional gradient */}
            <path 
              d={areaPath} 
              className="energy-gradient-area" 
              fill="url(#energyGradientCombined)"
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
                  cx={scaledStartPoint.x} 
                  cy={scaledStartPoint.y} 
                  r="5" 
                  fill="#333"
                  stroke="#fff" 
                  strokeWidth="1"
                  onMouseEnter={() => handlePointHover({
                    x: scaledStartPoint.x, 
                    y: scaledStartPoint.y, 
                    day: 1, 
                    energy: 1,
                    type: 'Start Point',
                    source: 'Fixed at day 1, energy level 1'
                  })}
                  onMouseLeave={handlePointLeave}
                />
                <text 
                  x={scaledStartPoint.x} 
                  y={scaledStartPoint.y - 12} 
                  fontSize="10" 
                  fill="#333" 
                  textAnchor="middle"
                >
                  Start
                </text>
                
                {/* Peak point marker */}
                <circle 
                  cx={scaledPeakPoint.x} 
                  cy={scaledPeakPoint.y} 
                  r="5" 
                  fill="#10B981"
                  stroke="#fff" 
                  strokeWidth="1"
                  onMouseEnter={() => handlePointHover({
                    x: scaledPeakPoint.x, 
                    y: scaledPeakPoint.y, 
                    day: peakDay, 
                    energy: 5,
                    type: 'Peak',
                    source: `Based on ${results.peakEnergy} input`
                  })}
                  onMouseLeave={handlePointLeave}
                />
                <text 
                  x={scaledPeakPoint.x} 
                  y={scaledPeakPoint.y - 12} 
                  fontSize="10" 
                  fill="#333" 
                  textAnchor="middle"
                >
                  Peak (Day {peakDay})
                </text>
                
                {/* End point marker */}
                <circle 
                  cx={scaledEndPoint.x} 
                  cy={scaledEndPoint.y} 
                  r="5" 
                  fill="#333"
                  stroke="#fff" 
                  strokeWidth="1"
                  onMouseEnter={() => handlePointHover({
                    x: scaledEndPoint.x, 
                    y: scaledEndPoint.y, 
                    day: cycleLength, 
                    energy: 1,
                    type: 'End Point',
                    source: `Fixed at cycle end (day ${cycleLength}), energy level 1`
                  })}
                  onMouseLeave={handlePointLeave}
                />
                <text 
                  x={scaledEndPoint.x} 
                  y={scaledEndPoint.y - 12} 
                  fontSize="10" 
                  fill="#333" 
                  textAnchor="middle"
                >
                  End
                </text>
                
                {/* Control point 1 marker */}
                <circle 
                  cx={scaledControlPoint1.x} 
                  cy={scaledControlPoint1.y} 
                  r="5" 
                  fill="#9b87f5"
                  stroke="#fff" 
                  strokeWidth="1"
                  strokeDasharray="2,2"
                  onMouseEnter={() => handlePointHover({
                    x: scaledControlPoint1.x, 
                    y: scaledControlPoint1.y, 
                    day: controlPoints[0].day, 
                    energy: controlPoints[0].energy,
                    type: 'Control Point 1',
                    source: `Between period end (day ${periodEndDay}) and peak (day ${peakDay})`
                  })}
                  onMouseLeave={handlePointLeave}
                />
                <text 
                  x={scaledControlPoint1.x} 
                  y={scaledControlPoint1.y - 12} 
                  fontSize="10" 
                  fill="#666" 
                  textAnchor="middle"
                >
                  Control 1
                </text>
                
                {/* Control point 2 marker */}
                <circle 
                  cx={scaledControlPoint2.x} 
                  cy={scaledControlPoint2.y} 
                  r="5" 
                  fill="#9b87f5"
                  stroke="#fff" 
                  strokeWidth="1"
                  strokeDasharray="2,2"
                  onMouseEnter={() => handlePointHover({
                    x: scaledControlPoint2.x, 
                    y: scaledControlPoint2.y, 
                    day: controlPoints[1].day, 
                    energy: controlPoints[1].energy,
                    type: 'Control Point 2',
                    source: `Between peak (day ${peakDay}) and cycle end (day ${cycleLength})`
                  })}
                  onMouseLeave={handlePointLeave}
                />
                <text 
                  x={scaledControlPoint2.x} 
                  y={scaledControlPoint2.y - 12} 
                  fontSize="10" 
                  fill="#666" 
                  textAnchor="middle"
                >
                  Control 2
                </text>
                
                {/* Low energy day marker */}
                <circle 
                  cx={padding + (lowestDay - 1) * (innerWidth / (cycleLength - 1))} 
                  cy={padding + innerHeight - ((1 - 1) / 4) * innerHeight} 
                  r="5" 
                  fill="#FCA5A5"
                  stroke="#fff" 
                  strokeWidth="1"
                  onMouseEnter={() => handlePointHover({
                    x: padding + (lowestDay - 1) * (innerWidth / (cycleLength - 1)), 
                    y: padding + innerHeight - ((1 - 1) / 4) * innerHeight, 
                    day: lowestDay, 
                    energy: 1,
                    type: 'Lowest Energy',
                    source: `Based on ${results.lowestEnergy} input`
                  })}
                  onMouseLeave={handlePointLeave}
                />
                <text 
                  x={padding + (lowestDay - 1) * (innerWidth / (cycleLength - 1))} 
                  y={padding + innerHeight - ((1 - 1) / 4) * innerHeight + 15} 
                  fontSize="10" 
                  fill="#666" 
                  textAnchor="middle"
                >
                  Low (Day {lowestDay})
                </text>

                {/* Hover tooltip */}
                {hoveredPoint && (
                  <g>
                    <rect 
                      x={hoveredPoint.x + 15}
                      y={hoveredPoint.y - 60}
                      width="160"
                      height="50"
                      rx="4"
                      fill="white"
                      stroke="#ccc"
                      strokeWidth="1"
                    />
                    <text 
                      x={hoveredPoint.x + 25}
                      y={hoveredPoint.y - 45}
                      fontSize="10" 
                      fill="#333"
                    >
                      <tspan x={hoveredPoint.x + 25} dy="0">{hoveredPoint.type}</tspan>
                      <tspan x={hoveredPoint.x + 25} dy="12">Day: {hoveredPoint.day}, Energy: {hoveredPoint.energy}</tspan>
                      <tspan x={hoveredPoint.x + 25} dy="12">{hoveredPoint.source}</tspan>
                    </text>
                  </g>
                )}
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
            
            {/* X-axis labels */}
            <text x={padding} y={height - 10} fontSize={isMobile ? "10" : "12"} textAnchor="middle" fill="#8E9196">
              Day 1
            </text>
            
            {!isMobile && dayGridLines.map((line, i) => (
              <text 
                key={`x-label-${i}`}
                x={line.x} 
                y={height - 10} 
                fontSize="12" 
                textAnchor="middle" 
                fill="#8E9196"
              >
                Day {line.day}
              </text>
            ))}
            
            <text x={padding + innerWidth} y={height - 10} fontSize={isMobile ? "10" : "12"} textAnchor="middle" fill="#8E9196">
              {displayCycleLengthLabel}
              {fuzziness.xAxis && <tspan fontStyle="italic">*</tspan>}
            </text>
            
            {/* Only show "Peak Energy" label at the top */}
            <text 
              x={padding - 10} 
              y={padding} 
              fontSize="12" 
              fill="#8E9196" 
              textAnchor="end"
              dominantBaseline="middle"
            >
              Peak Energy
            </text>
            
            {/* Fuzzy indicator explanation if needed */}
            {(fuzziness.xAxis || fuzziness.overall) && !isMobile && (
              <text x={padding} y={height - padding + 25} fontSize="10" fill="#666" fontStyle="italic">
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


import React from 'react';
import { QuizResults } from "@/utils/quizData";
import { generateChartData } from "@/utils/chartGenerator";
import { Button } from "@/components/ui/button";

interface EnergyChartProps {
  results: QuizResults;
  onReset: () => void;
}

const EnergyChart: React.FC<EnergyChartProps> = ({ results, onReset }) => {
  const chartData = generateChartData(results);
  const { points, bezierPoints, cycleLength, peakDay, lowestDay, peakMessage, lowMessage } = chartData;
  
  // SVG dimensions and settings
  const width = 800;
  const height = 400;
  const padding = 40;
  const innerWidth = width - (padding * 2);
  const innerHeight = height - (padding * 2);
  
  // Scale the bezier points to fit the SVG
  const scaledBezierPoints = bezierPoints.map(point => ({
    x: padding + point.x * innerWidth,
    y: padding + innerHeight - (point.y * innerHeight)
  }));
  
  // Scale the data points for markers
  const scaledPoints = points.map(point => ({
    x: padding + (point.day - 1) * (innerWidth / (cycleLength - 1)),
    y: padding + innerHeight - ((point.energy - 1) / 4) * innerHeight // Scale 1-5 to fill height
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
  
  // Calculate label positions
  const peakPointIndex = points.findIndex(p => p.day === peakDay);
  const peakPoint = scaledPoints[peakPointIndex] || scaledPoints[Math.floor(scaledPoints.length / 2)];
  
  const lowPointIndex = points.findIndex(p => p.day === lowestDay);
  const lowPoint = scaledPoints[lowPointIndex] || scaledPoints[scaledPoints.length - 2];
  
  // Dynamically calculate the phase positions
  const follicularWidth = (chartData.phases.follicular / cycleLength) * innerWidth;
  const ovulationWidth = (chartData.phases.ovulation / cycleLength) * innerWidth;
  const lutealWidth = (chartData.phases.luteal / cycleLength) * innerWidth;
  
  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Your Personal Energy Rhythm
        </h2>
        <p className="text-rhythm-text">
          Based on your responses, here's how your energy levels may flow throughout your cycle
        </p>
      </div>
      
      <div className="overflow-x-auto mb-8">
        <div className="min-w-[800px]">
          <svg width={width} height={height + 120} viewBox={`0 0 ${width} ${height + 120}`} className="mx-auto">
            {/* Define gradient for energy curve fill */}
            <defs>
              <linearGradient id="energyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#9b87f5" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#FFDEE2" stopOpacity="0.5" />
              </linearGradient>
            </defs>
            
            {/* Chart grid */}
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
            
            {Array.from({ length: 5 }).map((_, i) => (
              <line 
                key={`v-line-${i}`}
                x1={padding + (innerWidth / 4) * i} 
                y1={padding} 
                x2={padding + (innerWidth / 4) * i} 
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
            />
            
            {/* Key points markers */}
            <circle 
              cx={peakPoint.x} 
              cy={peakPoint.y} 
              r="6" 
              fill="#ff7193" 
              stroke="#fff" 
              strokeWidth="2"
            />
            
            <circle 
              cx={lowPoint.x} 
              cy={lowPoint.y} 
              r="6" 
              fill="#9b87f5" 
              stroke="#fff" 
              strokeWidth="2"
            />
            
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
            
            {/* Axis labels - updated to 1-5 scale */}
            <text x={padding} y={height - 10} fontSize="12" textAnchor="middle" fill="#8E9196">
              Day 1 of Period
            </text>
            <text x={padding + innerWidth * 0.25} y={height - 10} fontSize="12" textAnchor="middle" fill="#8E9196">
              7 Days
            </text>
            <text x={padding + innerWidth * 0.5} y={height - 10} fontSize="12" textAnchor="middle" fill="#8E9196">
              14 Days
            </text>
            <text x={padding + innerWidth * 0.75} y={height - 10} fontSize="12" textAnchor="middle" fill="#8E9196">
              21 Days
            </text>
            <text x={padding + innerWidth} y={height - 10} fontSize="12" textAnchor="middle" fill="#8E9196">
              {cycleLength} Days
            </text>
            
            {/* Y-axis labels - updated to 1-5 scale */}
            <text x={20} y={padding} fontSize="12" fill="#8E9196" dominantBaseline="middle">
              Energy 5
            </text>
            <text x={20} y={padding + innerHeight*0.25} fontSize="12" fill="#8E9196" dominantBaseline="middle">
              Energy 4
            </text>
            <text x={20} y={padding + innerHeight*0.5} fontSize="12" fill="#8E9196" dominantBaseline="middle">
              Energy 3
            </text>
            <text x={20} y={padding + innerHeight*0.75} fontSize="12" fill="#8E9196" dominantBaseline="middle">
              Energy 2
            </text>
            <text x={20} y={height - padding} fontSize="12" fill="#8E9196" dominantBaseline="middle">
              Energy 1
            </text>
            <text x={25} y={padding - 20} fontSize="14" fill="#8E9196" fontWeight="bold" dominantBaseline="middle">
              Energy meter
            </text>
            
            {/* Peak and low energy notes */}
            <text x={peakPoint.x} y={peakPoint.y - 20} fontSize="12" textAnchor="middle" fill="#333" fontStyle="italic">
              {peakMessage}
            </text>
            <text x={lowPoint.x} y={lowPoint.y + 20} fontSize="12" textAnchor="middle" fill="#333" fontStyle="italic">
              {lowMessage}
            </text>
            
            {/* Cycle phases */}
            <g transform={`translate(0, ${height + 20})`}>
              {/* Menstrual Cycle label */}
              <rect x={padding} y="0" width={innerWidth} height="20" fill="#f87171" />
              <text x={padding + innerWidth/2} y="13" fontSize="12" textAnchor="middle" fill="white">
                menstrual cycle
              </text>
              
              {/* Follicular Phase */}
              <rect x={padding} y="24" width={follicularWidth} height="20" fill="#fbbf24" />
              <text x={padding + follicularWidth/2} y="37" fontSize="12" textAnchor="middle" fill="white">
                follicular phase
              </text>
              
              {/* Ovulation Phase */}
              <rect x={padding + follicularWidth} y="24" width={ovulationWidth} height="20" fill="#34d399" />
              <text 
                x={padding + follicularWidth + ovulationWidth/2} 
                y="37" 
                fontSize="12" 
                textAnchor="middle" 
                fill="white"
              >
                ovulation phase
              </text>
              
              {/* Luteal Phase */}
              <rect 
                x={padding + follicularWidth + ovulationWidth} 
                y="24" 
                width={lutealWidth} 
                height="20" 
                fill="#60a5fa" 
              />
              <text 
                x={padding + follicularWidth + ovulationWidth + lutealWidth/2} 
                y="37" 
                fontSize="12" 
                textAnchor="middle" 
                fill="white"
              >
                luteal phase
              </text>
            </g>
            
            {/* Symptoms */}
            <g transform={`translate(${width - 120}, ${padding + 10})`}>
              <text x="0" y="0" fontSize="12" fill="#8E9196">cravings</text>
              <text x="0" y="20" fontSize="12" fill="#8E9196">cranky</text>
              <text x="0" y="40" fontSize="12" fill="#8E9196">mood swings</text>
            </g>
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

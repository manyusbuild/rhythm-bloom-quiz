
import { QuizResults } from "./quizData";

interface ChartPoint {
  day: number;
  energy: number;
}

interface BezierPoint {
  x: number;
  y: number;
}

interface ChartData {
  points: ChartPoint[];
  bezierPoints: BezierPoint[];
  cycleLength: number;
  peakDay: number;
  lowestDay: number;
  peakMessage: string;
  lowMessage: string;
  phases: {
    follicular: number;
    ovulation: number;
    luteal: number;
  };
}

// Generate the curve points based on quiz answers
export const generateChartData = (results: QuizResults): ChartData => {
  // Default to 28 days if unknown or inconsistent
  let cycleLength = 28;
  if (results.cycleLength === "28days") {
    cycleLength = 28;
  } else if (results.cycleLength === "30days") {
    cycleLength = 30;
  }

  // Determine peak and low days based on answers
  let peakDay = Math.floor(cycleLength / 2); // Default peak at ovulation (mid-cycle)
  let lowestDay = cycleLength - 2; // Default low at end of cycle (PMS)

  // Adjust based on answers
  if (results.peakEnergy === "afterPeriod") {
    peakDay = 7; // A week after period starts
  } else if (results.peakEnergy === "ovulation") {
    peakDay = Math.floor(cycleLength / 2);
  } else if (results.peakEnergy === "midMonth") {
    peakDay = Math.floor(cycleLength * 0.6);
  }

  if (results.lowestEnergy === "prePeriod") {
    lowestDay = cycleLength - 2;
  } else if (results.lowestEnergy === "duringPeriod") {
    lowestDay = 2;
  } else if (results.lowestEnergy === "postOvulation") {
    lowestDay = Math.floor(cycleLength * 0.7);
  }

  // Generate curve points
  const points: ChartPoint[] = [];
  for (let day = 1; day <= cycleLength; day++) {
    let energy = calculateEnergyLevel(day, cycleLength, peakDay, lowestDay);
    
    // Adjust curve based on conditions
    if (results.condition === "pcos" || results.condition === "pcod") {
      // More inconsistent energy with PCOS
      energy = energy * (0.8 + Math.random() * 0.4);
    } else if (results.condition === "thyroid") {
      // Lower overall energy with thyroid issues
      energy = energy * 0.85;
    } else if (results.condition === "menopause") {
      // More unpredictable energy with menopause
      energy = energy * (0.7 + Math.random() * 0.6);
    }
    
    points.push({ day, energy });
  }

  // Generate bezier curve points for smoother rendering
  const bezierPoints = generateBezierPoints(points, cycleLength);

  // Calculate phase estimates
  const follicular = Math.floor(cycleLength * 0.5); // ~14 days for 28-day cycle
  const ovulation = Math.floor(cycleLength * 0.1);  // ~3 days for 28-day cycle
  const luteal = cycleLength - follicular - ovulation; // Rest of cycle

  // Generate peak and low messages
  const peakMessage = getPeakMessage(results.peakEnergy);
  const lowMessage = getLowMessage(results.lowestEnergy);

  return {
    points,
    bezierPoints,
    cycleLength,
    peakDay,
    lowestDay,
    peakMessage,
    lowMessage,
    phases: {
      follicular,
      ovulation,
      luteal
    }
  };
};

// Helper function to generate smooth bezier curve points from raw data points
const generateBezierPoints = (points: ChartPoint[], cycleLength: number): BezierPoint[] => {
  if (points.length < 2) return [];
  
  const bezierPoints: BezierPoint[] = [];
  const tension = 0.3; // Controls the "tightness" of the curve (0 to 1)
  const stepSize = 0.05; // Smaller step for smoother curve
  
  // Scale points to 0-1 range for easier bezier calculations
  const scaledPoints = points.map(point => ({
    x: (point.day - 1) / (cycleLength - 1),
    y: point.energy
  }));
  
  // Add extra point at the end to ensure curve connects back (for cyclical data)
  scaledPoints.push({
    x: 1,
    y: scaledPoints[0].y
  });
  
  // Generate bezier curve points
  for (let i = 0; i < scaledPoints.length - 1; i++) {
    const p0 = scaledPoints[i > 0 ? i - 1 : scaledPoints.length - 2];
    const p1 = scaledPoints[i];
    const p2 = scaledPoints[i + 1];
    const p3 = scaledPoints[i + 2 < scaledPoints.length ? i + 2 : 1];
    
    // Calculate control points
    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;
    
    // Generate points along the bezier curve
    for (let t = 0; t < 1; t += stepSize) {
      const t2 = t * t;
      const t3 = t2 * t;
      const mt = 1 - t;
      const mt2 = mt * mt;
      const mt3 = mt2 * mt;
      
      // Bezier formula
      const x = mt3 * p1.x + 3 * mt2 * t * cp1x + 3 * mt * t2 * cp2x + t3 * p2.x;
      const y = mt3 * p1.y + 3 * mt2 * t * cp1y + 3 * mt * t2 * cp2y + t3 * p2.y;
      
      bezierPoints.push({
        x,
        y
      });
    }
  }
  
  return bezierPoints;
};

// Helper function to calculate energy level at each day
const calculateEnergyLevel = (day: number, cycleLength: number, peakDay: number, lowestDay: number): number => {
  // Energy level between 0.1 and 1.0
  const distanceToPeak = Math.abs(day - peakDay);
  const distanceToLow = Math.abs(day - lowestDay);
  
  // If closer to peak than low point
  if (distanceToPeak < distanceToLow) {
    return 0.9 - (distanceToPeak / cycleLength) * 0.8;
  } else {
    return 0.2 + (distanceToLow / cycleLength) * 0.3;
  }
};

// Generate personalized messages
const getPeakMessage = (peakEnergy: string): string => {
  switch (peakEnergy) {
    case "afterPeriod":
      return "I am at the top of the world!";
    case "ovulation":
      return "I feel my most confident now!";
    case "midMonth":
      return "My energy is flowing freely!";
    default:
      return "This is when I shine brightest!";
  }
};

const getLowMessage = (lowestEnergy: string): string => {
  switch (lowestEnergy) {
    case "prePeriod":
      return "Why am I feeling so low!";
    case "duringPeriod":
      return "I need extra care now";
    case "postOvulation":
      return "Time to slow down and rest";
    default:
      return "My energy is conserving";
  }
};

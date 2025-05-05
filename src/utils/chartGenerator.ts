
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

  // Determine key points for the curve
  const startDay = 1;
  const endDay = cycleLength;

  // Determine peak day (high energy point)
  let peakDay = Math.floor(cycleLength / 2); // Default peak at ovulation (mid-cycle)
  
  // Adjust based on answers
  if (results.peakEnergy === "afterPeriod") {
    peakDay = 7; // A week after period starts
  } else if (results.peakEnergy === "ovulation") {
    peakDay = Math.floor(cycleLength / 2);
  } else if (results.peakEnergy === "midMonth") {
    peakDay = Math.floor(cycleLength * 0.6);
  }

  // Determine low energy day
  let lowestDay = cycleLength - 2; // Default low at end of cycle (PMS)
  if (results.lowestEnergy === "prePeriod") {
    lowestDay = cycleLength - 2;
  } else if (results.lowestEnergy === "duringPeriod") {
    lowestDay = 2;
  } else if (results.lowestEnergy === "postOvulation") {
    lowestDay = Math.floor(cycleLength * 0.7);
  }

  // Define the three key points as requested
  // (day 1, energy 1), (peakDay, energy 5), (finalCycleDay, energy 1)
  const keyPoints = [
    { day: startDay, energy: 1 },       // Start point: day 1, low energy
    { day: peakDay, energy: 5 },        // Peak energy point
    { day: endDay, energy: 1 }          // End point: cycle end, low energy
  ];

  // Define control points as requested
  // Control point 1: End of period with energy 2.5
  const periodEndDay = results.periodLength === "1-2days" ? 3 : 
                      results.periodLength === "3-5days" ? 5 : 7;
  
  // Control point 2: Around ovulation with energy 4
  const ovulationDay = Math.floor(cycleLength / 2);
  
  const controlPoints = [
    { day: periodEndDay, energy: 2.5 },  // End of period, moderate energy
    { day: ovulationDay, energy: 4 }     // Ovulation, high-ish energy
  ];

  // Generate Bezier curve using the key points and control points
  const bezierPoints = generateSimplifiedBezierCurve(keyPoints, controlPoints, cycleLength);

  // Generate data points for the full curve (for display and markers)
  const points: ChartPoint[] = [];
  for (let day = 1; day <= cycleLength; day++) {
    // Find the closest bezier point for this day
    const closest = bezierPoints.reduce((prev, curr) => {
      const prevDiff = Math.abs((prev.x * (cycleLength-1) + 1) - day);
      const currDiff = Math.abs((curr.x * (cycleLength-1) + 1) - day);
      return prevDiff < currDiff ? prev : curr;
    });
    
    points.push({ 
      day, 
      energy: closest.y * 5 // Scale to 1-5 range
    });
  }

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

// Generate a simplified bezier curve with 3 key points and 2 control points
const generateSimplifiedBezierCurve = (
  keyPoints: ChartPoint[], 
  controlPoints: ChartPoint[], 
  cycleLength: number
): BezierPoint[] => {
  const bezierPoints: BezierPoint[] = [];
  const numPoints = 100; // Number of points to generate along the curve
  
  // Scale points to 0-1 range for x (day) and y (energy) values
  const scaledKeyPoints = keyPoints.map(point => ({
    x: (point.day - 1) / (cycleLength - 1),
    y: (point.energy - 1) / 4  // Scale 1-5 to 0-1
  }));
  
  const scaledControlPoints = controlPoints.map(point => ({
    x: (point.day - 1) / (cycleLength - 1),
    y: (point.energy - 1) / 4  // Scale 1-5 to 0-1
  }));
  
  // We'll create a composite bezier curve with two cubic bezier segments:
  // 1. From start to peak: P0(start), C1(controlPoint1), C2(calculated), P3(peak)
  // 2. From peak to end: P0(peak), C1(calculated), C2(controlPoint2), P3(end)
  
  // First segment: Start to Peak
  for (let t = 0; t <= 1; t += 1/numPoints) {
    const p0 = scaledKeyPoints[0]; // Start point
    const p3 = scaledKeyPoints[1]; // Peak point
    const c1 = scaledControlPoints[0]; // First control point
    
    // Calculate the second control point to ensure smooth transition at the peak
    const c2 = {
      x: p3.x - (p3.x - c1.x) * 0.5,
      y: p3.y
    };
    
    // Calculate point on cubic bezier curve
    const point = cubicBezier(t, p0, c1, c2, p3);
    bezierPoints.push(point);
  }
  
  // Second segment: Peak to End
  for (let t = 0; t <= 1; t += 1/numPoints) {
    const p0 = scaledKeyPoints[1]; // Peak point
    const p3 = scaledKeyPoints[2]; // End point
    const c2 = scaledControlPoints[1]; // Second control point
    
    // Calculate the first control point to ensure smooth transition at the peak
    const c1 = {
      x: p0.x + (c2.x - p0.x) * 0.5,
      y: p0.y
    };
    
    // Calculate point on cubic bezier curve
    const point = cubicBezier(t, p0, c1, c2, p3);
    bezierPoints.push(point);
  }
  
  return bezierPoints;
};

// Calculate a point on a cubic bezier curve
const cubicBezier = (t: number, p0: BezierPoint, p1: BezierPoint, p2: BezierPoint, p3: BezierPoint): BezierPoint => {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const mt3 = mt2 * mt;
  const t2 = t * t;
  const t3 = t2 * t;
  
  return {
    x: mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x,
    y: mt3 * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y,
  };
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

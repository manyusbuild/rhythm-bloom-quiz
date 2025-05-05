
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
  fuzziness: {
    xAxis: boolean;
    periodEnd: boolean;
    peak: boolean;
    dip: boolean;
    overall: boolean;
  };
  displayCycleLengthLabel: string;
  conditionMessage: string | null;
  periodEndDay: number;
  controlPoints: ChartPoint[];
}

/**
 * Chart Configuration Mapping
 * This object maps quiz responses to chart parameters
 */
const chartConfig = {
  // Cycle length mappings
  cycleLength: {
    "less28days": { value: 26, display: "24–28 days", fuzzyXAxis: false },
    "28to32days": { value: 30, display: "28–32 days", fuzzyXAxis: false },
    "more32days": { value: 34, display: "More than 32 days", fuzzyXAxis: false },
    "inconsistent": { value: 28, display: "~28 days*", fuzzyXAxis: true },
    "unknown": { value: 28, display: "~28 days*", fuzzyXAxis: true }
  },
  
  // Period length mappings (end day)
  periodLength: {
    "1-2days": { endDay: 3, fuzzy: false },
    "3-5days": { endDay: 5, fuzzy: false },
    "6-7days": { endDay: 7, fuzzy: false },
    "longer": { endDay: 9, fuzzy: true }
  },
  
  // Peak energy day mappings
  peakEnergy: {
    // For "afterPeriod", we'll add logic to calculate based on periodEndDay + 2
    "afterPeriod": { dayOffset: 2, fuzzy: false },
    // For "ovulation", we'll calculate as cycleLength/2
    "ovulation": { dayOffset: 0, fuzzy: false },
    // For "inconsistent", we'll use the same calculation as "ovulation" but add fuzziness
    "inconsistent": { dayOffset: 0, fuzzy: true }
  },
  
  // Lowest energy day mappings
  lowestEnergy: {
    "prePeriod": { daysFromEnd: 3, fuzzy: false },
    "duringPeriod": { daysFromStart: 1, fuzzy: false },
    "postOvulation": { daysFromEnd: 7, fuzzy: false },
    "varies": { daysFromEnd: 7, fuzzy: true }
  },
  
  // Hormonal conditions mappings
  condition: {
    "pcod": { fuzzy: true, message: "This is a generalized pattern — your body may follow a different rhythm." },
    "pcos": { fuzzy: true, message: "This is a generalized pattern — your body may follow a different rhythm." },
    "thyroid": { fuzzy: true, message: "This is a generalized pattern — your body may follow a different rhythm." },
    "menopause": { fuzzy: true, message: "This is a generalized pattern — your body may follow a different rhythm." },
    "none": { fuzzy: false, message: null }
  },
  
  // Energy scale labels (replacing numerical values)
  energyLabels: [
    "Very Low",   // Level 1
    "Low",        // Level 2 
    "Moderate",   // Level 3
    "High",       // Level 4
    "Peak Energy" // Level 5
  ]
};

// Generate the curve points based on quiz answers
export const generateChartData = (results: QuizResults): ChartData => {
  // Parse cycle length from config
  const cycleLengthConfig = chartConfig.cycleLength[results.cycleLength as keyof typeof chartConfig.cycleLength] || 
    chartConfig.cycleLength.unknown;
  const cycleLength = cycleLengthConfig.value;
  const displayCycleLengthLabel = cycleLengthConfig.display;
  
  // Parse period length from config
  const periodLengthConfig = chartConfig.periodLength[results.periodLength as keyof typeof chartConfig.periodLength] || 
    chartConfig.periodLength["3-5days"];
  const periodEndDay = periodLengthConfig.endDay;
  
  // Determine hormonal condition effects
  const conditionConfig = chartConfig.condition[results.condition as keyof typeof chartConfig.condition] || 
    chartConfig.condition.none;
  
  // Initialize fuzziness flags
  const fuzziness = {
    xAxis: cycleLengthConfig.fuzzyXAxis,
    periodEnd: periodLengthConfig.fuzzy,
    peak: false,
    dip: false,
    overall: conditionConfig.fuzzy
  };
  
  // Determine key points for the curve
  const startDay = 1;
  const endDay = cycleLength;

  // Determine peak day (high energy point) based on the configuration
  let peakDay: number;
  const peakEnergyConfig = chartConfig.peakEnergy[results.peakEnergy as keyof typeof chartConfig.peakEnergy] || 
    chartConfig.peakEnergy.ovulation;
  
  if (results.peakEnergy === "afterPeriod") {
    peakDay = periodEndDay + peakEnergyConfig.dayOffset;
  } else {
    // For ovulation or inconsistent, use cycleLength/2
    peakDay = Math.floor(cycleLength / 2);
  }
  
  // Ensure peak day is not too close to either end
  peakDay = Math.max(Math.min(peakDay, cycleLength - 5), 5);
  
  // Set peak fuzziness flag
  fuzziness.peak = peakEnergyConfig.fuzzy;

  // Determine low energy day based on the configuration
  let lowestDay: number;
  const lowestEnergyConfig = chartConfig.lowestEnergy[results.lowestEnergy as keyof typeof chartConfig.lowestEnergy] || 
    chartConfig.lowestEnergy.prePeriod;
  
  if ('daysFromEnd' in lowestEnergyConfig) {
    lowestDay = cycleLength - lowestEnergyConfig.daysFromEnd;
  } else if ('daysFromStart' in lowestEnergyConfig) {
    lowestDay = lowestEnergyConfig.daysFromStart;
  } else {
    lowestDay = cycleLength - 3; // Default to 3 days before end
  }
  
  // Set dip fuzziness flag
  fuzziness.dip = lowestEnergyConfig.fuzzy;

  // Always ensure start and end points are at energy level 1, and peak is at energy level 5
  const keyPoints = [
    { day: startDay, energy: 1 },    // Start point: day 1, low energy (level 1, never 0)
    { day: peakDay, energy: 5 },     // Peak energy point: always at level 5
    { day: endDay, energy: 1 }       // End point: cycle end, low energy (level 1, never 0)
  ];

  // Improved control points for smoother curves with horizontal tangents at start and end
  
  // Control point 1: Between period end and peak
  // Position further from the start point for a more horizontal tangent
  const controlPoint1Day = Math.max(
    Math.floor(periodEndDay + (peakDay - periodEndDay) * 0.4), 
    startDay + Math.floor(cycleLength * 0.15)
  );
  // Energy level adjusted for smoother transition
  const controlPoint1Energy = 3; 
  
  // Control point 2: Between peak and end
  // Position further from the end point for a more horizontal tangent
  const isLowEnergyNearEnd = lowestDay > peakDay && lowestDay > cycleLength * 0.6;
  const controlPoint2Day = isLowEnergyNearEnd 
    ? Math.floor(peakDay + (endDay - peakDay) * 0.7)
    : Math.floor(peakDay + (endDay - peakDay) * 0.6);
  
  // Lower energy if lowest day is closer to end
  const controlPoint2Energy = isLowEnergyNearEnd ? 2 : 3;
  
  const controlPoints = [
    { day: controlPoint1Day, energy: controlPoint1Energy },
    { day: controlPoint2Day, energy: controlPoint2Energy }
  ];

  // Generate Bezier curve using the key points and control points
  const bezierPoints = generateEnhancedBezierCurve(keyPoints, controlPoints, cycleLength);

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
      // Ensure energy is at least 1 (never 0)
      energy: Math.max(1, Math.round(closest.y * 5)) 
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
    },
    fuzziness,
    displayCycleLengthLabel,
    conditionMessage: conditionConfig.message,
    periodEndDay,
    controlPoints
  };
};

// Generate an enhanced bezier curve with improved control points for smoother transitions
// and horizontal tangents at start and end points
const generateEnhancedBezierCurve = (
  keyPoints: ChartPoint[], 
  controlPoints: ChartPoint[], 
  cycleLength: number
): BezierPoint[] => {
  const bezierPoints: BezierPoint[] = [];
  const numPoints = 200; // Increased number of points for smoother curve
  
  // Scale points to 0-1 range for x (day) and y (energy) values
  const scaledKeyPoints = keyPoints.map(point => ({
    x: (point.day - 1) / (cycleLength - 1),
    y: (point.energy - 1) / 4  // Scale 1-5 to 0-1
  }));
  
  const scaledControlPoints = controlPoints.map(point => ({
    x: (point.day - 1) / (cycleLength - 1),
    y: (point.energy - 1) / 4  // Scale 1-5 to 0-1
  }));
  
  // Create a composite bezier curve with two cubic bezier segments:
  // 1. From start to peak: P0(start), C1(controlPoint1), C2(calculated), P3(peak)
  // 2. From peak to end: P0(peak), C1(calculated), C2(controlPoint2), P3(end)
  
  // First segment: Start to Peak with horizontal tangent at start
  for (let t = 0; t <= 1; t += 1/numPoints) {
    const p0 = scaledKeyPoints[0]; // Start point
    const p3 = scaledKeyPoints[1]; // Peak point
    
    // Adjust control points for a horizontal tangent at the start
    // First control point moved horizontally from the start point
    const c1 = {
      x: p0.x + (scaledControlPoints[0].x - p0.x) * 0.3, // Closer to start for horizontal tangent
      y: p0.y // Same y as start for horizontal tangent
    };
    
    // Second control point positioned to ensure smooth transition to peak
    const c2 = scaledControlPoints[0];
    
    // Calculate point on cubic bezier curve
    const point = cubicBezier(t, p0, c1, c2, p3);
    bezierPoints.push(point);
  }
  
  // Second segment: Peak to End with horizontal tangent at end
  for (let t = 0; t <= 1; t += 1/numPoints) {
    const p0 = scaledKeyPoints[1]; // Peak point
    const p3 = scaledKeyPoints[2]; // End point
    
    // First control point positioned to ensure smooth transition from peak
    const c1 = scaledControlPoints[1];
    
    // Last control point moved horizontally from the end point
    const c2 = {
      x: p3.x - (p3.x - scaledControlPoints[1].x) * 0.3, // Closer to end for horizontal tangent
      y: p3.y // Same y as end for horizontal tangent
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
    case "inconsistent":
      return "This is when I might shine brightest!";
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
    case "varies":
      return "My energy may dip here";
    default:
      return "My energy is conserving";
  }
};

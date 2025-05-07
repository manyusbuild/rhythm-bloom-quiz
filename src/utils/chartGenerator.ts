
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
  periodEndDay: number; // Added for EnergyGraphPoints
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
    "prePeriod": { daysFromEnd: 5, fuzzy: false },
    "duringPeriod": { daysFromEnd: 3, fuzzy: false },
    "postOvulation": { daysFromEnd: 10, fuzzy: false },
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
  
  // Set peak fuzziness flag
  fuzziness.peak = peakEnergyConfig.fuzzy;

  // Determine low energy day based on the configuration
  let lowestDay: number;
  const lowestEnergyConfig = chartConfig.lowestEnergy[results.lowestEnergy as keyof typeof chartConfig.lowestEnergy] || 
    chartConfig.lowestEnergy.prePeriod;
  
  if ('daysFromEnd' in lowestEnergyConfig) {
    lowestDay = cycleLength - lowestEnergyConfig.daysFromEnd;
  } else {
    lowestDay = cycleLength - 3; // Default to 3 days before end
  }
  
  // Set dip fuzziness flag
  fuzziness.dip = lowestEnergyConfig.fuzzy;

  // Define the three key points as requested
  const keyPoints = [
    { day: startDay, energy: 1 },    // Start point: day 1, low energy
    { day: peakDay, energy: 5 },     // Peak energy point
    { day: endDay, energy: 1 }       // End point: cycle end, low energy
  ];

  // Define control points
  const controlPoints = [
    { day: periodEndDay, energy: 2.5 },  // End of period, moderate energy
    { day: Math.floor(cycleLength / 2), energy: 4 }  // Ovulation, high-ish energy
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
    periodEndDay, // Added for EnergyGraphPoints
    peakMessage,
    lowMessage,
    phases: {
      follicular,
      ovulation,
      luteal
    },
    fuzziness,
    displayCycleLengthLabel,
    conditionMessage: conditionConfig.message
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

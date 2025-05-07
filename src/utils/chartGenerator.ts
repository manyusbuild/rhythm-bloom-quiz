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
    "duringPeriod": { daysFromStart: 3, fuzzy: false },
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
  } else if ('daysFromStart' in lowestEnergyConfig) {
    lowestDay = lowestEnergyConfig.daysFromStart;
  } else {
    lowestDay = cycleLength - 3; // Default to 3 days before end
  }
  
  // Set dip fuzziness flag
  fuzziness.dip = lowestEnergyConfig.fuzzy;

  // Generate points array with basic energy values
  const points: ChartPoint[] = [];
  for (let day = 1; day <= cycleLength; day++) {
    // Simple linear interpolation between key points
    let energy = 1; // Default low energy
    
    // Determine energy based on position in cycle
    if (day === peakDay) {
      energy = 5; // Peak energy
    } else if (day === lowestDay) {
      energy = 1; // Lowest energy
    } else if (day === periodEndDay) {
      energy = 2.5; // End of period - moderate energy
    } else if (day === 1) {
      energy = 1; // Start of cycle - low energy
    } else if (day === cycleLength) {
      energy = 1; // End of cycle - low energy
    }
    
    points.push({ day, energy });
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
    cycleLength,
    peakDay,
    lowestDay,
    periodEndDay,
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

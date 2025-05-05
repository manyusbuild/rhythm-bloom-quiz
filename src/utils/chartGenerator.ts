
import { QuizResults } from "./quizData";

interface ChartPoint {
  day: number;
  energy: number;
}

interface ChartData {
  points: ChartPoint[];
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
    peakMessage,
    lowMessage,
    phases: {
      follicular,
      ovulation,
      luteal
    }
  };
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

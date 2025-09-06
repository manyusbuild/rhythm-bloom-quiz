
export interface QuizQuestion {
  id: number;
  question: string;
  options: {
    id: string;
    text: string;
    value: string;
  }[];
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "How long is your overall menstrual cycle (first day of one period to the next)?",
    options: [
      { id: "1-1", text: "Less than 28 days", value: "less28days" },
      { id: "1-2", text: "28–32 days", value: "28to32days" },
      { id: "1-3", text: "More than 32 days", value: "more32days" },
      { id: "1-4", text: "Inconsistent", value: "inconsistent" },
      { id: "1-5", text: "I don't know", value: "unknown" }
    ]
  },
  {
    id: 2,
    question: "How many days does your period usually last?",
    options: [
      { id: "2-1", text: "1–2 days", value: "1-2days" },
      { id: "2-2", text: "3–5 days", value: "3-5days" },
      { id: "2-3", text: "6–7 days", value: "6-7days" },
      { id: "2-4", text: "Longer / varies", value: "longer" }
    ]
  },
  {
    id: 3,
    question: "When do you typically feel most energized, motivated, or confident?",
    options: [
      { id: "3-1", text: "Just after my period", value: "afterPeriod" },
      { id: "3-2", text: "Around ovulation", value: "ovulation" },
      { id: "3-3", text: "Hard to say", value: "inconsistent" }
    ]
  },
  {
    id: 4,
    question: "When energy peaks, how high does it feel?",
    options: [
      { id: "4-1", text: "A gentle lift, I feel lighter than usual", value: "3.5" },
      { id: "4-2", text: "Energized, like I can take on my day with ease", value: "4" },
      { id: "4-3", text: "Strong and focused, I get a lot done", value: "4.5" },
      { id: "4-4", text: "I feel on top of the world, unstoppable!", value: "5" },
      { id: "4-5", text: "It varies", value: "4.25" }
    ]
  },
  {
    id: 5,
    question: "When do you tend to feel your lowest — physically, emotionally, or in motivation?",
    options: [
      { id: "5-1", text: "Just before my period (PMS)", value: "prePeriod" },
      { id: "5-2", text: "During my period", value: "duringPeriod" },
      { id: "5-3", text: "Week after ovulation", value: "postOvulation" },
      { id: "5-4", text: "It varies", value: "varies" }
    ]
  },
  {
    id: 6,
    question: "When energy dips, how low does it feel?",
    options: [
      { id: "6-1", text: "Barely noticeable, just a little slower", value: "2.5" },
      { id: "6-2", text: "I drag myself through the day", value: "2" },
      { id: "6-3", text: "Hard to focus or get things done", value: "1.5" },
      { id: "6-4", text: "Completely drained, need to crash", value: "1" },
      { id: "6-5", text: "It varies", value: "1.75" }
    ]
  },
  {
    id: 7,
    question: "Do you currently experience any diagnosed hormonal conditions?",
    options: [
      { id: "7-1", text: "PCOD", value: "pcod" },
      { id: "7-2", text: "PCOS", value: "pcos" },
      { id: "7-3", text: "Thyroid", value: "thyroid" },
      { id: "7-4", text: "Menopause / Peri-menopause", value: "menopause" },
      { id: "7-5", text: "None", value: "none" }
    ]
  }
];

export interface QuizResults {
  cycleLength: string;
  periodLength: string;
  peakEnergy: string;
  peakEnergyIntensity: string;
  lowestEnergy: string;
  lowEnergyIntensity: string;
  condition: string;
  email?: string;
}

export const defaultResults: QuizResults = {
  cycleLength: "",
  periodLength: "",
  peakEnergy: "",
  peakEnergyIntensity: "",
  lowestEnergy: "",
  lowEnergyIntensity: "",
  condition: ""
};

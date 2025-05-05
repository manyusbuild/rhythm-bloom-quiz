
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
      { id: "1-1", text: "~28 days", value: "28days" },
      { id: "1-2", text: "29–32 days", value: "30days" },
      { id: "1-3", text: "Inconsistent", value: "inconsistent" },
      { id: "1-4", text: "I don't know", value: "unknown" }
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
      { id: "3-3", text: "Mid-month, but not always consistent", value: "midMonth" },
      { id: "3-4", text: "Hard to say", value: "inconsistent" }
    ]
  },
  {
    id: 4,
    question: "When do you tend to feel your lowest — physically, emotionally, or in motivation?",
    options: [
      { id: "4-1", text: "Just before my period (PMS)", value: "prePeriod" },
      { id: "4-2", text: "During my period", value: "duringPeriod" },
      { id: "4-3", text: "Week after ovulation", value: "postOvulation" },
      { id: "4-4", text: "It varies", value: "varies" }
    ]
  },
  {
    id: 5,
    question: "Do you currently experience any diagnosed hormonal conditions?",
    options: [
      { id: "5-1", text: "PCOD", value: "pcod" },
      { id: "5-2", text: "PCOS", value: "pcos" },
      { id: "5-3", text: "Thyroid", value: "thyroid" },
      { id: "5-4", text: "Menopause / Peri-menopause", value: "menopause" },
      { id: "5-5", text: "None", value: "none" }
    ]
  }
];

export interface QuizResults {
  cycleLength: string;
  periodLength: string;
  peakEnergy: string;
  lowestEnergy: string;
  condition: string;
  email?: string;
}

export const defaultResults: QuizResults = {
  cycleLength: "",
  periodLength: "",
  peakEnergy: "",
  lowestEnergy: "",
  condition: ""
};

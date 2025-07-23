import React from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { QuizResults } from "@/utils/quizData";
import { ArrowRight } from "lucide-react";
import EnergyGraphPoints from "@/components/EnergyGraphPoints";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
interface ResultsScreenProps {
  results: QuizResults;
  onReset: () => void;
}

// Helper function to convert form values to user-friendly text
const formatResultValue = (key: string, value: string): string => {
  if (!value) return "Not specified";

  // Map the internal values back to the display values from the quiz questions
  switch (key) {
    case "cycleLength":
      switch (value) {
        case "less28days":
          return "Less than 28 days";
        case "28to32days":
          return "28–32 days";
        case "more32days":
          return "More than 32 days";
        case "inconsistent":
          return "Inconsistent";
        case "unknown":
          return "I don't know";
        default:
          return value;
      }
    case "periodLength":
      switch (value) {
        case "1-2days":
          return "1–2 days";
        case "3-5days":
          return "3–5 days";
        case "6-7days":
          return "6–7 days";
        case "longer":
          return "Longer / varies";
        default:
          return value;
      }
    case "peakEnergy":
      switch (value) {
        case "afterPeriod":
          return "Just after my period";
        case "ovulation":
          return "Around ovulation";
        case "inconsistent":
          return "Hard to say";
        default:
          return value;
      }
    case "lowestEnergy":
      switch (value) {
        case "prePeriod":
          return "Just before my period (PMS)";
        case "duringPeriod":
          return "During my period";
        case "postOvulation":
          return "Week after ovulation";
        case "varies":
          return "It varies";
        default:
          return value;
      }
    case "condition":
      switch (value) {
        case "pcod":
          return "PCOD";
        case "pcos":
          return "PCOS";
        case "thyroid":
          return "Thyroid";
        case "menopause":
          return "Menopause / Peri-menopause";
        case "none":
          return "None";
        default:
          return value;
      }
    default:
      return value;
  }
};

// Helper function to generate personalized insights based on quiz answers
const generateInsights = (results: QuizResults): string[] => {
  const insights: string[] = [];

  // Insight 1 - Cycle predictability
  if (results.cycleLength === 'inconsistent' || results.cycleLength === 'unknown' || results.periodLength === 'longer') {
    insights.push("Even if your cycle feels a little unpredictable right now, that doesn't mean your body rhythm is random. It follows signals — even if they're quiet or irregular. This is your first step to tuning in.");
  } else {
    insights.push("Your body shifts across the month in ways that aren't random — they move in a rhythm. Understanding this is the first step to making your wellness journey feel more natural.");
  }

  // Insight 2 - Energy peaks
  if (results.peakEnergy === 'afterPeriod') {
    insights.push("Some phases are naturally better for pushing, others for restoring. Since your energy tends to rise just after your period, that's a great time to move with intention. Flowing with that tide helps you build momentum without burnout.");
  } else if (results.peakEnergy === 'ovulation') {
    insights.push("Some phases are naturally better for pushing, others for restoring. Your energy seems to peak around ovulation — a great time for higher-intensity movement, if that's what your body is craving. The key is riding those peaks, not forcing through dips.");
  } else {
    insights.push("Some phases are naturally better for pushing, others for restoring. When you learn to move with your rhythm, movement feels less like pressure — more like flow.");
  }

  // Insight 3 - Low energy phases
  if (results.lowestEnergy === 'prePeriod') {
    insights.push("Feeling a dip before your period is completely natural. That's not a flaw — it's your body asking for recalibration, not retreat.");
  } else if (results.lowestEnergy === 'duringPeriod') {
    insights.push("Feeling a dip during your period is completely natural. That's not a flaw — it's your body asking for recalibration, not retreat.");
  } else if (results.lowestEnergy === 'postOvulation') {
    insights.push("Your energy crash post-ovulation is a signal, not a setback. Adjusting your rhythm here can make a big difference.");
  } else {
    insights.push("Low-energy phases aren't setbacks. They're your body asking for a shift in pace, not a shutdown. Even gentle movement or rest can be productive.");
  }

  // Insight 4 - Always show
  insights.push("Most fitness plans were never made for cycling hormones — they were built around the male body, which runs on a 24-hour hormonal loop. Yours moves on a monthly tide.");

  // Insight 5 - Only show if condition is selected
  if (results.condition && results.condition !== 'none') {
    if (results.condition === 'pcod' || results.condition === 'pcos') {
      insights.push("With PCOS or PCOD, your energy can fluctuate in more complicated ways — but it's not chaos. Starting here helps you make sense of it, one phase at a time.");
    } else if (results.condition === 'thyroid') {
      insights.push("Thyroid conditions can blur the rhythm, but they don't erase it. Your energy map is still a powerful way to reconnect.");
    } else if (results.condition === 'menopause') {
      insights.push("During menopause or perimenopause, your body's rhythm changes — but it doesn't disappear. This is a space to rediscover your new baseline.");
    }
  }
  return insights;
};
const ResultsScreen: React.FC<ResultsScreenProps> = ({
  results,
  onReset
}) => {
  const isMobile = useIsMobile();
  const personalizedInsights = generateInsights(results);
  return <div className="animate-fade-in flex flex-col gap-6 md:gap-8">
      {/* Header section */}
      <div className="text-center space-y-2 md:space-y-3">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">
          Your Energy Rhythm Map
        </h2>
        <p className="text-rhythm-text max-w-2xl mx-auto">
          Based on your responses, we've created a personalized map of how your energy may flow throughout your cycle
        </p>
      </div>
      
      {/* Graph container - adjusted for better mobile display */}
      <div className="relative bg-white p-2 md:p-4 rounded-lg border border-gray-100 shadow-sm">
        <div className={cn("aspect-auto w-full bg-gray-50 rounded", isMobile ? "h-[400px]" : "aspect-[4/3]")}>
          <div className="h-full w-full">
            <EnergyGraphPoints results={results} />
          </div>
        </div>
      </div>
      
      {/* Form summary recap */}
      <div className="bg-white p-4 md:p-6 rounded-lg border border-gray-100 shadow-sm">
        <h3 className="text-lg font-medium mb-4">Your Cycle Profile</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Cycle Length</p>
            <p className="font-medium">{formatResultValue("cycleLength", results.cycleLength)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Period Duration</p>
            <p className="font-medium">{formatResultValue("periodLength", results.periodLength)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Peak Energy Phase</p>
            <p className="font-medium">{formatResultValue("peakEnergy", results.peakEnergy)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Low Energy Phase</p>
            <p className="font-medium">{formatResultValue("lowestEnergy", results.lowestEnergy)}</p>
          </div>
          {results.condition && results.condition !== "none" && <div className="col-span-full space-y-1">
              <p className="text-sm text-gray-500">Health Conditions</p>
              <p className="font-medium">{formatResultValue("condition", results.condition)}</p>
            </div>}
        </div>
      </div>
      
      {/* Text-based insights - updated for personalized content */}
      <div className="bg-white p-4 md:p-6 rounded-lg border border-gray-100 shadow-sm">
        <h3 className="text-lg font-medium mb-4">Your Personal Insights</h3>
        <div className="space-y-4 text-rhythm-text">
          {personalizedInsights.map((insight, index) => <p key={index}>{insight}</p>)}
        </div>
      </div>
      
      {/* CTA Section with avatar - updated with Ketaki's photo */}
      <div className="bg-gradient-to-r from-rhythm-accent2/10 to-purple-200/20 p-4 md:p-6 rounded-lg">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <Avatar className="w-16 h-16 border-2 border-white">
            <AvatarImage src="/lovable-uploads/48c83989-71f5-42a5-84b0-a9da7e9c0d59.png" alt="Coach Ketaki" />
            <AvatarFallback>KT</AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-lg font-medium">Want to learn more about your cycle?</h3>
            <p className="text-rhythm-text mt-1">Get personalized insights and strategies tailored to your cycle pattern.</p>
          </div>
          <Button className="mt-4 md:mt-0 bg-rhythm-accent1 hover:bg-rhythm-accent2 text-white">
            Schedule a consultation <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Footer */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-2">
        <Button onClick={onReset} variant="outline" className="border-rhythm-accent1 text-rhythm-accent1 hover:bg-rhythm-accent1/10">
          Start Over
        </Button>
        
        <div className="flex gap-4 text-gray-500 text-sm">
          <a href="#" className="hover:text-rhythm-accent1">Email</a>
          <a href="#" className="hover:text-rhythm-accent1">Instagram</a>
          <a href="#" className="hover:text-rhythm-accent1">Twitter</a>
        </div>
      </div>
    </div>;
};
export default ResultsScreen;

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
        case "less28days": return "Less than 28 days";
        case "28to32days": return "28–32 days";
        case "more32days": return "More than 32 days";
        case "inconsistent": return "Inconsistent";
        case "unknown": return "I don't know";
        default: return value;
      }
    case "periodLength":
      switch (value) {
        case "1-2days": return "1–2 days";
        case "3-5days": return "3–5 days";
        case "6-7days": return "6–7 days";
        case "longer": return "Longer / varies";
        default: return value;
      }
    case "peakEnergy":
      switch (value) {
        case "afterPeriod": return "Just after my period";
        case "ovulation": return "Around ovulation";
        case "inconsistent": return "Hard to say";
        default: return value;
      }
    case "lowestEnergy":
      switch (value) {
        case "prePeriod": return "Just before my period (PMS)";
        case "duringPeriod": return "During my period";
        case "postOvulation": return "Week after ovulation";
        case "varies": return "It varies";
        default: return value;
      }
    case "condition":
      switch (value) {
        case "pcod": return "PCOD";
        case "pcos": return "PCOS";
        case "thyroid": return "Thyroid";
        case "menopause": return "Menopause / Peri-menopause";
        case "none": return "None";
        default: return value;
      }
    default:
      return value;
  }
};

const ResultsScreen: React.FC<ResultsScreenProps> = ({ results, onReset }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="animate-fade-in flex flex-col gap-6 md:gap-8">
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
        <div className={cn(
          "aspect-auto w-full bg-gray-50 rounded",
          isMobile ? "h-[400px]" : "aspect-[4/3]"
        )}>
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
          {results.condition && results.condition !== "none" && (
            <div className="col-span-full space-y-1">
              <p className="text-sm text-gray-500">Health Conditions</p>
              <p className="font-medium">{formatResultValue("condition", results.condition)}</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Text-based insights */}
      <div className="bg-white p-4 md:p-6 rounded-lg border border-gray-100 shadow-sm">
        <h3 className="text-lg font-medium mb-4">Energy Rhythm Insights</h3>
        <div className="space-y-4 text-rhythm-text">
          <p>
            Your energy rhythm has unique patterns that can help you plan activities, manage energy levels, and practice self-care throughout your cycle.
          </p>
          <p>
            Pay special attention to your energy peaks around {results.peakEnergy === "afterPeriod" ? "the follicular phase" : 
              results.peakEnergy === "ovulation" ? "ovulation" : "middle of your cycle"} for high-intensity activities.
          </p>
          <p>
            During your low energy days, typically {results.lowestEnergy === "prePeriod" ? "before your period" : 
              results.lowestEnergy === "duringPeriod" ? "during your period" : 
              results.lowestEnergy === "postOvulation" ? "after ovulation" : "at various points in your cycle"}, 
            prioritize rest and gentle movement.
          </p>
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
        <Button
          onClick={onReset}
          variant="outline"
          className="border-rhythm-accent1 text-rhythm-accent1 hover:bg-rhythm-accent1/10"
        >
          Start Over
        </Button>
        
        <div className="flex gap-4 text-gray-500 text-sm">
          <a href="#" className="hover:text-rhythm-accent1">Email</a>
          <a href="#" className="hover:text-rhythm-accent1">Instagram</a>
          <a href="#" className="hover:text-rhythm-accent1">Twitter</a>
        </div>
      </div>
    </div>
  );
};

export default ResultsScreen;
